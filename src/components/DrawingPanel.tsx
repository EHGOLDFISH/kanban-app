"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface DrawingPanelProps {
  strokes: Stroke[];
  onStrokeAdd: (stroke: Stroke) => void;
  onClear: () => void;
  onAddAsNote?: (dataUrl: string) => void;
  backgroundImage?: string;
  onCancelEdit?: () => void;
  isEditingNote?: boolean;
}

export interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

type Tool = "pen" | "fill" | "stamp-tree" | "stamp-fire" | "stamp-plant" | "stamp-chest";

// ── Flood fill ────────────────────────────────────────────────────────────────

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  if (h.length === 3) return { r: parseInt(h[0]+h[0],16), g: parseInt(h[1]+h[1],16), b: parseInt(h[2]+h[2],16) };
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}

function floodFill(canvas: HTMLCanvasElement, startX: number, startY: number, fillHex: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const W = canvas.width, H = canvas.height;
  const sx = Math.floor(startX), sy = Math.floor(startY);
  if (sx < 0 || sx >= W || sy < 0 || sy >= H) return;
  const si = (sy * W + sx) * 4;
  const tr = d[si], tg = d[si+1], tb = d[si+2], ta = d[si+3];
  const fill = parseHex(fillHex);
  if (tr === fill.r && tg === fill.g && tb === fill.b && ta === 255) return;
  const tol = 20;
  const matches = (i: number) =>
    Math.abs(d[i]-tr) <= tol && Math.abs(d[i+1]-tg) <= tol &&
    Math.abs(d[i+2]-tb) <= tol && Math.abs(d[i+3]-ta) <= tol;
  const set = (i: number) => { d[i]=fill.r; d[i+1]=fill.g; d[i+2]=fill.b; d[i+3]=255; };
  const visited = new Uint8Array(W * H);
  const stack: number[] = [sy * W + sx];
  while (stack.length) {
    const idx = stack.pop()!;
    if (visited[idx]) continue;
    const pi = idx * 4;
    if (!matches(pi)) continue;
    visited[idx] = 1;
    set(pi);
    const x = idx % W, y = Math.floor(idx / W);
    if (x > 0)     stack.push(idx - 1);
    if (x < W - 1) stack.push(idx + 1);
    if (y > 0)     stack.push(idx - W);
    if (y < H - 1) stack.push(idx + W);
  }
  ctx.putImageData(imgData, 0, 0);
}

// ── Stamps ────────────────────────────────────────────────────────────────────

function drawTree(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Trunk
  ctx.fillStyle = "#6b4226";
  ctx.fillRect(cx - 5, cy + 4, 10, 20);
  // Tiers (bottom → top, darkest → lightest)
  ctx.fillStyle = "#2d5a1b";
  ctx.beginPath(); ctx.moveTo(cx, cy - 14); ctx.lineTo(cx - 24, cy + 8); ctx.lineTo(cx + 24, cy + 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3a7022";
  ctx.beginPath(); ctx.moveTo(cx, cy - 32); ctx.lineTo(cx - 18, cy - 8); ctx.lineTo(cx + 18, cy - 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#4a8c2a";
  ctx.beginPath(); ctx.moveTo(cx, cy - 46); ctx.lineTo(cx - 11, cy - 26); ctx.lineTo(cx + 11, cy - 26); ctx.closePath(); ctx.fill();
  // Snow tip
  ctx.fillStyle = "#ccc8c0";
  ctx.beginPath(); ctx.moveTo(cx, cy - 46); ctx.lineTo(cx - 4, cy - 38); ctx.lineTo(cx + 4, cy - 38); ctx.closePath(); ctx.fill();
}

function drawFire(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Logs
  ctx.fillStyle = "#5c3a1e";
  ctx.beginPath(); ctx.ellipse(cx, cy + 18, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#3d2510"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - 12, cy + 14); ctx.lineTo(cx + 12, cy + 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 14, cy + 18); ctx.lineTo(cx + 14, cy + 18); ctx.stroke();
  // Outer flame
  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 10);
  ctx.bezierCurveTo(cx - 18, cy - 2, cx - 12, cy - 18, cx, cy - 32);
  ctx.bezierCurveTo(cx + 12, cy - 18, cx + 18, cy - 2, cx + 12, cy + 10);
  ctx.closePath(); ctx.fill();
  // Mid flame
  ctx.fillStyle = "#e67e22";
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 8);
  ctx.bezierCurveTo(cx - 12, cy - 4, cx - 6, cy - 16, cx, cy - 26);
  ctx.bezierCurveTo(cx + 6, cy - 16, cx + 12, cy - 4, cx + 8, cy + 8);
  ctx.closePath(); ctx.fill();
  // Inner flame
  ctx.fillStyle = "#f1c40f";
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + 6);
  ctx.bezierCurveTo(cx - 5, cy - 4, cx - 2, cy - 14, cx, cy - 20);
  ctx.bezierCurveTo(cx + 2, cy - 14, cx + 5, cy - 4, cx + 4, cy + 6);
  ctx.closePath(); ctx.fill();
}

