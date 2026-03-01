"use client";

import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Column as ColumnType, Task } from "@/types/kanban";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (columnId: string, content: string) => void;
}

export function Column({ column, tasks, onAddTask }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");

  const handleAdd = () => {
    if (newTaskContent.trim()) {
      onAddTask(column.id, newTaskContent.trim());
      setNewTaskContent("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTaskContent("");
    }
  };

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-[#c9b896] tracking-wide">{column.title}</h2>
        <span className="text-xs bg-[#3d332a] text-[#8b7355] px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 bg-[#231d17] rounded-lg p-2 min-h-[200px] transition-colors border border-[#3d332a] ${
              snapshot.isDraggingOver ? "bg-[#2d241c] border-[#8b6914]" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
            
            {isAdding ? (
              <div className="bg-[#2a231c] rounded p-3 border border-[#4a3f32]">
                <textarea
                  autoFocus
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter task description..."
                  className="w-full text-sm text-[#c9b896] resize-none outline-none bg-transparent placeholder:text-[#5a4d3d]"
                  rows={2}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAdd}
                    className="px-3 py-1.5 bg-[#8b6914] text-[#1a1612] text-sm rounded hover:bg-[#a67c16] transition-colors font-semibold"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewTaskContent("");
                    }}
                    className="px-3 py-1.5 text-[#8b7355] text-sm hover:text-[#c9b896] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full p-2 text-sm text-[#5a4d3d] hover:text-[#c9b896] hover:bg-[#2d241c] rounded-lg transition-colors text-left flex items-center gap-2 border border-dashed border-[#3d332a] hover:border-[#8b6914]"
              >
                <span>+</span> Add a task
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
