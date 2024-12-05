import Image from "next/image";
import { RankingTable } from "@/components/RankingTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1520] text-white p-8 relative">
      {/* Efeito de grid de fundo */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_1px,_#1A1520_1px),_linear-gradient(90deg,transparent_1px,_#1A1520_1px)] bg-[size:32px_32px] [background-position:center] opacity-20 pointer-events-none" style={{ backgroundColor: 'rgba(232, 76, 92, 0.05)' }} />
      
      <main className="max-w-7xl mx-auto relative">
        <h1 className="text-4xl font-bold text-center mb-8 pixel-text flex flex-row items-center justify-center">
          <span className="text-[#E84C5C] drop-shadow-[0_0_10px_rgba(232,76,92,0.5)] text-4xl pr-2">🏆 RANKING</span>
        </h1>
        <RankingTable />
      </main>
    </div>
  );
}
