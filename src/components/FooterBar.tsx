import { Sun, Moon, Shield } from 'lucide-react';

interface FooterBarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  statusText?: string;
}

export function FooterBar({ isDarkMode, onToggleDarkMode, statusText = 'ENGINE READY' }: FooterBarProps) {
  return (
    <footer className="w-full border-t-8 border-black bg-black text-white py-3 px-4 sm:px-8 sticky bottom-0 z-30 font-mono text-[10px] sm:text-[11px] font-black tracking-[0.18em] uppercase">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Processing Engine & Status */}
        <div className="flex items-center gap-3">
          <div className="bg-[#00FF00] text-black border-2 border-white px-2.5 py-0.5 flex items-center gap-1.5 font-black text-[10px]">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse inline-block" />
            <span>STATUS: {statusText}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-neutral-400">
            <span>ENGINE: v4.2.0-EDITORIAL</span>
            <span>•</span>
            <span>ENCRYPTION: 256-BIT SHIELDS UP</span>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="hidden lg:flex items-center gap-3 text-neutral-300">
          <span className="bg-white text-black px-1.5 py-0.5 text-[9px] font-black">
            SPACE
          </span>
          <span className="text-[10px]">PREVIEW</span>

          <span className="bg-white text-black px-1.5 py-0.5 text-[9px] font-black ml-2">
            CMD+ENTER
          </span>
          <span className="text-[10px]">COMBINE</span>
        </div>

        {/* Right: Copyright & Theme switch */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-neutral-400 font-mono">
            <Shield className="w-3.5 h-3.5 text-[#00FF00]" />
            <span>©2024 PDF_MASH_LABS</span>
          </div>

          <button
            onClick={onToggleDarkMode}
            className="flex items-center gap-1.5 border-2 border-white px-3 py-1 font-black text-[10px] bg-[#FFD700] text-black hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-black" />
                <span>LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-black" />
                <span>DARK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
