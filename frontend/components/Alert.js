"use client";
export default function Alert({ type = "error", message }) {
  if (!message) return null;
  const styles = type === "error"
    ? "bg-red-50 text-red-700 border-red-200"
    : "bg-yellow-50 text-yellow-800 border-yellow-200";
  return <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>{message}</div>;
}
