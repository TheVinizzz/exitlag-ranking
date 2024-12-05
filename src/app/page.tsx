import Image from "next/image";
import { RankingTable } from "@/components/RankingTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1520] text-white p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#E63946]">🏆 Ranking do Jogo</h1>
        <RankingTable />
      </main>
    </div>
  );
}
