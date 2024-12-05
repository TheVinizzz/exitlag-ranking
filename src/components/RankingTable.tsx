'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { CelebrationModal } from './CelebrationModal';

type Player = {
  id: number;
  name: string;
  score: number;
};

export function RankingTable() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [prevPositions, setPrevPositions] = useState<{[key: number]: number}>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCelebrating, setIsCelebrating] = useState(false);

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

  const firstPlacePlayer = players.sort((a, b) => b.score - a.score)[0];

  if (isLoading) {
    return (
      <div className="bg-[#251F2A] rounded-md shadow-[0_0_20px_rgba(232,76,92,0.1)] p-6 border-2 border-[#3A2D44] min-h-[400px] flex items-center justify-center [image-rendering:pixelated]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3A2D44] border-t-[#E84C5C] rounded-sm animate-spin" />
          <p className="text-gray-400 pixel-text">CARREGANDO...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#251F2A] rounded-md shadow-[0_0_20px_rgba(232,76,92,0.1)] p-6 border-2 border-[#3A2D44] relative [image-rendering:pixelated]">
        {/* Botão de Celebração */}
        <table className="w-full">
          <thead>
            <tr className="text-gray-400">
              <th className="px-6 py-4 text-left text-sm uppercase tracking-wider pixel-text">POS</th>
              <th className="px-6 py-4 text-left text-sm uppercase tracking-wider pixel-text">PLAYER</th>
              <th className="px-6 py-4 text-right text-sm uppercase tracking-wider pixel-text">SCORE</th>
            </tr>
          </thead>
          <tbody>
            {players.sort((a, b) => b.score - a.score).map((player, index) => {
              const previousPosition = prevPositions[player.id] ?? index;
              const yOffset = (previousPosition - index) * 20;
              
              return (
                <motion.tr 
                  key={player.id}
                  initial={{ y: yOffset }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative border-b-2 border-[#3A2D44] hover:bg-[#2F2635] transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <span className={`
                      pixel-text
                      ${index === 0 ? 'text-[#E84C5C] drop-shadow-[0_0_5px_rgba(232,76,92,0.5)]' : ''}
                      ${index === 1 ? 'text-gray-400' : ''}
                      ${index === 2 ? 'text-[#B13A47]' : ''}
                      font-bold
                    `}>
                      {index + 1}º
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium pixel-text">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white py-1 px-3 bg-[#3A2D44] rounded-sm pixel-text score-text border border-[#E84C5C] shadow-[0_0_10px_rgba(232,76,92,0.2)]">
                      {player.score.toLocaleString()}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1A1520] to-transparent pointer-events-none" />
      </div>
            
      {firstPlacePlayer && (
          <button
            onClick={() => setIsCelebrating(true)}
            className="absolute top-4 right-4 bg-[#E84C5C] pixel-text text-xs text-white px-3 py-2 rounded-sm hover:bg-[#ff718d] transition-colors shadow-[0_0_10px_rgba(232,76,92,0.2)] border border-[#ff718d]"
          >
            🎉 CELEBRAR
        </button>
      )}
      <CelebrationModal
        playerName={firstPlacePlayer?.name || ''}
        isOpen={isCelebrating}
        onClose={() => setIsCelebrating(false)}
      />
    </>
  );
} 