function drawPlant(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Pot
  ctx.fillStyle = "#7a4f2a";
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 8); ctx.lineTo(cx - 10, cy + 22);
  ctx.lineTo(cx + 10, cy + 22); ctx.lineTo(cx + 12, cy + 8);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#9b6634";
  ctx.fillRect(cx - 13, cy + 6, 26, 4);
  // Stems
  ctx.strokeStyle = "#5a8a30"; ctx.lineWidth = 2; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx, cy + 8); ctx.bezierCurveTo(cx, cy - 2, cx, cy - 8, cx, cy - 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy + 2); ctx.bezierCurveTo(cx - 6, cy - 6, cx - 14, cy - 8, cx - 18, cy - 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy + 2); ctx.bezierCurveTo(cx + 6, cy - 6, cx + 14, cy - 8, cx + 18, cy - 16); ctx.stroke();
  // Bush clusters (dark then light)
  ctx.fillStyle = "#2d6b18";
  ctx.beginPath(); ctx.arc(cx, cy - 22, 13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 14, cy - 18, 11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 14, cy - 18, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a8a22";
  ctx.beginPath(); ctx.arc(cx, cy - 22, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 14, cy - 18, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 14, cy - 18, 7, 0, Math.PI * 2); ctx.fill();
  // Red berries
  ctx.fillStyle = "#c0392b";
  ctx.beginPath(); ctx.arc(cx - 4, cy - 28, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 6, cy - 26, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 18, cy - 24, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 17, cy - 22, 2.5, 0, Math.PI * 2); ctx.fill();
  // Berry highlights
  ctx.fillStyle = "rgba(255,200,200,0.5)";
  ctx.beginPath(); ctx.arc(cx - 5, cy - 29, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 5, cy - 27, 1, 0, Math.PI * 2); ctx.fill();
}

