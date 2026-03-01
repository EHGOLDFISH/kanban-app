import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "",
});

type Presence = {
  cursor: { x: number; y: number } | null;
  draggingTaskId: string | null;
};

type Storage = {
  tasks: Record<string, { id: string; content: string }>;
  columns: Record<string, { id: string; title: string; taskIds: string[] }>;
  columnOrder: string[];
};

type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
  };
};

export const {
  RoomProvider,
  useMyPresence,
  useOthers,
  useSelf,
  useStorage,
  useMutation,
} = createRoomContext<Presence, Storage, UserMeta>(client);
