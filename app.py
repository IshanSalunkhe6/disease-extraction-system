# app.py  (at repo root)
import sys
from pathlib import Path

# add backend/app to import path
sys.path.append(str(Path(__file__).parent / "backend" / "app"))

# import the FastAPI instance named `app` from your file
from backend.app.main import app

