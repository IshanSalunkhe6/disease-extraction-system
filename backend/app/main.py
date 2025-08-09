import os, uuid, asyncio
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .utils import extract_text_from_pdf, highlight_terms_in_pdf
from .ner import extract_entity_terms

# ----------------- Config (env tunables) -----------------
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "https://disease-extraction-system.vercel.app,http://localhost:3000"
).split(",")
STATIC_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))

# Limits
MAX_FILE_MB = int(os.getenv("MAX_FILE_MB", "20"))              # max upload size
MAX_PAGES = int(os.getenv("MAX_PAGES", "60"))                  # max pages to allow
MAX_TEXT_CHARS = int(os.getenv("MAX_TEXT_CHARS", "800000"))    # after extraction
REQUEST_TIMEOUT_S = int(os.getenv("REQUEST_TIMEOUT_S", "180")) # per-request timeout (soft)
MAX_CONCURRENT_JOBS = int(os.getenv("MAX_CONCURRENT_JOBS", "2")) # throttle concurrency
MIN_SINGLE_WORD_LEN = int(os.getenv("MIN_SINGLE_WORD_LEN", "0"))

# ---------------------------------------------------------

app = FastAPI(title="Disease Extraction API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for highlighted PDFs
os.makedirs(STATIC_ROOT, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_ROOT), name="static")

sema = asyncio.Semaphore(MAX_CONCURRENT_JOBS)

@app.get("/")
def ok():
    return {"status": "ok"}

# --------------- internal worker (actual job) ---------------
async def _do_extract(raw: bytes) -> dict:
    """
    Performs text extraction, guards text length,
    runs NER, highlights, and writes the output PDF into /static/<uuid>/highlighted.pdf
    """
    # 1) Extract text (handles OCR if ENABLE_OCR=1 in utils.extract_text_from_pdf)
    text = extract_text_from_pdf(raw)
    if not text or not text.strip():
        # Keep message non-technical for the UI
        raise HTTPException(
            status_code=422,
            detail="No selectable text found. If this is a scanned PDF, enable OCR or try another file."
        )

    # 2) Guard on total extracted text length
    if len(text) > MAX_TEXT_CHARS:
        raise HTTPException(
            status_code=413,
            detail=f"PDF text too long for demo ({len(text):,} chars). Max allowed is {MAX_TEXT_CHARS:,}."
        )

    # 3) NER → disease terms
    diseases = extract_entity_terms(text)

    # 4) Highlight in the original PDF
    out_bytes = highlight_terms_in_pdf(raw, diseases, min_single_len=MIN_SINGLE_WORD_LEN)

    # 5) Persist to /static/<uuid>/highlighted.pdf
    bucket_id = str(uuid.uuid4())[:8]
    bucket_dir = os.path.join(STATIC_ROOT, bucket_id)
    os.makedirs(bucket_dir, exist_ok=True)
    out_path = os.path.join(bucket_dir, "highlighted.pdf")
    with open(out_path, "wb") as f:
        f.write(out_bytes)

    return {
        "diseases": diseases,
        "pdf_url": f"/static/{bucket_id}/highlighted.pdf",
    }

# ------------------------------ API ------------------------------
@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    # Read upload into memory
    raw = await file.read()
    size_mb = len(raw) / (1024 * 1024)

    # A) size guard
    if size_mb > MAX_FILE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Max allowed is {MAX_FILE_MB} MB."
        )

    # B) quick page-count guard using PyMuPDF (doesn't load text fully)
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=raw, filetype="pdf")
        page_count = doc.page_count
        doc.close()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or unreadable PDF.")

    if page_count > MAX_PAGES:
        raise HTTPException(
            status_code=413,
            detail=f"PDF has {page_count} pages. Max allowed is {MAX_PAGES}."
        )

    # C) throttle + soft timeout wrapper
    async with sema:
        try:
            result = await asyncio.wait_for(_do_extract(raw), timeout=REQUEST_TIMEOUT_S)
        except asyncio.TimeoutError:
            raise HTTPException(status_code=504, detail="Processing timed out. Try a smaller PDF.")
        except HTTPException:
            raise
        except Exception as e:
            # unexpected error (log in real app)
            raise HTTPException(status_code=500, detail="Unexpected error while processing the PDF.") from e

    # D) success
    return JSONResponse({
        "diseases": result["diseases"],
        "pdf_url": result["pdf_url"],
    })
