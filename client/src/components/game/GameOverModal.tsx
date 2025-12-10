import { Trophy, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@shared/schema";

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  personalBest: number;
  highestNumber: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
}

export function GameOverModal({ 
  isOpen, 
  score, 
  personalBest,
  highestNumber,
  isNewBest,
  onPlayAgain 
}: GameOverModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      data-testid="gameover-modal"
    >
      <div className="bg-game-grid rounded-2xl p-6 w-full max-w-xs flex flex-col items-center">
        {/* Header */}
        <h2 className="font-game-display text-3xl font-bold text-white mb-2">
          Game Over
        </h2>
        
        {/* New best indicator */}
        {isNewBest && (
          <div className="flex items-center gap-2 text-yellow-400 mb-4 animate-pulse">
            <Star className="w-5 h-5 fill-yellow-400" />
            <span className="font-game-display font-bold">New Best!</span>
            <Star className="w-5 h-5 fill-yellow-400" />
          </div>
        )}
        
        {/* Score display */}
        <div className="bg-game-bg rounded-xl p-6 w-full mb-6">
          <div className="text-center mb-4">
            <div className="text-white/60 font-game text-sm mb-1">Final Score</div>
            <div 
              className={`font-game-display text-4xl font-bold ${isNewBest ? "text-yellow-300" : "text-white"}`}
              data-testid="final-score"
            >
              {formatNumber(score)}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="text-white/60 font-game">Best</div>
              <div className="flex items-center gap-1 text-yellow-400 font-game-display font-bold">
                <Trophy className="w-4 h-4" />
                {formatNumber(personalBest)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-white/60 font-game">Highest</div>
              <div className="text-white font-game-display font-bold">
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
