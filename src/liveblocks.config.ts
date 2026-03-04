import { createClient, LiveMap, LiveList, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

type TaskAssignee = {
  name: string;
  characterId: string;
  color: string;
};

type TaskItem = {
  id: string;
  content: string;
  assignedTo?: TaskAssignee;
};

type ColumnType = {
  id: string;
  title: string;
  taskIds: string[];
};

type Stroke = {
  points: { x: number; y: number }[];
  color: string;
  width: number;
};

type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
  characterId: string;
};

type Storage = {
  tasks: LiveMap<string, TaskItem>;
  columns: LiveMap<string, ColumnType>;
  columnOrder: LiveList<string>;
  strokes: LiveList<Stroke>;
};

type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
  };
};

type RoomEvent = never;

export const {
  RoomProvider,
  useOthers,
  useSelf,
  useStorage,
  useMutation,
  useRoom,
  useMyPresence,
  useBroadcastEvent,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

export type { TaskAssignee, TaskItem, ColumnType, Stroke, Presence };
