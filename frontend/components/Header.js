"use client";
import DoctorMascot from "./DoctorMascot";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
      {/* thin static gradient strip */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-brand-600 to-teal-600" />

      {/* main row */}
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        {/* left: shield + title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-600 text-white grid place-items-center shadow">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z" fill="currentColor" opacity=".95"/>
              <path d="M8 12l2 2 4-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
              Disease Extraction System
            </h1>
            <p className="text-sm text-gray-500">BioBERT • FastAPI • Next.js</p>
          </div>
        </div>

        {/* right: link + your robot */}
        <div className="flex items-center gap-4">
          <a
            className="text-sm underline hover:text-brand-700"
            href="https://huggingface.co/Ishan0612/biobert-ner-disease-ncbi"
            target="_blank"
            rel="noreferrer"
          >
            Model on Hugging Face
          </a>
          <DoctorMascot size={52} />
        </div>
      </div>

      {/* ECG: continuous machine-like sweep (no shaking) */}
      <div className="mx-auto max-w-6xl px-4 pb-2">
        <div className="relative h-7 w-full overflow-hidden">
          {/* faint baseline */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden>
            <line x1="0" y1="22" x2="1200" y2="22" stroke="rgba(37,99,235,.18)" strokeWidth="2" />
          </svg>

          {/* two repeating segments; parent animates to the right */}
          <div className="ecg-track">
            <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="ecg-segment" aria-hidden>
              <path
                d="M0,22 L60,22 70,10 80,34 95,22 140,22 155,7 170,36 185,22 230,22 240,22 250,9 260,34 272,22 
                   320,22 335,7 350,36 365,22 410,22 420,22 430,9 440,34 452,22 500,22 510,22 520,10 530,34 545,22 600,22"
                className="ecg-path"
                fill="none"
              />
            </svg>
            <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="ecg-segment" aria-hidden>
              <path
                d="M0,22 L60,22 70,10 80,34 95,22 140,22 155,7 170,36 185,22 230,22 240,22 250,9 260,34 272,22 
                   320,22 335,7 350,36 365,22 410,22 420,22 430,9 440,34 452,22 500,22 510,22 520,10 530,34 545,22 600,22"
                className="ecg-path"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
