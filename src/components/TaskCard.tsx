"use client";

import { useState, useRef, useEffect } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Task, TaskAssignee } from "@/types/kanban";
import { useOthers, useSelf } from "@/liveblocks.config";
import { CharacterIcon } from "@/components/DSTCharacters";

interface TaskCardProps {
  task: Task;
  index: number;
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string, newContent: string) => void;
  onEditImage: (taskId: string) => void;
  onAssign: (taskId: string, assignee: TaskAssignee | null) => void;
}

export function TaskCard({ task, index, onDelete, onEdit, onEditImage, onAssign }: TaskCardProps) {
  const [isEditing, setIsEditing]   = useState(false);
  const [editText, setEditText]     = useState(task.content);
  const [showAssign, setShowAssign] = useState(false);
  const assignRef = useRef<HTMLDivElement>(null);

  const others = useOthers();
  const self   = useSelf();
  const isImage = task.content.startsWith("data:image");

  // Build list of everyone in the room (self first, then others)
  const users: TaskAssignee[] = [
    ...(self ? [{ name: self.presence.name, characterId: self.presence.characterId, color: self.presence.color }] : []),
    ...others.map((o) => ({ name: o.presence.name, characterId: o.presence.characterId, color: o.presence.color })),
  ];

  // Close popover when clicking outside
  useEffect(() => {
    if (!showAssign) return;
    function handler(e: MouseEvent) {
      if (assignRef.current && !assignRef.current.contains(e.target as Node)) setShowAssign(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAssign]);

  function startEdit() { setEditText(task.content); setIsEditing(true); }
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
              <div className="flex items-center gap-1 shrink-0">
                {/* Assign button */}
                <div className="relative" ref={assignRef}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAssign((v) => !v); }}
                    className="opacity-0 group-hover:opacity-100 transition-colors text-[#5a4d3d] hover:text-[#c9b896]"
                    title="Assign task"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 5c0-2.761-2.239-5-5-5S3 10.239 3 13h10z"/>
                    </svg>
                  </button>

                  {showAssign && (
                    <div
                      className="absolute right-0 top-6 z-50 rounded-lg border shadow-xl min-w-[160px]"
                      style={{ backgroundColor: "#1a1410", borderColor: "#3d332a" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-[#5a4d3d] border-b border-[#2a221a]">
                        Assign to
                      </div>
                      {users.map((u) => (
                        <button
                          key={u.name}
                          onClick={() => { onAssign(task.id, u); setShowAssign(false); }}
                          className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-[#2a231c] transition-colors"
                        >
                          <div className="w-5 h-5 rounded-full overflow-hidden shrink-0" style={{ border: `1px solid ${u.color}` }}>
                            <CharacterIcon characterId={u.characterId} size={20} />
                          </div>
                          <span className="text-xs text-[#c9b896] truncate">{u.name}</span>
                          {task.assignedTo?.name === u.name && (
                            <span className="ml-auto text-[#8b6914] text-xs">✓</span>
                          )}
                        </button>
                      ))}
                      {task.assignedTo && (
                        <>
                          <div className="border-t border-[#2a221a]" />
                          <button
                            onClick={() => { onAssign(task.id, null); setShowAssign(false); }}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-[#2a231c] transition-colors text-[#5a4d3d] hover:text-[#c9b896] text-xs"
                          >
                            Unassign
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                  className="text-[#5a4d3d] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete task"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Assignee badge */}
          {task.assignedTo && !isEditing && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#2a221a]">
              <div className="w-4 h-4 rounded-full overflow-hidden shrink-0" style={{ border: `1px solid ${task.assignedTo.color}` }}>
                <CharacterIcon characterId={task.assignedTo.characterId} size={16} />
              </div>
              <span className="text-[10px] truncate" style={{ color: task.assignedTo.color }}>
                {task.assignedTo.name}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
