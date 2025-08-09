"use client";
import { useCallback, useState } from "react";

export default function UploadBox({ onSubmit, uploading }) {
  const [file, setFile] = useState(null);
  const onDrop = useCallback((ev) => {
    ev.preventDefault();
    const f = ev.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
  }, []);

  return (
    <div
      className="rounded-xl border border-dashed glass soft-shadow p-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium">Upload a PDF</h2>
          <p className="text-sm text-gray-500">Drag & drop or choose a file (≤10MB)</p>
          {file && (
            <div className="mt-3 text-sm text-gray-600">
              Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-md border bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            Choose File
          </label>

          <button
            onClick={() => onSubmit(file)}
            disabled={!file || uploading}
            className="inline-flex items-center rounded-md bg-gradient-to-r from-brand-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Processing…" : "Extract & Highlight"}
          </button>
        </div>
      </div>
    </div>
  );
}
