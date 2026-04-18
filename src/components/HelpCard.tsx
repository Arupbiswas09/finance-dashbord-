import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HelpCardProps = {
  /** Light, minimal card for canvas / premium shells; default keeps the branded gradient */
  variant?: "default" | "minimal";
};

export function HelpCard({ variant = "default" }: HelpCardProps) {
  if (variant === "minimal") {
    return (
      <div className="relative mx-0.5 mb-2 overflow-hidden rounded-2xl border border-[#0A0021]/[0.08] bg-gradient-to-b from-white to-[#FAF9FC] p-3.5 shadow-[0_10px_28px_-10px_rgba(10,0,33,0.12),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-[6px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
          aria-hidden
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B87A8]">Support</p>
        <p className="mt-1.5 text-[13px] font-semibold tracking-tight text-[#0A0021]">Docs & guides</p>
        <p className="mt-1 text-xs leading-relaxed text-[#64748B]">Short answers when you’re stuck.</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2.5 h-auto min-h-8 w-full justify-start px-0 py-1 text-xs font-medium text-[#5c5899] hover:bg-transparent hover:text-[#0A0021]"
        >
          Documentation
          <span className="ml-0.5 opacity-70" aria-hidden>
            →
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative mx-3 mb-4 h-40 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1f5c] via-[#2a3f8a] to-[#1a1f5c] p-6 shadow-2xl">
      {/* Wavy gradient background with glow */}
      <div className="absolute inset-0">
        {/* Main wavy shape - top left */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-blue-400/60 via-purple-500/50 to-transparent rounded-full blur-3xl opacity-80" />

        {/* Secondary wave - bottom right */}
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-gradient-to-tl from-purple-600/50 via-blue-500/40 to-transparent rounded-full blur-3xl opacity-70" />

        {/* Accent glow - center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl opacity-60" />

        {/* Flowing wave effect */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q100,50 200,100 T400,100 L400,300 L0,300 Z"
            fill="url(#waveGradient)"
          />
        </svg>
      </div>

      <div className="relative z-10 space-y-4">
        {/* Icon - rounded square with glow */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
          <div className="w-8 h-8 rounded-lg bg-blue-500" />
        </div>

        {/* Text content */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">Need help?</h3>
          <p className="text-sm text-blue-300/80 text-white leading-relaxed">
            Please check our docs
          </p>
        </div>

        {/* Documentation button */}
        <Button
          variant="secondary"
          size="sm"
          className="w-full bg-[#0f1535] hover:bg-[#1a1f4a] text-white font-bold text-sm tracking-wider border border-blue-900/50 shadow-xl transition-all duration-200 hover:shadow-2xl hover:border-blue-800/50"
        >
          DOCUMENTATION
        </Button>
      </div>
    </div>
  );
}
