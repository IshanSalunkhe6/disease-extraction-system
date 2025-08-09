"use client";

export default function RobotIcon({ size = 54 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="text-brand-600">
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="14" width="36" height="24" rx="8" />
        <circle cx="26" cy="26" r="2.5" />
        <circle cx="38" cy="26" r="2.5" />
        <path d="M22 34h20" />
        <path d="M32 8v6" />
        <path d="M18 44c3.5 4 8.5 6 14 6s10.5-2 14-6" />
        <path d="M48 18l6 4M10 18l6 4" />
        <path d="M46 48c2.2.8 4 2.2 5 4" />
      </g>
    </svg>
  );
}
