"use client";
import { useEffect, useRef } from "react";

export default function TouchRipples() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const spawn = (x, y) => {
      const el = document.createElement("span");
      el.className = "pointer-events-none absolute rounded-full ripple";
      el.style.left = `${x - 12}px`;
      el.style.top = `${y - 12}px`;
      root.appendChild(el);
      setTimeout(() => el.remove(), 700);
    };

    const onClick = (e) => spawn(e.clientX, e.clientY);
    const onTouch = (e) => {
      const t = e.touches?.[0];
      if (t) spawn(t.clientX, t.clientY);
    };

    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        .ripple {
          width: 24px; height: 24px;
          background: radial-gradient(circle, rgba(59,130,246,.35) 0%, rgba(20,184,166,.25) 60%, rgba(59,130,246,0) 70%);
          animation: ripple-grow .7s ease-out forwards;
          transform: translate(-50%, -50%);
        }
        @keyframes ripple-grow {
          0%   { opacity: .9; transform: translate(-50%, -50%) scale(.5); }
          80%  { opacity: .25; transform: translate(-50%, -50%) scale(5); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(6); }
        }
      `}</style>
      <div ref={ref} className="fixed inset-0 -z-10"></div>
    </>
  );
}