function drawChest(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(cx, cy + 24, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = "#7a4f2a"; ctx.fillRect(cx - 22, cy, 44, 24);
  ctx.fillStyle = "#5c3a1e"; ctx.fillRect(cx - 22, cy + 18, 44, 6);
  // Lid
  ctx.fillStyle = "#9b6634"; ctx.fillRect(cx - 22, cy - 18, 44, 20);
  // Lid highlight
  ctx.fillStyle = "rgba(255,210,140,0.2)"; ctx.fillRect(cx - 19, cy - 16, 38, 7);
  // Dividing band
  ctx.fillStyle = "#5c3a1e"; ctx.fillRect(cx - 22, cy - 2, 44, 4);
  // Vertical bands
  ctx.fillRect(cx - 9, cy - 18, 3, 42);
  ctx.fillRect(cx + 6, cy - 18, 3, 42);
  // Gold latch
  ctx.fillStyle = "#c9a040"; ctx.fillRect(cx - 8, cy - 8, 16, 14);
  ctx.fillStyle = "#a07820"; ctx.fillRect(cx - 8, cy - 8, 16, 3);
  // Keyhole
  ctx.fillStyle = "#1a1410";
  ctx.beginPath(); ctx.arc(cx, cy - 2, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(cx - 2, cy - 2, 4, 5);
  // Outline
  ctx.strokeStyle = "#3d2510"; ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 22, cy - 18, 44, 42);
}

// ── Component ─────────────────────────────────────────────────────────────────

const TOOLS: { id: Tool; label: string; title: string; group: "draw" | "stamp" }[] = [
  { id: "pen",         label: "Pen",   title: "Draw freely",           group: "draw"  },
  { id: "fill",        label: "Fill",  title: "Flood-fill with color", group: "draw"  },
  { id: "stamp-tree",  label: "Tree",  title: "Place an evergreen",    group: "stamp" },
  { id: "stamp-fire",  label: "Fire",  title: "Place a campfire",      group: "stamp" },
  { id: "stamp-plant", label: "Plant", title: "Place a berry bush",    group: "stamp" },
  { id: "stamp-chest", label: "Chest", title: "Place a chest",         group: "stamp" },
];

export function DrawingPanel({ strokes, onStrokeAdd, onClear, onAddAsNote, backgroundImage, onCancelEdit, isEditingNote }: DrawingPanelProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const uploadRef  = useRef<HTMLInputElement>(null);

  const [isDrawing,     setIsDrawing]     = useState(false);
  const [color,         setColor]         = useState("#c9b896");
  const [lineWidth,     setLineWidth]     = useState(3);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [tool,          setTool]          = useState<Tool>("pen");

  const bgImgRef      = useRef<HTMLImageElement | null>(null);
  const [bgVersion,    setBgVersion]      = useState(0);
  const [uploadedBg,   setUploadedBg]     = useState<string | null>(null);
  // Holds a frozen snapshot of the canvas while a new bg image is loading (prevents flash)
  const frozenRef     = useRef<ImageData | null>(null);
  const onClearRef    = useRef(onClear);
  useEffect(() => { onClearRef.current = onClear; }, [onClear]);
  const pendingClearRef = useRef(false);

  const activeBg = uploadedBg ?? backgroundImage ?? null;
  useEffect(() => { setUploadedBg(null); }, [backgroundImage]);

  // Load background image
  useEffect(() => {
    if (!activeBg) { bgImgRef.current = null; setBgVersion((v) => v + 1); return; }
    const img = new Image();
    img.onload = () => {
      bgImgRef.current = img;
      frozenRef.current = null; // bg loaded — release frozen snapshot
      setBgVersion((v) => v + 1);
      if (pendingClearRef.current) {
        pendingClearRef.current = false;
        onClearRef.current();
      }
    };
    img.src = activeBg;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBg]);

  // Flatten current canvas into the background so fill/stamps don't re-render over strokes
  const flattenToBackground = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    frozenRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pendingClearRef.current = true;
    setUploadedBg(canvas.toDataURL("image/png"));
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // While waiting for a new bg image to load, use the frozen snapshot to prevent flash
    if (frozenRef.current) {
      ctx.putImageData(frozenRef.current, 0, 0);
      return;
    }

    ctx.fillStyle = "#1a1612";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (bgImgRef.current) ctx.drawImage(bgImgRef.current, 0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = stroke.color; ctx.lineWidth = stroke.width;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    if (currentStroke && currentStroke.points.length > 1) {
      ctx.strokeStyle = currentStroke.color; ctx.lineWidth = currentStroke.width;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      currentStroke.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [strokes, currentStroke, bgVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { redraw(); }, [redraw]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedBg(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width  / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (tool === "fill") {
      floodFill(canvas, pos.x, pos.y, color);
      flattenToBackground();
      return;
    }

    if (tool.startsWith("stamp-")) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (tool === "stamp-tree")  drawTree(ctx,  pos.x, pos.y);
      if (tool === "stamp-fire")  drawFire(ctx,  pos.x, pos.y);
      if (tool === "stamp-plant") drawPlant(ctx, pos.x, pos.y);
      if (tool === "stamp-chest") drawChest(ctx, pos.x, pos.y);
      flattenToBackground();
      return;
    }

    setCurrentStroke({ points: [pos], color, width: lineWidth });
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    const pos = getPos(e);
    setCurrentStroke((prev) => prev ? { ...prev, points: [...prev.points, pos] } : null);
  };

  const stopDrawing = () => {
    if (currentStroke && currentStroke.points.length > 1) onStrokeAdd(currentStroke);
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const handleAddAsNote = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onAddAsNote) return;
    onAddAsNote(canvas.toDataURL("image/png"));
  };

  const hasLocalBg = !!uploadedBg;
  const cursorStyle = tool === "pen" ? "crosshair" : tool === "fill" ? "cell" : "copy";

  const colors = ["#c9b896", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="flex flex-col flex-1 min-w-[300px] ml-6 h-[calc(100vh-140px)]">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[#c9b896] tracking-wide">Sketch Area</h2>
          {(isEditingNote || hasLocalBg) && (
            <span className="text-[10px] uppercase tracking-widest text-[#8b6914] border border-[#8b6914] px-1.5 py-0.5 rounded">
              {isEditingNote ? "Editing" : "Upload"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => uploadRef.current?.click()} className="text-xs text-[#8b7355] hover:text-[#c9b896] transition-colors" title="Upload image">Upload</button>
          <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <button onClick={() => { setUploadedBg(null); onClear(); }} className="text-xs text-[#8b7355] hover:text-[#c9b896] transition-colors">Clear</button>
        </div>
      </div>

      {/* Tool bar */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        {TOOLS.map((t, i) => {
          const isFirst  = i === 0;
          const prevTool = TOOLS[i - 1];
          const showSep  = !isFirst && t.group !== prevTool?.group;
          return (
            <span key={t.id} className="flex items-center gap-1">
              {showSep && <span className="w-px h-5 bg-[#3d332a] mx-0.5" />}
              <button
                onClick={() => setTool(t.id)}
                title={t.title}
                className="px-2.5 py-1 text-xs rounded border transition-colors"
                style={{
                  backgroundColor: "#1a1410",
                  borderColor:     tool === t.id ? "#8b6914" : "#3d332a",
                  color:           tool === t.id ? "#c9b896" : "#5a4d3d",
                }}
              >
                {t.label}
              </button>
            </span>
          );
        })}
      </div>

      {/* Color + size row (only shown for pen tool) */}
      <div className={`flex gap-2 mb-3 flex-wrap items-center transition-opacity ${tool !== "pen" ? "opacity-40 pointer-events-none" : ""}`}>
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
        <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-20 ml-2" />
      </div>
      {/* Fill color swatch (shown for fill tool) */}
      {tool === "fill" && (
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          <span className="text-xs text-[#5a4d3d]">Fill color:</span>
          {colors.map((c) => (
            <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`} style={{ backgroundColor: c }} />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-[#4a3f32] rounded-lg"
        style={{ maxWidth: "100%", height: "auto", cursor: cursorStyle }}
      />

      {onAddAsNote && (
        <div className="flex gap-2 mt-3">
          <button onClick={handleAddAsNote} className="px-4 py-2 bg-[#8b6914] text-[#1a1612] rounded font-medium hover:bg-[#a67c16] transition-colors">
            {isEditingNote ? "Update Note" : "+ Add to Note"}
          </button>
          {(isEditingNote || hasLocalBg) && (
            <button onClick={() => { setUploadedBg(null); onCancelEdit?.(); }} className="px-4 py-2 text-[#8b7355] rounded border border-[#3d332a] hover:text-[#c9b896] hover:border-[#8b7355] transition-colors">
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
