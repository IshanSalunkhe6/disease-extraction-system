const BASE = (process.env.NEXT_PUBLIC_API || "http://localhost:8000").replace(/\/$/, "");

export async function extractPdf(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/extract`, { method: "POST", body: form });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.error || "Backend error");

  const pdfUrlFull = `${BASE}${data.pdf_url}`;
  return { ...data, pdfUrlFull };
}
