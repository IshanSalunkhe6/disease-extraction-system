"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Header from "../components/Header";
import UploadBox from "../components/UploadBox";
import PdfPreview from "../components/PdfPreview";
import DiseaseChips from "../components/DiseaseChips";
import Alert from "../components/Alert";
import { extractPdf } from "../lib/api";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (file) => {
    setError(""); setDiseases([]); setPdfUrl(null);
    if (!file) return setError("Please choose a PDF file.");
    if (file.type !== "application/pdf") return setError("Only PDF files are supported.");
    if (file.size > 10 * 1024 * 1024) return setError("PDF is too large (max 10 MB).");

    setLoading(true);
    try {
      const data = await extractPdf(file);
      setPdfUrl(data.pdfUrlFull);
      setDiseases(Array.isArray(data.diseases) ? data.diseases : []);
    } catch (e) {
      setError(e.message || "Processing failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <Header />

      {/* static tiled plus background */}
      <div className="medical-wallpaper fixed inset-0 -z-10" />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6 relative">
        <UploadBox onSubmit={handleSubmit} uploading={loading} />

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <Alert message={error} />
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="rounded-xl border glass p-4 text-sm text-gray-700 soft-shadow">
            Processing with BioBERT… This may take a few seconds.
            <div className="mt-3 h-2 w-48 rounded-full bg-brand-200 overflow-hidden">
              <div className="h-full w-1/2 animate-pulse bg-brand-500/70" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <PdfPreview url={pdfUrl} />
          </motion.div>

          <motion.div className="lg:col-span-1 space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <DiseaseChips items={diseases} />
            <div className="rounded-xl border glass p-4 text-xs text-gray-600 soft-shadow">
              <p>⚠ <strong>Note:</strong> Designed to support medical learning and research.</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
