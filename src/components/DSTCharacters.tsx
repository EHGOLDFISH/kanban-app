"use client";

import { useState } from "react";

export interface DSTCharacter {
  id: string;
  name: string;
  color: string;
  portrait: string;   // path under /public/characters/
  quote: string;
  perk: string;
  health: number;
  hunger: number;
  sanity: number;
}

// ─── All 18 survivors (base + DLC, no Wonkey) ────────────────────────────────

export const DST_CHARACTERS: DSTCharacter[] = [
  // ── Base game ──────────────────────────────────────────────────────────────
  {
    id: "wilson", name: "Wilson", color: "#c9a96e",
    portrait: "/characters/Wilson_DST.webp",
    quote:  "Do you like science?",
    perk:   "Grows a magnificent beard that provides insulation and can be shaved for beard hair.",
    health: 150, hunger: 150, sanity: 200,
  },
  {
    id: "willow", name: "Willow", color: "#e74c3c",
    portrait: "/characters/Willow_DST.webp",
    quote:  "Hmmm. I wonder if these will burn.",
    perk:   "Immune to fire damage. Gains sanity near flames and can summon her bear Bernie.",
    health: 150, hunger: 150, sanity: 120,
  },
  {
    id: "wolfgang", name: "Wolfgang", color: "#4a90d9",
    portrait: "/characters/Wolfgang_DST.webp",
    quote:  "Mind says no. Muscles say yes!",
    perk:   "Becomes Mighty when well-fed (2× damage) or Wimpy when starving.",
    health: 200, hunger: 200, sanity: 200,
  },
  {
    id: "wendy", name: "Wendy", color: "#9b59b6",
    portrait: "/characters/Wendy_DST.webp",
    quote:  "Not all deaths are the same.",
    perk:   "Haunted by her twin sister Abigail who manifests as a ghostly combat companion.",
    health: 150, hunger: 150, sanity: 200,
  },
  {
    id: "wx78", name: "WX-78", color: "#7fb3c8",
    portrait: "/characters/WX-78_DST.webp",
    quote:  "SYSTEM OVERLOAD",
    perk:   "Crafts and equips circuits for upgrades. Charged by lightning, damaged by rain.",
    health: 125, hunger: 125, sanity: 150,
  },
  {
    id: "wickerbottom", name: "Wickerbottom", color: "#27ae60",
    portrait: "/characters/Wickerbottom_DST.webp",
    quote:  "Knowledge is power!",
    perk:   "Publishes magical books with powerful effects and identifies creatures by scientific name.",
    health: 150, hunger: 150, sanity: 250,
  },
  {
    id: "woodie", name: "Woodie", color: "#a0522d",
    portrait: "/characters/Woodie_DST.webp",
    quote:  "Lucy would want me to chop it down.",
    perk:   "Cursed to transform into Werebeaver, Weremoose, or Weregoose when the meter fills.",
    health: 150, hunger: 150, sanity: 200,
  },
  {
    id: "wes", name: "Wes", color: "#e8a838",
    portrait: "/characters/Wes_DST.webp",
    quote:  "...",
    perk:   "The mime creates balloons for allies but deals 25% less damage and has lower base stats.",
    health: 113, hunger: 113, sanity: 150,
  },
  {
    id: "maxwell", name: "Maxwell", color: "#8e44ad",
    portrait: "/characters/Maxwell_DST.webp",
    quote:  "Freedom, at last!",
    perk:   "Summons Shadow Puppets from the Codex Umbra. Naturally regenerates sanity over time.",
    health:  75, hunger: 150, sanity: 200,
  },
  {
    id: "wigfrid", name: "Wigfrid", color: "#e67e22",
    portrait: "/characters/Wigfrid_DST.webp",
    quote:  "Valhalla awaits!",
    perk:   "Deals 25% more damage and takes 25% less. Gains health and sanity from defeating enemies.",
    health: 200, hunger: 120, sanity: 120,
  },
  {
    id: "webber", name: "Webber", color: "#3c5c56",
    portrait: "/characters/Webber_DST.webp",
    quote:  "Spiders understand us.",
    perk:   "Can befriend and command spiders. Neutral to spider enemies. Eats monster food without penalty.",
    health: 175, hunger: 175, sanity: 100,
  },
  // ── DLC / Updates ──────────────────────────────────────────────────────────
  {
    id: "winona", name: "Winona", color: "#c0392b",
    portrait: "/characters/Winona_DST.webp",
    quote:  "Ha! I know all your moves!",
    perk:   "Builds efficient gadgets and catapults faster than anyone. Heals allies with trusty tape.",
    health: 150, hunger: 150, sanity: 200,
  },
  {
    id: "warly", name: "Warly", color: "#d4a017",
    portrait: "/characters/Warly_DST.webp",
    quote:  "Nothing worthwhile is ever done on an empty stomach!",
    perk:   "Uses a portable Crockpot and spices to cook unique dishes with powerful buffs. Only eats gourmet food.",
    health: 150, hunger: 250, sanity: 200,
  },
  {
    id: "wortox", name: "Wortox", color: "#a93226",
    portrait: "/characters/Wortox_DST.webp",
    quote:  "Oh, we're going to have some fun!",
    perk:   "Harvests souls from fallen creatures and can use them to heal allies or teleport through space.",
    health: 200, hunger: 175, sanity: 150,
  },
  {
    id: "wormwood", name: "Wormwood", color: "#1d6a3a",
    portrait: "/characters/Wormwood_DST.webp",
    quote:  "Mmm...Smells good!",
    perk:   "Cannot heal from food but heals by fertilizing himself. Loved by plants and neutral to plant enemies.",
    health: 150, hunger: 150, sanity: 200,
  },
  {
    id: "wurt", name: "Wurt", color: "#148f77",
    portrait: "/characters/Wurt_DST.webp",
    quote:  "Mermfolk known for hos-per-tality, florp.",
    perk:   "Can build a Merm King to command merm armies. Vegetarian and thrives in the swamp.",
    health: 150, hunger: 200, sanity: 150,
  },
  {
    id: "walter", name: "Walter", color: "#7d6608",
    portrait: "/characters/Walter_DST.webp",
    quote:  "A Pinetree Pioneer is always prepared!",
    perk:   "Expert slingshot fighter with his loyal dog Woby. Doesn't lose sanity from darkness.",
    health: 130, hunger: 110, sanity: 200,
  },
  {
    id: "wanda", name: "Wanda", color: "#d81b60",
    portrait: "/characters/Wanda_DST.webp",
    quote:  "Time! I just need more time!",
    perk:   "Ages as she takes damage, wielding powerful timepieces. Can rewind death with the Backtrek Watch.",
    health: 175, hunger: 200, sanity: 50,
  },
];

