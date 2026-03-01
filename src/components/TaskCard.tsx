"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Task } from "@/types/kanban";

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded p-3 mb-2 select-none border transition-all ${
            snapshot.isDragging 
              ? "shadow-lg ring-2 ring-[#8b6914] bg-[#3d332a]" 
              : "bg-[#2a231c] border-[#4a3f32] hover:border-[#8b6914]"
          }`}
          style={provided.draggableProps.style}
        >
          <p className="text-sm text-[#c9b896]">{task.content}</p>
        </div>
      )}
    </Draggable>
  );
}
