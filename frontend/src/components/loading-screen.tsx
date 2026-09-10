import { Activity } from "lucide-react";

export function LoadingScreen({ message = "Loading TeamPulse..." }: { message?: string }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Background glow ambient effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      
      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Animated Brand Logo Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping duration-1000 scale-125" />
          <div className="size-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/25 border border-primary/40 relative z-10 transition-transform duration-300">
            <Activity className="size-9 animate-pulse" />
          </div>
        </div>

        {/* Brand Name & Spinner */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
            TeamPulse
            <span className="inline-block size-2 rounded-full bg-primary animate-ping" />
          </h2>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            {message}
          </p>
        </div>

        {/* Modern Loading Bar indicator */}
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 w-2/5 bg-primary rounded-full animate-[shimmer_1.5s_infinite_linear]" style={{
            animation: "loading-bar 1.5s ease-in-out infinite"
          }} />
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { left: -40%; width: 40%; }
          50% { left: 40%; width: 60%; }
          100% { left: 100%; width: 40%; }
        }
      `}</style>
    </div>
  );
}
