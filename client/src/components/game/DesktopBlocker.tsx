import { Smartphone } from "lucide-react";

export function DesktopBlocker() {
  return (
    <div 
      className="fixed inset-0 bg-game-bg flex flex-col items-center justify-center p-8 z-50"
      data-testid="desktop-blocker"
    >
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-game-grid flex items-center justify-center mb-8">
          <Smartphone className="w-12 h-12 text-white/60" />
        </div>
        
        <h1 className="font-game-display text-3xl font-bold text-white mb-4">
          Mobile Only
        </h1>
        
        <p className="font-game text-lg text-white/70 mb-6">
          This game is designed for mobile devices with touch screens.
        </p>
        
        <p className="font-game text-base text-white/50">
          Please visit on your phone or tablet to play Number Match.
        </p>
        
        <div className="mt-12 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-block-32 animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-block-512 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 rounded-full bg-block-4k animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}
