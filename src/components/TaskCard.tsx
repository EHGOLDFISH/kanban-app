"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Task } from "@/types/kanban";

interface TaskCardProps {
  task: Task;
  index: number;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, index, onDelete }: TaskCardProps) {
  const isImage = task.content.startsWith("data:image");

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded p-3 mb-2 select-none border transition-all group ${
            snapshot.isDragging 
              ? "shadow-lg ring-2 ring-[#8b6914] bg-[#3d332a]" 
              : "bg-[#2a231c] border-[#4a3f32] hover:border-[#8b6914]"
          }`}
          style={provided.draggableProps.style}
        >
          <div className="flex items-start justify-between gap-2">
            {isImage ? (
              <img 
                src={task.content} 
                alt="Sketch" 
                className="max-w-full rounded border border-[#4a3f32]"
              />
            ) : (
              <p className="text-sm text-[#c9b896]">{task.content}</p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-[#5a4d3d] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              title="Delete task"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
