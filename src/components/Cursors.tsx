"use client";

import { useOthers } from "@/liveblocks.config";

function Cursor({ x, y, color, name, isDragging }: {
  x: number;
  y: number;
  color: string;
  name: string;
  isDragging: boolean;
}) {
  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-75"
      style={{
        left: x,
        top: y,
        transform: "translate(-2px, -2px)",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={color}
        style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.5))" }}
      >
        <path d="M5.65 2.65l12.5 12.5a1 1 0 01-1.1 1.6l-4.6-4.6L4 22l2-6-4.6-4.6a1 1 0 011.6-1.1l3.65 3.65z" />
      </svg>
      <div
        className="absolute left-5 top-4 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
        {isDragging && <span className="ml-1">✋</span>}
      </div>
    </div>
  );
}

export function Cursors() {
  const others = useOthers();

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence?.cursor) return null;
        
        return (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            color={info?.color || "#888"}
            name={info?.name || "Anonymous"}
            isDragging={!!presence.draggingTaskId}
          />
        );
      })}
    </>
  );
}
