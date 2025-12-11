import { Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@shared/schema";

interface GameOverModalProps {
  isOpen: boolean;
  progressLevel: number;
  highestNumber: number;
  onPlayAgain: () => void;
}

export function GameOverModal({ 
  isOpen, 
  progressLevel,
  highestNumber,
  onPlayAgain 
}: GameOverModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      data-testid="gameover-modal"
    >
      <div className="bg-game-grid rounded-2xl p-6 w-full max-w-xs flex flex-col items-center animate-bounce-in">
        {/* Header */}
        <h2 className="font-game-display text-3xl font-bold text-white mb-4">
          Game Over
        </h2>
        
        {/* Stats display */}
        <div className="bg-game-bg rounded-xl p-6 w-full mb-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <div className="text-white/60 font-game text-sm mb-1">Level</div>
              <div 
                className="font-game-display text-3xl font-bold text-white"
                data-testid="final-level"
              >
                {progressLevel + 1}
              </div>
            </div>
            
            <div className="text-center flex-1">
              <div className="text-white/60 font-game text-sm mb-1">Highest</div>
              <div className="flex items-center justify-center gap-1 text-yellow-400 font-game-display text-2xl font-bold">
                <Trophy className="w-5 h-5" />
                {formatNumber(highestNumber)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Play again button */}
        <Button
          onClick={onPlayAgain}
          className="w-full h-14 text-lg font-game-display bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-xl"
          data-testid="button-play-again"
        >
          <RotateCcw className="w-6 h-6 mr-2" />
          Play Again
        </Button>
      </div>
    </div>
  );
}
