"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Simple deterministic star positions (avoids hydration mismatch)
const STARS = Array.from({ length: 60 }, (_, i) => {
  const t = (i * 2.399963) % (Math.PI * 2);
  return {
    x: ((Math.cos(t * 3.7) + 1) / 2) * 100,
    y: ((Math.sin(t * 2.1) + 1) / 2) * 70,
    r: (i % 3 === 0 ? 1.5 : i % 2 === 0 ? 1 : 0.6),
    opacity: 0.2 + (i % 5) * 0.12,
    delay: (i % 7) * 0.4,
  };
});

export default function Home() {
  const router  = useRouter();
  const [joinId, setJoinId] = useState("");

  const createBoard = () => {
    const id = Math.random().toString(36).substring(2, 10);
    router.push(`/board/${id}`);
  };

  const joinBoard = (e: React.FormEvent) => {
    e.preventDefault();
    const id = joinId.trim();
    if (id) router.push(`/board/${id}`);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1408 0%, #0d0b06 60%, #060504 100%)" }}
    >
      {/* ── Stars ─────────────────────────────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="#f5e6c8"
            style={{
              opacity: s.opacity,
              animation: `twinkle ${2.5 + s.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </svg>

      {/* ── Moon ──────────────────────────────────────────────────────────── */}
      <svg className="absolute top-8 right-16 pointer-events-none" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="#f5e6a0" opacity="0.12" />
        <circle cx="40" cy="40" r="26" fill="#f0dc90" opacity="0.18" />
        <circle cx="54" cy="28" r="26" fill="#0d0b06" />
      </svg>

      {/* ── Tree silhouettes ──────────────────────────────────────────────── */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none select-none"
        height="200"
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMax slice"
        fill="#060504"
      >
        {/* Left cluster */}
        <path d="M0,200 L0,130 Q15,100 30,125 Q50,90 70,115 Q90,75 115,105 Q135,85 155,108 L155,200Z" />
        <path d="M130,200 L130,110 Q155,70 180,100 Q205,60 230,90 Q255,65 280,88 L280,200Z" opacity="0.85" />
        <path d="M260,200 L260,120 Q290,85 320,110 Q350,75 380,100 L380,200Z" opacity="0.7" />
        {/* Right cluster */}
        <path d="M1060,200 L1060,115 Q1090,80 1120,105 Q1150,65 1180,95 Q1205,75 1230,98 L1230,200Z" opacity="0.7" />
        <path d="M1210,200 L1210,105 Q1250,65 1290,92 Q1320,70 1350,90 Q1375,60 1405,85 L1440,100 L1440,200Z" opacity="0.85" />
        <path d="M1390,200 L1390,125 Q1410,98 1430,115 L1440,110 L1440,200Z" />
        {/* Ground */}
        <rect x="0" y="185" width="1440" height="15" />
      </svg>

      {/* ── Campfire glow ─────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 120,
          height: 60,
          background: "radial-gradient(ellipse, rgba(201,120,30,0.25) 0%, transparent 70%)",
          animation: "flicker 1.8s ease-in-out infinite alternate",
        }}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center">
          {/* Decorative rule */}
          <div className="flex items-center gap-3 mb-3 justify-center">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#6a5a3a]" />
            <span className="text-[#5a4d3d] text-[10px] tracking-[0.4em] uppercase">Klei Entertainment</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#6a5a3a]" />
          </div>

          <h1
            className="text-4xl font-bold text-[#c9a96e] leading-tight"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              textShadow: "0 0 40px rgba(201,169,110,0.35), 2px 3px 6px rgba(0,0,0,0.95)",
              letterSpacing: "0.06em",
            }}
          >
            Don&apos;t Starve
            <br />
            <span className="text-2xl" style={{ letterSpacing: "0.15em" }}>Together</span>
          </h1>

          <div
            className="mt-2 text-[#8b6914] text-sm tracking-[0.35em] uppercase"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Kanban
          </div>

          <div className="mt-4 flex items-center gap-3 justify-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#4a3f32]" />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#4a3f32" strokeWidth="1" />
              <path d="M8 4 L9.5 7.5 L13 8 L10.5 10.5 L11 14 L8 12.5 L5 14 L5.5 10.5 L3 8 L6.5 7.5 Z"
                fill="#4a3f32" />
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#4a3f32]" />
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={createBoard}
          className="w-full py-4 text-base font-bold uppercase tracking-widest rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #5a3c10, #8b6914, #5a3c10)",
            color: "#0d0b06",
            border: "2px solid #c9a96e",
            boxShadow: "0 0 16px rgba(201,169,110,0.3), 0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            fontFamily: "Georgia, serif",
          }}
        >
          + Create New Board
        </button>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2a221a]" />
          <span className="text-[#3a3028] text-xs tracking-widest">or</span>
          <div className="flex-1 h-px bg-[#2a221a]" />
        </div>

        {/* Join form */}
        <form onSubmit={joinBoard} className="w-full flex flex-col gap-3">
          <input
            type="text"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Enter board ID to join..."
            className="w-full px-4 py-3 rounded-lg text-[#c9b896] placeholder-[#3a3028] font-mono text-sm focus:outline-none transition-colors"
            style={{
              backgroundColor: "#0d0b06",
              border: "1px solid #2a221a",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6a5a3a")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "#2a221a")}
          />
          <button
            type="submit"
            disabled={!joinId.trim()}
            className="w-full py-3 font-bold uppercase tracking-widest rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: "#110e08",
              color: "#c9b896",
              border: "1px solid #3a3028",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.2em",
            }}
          >
            Join Board
          </button>
        </form>

        <p className="text-[#2a221a] text-xs text-center leading-relaxed">
          Share the board ID with your allies so they can
          <br />
          join and survive together in real time.
        </p>
      </div>

      <style>{`
        @keyframes twinkle {
          from { opacity: 0.15; }
          to   { opacity: 0.85; }
        }
        @keyframes flicker {
          0%   { opacity: 0.7; transform: translateX(-50%) scale(1);    }
          50%  { opacity: 0.9; transform: translateX(-50%) scale(1.08); }
          100% { opacity: 0.6; transform: translateX(-50%) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
