import { useEffect, useRef, useState } from "react";
import { Gift } from "lucide-react";
import { type DifficultyLevel, getProgressThreshold, formatNumber } from "@shared/schema";

interface ProgressBarProps {
  progressPoints: number;
  difficulty: DifficultyLevel;
  progressLevel: number;
  onRewardReady?: () => void;
}

function useAnimatedValue(target: number, duration: number = 300) {
  const [value, setValue] = useState(target);
  const animationRef = useRef<number | null>(null);
  const startRef = useRef(value);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startRef.current = value;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setValue(startRef.current + (target - startRef.current) * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration]);

  return value;
}

export function ProgressBar({ progressPoints, difficulty, progressLevel }: ProgressBarProps) {
  const threshold = getProgressThreshold(difficulty, progressLevel);
  const animatedProgress = useAnimatedValue(progressPoints, 400);
  const progress = Math.min(animatedProgress / threshold, 1);
  const isNearThreshold = progress >= 0.8;
  const isRewardReady = progressPoints >= threshold;
  
  return (
    <div className="w-full px-4" data-testid="progress-bar">
      <div 
        className={`relative h-6 bg-game-grid-border rounded-full overflow-hidden ${isNearThreshold && !isRewardReady ? "animate-pulse-glow" : ""}`}
      >
        {/* Progress fill with smooth animation */}
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
        
        {/* Pulsing overlay when near threshold */}
        {isNearThreshold && !isRewardReady && (
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 animate-progress-pulse"
            style={{ width: `${progress * 100}%` }}
          />
        )}
        
        {/* Threshold marker */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white/80 text-xs font-game">
          <span>{formatNumber(threshold)}</span>
          <Gift className={`w-4 h-4 ${isRewardReady ? "text-yellow-400 animate-pulse" : "text-white/60"}`} />
        </div>
        
        {/* Glow effect when ready */}
        {isRewardReady && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse" />
        )}
      </div>
    </div>
  );
}
