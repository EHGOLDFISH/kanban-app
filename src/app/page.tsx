import { KanbanBoard } from "@/components/KanbanBoard";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#4a3f32] px-6 py-4 bg-[#1f1a15]">
        <h1 className="text-xl font-bold tracking-wider text-[#c9b896] uppercase" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
          Survive Together
        </h1>
      </header>
      <main>
        <KanbanBoard />
      </main>
    </div>
  );
}
