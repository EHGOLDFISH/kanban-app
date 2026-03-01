"use client";

import { useRef, useState, useEffect } from "react";

interface SketchBoardProps {
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

export function SketchBoard({ onSave, onClose }: SketchBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#c9b896");
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#1a1612";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#1a1612";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  const colors = ["#c9b896", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a231c] border border-[#4a3f32] rounded-lg p-4 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#c9b896]">Sketch Board</h3>
          <button onClick={onClose} className="text-[#8b7355] hover:text-[#c9b896]">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-3 flex-wrap">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs text-[#8b7355]">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20"
            />
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={700}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border border-[#4a3f32] rounded cursor-crosshair"
          style={{ maxWidth: "100%", height: "auto" }}
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={clear}
            className="px-4 py-2 bg-[#3d332a] text-[#c9b896] border border-[#4a3f32] rounded hover:border-[#8b6914] transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#8b7355] hover:text-[#c9b896] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 px-4 py-2 bg-[#8b6914] text-[#1a1612] rounded font-medium hover:bg-[#a67c16] transition-colors"
          >
            Add to Board
          </button>
        </div>
      </div>
    </div>
  );
}
