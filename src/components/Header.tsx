import { Step } from '../types';
import { ShieldCheck, Zap, Lock, FileText } from 'lucide-react';

interface HeaderProps {
  currentStep: Step;
  onStepClick: (step: Step) => void;
  canNavigateToReorder: boolean;
  canNavigateToDownload: boolean;
  jobId: string;
  executionTime?: number;
}

export function Header({
  currentStep,
  onStepClick,
  canNavigateToReorder,
  canNavigateToDownload,
  jobId,
  executionTime,
}: HeaderProps) {
  return (
    <header className="w-full border-b-8 border-black bg-[#FFD700] text-black sticky top-0 z-40">
      {/* Primary Top Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo with Rotate-45 Diamond Mark */}
        <div
          onClick={() => onStepClick('upload')}
          className="flex items-center gap-3.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 bg-black rotate-45 shrink-0 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] group-hover:rotate-90 transition-transform duration-200">
            <div className="w-2.5 h-2.5 bg-[#FFD700]" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-black">
              MERGE PDF
            </h1>
            <span className="hidden sm:inline-block bg-black text-[#FFD700] px-1.5 py-0.5 font-mono text-[11px] font-black tracking-widest uppercase">
              v4.2
            </span>
          </div>
        </div>

        {/* Editorial Navigation Steps */}
        <nav className="flex items-center gap-4 sm:gap-8 font-sans">
          {/* Step 01: Upload */}
          <button
            onClick={() => onStepClick('upload')}
            className="flex items-center gap-2.5 cursor-pointer group text-left"
          >
            <span
              className={`w-7 h-7 rounded-full border-4 border-black flex items-center justify-center font-black text-xs transition-colors ${
                currentStep === 'upload'
                  ? 'bg-black text-white'
                  : 'bg-white text-black group-hover:bg-neutral-100'
              }`}
            >
              01
            </span>
            <span
              className={`font-black uppercase text-sm tracking-tight ${
                currentStep === 'upload' ? 'underline decoration-4 text-black' : 'text-neutral-800'
              }`}
            >
              Upload
            </span>
          </button>

          {/* Step 02: Arrange */}
          <button
            onClick={() => canNavigateToReorder && onStepClick('reorder')}
            disabled={!canNavigateToReorder}
            className={`flex items-center gap-2.5 transition-opacity ${
              canNavigateToReorder ? 'cursor-pointer group text-left' : 'opacity-35 cursor-not-allowed text-left'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full border-4 border-black flex items-center justify-center font-black text-xs transition-colors ${
                currentStep === 'reorder'
                  ? 'bg-black text-white'
                  : canNavigateToReorder
                  ? 'bg-white text-black group-hover:bg-neutral-100'
                  : 'bg-white text-neutral-500'
              }`}
            >
              02
            </span>
            <span
              className={`font-black uppercase text-sm tracking-tight ${
                currentStep === 'reorder'
                  ? 'underline decoration-4 text-black'
                  : 'text-neutral-800'
              }`}
            >
              Arrange
            </span>
          </button>

          {/* Step 03: Export */}
          <button
            onClick={() => canNavigateToDownload && onStepClick('download')}
            disabled={!canNavigateToDownload}
            className={`flex items-center gap-2.5 transition-opacity ${
              canNavigateToDownload ? 'cursor-pointer group text-left' : 'opacity-35 cursor-not-allowed text-left'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full border-4 border-black flex items-center justify-center font-black text-xs transition-colors ${
                currentStep === 'download'
                  ? 'bg-black text-white'
                  : canNavigateToDownload
                  ? 'bg-white text-black group-hover:bg-neutral-100'
                  : 'bg-white text-neutral-500'
              }`}
            >
              03
            </span>
            <span
              className={`font-black uppercase text-sm tracking-tight ${
                currentStep === 'download'
                  ? 'underline decoration-4 text-black'
                  : 'text-neutral-800'
              }`}
            >
              Export
            </span>
          </button>
        </nav>

        {/* Security & System Info Badges */}
        <div className="hidden xl:flex items-center gap-2 font-mono text-xs font-black">
          <div className="bg-white border-4 border-black px-2.5 py-1 flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <ShieldCheck className="w-4 h-4 text-black" />
            <span className="uppercase tracking-wider">CLIENT SAFE</span>
          </div>
          <div className="bg-[#00FF00] border-4 border-black px-2.5 py-1 flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
            <Zap className="w-4 h-4 text-black fill-black" />
            <span className="uppercase tracking-wider">NO LIMITS</span>
          </div>
        </div>
      </div>

      {/* Editorial Ticker Bar */}
      <div className="w-full bg-black text-[#FFD700] border-t-4 border-black overflow-hidden py-1">
        <div className="animate-marquee font-mono text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-8 whitespace-nowrap">
          <span>EDITORIAL AESTHETIC</span>
          <span>✦</span>
          <span>100% IN-BROWSER MERGE</span>
          <span>✦</span>
          <span>ZERO SERVER STORAGE</span>
          <span>✦</span>
          <span>HIGH-RES VECTOR ENGINE</span>
          <span>✦</span>
          <span>INSTANT DRAG & REARRANGE</span>
          <span>✦</span>
          <span>JOB ID: {jobId}</span>
          <span>✦</span>
          <span>WASM SPEED: {executionTime ? `${(executionTime / 1000).toFixed(3)}S` : '0.412S'}</span>
          <span>✦</span>
          <span>EDITORIAL AESTHETIC</span>
          <span>✦</span>
          <span>100% IN-BROWSER MERGE</span>
        </div>
      </div>
    </header>
  );
}
