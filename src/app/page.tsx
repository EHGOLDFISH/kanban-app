"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [boardId, setBoardId] = useState("");
  const [existingBoards, setExistingBoards] = useState<string[]>([]);

  useEffect(() => {
    const boards = Object.keys(localStorage)
      .filter((key) => key.startsWith("kanban-board-"))
      .map((key) => key.replace("kanban-board-", ""));
    setExistingBoards(boards);
  }, []);

  const createBoard = () => {
    const id = Math.random().toString(36).substring(2, 10);
    router.push(`/board/${id}`);
  };

  const openBoard = (id: string) => {
    router.push(`/board/${id}`);
  };

  const deleteBoard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this board?")) {
      localStorage.removeItem(`kanban-board-${id}`);
      setExistingBoards(existingBoards.filter((b) => b !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#c9b896] mb-2 tracking-wider uppercase" style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.8)" }}>
          Survive Together
        </h1>
        <p className="text-[#8b7355]">Kanban Board</p>
      </div>

      <button
        onClick={createBoard}
        className="px-8 py-4 bg-[#8b6914] text-[#1a1612] text-lg font-semibold rounded-lg hover:bg-[#a67c16] transition-all hover:scale-105 hover:shadow-lg shadow-md mb-8"
      >
        + Create New Board
      </button>

      {existingBoards.length > 0 && (
        <div className="w-full max-w-md">
          <h2 className="text-[#c9b896] font-semibold mb-4 text-center">Your Boards</h2>
          <div className="space-y-2">
            {existingBoards.map((id) => (
              <div
                key={id}
                onClick={() => openBoard(id)}
                className="flex items-center justify-between p-4 bg-[#2a231c] border border-[#4a3f32] rounded-lg hover:border-[#8b6914] cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <span className="text-[#c9b896] font-mono">Board: {id}</span>
                <button
                  onClick={(e) => deleteBoard(id, e)}
                  className="text-[#5a4d3d] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
