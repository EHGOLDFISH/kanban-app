"use client";

import { useState } from "react";
import { DST_CHARACTERS, DSTCharacter, CharacterIcon } from "./DSTCharacters";

interface Props {
  boardId: string;
  onSelect: (character: DSTCharacter) => void;
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#8b7355] text-xs w-14 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#1a1410] rounded-full overflow-hidden border border-[#3a2f22]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[#c9b896] text-xs w-8 text-right font-mono">{value}</span>
    </div>
  );
}

// Deterministic star field — same values on server and client (no hydration mismatch)
const STARS = Array.from({ length: 80 }, (_, i) => {
  const t = (i * 2.399963) % (Math.PI * 2);
  const round4 = (n: number) => Math.round(n * 10000) / 10000;
  return {
    id: i,
    x: round4(((Math.cos(t * 3.7) + 1) / 2) * 100),
    y: round4(((Math.sin(t * 2.1) + 1) / 2) * 90),
    r: i % 3 === 0 ? 1.5 : i % 2 === 0 ? 1 : 0.6,
    opacity: 0.15 + (i % 5) * 0.12,
    delay: (i % 7) * 0.4,
  };
});

export function CharacterSelect({ boardId, onSelect }: Props) {
  const [hovered, setHovered]   = useState<DSTCharacter | null>(null);
  const [selected, setSelected] = useState<DSTCharacter | null>(null);
  const [isRandom, setIsRandom] = useState(false);

  // When random is picked and nothing is hovered, show the "?" placeholder — not the chosen character
  const RANDOM_PLACEHOLDER: DSTCharacter = { id: "__random__", name: "Random", color: "#c9a96e", portrait: "", quote: "", perk: "", health: 0, hunger: 0, sanity: 0 };
  const displayed = hovered ?? (isRandom ? RANDOM_PLACEHOLDER : selected);

  function pickRandom() {
    const pick = DST_CHARACTERS[Math.floor(Math.random() * DST_CHARACTERS.length)];
    setSelected(pick);
    setIsRandom(true);
    setHovered(null);
  }

  function handleSelect(char: DSTCharacter) {
    setSelected(char);
    setIsRandom(false);
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1408 0%, #0d0b06 60%, #060504 100%)" }}
    >
      {/* ── Star field ─────────────────────────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
        {STARS.map((s) => (
          <circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="#f5e6c8"
            opacity={s.opacity}
            style={{ animation: `twinkle ${2 + s.delay}s ease-in-out infinite alternate` }}
          />
        ))}
      </svg>

      {/* ── Moon ───────────────────────────────────────────────────────────── */}
      <svg className="absolute top-6 right-12 pointer-events-none" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="#f5e6a0" opacity="0.15" />
        <circle cx="32" cy="32" r="22" fill="#f5e6a0" opacity="0.12" />
        <circle cx="32" cy="32" r="16" fill="#f0dc90" opacity="0.25" />
        <circle cx="44" cy="22" r="16" fill="#0d0b06" />
      </svg>

      {/* ── Tree silhouettes ───────────────────────────────────────────────── */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        height="160"
        viewBox="0 0 1440 160"
        preserveAspectRatio="xMidYMax slice"
        fill="#060504"
      >
        <path d="M0,160 L0,100 Q20,80 40,100 Q60,80 80,90 Q100,60 120,85 Q140,70 160,90 L160,160Z" />
        <path d="M140,160 L140,80 Q160,50 180,75 Q200,40 220,70 Q240,50 260,72 Q280,45 300,68 L300,160Z" />
        <path d="M280,160 L280,90 Q310,60 340,85 Q370,55 400,80 L400,160Z" opacity="0.8" />
        <path d="M1100,160 L1100,85 Q1130,55 1160,80 Q1190,50 1220,75 L1220,160Z" opacity="0.9" />
        <path d="M1200,160 L1200,75 Q1240,45 1280,70 Q1310,50 1340,72 Q1370,40 1400,68 L1440,80 L1440,160Z" />
        <path d="M1380,160 L1380,95 Q1400,70 1420,90 Q1430,75 1440,88 L1440,160Z" />
        <rect x="0" y="145" width="1440" height="15" />
      </svg>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center pt-10 pb-4 px-4">
        <div className="text-[#5a4d3d] text-xs tracking-[0.3em] uppercase mb-1">Klei Entertainment</div>
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-widest uppercase text-[#c9a96e]"
          style={{
            textShadow: "0 0 30px rgba(201,169,110,0.4), 2px 2px 4px rgba(0,0,0,0.9)",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Don&apos;t Starve Together
        </h1>
        <div className="text-[#8b7355] text-sm tracking-widest uppercase mt-1">Kanban</div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#4a3f32]" />
          <span className="text-[#5a4d3d] text-xs tracking-widest uppercase">Choose Your Survivor</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#4a3f32]" />
        </div>
        <div className="text-[#3a3028] text-xs mt-1 font-mono">Board: {boardId}</div>
      </div>

      {/* ── Character grid ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pb-4">
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2 mb-4 w-full max-w-4xl">

          {/* Random Survivor card */}
          {(() => {
            const isRandomSelected = isRandom && selected !== null;
            const isRandomHovered  = hovered?.id === "__random__";
            return (
              <button
                onClick={pickRandom}
                onMouseEnter={() => setHovered({ id: "__random__", name: "Random", color: "#c9a96e", portrait: "", quote: "", perk: "", health: 0, hunger: 0, sanity: 0 })}
                onMouseLeave={() => setHovered(null)}
                className="rounded-lg border overflow-hidden focus:outline-none transition-all duration-150"
                style={{
                  backgroundColor: isRandomSelected ? "#1f180e" : "#110e08",
                  borderColor: isRandomSelected ? "#c9a96e" : isRandomHovered ? "#6a5a3a" : "#2a221a",
                  boxShadow: isRandomSelected ? "0 0 14px #c9a96e55, 0 0 28px #c9a96e22" : "none",
                  transform: isRandomSelected || isRandomHovered ? "scale(1.06)" : "scale(1)",
                  aspectRatio: "3 / 4",
                }}
                title="Pick a random survivor"
              >
                <img
                  src="/characters/Random_Character_Portrait.webp"
                  alt="Random Survivor"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
              </button>
            );
          })()}

          {/* Character cards */}
          {DST_CHARACTERS.map((char) => {
            const isSelected = !isRandom && selected?.id === char.id;
            const isHovered  = hovered?.id === char.id;
            return (
              <button
                key={char.id}
                onClick={() => handleSelect(char)}
                onMouseEnter={() => setHovered(char)}
                onMouseLeave={() => setHovered(null)}
                className="rounded-lg border overflow-hidden focus:outline-none transition-all duration-150"
                style={{
                  backgroundColor: isSelected ? "#1f180e" : "#110e08",
                  borderColor: isSelected ? char.color : isHovered ? "#6a5a3a" : "#2a221a",
                  boxShadow: isSelected
                    ? `0 0 14px ${char.color}55, 0 0 28px ${char.color}22`
                    : isHovered ? "0 0 6px rgba(201,169,110,0.15)" : "none",
                  transform: isSelected || isHovered ? "scale(1.06)" : "scale(1)",
                  aspectRatio: "3 / 4",
                }}
              >
                <CharacterIcon characterId={char.id} size={0} />
              </button>
            );
          })}
        </div>

        {/* ── Info panel ─────────────────────────────────────────────────────── */}
        <div
          className="w-full max-w-3xl rounded-xl border p-4 sm:p-5 transition-all duration-300 mb-4"
          style={{
            backgroundColor: "#110e08",
            borderColor: displayed ? displayed.color + "55" : "#2a221a",
            boxShadow: displayed ? `0 0 20px ${displayed.color}18` : "none",
            minHeight: "120px",
          }}
        >
          {displayed?.id === "__random__" ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="shrink-0 rounded-lg overflow-hidden self-start" style={{ backgroundColor: "#c9a96e18", border: "1px solid #c9a96e44", width: 72, height: 96 }}>
                <img src="/characters/Random_Character_Portrait.webp" alt="Random" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
              </div>
              <div className="flex-1 flex flex-col justify-center gap-1">
                <h2 className="text-xl font-bold tracking-wider uppercase" style={{ color: "#c9a96e", fontFamily: "Georgia, serif", textShadow: "0 0 10px #c9a96e66" }}>Random</h2>
                <span className="text-[#5a4d3d] text-xs italic">Mystery Survivor</span>
                <p className="text-[#8b7355] text-sm italic mt-1">Your fate is chosen for you.<br />A random survivor will be selected.</p>
              </div>
            </div>
          ) : displayed ? (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Portrait */}
              <div
                className="shrink-0 rounded-lg p-2 self-start"
                style={{ backgroundColor: `${displayed.color}18`, border: `1px solid ${displayed.color}44` }}
              >
                <CharacterIcon characterId={displayed.id} size={72} />
              </div>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h2
                    className="text-xl font-bold tracking-wider uppercase"
                    style={{ color: displayed.color, fontFamily: "Georgia, serif", textShadow: `0 0 10px ${displayed.color}66` }}
                  >
                    {displayed.name}
                  </h2>
                  <span className="text-[#5a4d3d] text-xs italic">Survivor</span>
                </div>
                <p className="text-[#c9b896] text-sm italic mt-1 mb-2 leading-relaxed">
                  &ldquo;{displayed.quote}&rdquo;
                </p>
                <p className="text-[#8b7355] text-xs mb-3 leading-relaxed">{displayed.perk}</p>

                {/* Stats */}
                <div className="flex flex-col gap-1.5">
                  <StatBar label="Health"  value={displayed.health}  max={250} color="#e74c3c" />
                  <StatBar label="Hunger"  value={displayed.hunger}  max={250} color="#e8a838" />
                  <StatBar label="Sanity"  value={displayed.sanity}  max={300} color="#4a90d9" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#3a3028] text-sm italic">
              Hover over a survivor to learn more...
            </div>
          )}
        </div>

        {/* ── Confirm button ──────────────────────────────────────────────────── */}
        <button
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
          className="px-10 py-3 text-base font-bold uppercase tracking-widest rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: selected
              ? `linear-gradient(135deg, #5a3c10, ${isRandom ? "#c9a96e" : selected.color}cc, #5a3c10)`
              : "#1a1410",
            color: selected ? "#0d0b06" : "#3a3028",
            border: selected ? `2px solid ${isRandom ? "#c9a96e" : selected.color}` : "2px solid #2a221a",
            boxShadow: selected ? `0 0 20px ${isRandom ? "#c9a96e" : selected.color}44, 0 4px 12px rgba(0,0,0,0.6)` : "none",
            transform: selected ? "scale(1.02)" : "scale(1)",
            fontFamily: "Georgia, serif",
          }}
        >
          {selected
            ? isRandom ? "Venture Forth into the Unknown" : `Venture Forth as ${selected.name}`
            : "Select a Survivor"}
        </button>
      </div>

      {/* Twinkling star animation */}
      <style>{`
        @keyframes twinkle {
          from { opacity: var(--from-opacity, 0.2); }
          to   { opacity: var(--to-opacity,   0.9); }
        }
      `}</style>
    </div>
  );
}
