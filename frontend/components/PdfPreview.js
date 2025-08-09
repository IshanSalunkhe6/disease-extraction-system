"use client";
export default function PdfPreview({ url }) {
  if (!url) return null;
  return (
    <section className="rounded-xl border glass soft-shadow">
      <div className="border-b px-4 py-3">
        <h3 className="text-base font-semibold">Preview</h3>
      </div>
      <div className="h-[78vh] overflow-hidden">
        <object data={url} type="application/pdf" width="100%" height="100%">
          <iframe src={url} title="pdf" width="100%" height="100%" />
        </object>
      </div>
    </section>
  );
}
