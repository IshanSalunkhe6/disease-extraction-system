"use client";
import { motion } from "framer-motion";

export default function DoctorMascot({ size = 64 }) {
  return (
    <motion.div
      className="hidden sm:block"
      initial={{ y: 0, rotate: 0, opacity: 0.95 }}
      animate={{ y: [0, -6, 0], rotate: [0, -2, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 64 64" className="drop-shadow">
        <circle cx="32" cy="18" r="10" fill="#ffffff" stroke="#7a34f6" strokeWidth="2"/>
        <rect x="24" y="16" rx="3" ry="3" width="16" height="6" fill="#d0a1ff" stroke="#7a34f6" strokeWidth="1.5"/>
        <path d="M16 56 C16 38, 48 38, 48 56 Z" fill="#ffffff" stroke="#7a34f6" strokeWidth="2"/>
        <path d="M22 44 L42 44" stroke="#ff58b4" strokeWidth="2" />
        <circle cx="32" cy="38" r="4" fill="#b66aff" stroke="#421c9f" strokeWidth="1.5"/>
      </svg>
    </motion.div>
  );
}
