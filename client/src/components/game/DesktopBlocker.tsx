import { Smartphone, Sparkles } from "lucide-react";

export function DesktopBlocker() {
  return (
    <div
      className="fixed inset-0 bg-game-bg flex flex-col items-center justify-center p-8 z-50 relative overflow-hidden"
      data-testid="desktop-blocker"
    >
      {/* Dramatic animated background with multiple gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 30% 40%, #7c3aed 0%, transparent 50%)",
            animation: "float 8s ease-in-out infinite"
          }}
        />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: "radial-gradient(circle at 70% 60%, #fb7185 0%, transparent 50%)",
            animation: "float 10s ease-in-out infinite reverse"
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: "radial-gradient(circle at 50% 80%, #14b8a6 0%, transparent 40%)",
            animation: "float 12s ease-in-out infinite"
          }}
        />
      </div>

      <div className="flex flex-col items-center text-center max-w-lg relative z-10 animate-bounce-in">
        {/* Icon with dramatic gradient background and glow */}
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center mb-10 border-2 border-white/30 shadow-2xl relative overflow-hidden animate-pulse-glow"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #fb7185 100%)",
            boxShadow: "0 8px 40px rgba(124, 58, 237, 0.6), 0 0 80px rgba(251, 113, 133, 0.4)"
          }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
          <Smartphone className="w-20 h-20 text-white relative z-10 drop-shadow-2xl" />
        </div>

        {/* Title with dramatic gradient */}
        <div className="mb-8">
          <h1
            className="font-game-display text-7xl font-black text-transparent bg-clip-text mb-4"
            style={{
              backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #fb7185 50%, #fbbf24 100%)",
              filter: "drop-shadow(0 4px 20px rgba(124, 58, 237, 0.7)) drop-shadow(0 0 50px rgba(251, 113, 133, 0.5))"
            }}
          >
            Merge Mania
          </h1>
          <div className="flex items-center justify-center gap-3 backdrop-blur-sm bg-white/10 px-6 py-2 rounded-full border border-white/20">
            <Sparkles className="w-5 h-5 text-game-accent animate-pulse drop-shadow-lg" />
            <p className="font-game-display text-2xl font-black text-game-accent drop-shadow-lg">Mobile Only</p>
            <Sparkles className="w-5 h-5 text-game-accent animate-pulse drop-shadow-lg" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Description with enhanced styling */}
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl px-8 py-6 mb-6 max-w-md">
          <p className="font-game text-xl text-white/90 mb-3 leading-relaxed font-semibold">
            This game is designed for mobile devices with touch screens.
          </p>
          <p className="font-game text-lg text-white/70 leading-relaxed">
            Please visit on your phone or tablet to play Merge Mania.
          </p>
        </div>

        {/* Animated dots with enhanced glow */}
        <div className="mt-12 flex items-center gap-4">
          <div
            className="w-6 h-6 rounded-full bg-block-32 shadow-2xl animate-pulse"
            style={{
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.8), 0 0 40px rgba(124, 58, 237, 0.4)"
            }}
          />
          <div
            className="w-6 h-6 rounded-full bg-block-512 shadow-2xl animate-pulse"
            style={{
              animationDelay: "0.3s",
              boxShadow: "0 0 20px rgba(251, 113, 133, 0.8), 0 0 40px rgba(251, 113, 133, 0.4)"
            }}
          />
          <div
            className="w-6 h-6 rounded-full bg-block-8k shadow-2xl animate-pulse"
            style={{
              animationDelay: "0.6s",
              boxShadow: "0 0 20px rgba(20, 184, 166, 0.8), 0 0 40px rgba(20, 184, 166, 0.4)"
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1) translate(0, 0);
          }
          33% {
            opacity: 0.25;
            transform: scale(1.1) translate(20px, -20px);
          }
          66% {
            opacity: 0.2;
            transform: scale(0.95) translate(-15px, 15px);
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) rotate(45deg);
          }
        }
      `}</style>
    </div>
  );
}
