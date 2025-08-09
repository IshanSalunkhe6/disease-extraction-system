import "./globals.css";

export const metadata = {
  title: "Disease Extraction System",
  description: "BioBERT (HF) + FastAPI + Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  );
}