export function getRandomCharacter(): DSTCharacter {
  return DST_CHARACTERS[Math.floor(Math.random() * DST_CHARACTERS.length)];
}

// ─── SVG fallback bodies (used when portrait image fails to load) ─────────────

function Wilson() {
  return (
    <>
      <path d="M6 15 Q8 1 16 2 Q24 1 26 15" fill="#1a0f00" />
      <circle cx="16" cy="19" r="10" fill="#d4a96a" stroke="#1a0f00" strokeWidth="1" />
      <circle cx="12.5" cy="19" r="1.5" fill="#1a0f00" />
      <circle cx="19.5" cy="19" r="1.5" fill="#1a0f00" />
      <ellipse cx="16" cy="26" rx="2.5" ry="2" fill="#1a0f00" />
      <path d="M12 29 L14.5 27 L16 29 L14.5 31Z" fill="#6b1a0a" />
      <path d="M20 29 L17.5 27 L16 29 L17.5 31Z" fill="#6b1a0a" />
    </>
  );
}
function Willow() {
  return (
    <>
      <path d="M7 15 Q7 5 16 5 Q25 5 25 15" fill="#2a1a0a" />
      <circle cx="16" cy="18" r="10" fill="#f5d5bc" stroke="#1a0f00" strokeWidth="1" />
      <path d="M7 15 Q2 20 4 27" stroke="#2a1a0a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M25 15 Q30 20 28 27" stroke="#2a1a0a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="5"  cy="18" r="2.5" fill="#e74c3c" />
      <circle cx="27" cy="18" r="2.5" fill="#e74c3c" />
      <circle cx="12.5" cy="18" r="1.5" fill="#1a0f00" />
      <circle cx="19.5" cy="18" r="1.5" fill="#1a0f00" />
      <path d="M13 23 Q17 26 20 23" stroke="#1a0f00" strokeWidth="1.2" fill="none" />
    </>
  );
}
function Wolfgang() {
  return (
    <>
      <ellipse cx="16" cy="18" rx="12" ry="11" fill="#e8c080" stroke="#1a0f00" strokeWidth="1" />
      <path d="M5 14 Q5 2 16 3 Q27 2 27 14" fill="#d4a820" />
      <path d="M9 15 Q12 13 15 15" stroke="#5a3a10" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M17 15 Q20 13 23 15" stroke="#5a3a10" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="18" r="2" fill="#1a0f00" />
      <circle cx="20" cy="18" r="2" fill="#1a0f00" />
      <path d="M11 23 Q16 28 21 23" stroke="#1a0f00" strokeWidth="1.5" fill="none" />
    </>
  );
}
function Wendy() {
  return (
    <>
      <path d="M7 15 Q7 5 16 5 Q25 5 25 15" fill="#1a0a1a" />
      <circle cx="16" cy="18" r="10" fill="#e4d4e8" stroke="#1a0f00" strokeWidth="1" />
      <path d="M7 15 Q5 20 6 26 Q7 30 8 26" stroke="#1a0a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M25 15 Q27 20 26 26 Q25 30 24 26" stroke="#1a0a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="7" cy="26" r="2" fill="#4a1a4a" />
      <circle cx="25" cy="26" r="2" fill="#4a1a4a" />
      <circle cx="12.5" cy="18" r="1.5" fill="#1a0a1a" />
      <circle cx="19.5" cy="18" r="1.5" fill="#1a0a1a" />
      <path d="M13 23 Q16 21 19 23" stroke="#1a0a1a" strokeWidth="1.2" fill="none" />
    </>
  );
}
function WX78() {
  return (
    <>
      <line x1="12" y1="7"  x2="9"  y2="2"  stroke="#3a4a52" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="7"  x2="23" y2="2"  stroke="#3a4a52" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9"  cy="2" r="1.8" fill="#4ecdc4" />
      <circle cx="23" cy="2" r="1.8" fill="#4ecdc4" />
      <rect x="5" y="7" width="22" height="22" rx="3" fill="#8a9ba8" stroke="#3a4a52" strokeWidth="1.5" />
      <rect x="8"  y="14" width="6" height="4" rx="1" fill="#4ecdc4" />
      <rect x="18" y="14" width="6" height="4" rx="1" fill="#4ecdc4" />
      <line x1="9"  y1="22" x2="23" y2="22" stroke="#3a4a52" strokeWidth="1.5" />
      <line x1="10" y1="25" x2="22" y2="25" stroke="#3a4a52" strokeWidth="1.5" />
      <circle cx="6"  cy="11" r="1.5" fill="#3a4a52" />
      <circle cx="26" cy="11" r="1.5" fill="#3a4a52" />
    </>
  );
}
function Wickerbottom() {
  return (
    <>
      <path d="M7 15 Q7 5 16 5 Q25 5 25 15" fill="#9a9a8a" />
      <circle cx="16" cy="18" r="10" fill="#d4c8a0" stroke="#1a0f00" strokeWidth="1" />
      <circle cx="16" cy="4" r="4.5" fill="#9a9a8a" stroke="#6a6a5a" strokeWidth="1" />
      <circle cx="16" cy="4" r="2" fill="#7a7a6a" />
      <rect x="8.5" y="16" width="6" height="4.5" rx="1.5" fill="none" stroke="#3a2a10" strokeWidth="1.5" />
      <rect x="17.5" y="16" width="6" height="4.5" rx="1.5" fill="none" stroke="#3a2a10" strokeWidth="1.5" />
      <line x1="14.5" y1="18.2" x2="17.5" y2="18.2" stroke="#3a2a10" strokeWidth="1.5" />
      <circle cx="11.5" cy="18.3" r="1" fill="#1a0f00" />
      <circle cx="20.5" cy="18.3" r="1" fill="#1a0f00" />
      <path d="M12 24 Q16 27 20 24" stroke="#3a2a10" strokeWidth="1.2" fill="none" />
    </>
  );
}
function Woodie() {
  return (
    <>
      <path d="M7 14 Q7 4 16 4 Q25 4 25 14" fill="#5a3010" />
      <circle cx="16" cy="17" r="10" fill="#d4a870" stroke="#1a0f00" strokeWidth="1" />
      <path d="M8 26 Q16 30 24 26 L24 32 L8 32Z" fill="#8b1a1a" />
      <line x1="14" y1="26" x2="14" y2="32" stroke="#4a0a0a" strokeWidth="1" />
      <line x1="18" y1="26" x2="18" y2="32" stroke="#4a0a0a" strokeWidth="1" />
      <line x1="8"  y1="29" x2="24" y2="29" stroke="#4a0a0a" strokeWidth="1" />
      <path d="M8 21 Q16 30 24 21" fill="#5a3010" />
      <circle cx="12.5" cy="17" r="1.5" fill="#1a0f00" />
      <circle cx="19.5" cy="17" r="1.5" fill="#1a0f00" />
    </>
  );
}
function Wes() {
  return (
    <>
      <path d="M8 14 Q9 7 16 7 Q23 7 24 14" fill="#2a1a0a" />
      <circle cx="16" cy="18" r="10" fill="#f2f2f2" stroke="#1a0f00" strokeWidth="1" />
      <path d="M11 20 Q10 23 11 24 Q12 23 11 20" fill="#4aa0d0" />
      <circle cx="12.5" cy="18" r="1.5" fill="#1a0f00" />
      <circle cx="19.5" cy="18" r="1.5" fill="#1a0f00" />
      <path d="M12 23 Q16 20 20 23" stroke="#1a0f00" strokeWidth="1.5" fill="none" />
      <rect x="9" y="27" width="14" height="5" fill="#f2f2f2" stroke="#1a0f00" strokeWidth="0.8" />
      <line x1="12.5" y1="27" x2="12.5" y2="32" stroke="#1a0f00" strokeWidth="1.5" />
      <line x1="16"   y1="27" x2="16"   y2="32" stroke="#1a0f00" strokeWidth="1.5" />
      <line x1="19.5" y1="27" x2="19.5" y2="32" stroke="#1a0f00" strokeWidth="1.5" />
    </>
  );
}
function Maxwell() {
  return (
    <>
      <rect x="10" y="1"  width="12" height="10" fill="#1a0a2a" />
      <rect x="6"  y="10" width="20" height="2.5" rx="1" fill="#1a0a2a" />
      <rect x="10" y="9"  width="12" height="2.5" fill="#8e44ad" />
      <circle cx="16" cy="21" r="10" fill="#c8a880" stroke="#1a0f00" strokeWidth="1" />
      <circle cx="12.5" cy="21" r="1.5" fill="#1a0f00" />
      <circle cx="19.5" cy="21" r="1.5" fill="#1a0f00" />
      <path d="M14 26 Q16 31 18 26 Q16 29 14 26" fill="#1a0a2a" />
      <path d="M10 30 L13.5 27 L16 29.5 L18.5 27 L22 30" fill="#fff" stroke="#1a0f00" strokeWidth="0.8" />
    </>
  );
}
function Wigfrid() {
  return (
    <>
      <path d="M6 15 Q6 3 16 3 Q26 3 26 15" fill="#8a6a30" />
      <path d="M8 9  Q2 4 3 0  Q6 5 8 9"  fill="#d4c080" stroke="#9a8840" strokeWidth="1" />
      <path d="M24 9 Q30 4 29 0 Q26 5 24 9" fill="#d4c080" stroke="#9a8840" strokeWidth="1" />
      <circle cx="16" cy="19" r="10" fill="#f0c880" stroke="#1a0f00" strokeWidth="1" />
      <path d="M9  15 Q12 13 15 15" stroke="#3a2000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M17 15 Q20 13 23 15" stroke="#3a2000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="12.5" cy="19" r="1.5" fill="#1a0f00" />
      <circle cx="19.5" cy="19" r="1.5" fill="#1a0f00" />
      <path d="M13 24 Q16 27 19 24" stroke="#3a2000" strokeWidth="1.5" fill="none" />
    </>
  );
}
function Webber() {
  return (
    <>
      <line x1="16" y1="5"  x2="16" y2="29" stroke="#16a085" strokeWidth="0.8" strokeDasharray="2,2" />
      <line x1="4"  y1="17" x2="28" y2="17" stroke="#16a085" strokeWidth="0.8" strokeDasharray="2,2" />
      <line x1="8"  y1="8"  x2="24" y2="26" stroke="#16a085" strokeWidth="0.8" strokeDasharray="2,2" />
      <line x1="24" y1="8"  x2="8"  y2="26" stroke="#16a085" strokeWidth="0.8" strokeDasharray="2,2" />
      <circle cx="16" cy="17" r="10" fill="#c8e8c8" stroke="#1a0f00" strokeWidth="1" />
      <circle cx="12"   cy="15" r="1.8" fill="#1a2a1a" />
      <circle cx="20"   cy="15" r="1.8" fill="#1a2a1a" />
      <circle cx="9.5"  cy="18" r="1.2" fill="#1a2a1a" />
      <circle cx="22.5" cy="18" r="1.2" fill="#1a2a1a" />
      <path d="M13 22 Q11 26 10 25" stroke="#2a4a2a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M19 22 Q21 26 22 25" stroke="#2a4a2a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>
  );
}
function Winona() {
  return (
    <>
      <path d="M7 14 Q7 4 16 4 Q25 4 25 14" fill="#4a2800" />
      <circle cx="16" cy="17" r="10" fill="#d4a870" stroke="#1a0f00" strokeWidth="1" />
      <path d="M25 14 Q31 11 29 20 Q28 25 25 23" fill="#4a2800" stroke="#1a0f00" strokeWidth="0.8" />
      <circle cx="26.5" cy="16" r="2.5" fill="#c0392b" />
      <circle cx="12.5" cy="17" r="1.5" fill="#1a0f00" />
      <circle cx="19.5" cy="17" r="1.5" fill="#1a0f00" />
      <path d="M13 22 Q16 23.5 19 22" stroke="#3a1a00" strokeWidth="1.5" fill="none" />
      <rect x="21" y="24" width="6" height="2" rx="1" fill="#8a8a8a" transform="rotate(-35 21 24)" />
    </>
  );
}
function Warly() {
  return (
    <>
      {/* chef hat */}
      <ellipse cx="16" cy="7" rx="10" ry="6" fill="#f0f0f0" stroke="#2a1a0a" strokeWidth="1" />
      <rect x="9" y="11" width="14" height="3" fill="#f0f0f0" stroke="#2a1a0a" strokeWidth="1" />
      {/* face */}
      <circle cx="16" cy="21" r="10" fill="#d4a870" stroke="#1a0f00" strokeWidth="1" />
      {/* mustache */}
      <path d="M11 21 Q13.5 19 16 21 Q18.5 19 21 21" stroke="#4a2a00" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="12.5" cy="19" r="1.5" fill="#1a0f00" />
      <circle cx="19.5" cy="19" r="1.5" fill="#1a0f00" />
      <path d="M13 25 Q16 27 19 25" stroke="#1a0f00" strokeWidth="1.2" fill="none" />
    </>
  );
}
function Wortox() {
  return (
    <>
      {/* horns */}
      <path d="M10 12 Q7 3 11 7" fill="#8b1a1a" stroke="#5a0a0a" strokeWidth="1" />
      <path d="M22 12 Q25 3 21 7" fill="#8b1a1a" stroke="#5a0a0a" strokeWidth="1" />
      {/* imp face */}
      <circle cx="16" cy="18" r="10" fill="#c0392b" stroke="#1a0f00" strokeWidth="1" />
      {/* glowing eyes */}
      <circle cx="12.5" cy="17" r="2.5" fill="#f0a080" />
      <circle cx="19.5" cy="17" r="2.5" fill="#f0a080" />
      <circle cx="13"   cy="17" r="1.2" fill="#1a0f00" />
      <circle cx="20"   cy="17" r="1.2" fill="#1a0f00" />
      {/* grin */}
      <path d="M11 22 Q16 28 21 22" fill="#8b1010" stroke="#1a0f00" strokeWidth="1" />
      <line x1="13" y1="22" x2="13" y2="24" stroke="#f0f0f0" strokeWidth="1" />
      <line x1="16" y1="23" x2="16" y2="25" stroke="#f0f0f0" strokeWidth="1" />
      <line x1="19" y1="22" x2="19" y2="24" stroke="#f0f0f0" strokeWidth="1" />
    </>
  );
}
function Wormwood() {
  return (
    <>
      {/* leaves on head */}
      <path d="M11 11 Q9 2 16 5 Q23 2 21 11" fill="#27ae60" stroke="#1a5c30" strokeWidth="1" />
      <path d="M16 9 Q13 1 16 4 Q19 1 16 9"  fill="#2ecc71" />
      {/* green face */}
      <circle cx="16" cy="19" r="10" fill="#7dbb8c" stroke="#1a0f00" strokeWidth="1" />
      {/* diamond eyes */}
      <path d="M11 17 L13 15 L15 17 L13 19Z" fill="#1a0f00" />
      <path d="M17 17 L19 15 L21 17 L19 19Z" fill="#1a0f00" />
      <path d="M13 24 Q16 27 19 24" stroke="#1a0f00" strokeWidth="1.5" fill="none" />
    </>
  );
}
function Wurt() {
  return (
    <>
      {/* head fin */}
      <path d="M13 9 Q16 1 19 9" fill="#148f77" stroke="#0e6655" strokeWidth="1" />
      {/* merm face */}
      <ellipse cx="16" cy="19" rx="11" ry="10" fill="#45b39d" stroke="#1a0f00" strokeWidth="1" />
      {/* big smile */}
      <path d="M9 23 Q16 30 23 23" fill="#148f77" stroke="#1a0f00" strokeWidth="1" />
      {/* yellow eyes */}
      <circle cx="12" cy="17" r="2.2" fill="#f8c471" />
      <circle cx="20" cy="17" r="2.2" fill="#f8c471" />
      <circle cx="12" cy="17" r="1"   fill="#1a0f00" />
      <circle cx="20" cy="17" r="1"   fill="#1a0f00" />
    </>
  );
}
function Walter() {
  return (
    <>
      {/* scout cap */}
      <ellipse cx="16" cy="10" rx="11" ry="5" fill="#5d4037" stroke="#3e2723" strokeWidth="1" />
      <rect x="5" y="13" width="22" height="3" rx="1" fill="#4e342e" stroke="#3e2723" strokeWidth="1" />
      {/* badge */}
      <path d="M14 10 L16 7 L18 10 L16 12Z" fill="#ffd700" stroke="#b8860b" strokeWidth="0.5" />
      {/* face */}
      <circle cx="16" cy="22" r="9" fill="#f5cba7" stroke="#1a0f00" strokeWidth="1" />
      {/* freckles */}
      <circle cx="12"   cy="22" r="0.8" fill="#c9a96e" opacity="0.7" />
      <circle cx="13.5" cy="23.5" r="0.8" fill="#c9a96e" opacity="0.7" />
      <circle cx="20"   cy="22" r="0.8" fill="#c9a96e" opacity="0.7" />
      <circle cx="18.5" cy="23.5" r="0.8" fill="#c9a96e" opacity="0.7" />
      <circle cx="13" cy="20" r="1.5" fill="#1a0f00" />
      <circle cx="19" cy="20" r="1.5" fill="#1a0f00" />
      <path d="M13 25 Q16 28 19 25" stroke="#1a0f00" strokeWidth="1.2" fill="none" />
    </>
  );
}
function Wanda() {
  return (
    <>
      {/* silver/white hair */}
      <path d="M7 14 Q7 3 16 3 Q25 3 25 14" fill="#bdc3c7" />
      {/* aged face */}
      <circle cx="16" cy="18" r="10" fill="#d4c0a8" stroke="#1a0f00" strokeWidth="1" />
      {/* hourglass on forehead */}
      <path d="M14 10 L18 10 L17 13 L15 13Z" fill="#d81b60" stroke="#a01545" strokeWidth="0.5" />
      <path d="M15 13 L17 13 L18 16 L14 16Z" fill="#d81b60" stroke="#a01545" strokeWidth="0.5" />
      {/* wrinkle lines */}
      <path d="M10 17 Q12 16.5 10 18" stroke="#8a7a6a" strokeWidth="0.8" fill="none" />
      <path d="M22 17 Q20 16.5 22 18" stroke="#8a7a6a" strokeWidth="0.8" fill="none" />
      <circle cx="12.5" cy="19" r="1.5" fill="#1a0f00" />
      <circle cx="19.5" cy="19" r="1.5" fill="#1a0f00" />
      <path d="M13 24 Q16 27 19 24" stroke="#1a0f00" strokeWidth="1.2" fill="none" />
    </>
  );
}

