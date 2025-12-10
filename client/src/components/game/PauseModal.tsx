import { Play, RotateCcw, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

export function PauseModal({ isOpen, onResume, onRestart, onSettings, onQuit }: PauseModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      data-testid="pause-modal"
    >
      <div className="bg-game-grid rounded-2xl p-6 w-full max-w-xs flex flex-col items-center gap-4">
        <h2 className="font-game-display text-2xl font-bold text-white mb-2">
          Paused
        </h2>
        
        <Button
          onClick={onResume}
          className="w-full h-14 text-lg font-game-display bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-xl"
          data-testid="button-resume"
        >
          <Play className="w-6 h-6 mr-2" />
          Resume
        </Button>
        
        <Button
          onClick={onRestart}
          variant="secondary"
          className="w-full h-14 text-lg font-game-display bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl"
          data-testid="button-restart"
        >
          <RotateCcw className="w-6 h-6 mr-2" />
          Restart
        </Button>
        
        <Button
          onClick={onSettings}
          variant="ghost"
          className="w-full h-14 text-lg font-game-display text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
          data-testid="button-settings"
        >
          <Settings className="w-6 h-6 mr-2" />
          Settings
        </Button>
        
        <Button
          onClick={onQuit}
          variant="ghost"
          className="w-full h-14 text-lg font-game-display text-white/50 hover:text-white hover:bg-white/10 rounded-xl"
          data-testid="button-quit"
        >
          <Home className="w-6 h-6 mr-2" />
          Quit
        </Button>
      </div>
    </div>
  );
}
