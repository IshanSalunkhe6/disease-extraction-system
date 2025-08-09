# Disease Extraction System

**Live Demo:** [https://disease-extraction-system.vercel.app/](https://disease-extraction-system.vercel.app/)

> ⚠ **Note:** First request after inactivity may take \~5–20s due to free-tier cold start on Vercel & Hugging Face Spaces.

---

## 📌 Overview

A **disease term extraction system** that identifies and highlights disease mentions in biomedical text or PDF files.
Powered by the fine-tuned **[BioBERT NER model](https://huggingface.co/Ishan0612/biobert-ner-disease-ncbi)**, this tool helps medical students, researchers, and healthcare professionals quickly scan documents for relevant medical conditions.

---

## 🖼 Sample Output

Below is an example of a processed PDF, with detected diseases highlighted and listed:

![Sample Output](assets/sample-output.png.png)

---

## 🤖 Model Details

* **Model:** [Ishan0612/biobert-ner-disease-ncbi](https://huggingface.co/Ishan0612/biobert-ner-disease-ncbi)
* **Base Model:** `dmis-lab/biobert-base-cased-v1.1`
* **Dataset:** [NCBI Disease dataset](https://huggingface.co/datasets/ncbi_disease)
* **Metrics:**

  * Accuracy: **98.64%**
  * F1-score: **89.04%**
  * Precision: 86.80%, Recall: 91.39%

---

## ⚙️ Tech Stack

* **Frontend:** Next.js (Vercel)
* **Backend:** FastAPI (Hugging Face Spaces)
* **NLP:** BioBERT fine-tuned for Disease NER
* **PDF Processing:** PyMuPDF, optional Tesseract OCR
* **Deployment:** Vercel + Hugging Face Spaces (Docker)

---

## 🚀 Running Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2️⃣ Backend Setup (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

The backend will run at `http://127.0.0.1:8000`

### 3️⃣ Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:3000`

### 4️⃣ Environment Variables

In `frontend/.env.local`

```
NEXT_PUBLIC_API=http://127.0.0.1:8000
```

---
