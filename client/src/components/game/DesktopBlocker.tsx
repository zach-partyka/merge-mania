import { Smartphone, Sparkles } from "lucide-react";

export function DesktopBlocker() {
  return (
    <div
      className="fixed inset-0 bg-game-bg flex flex-col items-center justify-center p-8 z-50 relative overflow-hidden"
      data-testid="desktop-blocker"
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(circle at 50% 50%, #16a34a 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite"
        }}
      />

      <div className="flex flex-col items-center text-center max-w-md relative z-10">
        {/* Icon with gradient background */}
        <div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center mb-8 border-2 border-white/20 shadow-xl relative overflow-hidden"
        >
          {/* Shine effect */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
              backgroundSize: "200% 200%",
              animation: "shine 3s ease-in-out infinite"
            }}
          />
          <Smartphone className="w-16 h-16 text-white relative z-10" />
        </div>

        {/* Title with gradient */}
        <div className="mb-6">
          <h1
            className="font-game-display text-5xl font-black text-transparent bg-clip-text mb-2"
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 0%, #16a34a 100%)",
              textShadow: "0 4px 20px rgba(22, 163, 74, 0.3)"
            }}
          >
            Merge Mania
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-game-accent" />
            <p className="font-game-display text-xl font-bold text-game-accent">Mobile Only</p>
            <Sparkles className="w-4 h-4 text-game-accent" />
          </div>
        </div>

        {/* Description */}
        <p className="font-game text-lg text-white/70 mb-4 leading-relaxed">
          This game is designed for mobile devices with touch screens.
        </p>

        <p className="font-game text-base text-white/50 leading-relaxed">
          Please visit on your phone or tablet to play Merge Mania.
        </p>

        {/* Animated dots */}
        <div className="mt-12 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-block-32 shadow-lg animate-pulse" />
          <div
            className="w-4 h-4 rounded-full bg-block-512 shadow-lg animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className="w-4 h-4 rounded-full bg-block-4k shadow-lg animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0%, 100% { background-position: 200% 200%; }
          50% { background-position: -200% -200%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
