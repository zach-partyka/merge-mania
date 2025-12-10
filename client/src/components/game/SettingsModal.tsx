import { X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { type GameSettings } from "@shared/schema";

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
  onSettingsChange: (settings: GameSettings) => void;
  onResetGame: () => void;
}

export function SettingsModal({ 
  isOpen, 
  settings, 
  onClose, 
  onSettingsChange,
  onResetGame 
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      data-testid="settings-modal"
    >
      <div className="bg-game-grid rounded-2xl p-6 w-full max-w-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-game-display text-2xl font-bold text-white">
            Settings
          </h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
            data-testid="button-close-settings"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Settings list */}
        <div className="space-y-4">
          {/* Sound */}
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center gap-3 text-white">
              <Volume2 className="w-5 h-5 text-white/60" />
              <span className="font-game">Sound Effects</span>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => 
                onSettingsChange({ ...settings, soundEnabled: checked })
              }
              data-testid="switch-sound"
            />
          </div>
        </div>
        
        {/* Reset game */}
        <div className="mt-8">
          <Button
            onClick={onResetGame}
            variant="destructive"
            className="w-full h-12 font-game-display rounded-xl"
            data-testid="button-reset-game"
          >
            Reset All Progress
          </Button>
        </div>
        
        {/* Version */}
        <div className="mt-6 text-center text-white/40 text-sm font-game">
          Number Match v1.0
        </div>
      </div>
    </div>
  );
}
