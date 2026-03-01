"use client";

import { useState, useEffect, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { BoardData } from "@/types/kanban";
import { Column } from "./Column";

const STORAGE_KEY = "kanban-data";

const initialData: BoardData = {
  tasks: {
    "task-1": { id: "task-1", content: "Gather berries" },
    "task-2": { id: "task-2", content: "Chop trees" },
    "task-3": { id: "task-3", content: "Build a fire" },
    "task-4": { id: "task-4", content: "Hunt rabbits" },
    "task-5": { id: "task-5", content: "Repair shelter" },
    "task-6": { id: "task-6", content: "Survive the night" },
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "To Do",
      taskIds: ["task-1", "task-2", "task-3"],
    },
    "column-2": {
      id: "column-2",
      title: "Doing",
      taskIds: ["task-4", "task-5"],
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      taskIds: ["task-6"],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
};

function loadFromStorage(): BoardData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data: BoardData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function KanbanBoard() {
  const [data, setData] = useState<BoardData>(initialData);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setData(saved);
    }
    setIsLoaded(true);
    setIsOnline(navigator.onLine);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveToStorage(data);
    setLastSaved(new Date());
  }, [data, isLoaded]);

  const onAddTask = useCallback((columnId: string, content: string) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask = { id: newTaskId, content };

    setData((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          taskIds: [...prev.columns[columnId].taskIds, newTaskId],
        },
      },
    }));
  }, []);

  const onDeleteTask = useCallback((taskId: string) => {
    setData((prev) => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];

      const newColumns = { ...prev.columns };
      for (const columnId in newColumns) {
        newColumns[columnId] = {
          ...newColumns[columnId],
          taskIds: newColumns[columnId].taskIds.filter((id) => id !== taskId),
        };
      }

      return {
        ...prev,
        tasks: newTasks,
        columns: newColumns,
      };
    });
  }, []);

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setData((prev) => {
      const sourceColumn = prev.columns[source.droppableId];
      const destColumn = prev.columns[destination.droppableId];

      if (sourceColumn === destColumn) {
        const newTaskIds = Array.from(sourceColumn.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        return {
          ...prev,
          columns: {
            ...prev.columns,
            [sourceColumn.id]: { ...sourceColumn, taskIds: newTaskIds },
          },
        };
      } else {
        const sourceTaskIds = Array.from(sourceColumn.taskIds);
        sourceTaskIds.splice(source.index, 1);
        const destTaskIds = Array.from(destColumn.taskIds);
        destTaskIds.splice(destination.index, 0, draggableId);

        return {
          ...prev,
          columns: {
            ...prev.columns,
            [sourceColumn.id]: { ...sourceColumn, taskIds: sourceTaskIds },
            [destColumn.id]: { ...destColumn, taskIds: destTaskIds },
          },
        };
      }
    });
  }, []);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {lastSaved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900/80 backdrop-blur-sm text-gray-300 border border-gray-700 shadow-sm transition-all hover:shadow-lg hover:scale-105 hover:bg-gray-800/80 duration-200">
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-600 text-white text-xs font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 3.636a1 1 0.414  010 17 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-600 text-white text-xs font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Offline
              </span>
            )}
            <span className="ml-2 text-xs font-medium text-gray-400">• {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        )}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 p-6 overflow-x-auto min-h-[calc(100vh-100px)]">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                onAddTask={onAddTask}
                onDeleteTask={onDeleteTask}
              />
            );
          })}
        </div>
      </DragDropContext>
    </>
  );
}
