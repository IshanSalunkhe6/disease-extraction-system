"use client";
export default function DiseaseChips({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="rounded-xl border glass soft-shadow">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Detected Diseases</h3>
        <span className="text-xs rounded-full bg-gray-100 px-2 py-1">{items.length}</span>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {items.map((d) => (
            <span
              key={d}
              className="rounded-full border bg-white px-3 py-1 text-sm text-gray-800 hover:bg-gray-50"
              title={d}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
