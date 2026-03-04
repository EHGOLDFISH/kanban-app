"use client";

import { use, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  useStorage,
  useMutation,
  useOthers,
  useSelf,
  useMyPresence,
  RoomProvider,
} from "@/liveblocks.config";
import { Column as ColumnComponent } from "@/components/Column";
import { DrawingPanel } from "@/components/DrawingPanel";
import { CharacterIcon, DSTCharacter } from "@/components/DSTCharacters";
import { CharacterSelect } from "@/components/CharacterSelect";
import { LiveMap, LiveList } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";

type TaskAssignee = { name: string; characterId: string; color: string };
type TaskItem   = { id: string; content: string; assignedTo?: TaskAssignee };
type ColumnType = { id: string; title: string; taskIds: string[] };
type Stroke     = { points: { x: number; y: number }[]; color: string; width: number };
type SaveFile   = { tasks: TaskItem[]; columns: ColumnType[]; columnOrder: string[] };

// ─── Local cache helpers (localStorage) ──────────────────────────────────────
// Liveblocks has storage size limits; store image content + assignee locally as fallback.
function cacheImage(taskId: string, dataUrl: string) {
  try { localStorage.setItem(`kimg_${taskId}`, dataUrl); } catch {}
}
function getCachedImage(taskId: string): string | null {
  try { return localStorage.getItem(`kimg_${taskId}`); } catch { return null; }
}
function cacheAssignee(taskId: string, assignee: TaskAssignee | null) {
  try {
    if (assignee) localStorage.setItem(`kassignee_${taskId}`, JSON.stringify(assignee));
    else localStorage.removeItem(`kassignee_${taskId}`);
  } catch {}
}
function getCachedAssignee(taskId: string): TaskAssignee | null {
  try {
    const v = localStorage.getItem(`kassignee_${taskId}`);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

// ─── Board content (inside RoomProvider) ─────────────────────────────────────

function BoardContent({ boardId }: { boardId: string }) {
  const tasks       = useStorage((root) => root.tasks);
  const columns     = useStorage((root) => root.columns);
  const columnOrder = useStorage((root) => root.columnOrder);
  const strokes     = useStorage((root) => root.strokes);
  const others      = useOthers();
  const self        = useSelf();
  const [, updateMyPresence] = useMyPresence();

  // ── Empty-room auto-close ──────────────────────────────────────────────────
  const router      = useRouter();
  const hadOthers   = useRef(false);           // becomes true once someone joins
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (others.length > 0) {
      hadOthers.current = true;
      setCountdown(null);                      // cancel any pending close
    } else if (hadOthers.current) {
      setCountdown(30);                        // start 30-second countdown
    }
  }, [others.length]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { router.push("/"); return; }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  // Throttle cursor updates to ~20 fps
  const lastCursorSend = useRef(0);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastCursorSend.current < 50) return;
    lastCursorSend.current = now;
    updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } });
  }, [updateMyPresence]);

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addTask = useMutation(({ storage }, columnId: string, content: string) => {
    const taskId = `task-${Date.now()}`;
    storage.get("tasks").set(taskId, { id: taskId, content });
    const col = storage.get("columns").get(columnId);
    if (col) storage.get("columns").set(columnId, { ...col, taskIds: [...col.taskIds, taskId] });
  }, []);

  const editTask = useMutation(({ storage }, taskId: string, newContent: string) => {
    const existing = storage.get("tasks").get(taskId);
    if (existing) storage.get("tasks").set(taskId, { ...existing, content: newContent });
  }, []);

  const assignTask = useMutation(({ storage }, taskId: string, assignee: TaskAssignee | null) => {
    const existing = storage.get("tasks").get(taskId);
    if (existing) storage.get("tasks").set(taskId, { ...existing, assignedTo: assignee ?? undefined });
  }, []);

  const deleteTask = useMutation(({ storage }, taskId: string) => {
    storage.get("tasks").delete(taskId);
    for (const colId of Array.from(storage.get("columns").keys())) {
      const col = storage.get("columns").get(colId);
      if (col) storage.get("columns").set(colId, { ...col, taskIds: col.taskIds.filter((id: string) => id !== taskId) });
    }
  }, []);

  const moveTask = useMutation(({ storage }, result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const src  = storage.get("columns").get(source.droppableId);
    const dest = storage.get("columns").get(destination.droppableId);
    if (!src || !dest) return;
    if (src.id === dest.id) {
      const ids = [...src.taskIds];
      ids.splice(source.index, 1);
      ids.splice(destination.index, 0, draggableId);
      storage.get("columns").set(src.id, { ...src, taskIds: ids });
    } else {
      const srcIds  = [...src.taskIds];  srcIds.splice(source.index, 1);
      const destIds = [...dest.taskIds]; destIds.splice(destination.index, 0, draggableId);
      storage.get("columns").set(src.id,  { ...src,  taskIds: srcIds });
      storage.get("columns").set(dest.id, { ...dest, taskIds: destIds });
    }
  }, []);

  const addStroke = useMutation(({ storage }, stroke: Stroke) => {
    storage.get("strokes").push(stroke);
  }, []);

  const clearStrokes = useMutation(({ storage }) => {
    const list = storage.get("strokes");
    while (list.length > 0) list.delete(0);
  }, []);

  const undoStroke = useMutation(({ storage }) => {
    const list = storage.get("strokes");
    if (list.length > 0) list.delete(list.length - 1);
  }, []);

  const addSketchAsNote = useMutation(({ storage }, taskId: string, dataUrl: string) => {
    storage.get("tasks").set(taskId, { id: taskId, content: dataUrl });
    const col = storage.get("columns").get("column-1");
    if (col) storage.get("columns").set("column-1", { ...col, taskIds: [taskId, ...col.taskIds] });
  }, []);

  // ── Assign task (with local cache so assignee survives Liveblocks size limits)
  const handleAssignTask = useCallback((taskId: string, assignee: TaskAssignee | null) => {
    cacheAssignee(taskId, assignee);
    assignTask(taskId, assignee);
  }, [assignTask]);

  // ── Image task editing ─────────────────────────────────────────────────────
  const [editingImageTaskId, setEditingImageTaskId] = useState<string | null>(null);

  const handleEditImage = useCallback((taskId: string) => {
    setEditingImageTaskId(taskId);
  }, []);

  const handleSaveNote = useCallback((dataUrl: string) => {
    if (editingImageTaskId) {
      cacheImage(editingImageTaskId, dataUrl);
      editTask(editingImageTaskId, dataUrl);
      setEditingImageTaskId(null);
    } else {
      const taskId = `task-${Date.now()}`;
      cacheImage(taskId, dataUrl);
      addSketchAsNote(taskId, dataUrl);
    }
  }, [editingImageTaskId, editTask, addSketchAsNote]);

  const handleCancelEdit = useCallback(() => {
    setEditingImageTaskId(null);
  }, []);

  // ── Import mutation ────────────────────────────────────────────────────────

  const importBoard = useMutation(({ storage }, data: SaveFile) => {
    // Overwrite tasks
    const tasksMap = storage.get("tasks");
    for (const k of Array.from(tasksMap.keys())) tasksMap.delete(k);
    for (const t of data.tasks) tasksMap.set(t.id, t);
    // Overwrite columns
    const colsMap = storage.get("columns");
    for (const k of Array.from(colsMap.keys())) colsMap.delete(k);
    for (const c of data.columns) colsMap.set(c.id, c);
    // Overwrite column order
    const colOrder = storage.get("columnOrder");
    while (colOrder.length > 0) colOrder.delete(0);
    for (const id of data.columnOrder) colOrder.push(id);
  }, []);

  // ── Export ─────────────────────────────────────────────────────────────────

  const handleExport = useCallback(() => {
    if (!tasks || !columns || !columnOrder) return;
    // For image tasks, Liveblocks may have dropped the content due to size limits.
    // Fall back to the locally cached copy when the stored content is missing/empty.
    const taskList = Array.from(tasks.values()).map((t) => {
      let task = t as TaskItem;
      if (!task.content || task.content === "") {
        const cached = getCachedImage(t.id);
        if (cached) task = { ...task, content: cached };
      }
      if (!task.assignedTo) {
        const cached = getCachedAssignee(t.id);
        if (cached) task = { ...task, assignedTo: cached };
      }
      return task;
    });
    const data: SaveFile = {
      tasks:       taskList,
      columns:     Array.from(columns.values()),
      columnOrder: Array.from(columnOrder),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `dst-kanban-${boardId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks, columns, columnOrder, boardId]);

  // ── Import ─────────────────────────────────────────────────────────────────

  const importRef = useRef<HTMLInputElement>(null);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as SaveFile;
        if (!data.tasks || !data.columns || !data.columnOrder) throw new Error("Invalid save file");
        // Cache image content and assignees so they survive future exports
        for (const t of data.tasks) {
          if (t.content?.startsWith("data:image")) cacheImage(t.id, t.content);
          if (t.assignedTo) cacheAssignee(t.id, t.assignedTo);
        }
        importBoard(data);
      } catch {
        alert("Invalid save file. Please choose a valid DST Kanban save.");
      }
    };
    reader.readAsText(file);
    // reset so the same file can be re-imported
    e.target.value = "";
  }, [importBoard]);

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!tasks || !columns || !columnOrder || !strokes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0b06]">
        <div className="text-[#c9b896]">Loading board...</div>
      </div>
    );
  }

  const tasksObj       = Object.fromEntries(tasks.entries());
  const columnsObj     = Object.fromEntries(columns.entries());
  const columnOrderArr = Array.from(columnOrder);
  const strokesArr     = Array.from(strokes);

  const myCharId = self?.presence.characterId ?? "wilson";
  const myColor  = self?.presence.color       ?? "#888";
  const myName   = self?.presence.name        ?? "You";

  return (
    <div className="min-h-screen bg-[#0d0b06]" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="px-4 py-2 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0f0c07", borderColor: "#2a221a" }}
      >
        {/* Left: title + board ID */}
        <div className="flex items-center gap-3">
          <span
            className="text-[#c9a96e] font-bold tracking-widest text-sm uppercase"
            style={{ fontFamily: "Georgia, serif", textShadow: "0 0 10px rgba(201,169,110,0.3)" }}
          >
            Don&apos;t Starve Together
          </span>
          <span className="text-[#2a221a] text-xs">|</span>
          <span className="text-[#4a3f32] text-xs font-mono">{boardId}</span>
        </div>

        {/* Right: save/load + avatars */}
        <div className="flex items-center gap-3">
          {/* Export / Import */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExport}
              className="px-2 py-1 text-xs rounded border transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#110e08", borderColor: "#3a3028", color: "#8b7355" }}
              title="Export board as save file"
            >
              Export Save
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="px-2 py-1 text-xs rounded border transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#110e08", borderColor: "#3a3028", color: "#8b7355" }}
              title="Import board from save file"
            >
              Import Save
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
          </div>

          {/* Avatar stack */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div
                className="w-8 h-8 rounded-full border overflow-hidden"
                style={{ borderColor: myColor }}
                title={`${myName} (you)`}
              >
                <CharacterIcon characterId={myCharId} size={32} />
              </div>
              {others.slice(0, 6).map((other) => (
                <div
                  key={other.connectionId}
                  className="w-8 h-8 rounded-full border overflow-hidden"
                  style={{ borderColor: other.presence.color || "#888" }}
                  title={other.presence.name || "Unknown"}
                >
                  <CharacterIcon characterId={other.presence.characterId || "wilson"} size={32} />
                </div>
              ))}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold leading-none" style={{ color: myColor }}>{myName}</div>
              <div className="text-[10px] text-[#3a3028] leading-none mt-0.5">
                {others.length > 0 ? `+${others.length} online` : "alone in the dark"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Remote cursors ─────────────────────────────────────────────────── */}
      {others.map((other) =>
        other.presence?.cursor ? (
          <div
            key={other.connectionId}
            className="fixed pointer-events-none z-50"
            style={{
              left: 0,
              top: 0,
              transform: `translate(${other.presence.cursor.x}px, ${other.presence.cursor.y}px)`,
              transition: "transform 60ms linear",
              willChange: "transform",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M4 2L18 10L11 12L8.5 19L4 2Z"
                fill={other.presence.color || "#888"}
                stroke="#0d0b06"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="absolute flex items-center gap-1 rounded px-1.5 py-0.5 shadow-lg whitespace-nowrap"
              style={{ left: 16, top: 14, backgroundColor: other.presence.color || "#888" }}
            >
              <div className="w-4 h-4 rounded-full overflow-hidden bg-black/20 shrink-0">
                <CharacterIcon characterId={other.presence.characterId || "wilson"} size={16} />
              </div>
              <span className="text-[11px] font-bold text-black leading-none">
                {other.presence.name || "Unknown"}
              </span>
            </div>
          </div>
        ) : null
      )}

      {/* ── Kanban columns ─────────────────────────────────────────────────── */}
      <DragDropContext onDragEnd={moveTask}>
        <div className="flex gap-6 p-6 overflow-x-auto min-h-[calc(100vh-49px)]">
          {columnOrderArr.map((columnId) => {
            const column      = columnsObj[columnId];
            const columnTasks = column.taskIds.map((tid) => tasksObj[tid]).filter(Boolean);
            return (
              <ColumnComponent
                key={column.id}
                column={column}
                tasks={columnTasks}
                onAddTask={addTask}
                onDeleteTask={deleteTask}
                onEditTask={editTask}
                onEditImage={handleEditImage}
                onAssignTask={handleAssignTask}
              />
            );
          })}
          <DrawingPanel
            strokes={strokesArr}
            onStrokeAdd={addStroke}
            onUndoStroke={undoStroke}
            onClear={clearStrokes}
            onAddAsNote={handleSaveNote}
            backgroundImage={editingImageTaskId ? tasksObj[editingImageTaskId]?.content : undefined}
            isEditingNote={!!editingImageTaskId}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </DragDropContext>

      {/* ── Empty-room overlay ─────────────────────────────────────────────── */}
      {countdown !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="flex flex-col items-center gap-5 rounded-xl border p-10 text-center max-w-sm w-full"
            style={{ backgroundColor: "#0f0c07", borderColor: "#3a2a10" }}
          >
            {/* Skull / ghost icon */}
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="24" r="18" fill="#1a1410" stroke="#4a3a1a" strokeWidth="1.5" />
              <circle cx="22" cy="22" r="4" fill="#c9a96e" opacity="0.8" />
              <circle cx="34" cy="22" r="4" fill="#c9a96e" opacity="0.8" />
              <path d="M20 32 L22 36 L24 32 L28 36 L32 32 L34 36 L36 32" stroke="#4a3a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M18 42 Q28 50 38 42" stroke="#c9a96e" strokeWidth="1" strokeDasharray="2,3" fill="none" opacity="0.4" />
            </svg>

            <div>
              <h2
                className="text-xl font-bold text-[#c9a96e] tracking-widest uppercase mb-1"
                style={{ fontFamily: "Georgia, serif", textShadow: "0 0 12px rgba(201,169,110,0.4)" }}
              >
                All Survivors Have Perished
              </h2>
              <p className="text-[#6a5a3a] text-sm">
                The wilderness claims the empty camp...
              </p>
            </div>

            {/* Countdown bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-[#4a3a1a] mb-1.5">
                <span>Returning to camp</span>
                <span className="font-mono text-[#8b7355]">{countdown}s</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#1a1410" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(countdown / 30) * 100}%`,
                    background: "linear-gradient(90deg, #5a3c10, #c9a96e)",
                  }}
                />
              </div>
            </div>

            {/* Stay button */}
            <button
              onClick={() => { hadOthers.current = false; setCountdown(null); }}
              className="px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-lg border transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "#1a1410",
                borderColor: "#3a2a10",
                color: "#8b7355",
                fontFamily: "Georgia, serif",
              }}
            >
              Stay in the Dark
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [character, setCharacter] = useState<DSTCharacter | null>(null);

  // Fresh LiveMap/LiveList per page mount → each board ID is isolated
  const [initialStorage] = useState(() => ({
    tasks: new LiveMap<string, TaskItem>([
      ["task-1", { id: "task-1", content: "Gather berries" }],
      ["task-2", { id: "task-2", content: "Chop trees" }],
      ["task-3", { id: "task-3", content: "Build a fire" }],
    ]),
    columns: new LiveMap<string, ColumnType>([
      ["column-1", { id: "column-1", title: "To Do",  taskIds: ["task-1", "task-2", "task-3"] }],
      ["column-2", { id: "column-2", title: "Doing",  taskIds: [] }],
      ["column-3", { id: "column-3", title: "Done",   taskIds: [] }],
    ]),
    columnOrder: new LiveList<string>(["column-1", "column-2", "column-3"]),
    strokes: new LiveList<Stroke>([]),
  }));

  // Show character select before connecting to the room
  if (!character) {
    return <CharacterSelect boardId={id} onSelect={setCharacter} />;
  }

  return (
    <RoomProvider
      id={`kanban-board-${id}`}
      initialPresence={{
        cursor:      null,
        name:        character.name,
        color:       character.color,
        characterId: character.id,
      }}
      initialStorage={initialStorage}
    >
      <ClientSideSuspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#0d0b06]">
            <div className="text-[#c9b896]">Venturing forth...</div>
          </div>
        }
      >
        {() => <BoardContent boardId={id} />}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
