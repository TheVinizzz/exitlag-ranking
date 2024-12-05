'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

type Player = {
  id: number;
  name: string;
  score: number;
};

export function RankingTable() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [prevPositions, setPrevPositions] = useState<{[key: number]: number}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Connect to your Socket.IO server
    const socket = io('https://exitlag-service-ranking.207xgx.easypanel.host');

    // Listen for initial ranking and updates
    socket.on('ranking', (data: Player[]) => {
      setPlayers(data);
      setIsLoading(false);
    });

    socket.on('rankingUpdate', (data: Player[]) => {
      // Salva as posições anteriores antes de atualizar
      const positions = players.reduce((acc, player, index) => {
        acc[player.id] = index;
        return acc;
      }, {} as {[key: number]: number});
      
      setPrevPositions(positions);
      setPlayers(data);
    });

    // Request initial ranking
    socket.emit('getRanking');

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#251F2A] rounded-2xl shadow-2xl p-6 border border-[#3A2D44] min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3A2D44] border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#251F2A] rounded-2xl shadow-2xl p-6 border border-[#3A2D44]">
      <table className="w-full">
        <thead>
          <tr className="text-gray-400">
            <th className="px-6 py-4 text-left text-sm uppercase tracking-wider">Posição</th>
            <th className="px-6 py-4 text-left text-sm uppercase tracking-wider">Jogador</th>
            <th className="px-6 py-4 text-right text-sm uppercase tracking-wider">Pontuação</th>
          </tr>
        </thead>
        <tbody>
          {players
            .sort((a, b) => b.score - a.score)
            .map((player, index) => {
              const previousPosition = prevPositions[player.id] ?? index;
              const yOffset = (previousPosition - index) * 20;
              
              return (
                <motion.tr 
                  key={player.id}
                  initial={{ y: yOffset }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative border-b border-[#3A2D44] hover:bg-[#2F2635] transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <span className={`
                      ${index === 0 ? 'text-yellow-500' : ''}
                      ${index === 1 ? 'text-gray-400' : ''}
                      ${index === 2 ? 'text-amber-700' : ''}
                      font-bold
                    `}>
                      {index + 1}º
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white py-1 px-3 rounded-full font-mono text-lg">
                      {player.score.toLocaleString()}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
        </tbody>
      </table>

      {/* Adiciona um efeito de gradiente na parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1A1520] to-transparent pointer-events-none rounded-b-2xl" />
    </div>
  );
} 