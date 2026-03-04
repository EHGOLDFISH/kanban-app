"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface DrawingPanelProps {
  strokes: Stroke[];
  onStrokeAdd: (stroke: Stroke) => void;
  onClear: () => void;
  onAddAsNote?: (dataUrl: string) => void;
  backgroundImage?: string;      // data URL to load as background (editing existing image task)
  onCancelEdit?: () => void;     // called when user cancels editing an existing image
  isEditingNote?: boolean;       // true when editing an existing image task
}

export interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export function DrawingPanel({ strokes, onStrokeAdd, onClear, onAddAsNote, backgroundImage, onCancelEdit, isEditingNote }: DrawingPanelProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const uploadRef  = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#c9b896");
  const [lineWidth, setLineWidth] = useState(3);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const bgImgRef   = useRef<HTMLImageElement | null>(null);
  const [bgVersion, setBgVersion] = useState(0); // bumped when bgImgRef changes to force redraw

  // Resolve active background: locally uploaded takes precedence over prop (edit mode)
  const [uploadedBg, setUploadedBg] = useState<string | null>(null);
  const activeBg = uploadedBg ?? backgroundImage ?? null;

  // Clear local upload whenever the parent switches to a different background (edit mode)
  useEffect(() => { setUploadedBg(null); }, [backgroundImage]);

  // Load active background into bgImgRef
  useEffect(() => {
    if (!activeBg) { bgImgRef.current = null; setBgVersion((v) => v + 1); return; }
    const img = new Image();
    img.onload = () => { bgImgRef.current = img; setBgVersion((v) => v + 1); };
    img.src = activeBg;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBg]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedBg(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const hasLocalBg = !!uploadedBg;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1a1612";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (bgImgRef.current) {
      ctx.drawImage(bgImgRef.current, 0, 0, canvas.width, canvas.height);
    }

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
    
    if (currentStroke && currentStroke.points.length > 1) {
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      currentStroke.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, [strokes, currentStroke, bgVersion]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    setCurrentStroke({ points: [pos], color, width: lineWidth });
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    const pos = getPos(e);
    setCurrentStroke((prev) => prev ? { ...prev, points: [...prev.points, pos] } : null);
  };

  const stopDrawing = () => {
    if (currentStroke && currentStroke.points.length > 1) {
      onStrokeAdd(currentStroke);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const handleAddAsNote = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onAddAsNote) return;
    const dataUrl = canvas.toDataURL("image/png");
    onAddAsNote(dataUrl);
  };

  const colors = ["#c9b896", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="flex flex-col flex-1 min-w-[300px] ml-6 h-[calc(100vh-140px)]">
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
          <button
            onClick={() => uploadRef.current?.click()}
            className="text-xs text-[#8b7355] hover:text-[#c9b896] transition-colors"
            title="Upload a screenshot or image"
          >
            Upload
          </button>
          <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => { setUploadedBg(null); onClear(); }}
            className="text-xs text-[#8b7355] hover:text-[#c9b896] transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 mb-3 flex-wrap">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer"
        />
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-20 ml-2"
        />
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-[#4a3f32] rounded-lg cursor-crosshair"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      
      {onAddAsNote && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAddAsNote}
            className="px-4 py-2 bg-[#8b6914] text-[#1a1612] rounded font-medium hover:bg-[#a67c16] transition-colors"
          >
            {isEditingNote ? "Update Note" : "+ Add to Note"}
          </button>
          {(isEditingNote || hasLocalBg) && (
            <button
              onClick={() => { setUploadedBg(null); onCancelEdit?.(); }}
              className="px-4 py-2 text-[#8b7355] rounded border border-[#3d332a] hover:text-[#c9b896] hover:border-[#8b7355] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
