"use client";

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Task } from "@/types/kanban";

interface TaskCardProps {
  task: Task;
  index: number;
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string, newContent: string) => void;
  onEditImage: (taskId: string) => void;
}

export function TaskCard({ task, index, onDelete, onEdit, onEditImage }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.content);
  const isImage = task.content.startsWith("data:image");

  function startEdit() {
    setEditText(task.content);
    setIsEditing(true);
  }

  function saveEdit() {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.content) onEdit(task.id, trimmed);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); }
    else if (e.key === "Escape") { setIsEditing(false); setEditText(task.content); }
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(!isEditing ? provided.dragHandleProps : {})}
          className={`rounded p-3 mb-2 border transition-all group ${
            snapshot.isDragging
              ? "shadow-lg ring-2 ring-[#8b6914] bg-[#3d332a] select-none"
              : "bg-[#2a231c] border-[#4a3f32] hover:border-[#8b6914]"
          }`}
          style={provided.draggableProps.style}
        >
          <div className="flex items-start justify-between gap-2">
            {isImage ? (
              <img
                src={task.content}
                alt="Sketch"
                className="max-w-full rounded border border-[#4a3f32] cursor-pointer"
                onDoubleClick={() => onEditImage(task.id)}
                title="Double-click to edit in canvas"
              />
            ) : isEditing ? (
              <textarea
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveEdit}
                className="w-full text-sm text-[#c9b896] resize-none outline-none bg-[#1a1410] border border-[#8b6914] rounded px-2 py-1 placeholder:text-[#5a4d3d]"
                rows={2}
              />
            ) : (
              <p
                className="text-sm text-[#c9b896] flex-1 cursor-text select-none"
                onDoubleClick={startEdit}
                title="Double-click to edit"
              >
                {task.content}
              </p>
            )}
            {!isEditing && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="text-[#5a4d3d] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                title="Delete task"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