const CHARACTER_BODIES: Record<string, React.FC> = {
  wilson:       Wilson,
  willow:       Willow,
  wolfgang:     Wolfgang,
  wendy:        Wendy,
  wx78:         WX78,
  wickerbottom: Wickerbottom,
  woodie:       Woodie,
  wes:          Wes,
  maxwell:      Maxwell,
  wigfrid:      Wigfrid,
  webber:       Webber,
  winona:       Winona,
  warly:        Warly,
  wortox:       Wortox,
  wormwood:     Wormwood,
  wurt:         Wurt,
  walter:       Walter,
  wanda:        Wanda,
};

// ─── CharacterIcon ────────────────────────────────────────────────────────────
// Uses the wiki portrait image; falls back to SVG on load error.

export function CharacterIcon({
  characterId,
  size = 32,
}: {
  characterId: string;
  size?: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const char = DST_CHARACTERS.find((c) => c.id === characterId);

  // size === 0 means "fill container via CSS 100%"
  const fill = size === 0;
  const px = fill ? "100%" : size;

  if (char?.portrait && !imgFailed) {
    return (
      <img
        src={char.portrait}
        alt={char.name}
        width={fill ? undefined : size}
        height={fill ? undefined : size}
        style={{ width: px, height: px, objectFit: "cover", objectPosition: fill ? "top center" : "center", display: "block" }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  const Body = CHARACTER_BODIES[characterId];
  if (!Body) {
    return (
      <svg width={px} height={px} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill={char?.color ?? "#888"} />
        <text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
          {char?.name.charAt(0) ?? "?"}
        </text>
      </svg>
    );
  }
  return (
    <svg width={px} height={px} viewBox="0 0 32 32" fill="none" style={{ display: "block" }}>
      <Body />
    </svg>
  );
}
