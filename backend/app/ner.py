import os
from transformers import pipeline

# ---------- Tunables via env ----------
MAX_TOKENS          = int(os.getenv("MAX_TOKENS", "450"))
MIN_SINGLE_CHARS    = int(os.getenv("MIN_SINGLE_CHARS", "4"))      # short single word guard (if low score)
MIN_AVG_SCORE       = float(os.getenv("MIN_AVG_SCORE", "0.55"))    # confidence guard for short singles
MIN_FIRST_SCORE     = float(os.getenv("MIN_FIRST_SCORE", "0.70"))  # trim short, lowercase leading token
DROP_SUBSTRINGS     = os.getenv("DROP_SUBSTRINGS", "1") == "1"     # prefer maximal phrases
# --------------------------------------

# IMPORTANT: no aggregator — we merge ourselves
nlp = pipeline(
    "ner",
    model="Ishan0612/biobert-ner-disease-ncbi",
    tokenizer="Ishan0612/biobert-ner-disease-ncbi",
    aggregation_strategy=None
)

def _is_entity(lbl: str) -> bool:
    # model uses LABEL_0 (O), LABEL_1/LABEL_2 (entity)
    return lbl in ("LABEL_1", "LABEL_2")

def _chunk_by_tokens(tokenizer, text: str, limit=MAX_TOKENS):
    """Greedy chunking by token count to respect MAX_TOKENS."""
    words = text.split()
    chunks, cur, tok_count = [], [], 0
    hard = max(50, limit - 20)  # small margin
    for w in words:
        n = len(tokenizer.tokenize(w))
        if cur and tok_count + n > hard:
            chunks.append(" ".join(cur))
            cur, tok_count = [w], n
        else:
            cur.append(w)
            tok_count += n
    if cur:
        chunks.append(" ".join(cur))
    return chunks

def _refine_leading_token(tokens_in_span):
    """
    Trim a helper-like leading token if:
      - it's very short (<=3),
      - lowercase (not an acronym),
      - low confidence,
      - and there are tokens after it.
    """
    if len(tokens_in_span) < 2:
        return tokens_in_span
    first = tokens_in_span[0]
    w = (first["word"] or "")
    # keep acronyms (CKD, DVT, T2DM)
    is_acronym = (w.isupper() and len(w) <= 5) or any(ch.isdigit() for ch in w)
    if (len(w) <= 3) and w.islower() and (first["score"] < MIN_FIRST_SCORE) and not is_acronym:
        return tokens_in_span[1:]
    return tokens_in_span

def _merge_spans_from_offsets(chunk_text: str, toks: list):
    """
    Build entity phrases using character offsets:

      start at first LABEL_1/LABEL_2,
      extend across subsequent LABEL_1/LABEL_2,
      ALSO extend across immediate '##' wordpieces even if label==LABEL_0
      (fixes 'late' + '##nt' -> 'latent', 'di' + '##abetes' -> 'diabetes').

    Return list of dicts: {text, start, end, avg_score, tok_count}
    """
    spans = []
    i, N = 0, len(toks)

    while i < N:
        t = toks[i]
        if not _is_entity(t.get("entity")):
            i += 1
            continue

        tokens_in_span = []
        start = t.get("start")
        end   = t.get("end")
        tokens_in_span.append({
            "word": t.get("word") or "",
            "start": start,
            "end": end,
            "score": float(t.get("score", 1.0)),
            "label": t.get("entity"),
        })

        j = i + 1
        while j < N:
            tj = toks[j]
            wj = tj.get("word") or ""
            labj = tj.get("entity")

            if _is_entity(labj) or wj.startswith("##"):
                end = tj.get("end")
                tokens_in_span.append({
                    "word": wj,
                    "start": tj.get("start"),
                    "end": tj.get("end"),
                    "score": float(tj.get("score", 1.0)),
                    "label": labj,
                })
                j += 1
                continue
            break

        tokens_in_span = _refine_leading_token(tokens_in_span)

        if tokens_in_span:
            start = tokens_in_span[0]["start"]
            end   = tokens_in_span[-1]["end"]
            phrase = chunk_text[start:end].strip()
            if phrase:
                ent_scores = [tok["score"] for tok in tokens_in_span if _is_entity(tok["label"])]
                avg_score = (sum(ent_scores) / max(1, len(ent_scores))) if ent_scores else 0.0
                spans.append({
                    "text": " ".join(phrase.split()),
                    "start": start,
                    "end": end,
                    "avg_score": avg_score,
                    "tok_count": len(ent_scores),
                })

        i = j

    return spans

def _prefer_maximal_spans(spans):
    if not spans:
        return spans
    # prefer longer phrases, then restore original order
    sorted_spans = sorted(spans, key=lambda s: len(s["text"]), reverse=True)
    kept_texts, kept = [], []
    for s in sorted_spans:
        t_low = s["text"].lower()
        if any((t_low in kt) and (t_low != kt) for kt in kept_texts):
            continue
        kept.append(s)
        kept_texts.append(t_low)
    order = {s["text"].lower(): i for i, s in enumerate(spans)}
    kept.sort(key=lambda s: order.get(s["text"].lower(), 10**9))
    return kept

def extract_entity_terms(text: str) -> list:
    """
    Chunk → NER (no aggregation) → offset-merge → dynamic cleanup:
      - trim short, low-signal leading token
      - drop short + low-confidence single words
      - optional substring drop
      - dedupe case-insensitively, preserve order
    """
    tokenizer = nlp.tokenizer
    chunks = _chunk_by_tokens(tokenizer, text, MAX_TOKENS)

    spans = []
    for ch in chunks:
        toks = nlp(ch)  # raw tokens with offsets
        spans.extend(_merge_spans_from_offsets(ch, toks))

    # drop short & low-confidence single words
    filtered, seen = [], set()
    for s in spans:
        txt = s["text"]
        if not txt:
            continue
        if " " not in txt and len(txt) < MIN_SINGLE_CHARS and s["avg_score"] < MIN_AVG_SCORE:
            continue
        key = txt.lower()
        if key in seen:
            continue
        seen.add(key)
        filtered.append(s)

    if DROP_SUBSTRINGS:
        filtered = _prefer_maximal_spans(filtered)

    out, seen2 = [], set()
    for s in filtered:
        k = s["text"].lower()
        if k not in seen2:
            seen2.add(k)
            out.append(s["text"])
    return out
