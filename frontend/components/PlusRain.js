"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function usePlusRain(count = 120) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const arr = Array.from({ length: count }, (_, i) => {
      const xvw = Math.random() * 100;
      const delay = Math.random() * 6;
      const speed = 10 + Math.random() * 14;
      const size = 0.7 + Math.random() * 1.6;
      const sway = (Math.random() * 30 + 10) * (Math.random() < 0.5 ? -1 : 1);
      const rotate = (Math.random() * 18 + 6) * (Math.random() < 0.5 ? -1 : 1);
      return { id: i, xvw, delay, speed, size, sway, rotate };
    });
    setItems(arr);
  }, [count]);
  return items;
}

function Drop({ d }) {
  const gradId = `g-${d.id}`;
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="absolute opacity-80"
      style={{ left: `${d.xvw}vw`, top: `-10vh` }}
      initial={{ y: "-10vh", x: 0, rotate: 0, opacity: 0 }}
      animate={{
        y: ["-10vh", "120vh"],
        x: [0, d.sway, 0],
        rotate: [0, d.rotate, 0],
        opacity: [0, 0.9, 0.9, 0],
        scale: d.size,
      }}
      transition={{ duration: d.speed, delay: d.delay, repeat: Infinity, ease: "linear" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#74a6ff" />
          <stop offset="60%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0fb5a8" />
        </linearGradient>
      </defs>
      <path
        d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8V2z"
        fill={`url(#${gradId})`}
        stroke={`url(#${gradId})`}
        strokeWidth="0.8"
      />
    </motion.svg>
  );
}

export default function PlusRain({ density = 120 }) {
  const items = usePlusRain(density);
  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
      {items.map((d) => <Drop key={d.id} d={d} />)}
    </div>
  );
}
