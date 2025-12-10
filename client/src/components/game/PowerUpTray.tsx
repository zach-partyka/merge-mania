import { Eraser, ArrowLeftRight, Magnet } from "lucide-react";
import { cn } from "@/lib/utils";
import { type PowerUpType, type PowerUps } from "@shared/schema";

interface PowerUpTrayProps {
  powerUps: PowerUps;
  activePowerUp: PowerUpType | null;
  onPowerUpSelect: (type: PowerUpType) => void;
  disabled?: boolean;
}

const powerUpConfig = {
  remove: {
    icon: Eraser,
    label: "Remove",
    color: "from-red-500 to-red-600",
    activeColor: "ring-red-400"
  },
  swap: {
    icon: ArrowLeftRight,
    label: "Swap",
    color: "from-purple-500 to-purple-600",
    activeColor: "ring-purple-400"
  },
  mergeAll: {
    icon: Magnet,
    label: "Merge",
    color: "from-blue-500 to-blue-600",
    activeColor: "ring-blue-400"
  }
};

export function PowerUpTray({ 
  powerUps, 
  activePowerUp, 
  onPowerUpSelect,
  disabled = false 
}: PowerUpTrayProps) {
  return (
    <div 
      className="flex items-center justify-center gap-6 py-4"
      data-testid="powerup-tray"
    >
      {(Object.keys(powerUpConfig) as PowerUpType[]).map((type) => {
        const config = powerUpConfig[type];
        const count = powerUps[type];
        const isActive = activePowerUp === type;
        const isDisabled = disabled || count === 0;
        const Icon = config.icon;
        
        return (
          <button
            key={type}
            onClick={() => !isDisabled && onPowerUpSelect(type)}
            disabled={isDisabled}
            className={cn(
              "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
              "bg-gradient-to-b shadow-lg",
              config.color,
              isActive && `ring-4 ${config.activeColor} scale-110`,
              isDisabled && "opacity-40 grayscale",
              !isDisabled && "active:scale-95"
            )}
            style={{
              boxShadow: isDisabled 
                ? "none" 
                : "0 4px 0 0 rgba(0,0,0,0.3), 0 6px 10px rgba(0,0,0,0.2)"
            }}
            data-testid={`powerup-${type}`}
          >
            <Icon className="w-7 h-7 text-white drop-shadow-md" />
            
            {/* Count badge */}
            <div 
              className={cn(
                "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
                "bg-white text-gray-900 font-game-display font-bold text-sm shadow-md",
                count === 0 && "bg-gray-400 text-gray-600"
              )}
              data-testid={`powerup-count-${type}`}
            >
              {count}
            </div>
          </button>
        );
      })}
    </div>
  );
}
