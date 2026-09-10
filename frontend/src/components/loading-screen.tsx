import { Sparkles } from "lucide-react";

export function LoadingScreen({ message = "Synchronizing workspace..." }: { message?: string }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden select-none">
      {/* Dynamic ambient glowing mesh Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-primary/20 via-blue-600/10 to-indigo-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-3000" />
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none animate-bounce duration-5000" />

      {/* Main Glassmorphism Card */}
      <div className="relative flex flex-col items-center p-8 md:p-10 rounded-3xl bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl shadow-primary/10 max-w-sm w-full mx-4 z-10">
        
        {/* Animated Brand Logo Icon with Conic Gradient Ring */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Rotating Conic Ring */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 opacity-75 blur-sm animate-[spin_4s_linear_infinite]" />
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary via-blue-500 to-emerald-400 animate-[spin_3s_linear_infinite]" />
          
          {/* Central Logo Container */}
          <div className="relative size-20 rounded-2xl bg-background/90 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20 z-10">
            <div className="size-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30 relative overflow-hidden group">
              {/* Pulse line SVG */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-8 text-primary-foreground drop-shadow-md z-10"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              {/* Shimmer sweep inside icon */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer-sweep_2s_infinite]" />
            </div>
          </div>
        </div>

        {/* Brand Name & Dynamic Text */}
        <div className="flex flex-col items-center gap-2 text-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-indigo-500 bg-clip-text text-transparent">
              TeamPulse
            </h1>
            <Sparkles className="size-4 text-primary animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            {message}
          </p>
        </div>

        {/* Pulse Loading Wave Bars */}
        <div className="flex items-center justify-center gap-1.5 h-8 mb-4">
          <span className="w-1.5 h-3 bg-primary rounded-full animate-[bar-wave_1s_ease-in-out_infinite_0ms]" />
          <span className="w-1.5 h-6 bg-primary rounded-full animate-[bar-wave_1s_ease-in-out_infinite_150ms]" />
          <span className="w-1.5 h-8 bg-indigo-500 rounded-full animate-[bar-wave_1s_ease-in-out_infinite_300ms]" />
          <span className="w-1.5 h-5 bg-blue-500 rounded-full animate-[bar-wave_1s_ease-in-out_infinite_450ms]" />
          <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-[bar-wave_1s_ease-in-out_infinite_600ms]" />
        </div>

        {/* Modern Shimmer Progress Bar */}
        <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 rounded-full animate-[pulse-progress_1.8s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes bar-wave {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
        @keyframes pulse-progress {
          0% { left: -35%; width: 35%; }
          50% { left: 30%; width: 50%; }
          100% { left: 100%; width: 30%; }
        }
      `}</style>
    </div>
  );
}

