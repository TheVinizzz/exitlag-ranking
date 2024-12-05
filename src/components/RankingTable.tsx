'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { CelebrationModal } from './CelebrationModal';
import useSound from 'use-sound';
import celebrationSound from './celebration.mp3';

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
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  
  const [playCelebration] = useSound(celebrationSound, {
    volume: 0.5,
  });

  // Add this useEffect to handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCelebrate = () => {
    if (mounted) {
      setIsCelebrating(true);
      playCelebration();
    }
  };

  const handleStartTimer = () => {
    if (mounted && !isTimerRunning) {
      setIsTimerRunning(true);
      setCountdown(180); // 3 minutes in seconds
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isTimerRunning && countdown !== null) {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
      } else {
        setIsTimerRunning(false);
        handleCelebrate();
        if (socket) {
          socket.disconnect();
        }
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isTimerRunning, socket]);

  useEffect(() => {
    // Connect to your Socket.IO server
    const socketInstance = io('https://exitlag-service-ranking.207xgx.easypanel.host');
    setSocket(socketInstance);

    // Listen for initial ranking and updates
    socketInstance.on('ranking', (data: Player[]) => {
      setPlayers(data);
      setIsLoading(false);
    });

    socketInstance.on('rankingUpdate', (data: Player[]) => {
      // Salva as posições anteriores antes de atualizar
      const positions = players.reduce((acc, player, index) => {
        acc[player.id] = index;
        return acc;
      }, {} as {[key: number]: number});
      
      setPrevPositions(positions);
      setPlayers(data);
    });

    // Request initial ranking
    socketInstance.emit('getRanking');

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const firstPlacePlayer = players.sort((a, b) => b.score - a.score)[0];

  return (
    <>
      {mounted && (
        <button
          onClick={handleStartTimer}
          disabled={isTimerRunning}
          className="absolute top-1 right-2 bg-[#E84C5C] pixel-text text-sm text-white px-4 py-3 rounded-sm hover:bg-[#ff718d] transition-colors shadow-[0_0_10px_rgba(232,76,92,0.2)] border border-[#ff718d] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTimerRunning 
            ? `🕒 ${Math.floor(countdown! / 60)}:${(countdown! % 60).toString().padStart(2, '0')}`
            : countdown === null ? 'Start' : '🎉 CELEBRAR'}
        </button>
      )}
      {isLoading ? (
        <div className="bg-[#251F2A] rounded-md shadow-[0_0_20px_rgba(232,76,92,0.1)] p-6 border-2 border-[#3A2D44] min-h-[400px] flex items-center justify-center [image-rendering:pixelated]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#3A2D44] border-t-[#E84C5C] rounded-sm animate-spin" />
            <p className="text-gray-400 pixel-text">CARREGANDO...</p>
          </div>
        </div>
      ) : players.length === 0 ? (
        <div className="bg-[#251F2A] rounded-md shadow-[0_0_20px_rgba(232,76,92,0.1)] p-6 border-2 border-[#3A2D44] min-h-[400px] flex items-center justify-center [image-rendering:pixelated]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#3A2D44] border-t-[#E84C5C] rounded-sm animate-spin" />
            <p className="text-gray-400 pixel-text">ESPERANDO JOGADORES...</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#251F2A] rounded-md shadow-[0_0_20px_rgba(232,76,92,0.1)] p-8 border-2 border-[#3A2D44] relative [image-rendering:pixelated]">
          
        
        <table className="w-full">
          <thead>
            <tr className="text-gray-400">
              <th className="px-8 py-6 text-left uppercase tracking-wider pixel-text">POS</th>
              <th className="px-8 py-6 text-left uppercase tracking-wider pixel-text">PLAYER</th>
              <th className="px-8 py-6 text-right uppercase tracking-wider pixel-text">SCORE</th>
            </tr>
          </thead>
          <tbody>
            {players.sort((a, b) => b.score - a.score).map((player, index) => {
              const previousPosition = prevPositions[player.id] ?? index;
              const yOffset = (previousPosition - index) * 40;
              
              return (
                <motion.tr 
                  key={player.id}
                  initial={{ y: yOffset }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative border-b-2 border-[#3A2D44] hover:bg-[#2F2635] transition-all duration-200"
                >
                  <td className="px-8 py-6">
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
                  <td className="px-8 py-6 font-medium pixel-text">
                    {player.name}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`
                      text-white py-1 px-3 bg-[#3A2D44] rounded-sm pixel-text score-text
                      shadow-[0_0_10px_rgba(232,76,92,0.2)]
                      ${index === 0 
                        ? 'border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                        : 'border border-[#E84C5C]'}
                    `}>
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
      )}
            
      <CelebrationModal
        playerName={firstPlacePlayer?.name || ''}
        isOpen={isCelebrating}
        onClose={() => setIsCelebrating(false)}
      />
    </>
  );
} 