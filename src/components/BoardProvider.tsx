"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";

interface BoardProviderProps {
  children: ReactNode;
  boardId: string;
}

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", 
  "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#ec4899", "#f43f5e"
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function getRandomName() {
  const adjectives = ["Hungry", "Brave", "Clever", "Wandering", "Mighty"];
  const nouns = ["Survivor", "Traveler", "Explorer", "Wanderer", "Adventurer"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

export function BoardProvider({ children, boardId }: BoardProviderProps) {
  const initialStorage = {
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
  };

  return (
    <RoomProvider
      id={`kanban-${boardId}`}
      initialPresence={{
        cursor: null,
        draggingTaskId: null,
      }}
      initialStorage={initialStorage}
    >
      <ClientSideSuspense fallback={<div className="text-[#c9b896] p-8">Loading...</div>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}

export { getRandomColor, getRandomName };
