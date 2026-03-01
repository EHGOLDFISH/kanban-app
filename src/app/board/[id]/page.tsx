"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Column } from "@/components/Column";
import { DrawingPanel, Stroke } from "@/components/DrawingPanel";

const STORAGE_PREFIX = "kanban-board-";

const initialData = {
  tasks: {
    "task-1": { id: "task-1", content: "Gather berries" },
    "task-2": { id: "task-2", content: "Chop trees" },
    "task-3": { id: "task-3", content: "Build a fire" },
  },
  columns: {
    "column-1": { id: "column-1", title: "To Do", taskIds: ["task-1", "task-2", "task-3"] },
    "column-2": { id: "column-2", title: "Doing", taskIds: [] },
    "column-3": { id: "column-3", title: "Done", taskIds: [] },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
  strokes: [] as Stroke[],
};

function loadFromStorage(boardId: string) {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + boardId);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveToStorage(boardId: string, data: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + boardId, JSON.stringify(data));
  } catch {}
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  
  const [data, setData] = useState<any>(initialData);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState("");

  useEffect(() => {
    const saved = loadFromStorage(boardId);
    if (saved) {
      setData(saved);
    }
    setIsLoaded(true);
    setIsOnline(navigator.onLine);
  }, [boardId]);

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
    saveToStorage(boardId, data);
    setLastSaved(new Date());
  }, [data, isLoaded, boardId]);

  const onAddTask = useCallback((columnId: string, content: string) => {
    const taskId = `task-${Date.now()}`;
    const newTask = { id: taskId, content };

    setData((prev: any) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: newTask,
      },
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          taskIds: [...prev.columns[columnId].taskIds, taskId],
        },
      },
    }));
  }, []);

  const onDeleteTask = useCallback((taskId: string) => {
    setData((prev: any) => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];

      const newColumns = { ...prev.columns };
      for (const columnId in newColumns) {
        newColumns[columnId] = {
          ...newColumns[columnId],
          taskIds: newColumns[columnId].taskIds.filter((id: string) => id !== taskId),
        };
      }

      return {
        ...prev,
        tasks: newTasks,
        columns: newColumns,
      };
    });
  }, []);

  const handleStrokeAdd = useCallback((stroke: Stroke) => {
    setData((prev: any) => ({
      ...prev,
      strokes: [...(prev.strokes || []), stroke],
    }));
  }, []);

  const handleClearStrokes = useCallback(() => {
    setData((prev: any) => ({
      ...prev,
      strokes: [],
    }));
  }, []);

  const handleAddSketchAsNote = useCallback((dataUrl: string) => {
    const taskId = `task-${Date.now()}`;
    const newTask = { id: taskId, content: dataUrl };

    setData((prev: any) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: newTask,
      },
      columns: {
        ...prev.columns,
        "column-1": {
          ...prev.columns["column-1"],
          taskIds: [taskId, ...prev.columns["column-1"].taskIds],
        },
      },
    }));
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

    setData((prev: any) => {
      const sourceColumn = prev.columns[source.droppableId];
      const destColumn = prev.columns[destination.droppableId];

      if (sourceColumn.id === destColumn.id) {
        const newTaskIds = [...sourceColumn.taskIds];
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        return {
          ...prev,
          columns: {
            ...prev.columns,
            [sourceColumn.id]: {
              ...sourceColumn,
              taskIds: newTaskIds,
            },
          },
        };
      } else {
        const sourceTaskIds = [...sourceColumn.taskIds];
        sourceTaskIds.splice(source.index, 1);

        const destTaskIds = [...destColumn.taskIds];
        destTaskIds.splice(destination.index, 0, draggableId);

        return {
          ...prev,
          columns: {
            ...prev.columns,
            [sourceColumn.id]: {
              ...sourceColumn,
              taskIds: sourceTaskIds,
            },
            [destColumn.id]: {
              ...destColumn,
              taskIds: destTaskIds,
            },
          },
        };
      }
    });
  }, []);

  const handleExport = () => {
    const exportObj = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: data,
    };
    const json = JSON.stringify(exportObj, null, 2);
    setExportData(json);
    setShowExportModal(true);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            if (imported.data && imported.data.tasks && imported.data.columns) {
              setData(imported.data);
            } else {
              alert("Invalid board file");
            }
          } catch {
            alert("Failed to parse file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
  };

  const downloadJson = () => {
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kanban-board-${boardId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#c9b896]">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <header className="border-b border-[#4a3f32] px-6 py-4 bg-[#1f1a15] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-[#8b7355] hover:text-[#c9b896] transition-colors text-sm"
            >
              ← Home
            </button>
            <h1 className="text-xl font-bold tracking-wider text-[#c9b896] uppercase" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
              Board: {boardId}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="px-3 py-1.5 bg-[#3d332a] text-[#c9b896] text-sm rounded border border-[#4a3f32] hover:border-[#8b6914] transition-colors"
            >
              Import
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-[#3d332a] text-[#c9b896] text-sm rounded border border-[#4a3f32] hover:border-[#8b6914] transition-colors"
            >
              Export
            </button>
          </div>
        </header>

        <div className="fixed bottom-4 right-4 z-50">
          {lastSaved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900/80 backdrop-blur-sm text-gray-300 border border-gray-700 shadow-sm">
              {isOnline ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-600 text-white text-xs font-medium">
                  Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-600 text-white text-xs font-medium">
                  Offline
                </span>
              )}
              <span className="ml-2 text-xs font-medium text-gray-400">• {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 p-6 overflow-x-auto min-h-[calc(100vh-100px)]">
            {data.columnOrder.map((columnId: string) => {
              const column = data.columns[columnId];
              const tasks = column.taskIds.map((taskId: string) => data.tasks[taskId]);

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
            <DrawingPanel 
              strokes={data.strokes || []} 
              onStrokeAdd={handleStrokeAdd}
              onClear={handleClearStrokes}
              onAddAsNote={handleAddSketchAsNote}
            />
          </div>
        </DragDropContext>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a231c] border border-[#4a3f32] rounded-lg p-4 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#c9b896]">Export Board</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-[#8b7355] hover:text-[#c9b896]"
              >
                ✕
              </button>
            </div>
            <textarea
              value={exportData}
              readOnly
              className="w-full h-48 bg-[#1a1612] border border-[#4a3f32] rounded p-2 text-[#c9b896] text-xs font-mono resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 px-4 py-2 bg-[#8b6914] text-[#1a1612] rounded font-medium hover:bg-[#a67c16] transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={downloadJson}
                className="flex-1 px-4 py-2 bg-[#3d332a] text-[#c9b896] border border-[#4a3f32] rounded font-medium hover:border-[#8b6914] transition-colors"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
