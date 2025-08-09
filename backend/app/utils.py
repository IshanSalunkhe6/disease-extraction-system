import io
import os
import tempfile
import fitz  # PyMuPDF

# ---------- Optional OCR (only used if ENABLE_OCR=1) ----------
ENABLE_OCR = os.getenv("ENABLE_OCR", "0") == "1"
try:
    if ENABLE_OCR:
        import pytesseract
        from PIL import Image

        tess_path = os.getenv("TESSERACT_PATH", "").strip()
        if tess_path:
            pytesseract.pytesseract.tesseract_cmd = tess_path
        else:
            default_win = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
            if os.name == "nt" and os.path.exists(default_win):
                pytesseract.pytesseract.tesseract_cmd = default_win
except Exception:
    ENABLE_OCR = False
# -------------------------------------------------------------

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for p in doc:
        t = p.get_text("text", flags=fitz.TEXT_DEHYPHENATE)
        if (not t or not t.strip()) and ENABLE_OCR:
            pm = p.get_pixmap(dpi=225)
            mode = "RGBA" if pm.alpha else "RGB"
            try:
                from PIL import Image
                img = Image.frombytes(mode, [pm.width, pm.height], pm.samples)
                t = pytesseract.image_to_string(img)
            except Exception:
                t = ""
        pages.append(t or "")
    doc.close()
    return "\n\n".join(pages)

def _term_variants(term: str) -> set[str]:
    san = term.replace("–", "-")
    base = {term, term.lower(), term.upper(), term.title(), san, san.lower(), san.title()}
    return {v for v in base if v.strip()}

def highlight_terms_in_pdf(pdf_bytes: bytes, terms: list[str], min_single_len: int = 0) -> bytes:
    uniq, seen = [], set()
    for t in terms:
        s = (t or "").strip()
        if not s:
            continue
        if " " not in s and len(s) < min_single_len:
            continue
        k = s.lower()
        if k not in seen:
            seen.add(k)
            uniq.append(s)

    if not uniq:
        return pdf_bytes

    # write to temp, then patch in-place to preserve layout
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp.flush()
        tmp_path = tmp.name

    doc = fitz.open(tmp_path)
    try:
        for page in doc:
            for term in uniq:
                for variant in _term_variants(term):
                    rects = page.search_for(variant, quads=False, flags=fitz.TEXT_DEHYPHENATE)
                    for r in rects:
                        ann = page.add_highlight_annot(r)
                        if ann:
                            ann.update()

        try:
            doc.saveIncr()  # in-place incremental save
            doc.close()
            with open(tmp_path, "rb") as f:
                return f.read()
        except Exception:
            out = io.BytesIO()
            doc.save(out)
            doc.close()
            out.seek(0)
            return out.read()
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass
