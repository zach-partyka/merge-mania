import { useEffect, useState } from "react";
import { Gift, Eraser, ArrowLeftRight, Magnet, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type PowerUpType } from "@shared/schema";

interface RewardModalProps {
  isOpen: boolean;
  onSelectPowerUp: (type: PowerUpType) => void;
  onSaveForLater: () => void;
}

function ConfettiEffect() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string; rotation: number }>>([]);

  useEffect(() => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

const powerUpOptions: { type: PowerUpType; icon: typeof Eraser; label: string; description: string; color: string }[] = [
  {
    type: "remove",
    icon: Eraser,
    label: "Remove",
    description: "Remove any block from the board",
    color: "from-red-500 to-red-600"
  },
  {
    type: "swap",
    icon: ArrowLeftRight,
    label: "Swap",
    description: "Swap positions of two blocks",
    color: "from-purple-500 to-purple-600"
  },
  {
    type: "mergeAll",
    icon: Magnet,
    label: "Merge All",
    description: "Merge all matching number blocks",
    color: "from-blue-500 to-blue-600"
  }
];

export function RewardModal({ isOpen, onSelectPowerUp, onSaveForLater }: RewardModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      data-testid="reward-modal"
    >
      <ConfettiEffect />
      <div className="bg-game-grid rounded-2xl p-6 w-full max-w-xs flex flex-col items-center relative z-10">
        {/* Header with gift icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-yellow-400 to-orange-500 flex items-center justify-center mb-4 animate-pulse-glow">
          <Gift className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="font-game-display text-2xl font-bold text-white mb-2">
          Reward!
        </h2>
        
        <p className="font-game text-white/60 text-center mb-6">
          Choose a power-up to add to your collection
        </p>
        
        {/* Power-up options */}
        <div className="w-full space-y-3 mb-6">
          {powerUpOptions.map(({ type, icon: Icon, label, description, color }) => (
            <button
              key={type}
              onClick={() => onSelectPowerUp(type)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${color} text-white transition-transform active:scale-95`}
              data-testid={`reward-option-${type}`}
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-game-display font-bold">{label}</div>
                <div className="font-game text-sm text-white/80">{description}</div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Save for later */}
        <Button
          onClick={onSaveForLater}
          variant="ghost"
          className="w-full h-12 font-game text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
          data-testid="button-save-for-later"
        >
          <Bookmark className="w-5 h-5 mr-2" />
          Save for Later
        </Button>
      </div>
    </div>
  );
}
