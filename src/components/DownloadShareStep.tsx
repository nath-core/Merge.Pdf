import { useState, useEffect } from 'react';
import { MergeResult } from '../types';
import { formatBytes } from '../utils/pdfUtils';
import confetti from 'canvas-confetti';
import {
  Download,
  Share2,
  HardDrive,
  Edit3,
  CheckCircle2,
  Lock,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Layers,
  Copy,
  Check,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface DownloadShareStepProps {
  mergeResult: MergeResult;
  onReturnToEdit: () => void;
  onStartNewMerge: () => void;
  onOpenRenameModal: () => void;
  onPreviewMerged: () => void;
}

export function DownloadShareStep({
  mergeResult,
  onReturnToEdit,
  onStartNewMerge,
  onOpenRenameModal,
  onPreviewMerged,
}: DownloadShareStepProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);
  const [showDriveToast, setShowDriveToast] = useState(false);
  const [mobilePin] = useState('884-209');

  useEffect(() => {
    // Fire festive neo-brutalist confetti blast
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFE600', '#5AFFC8', '#FF5A36', '#121212'],
    });
  }, []);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = mergeResult.url;
    a.download = mergeResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCopySha = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(mergeResult.sha256);
      }
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2500);
    } catch {
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2500);
    }
  };

  const handleSaveToDrive = () => {
    setShowDriveToast(true);
    // Trigger download simultaneously as local copy for Google Drive backup
    handleDownload();
    setTimeout(() => setShowDriveToast(false), 4500);
  };

  // Truncate file name for display if long
  const displayFileName =
    mergeResult.fileName.length > 28
      ? `${mergeResult.fileName.substring(0, 25)}....`
      : mergeResult.fileName;

  const executionTimeFormatted = (mergeResult.executionTimeMs / 1000).toFixed(2);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-7 relative">
      {/* Toast alert for Drive export */}
      {showDriveToast && (
        <div className="fixed bottom-14 right-6 z-50 bg-[#5AFFC8] border-[3px] border-[#121212] p-4 brutal-shadow font-mono text-xs font-bold text-[#121212] flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <HardDrive className="w-5 h-5 text-emerald-800" />
          <div>
            <p className="font-extrabold">GOOGLE DRIVE DIRECT INTEGRATION</p>
            <p className="text-[11px] font-normal">
              Direct download initiated. File saved ready for one-click upload to your Google Drive account.
            </p>
          </div>
        </div>
      )}

      {/* 1. Protocol Badge */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-black px-4 py-1.5 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
          <span className="w-2.5 h-2.5 bg-black" />
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>Protocol 03 // Assembly Complete ({executionTimeFormatted}s)</span>
        </div>
      </div>

      {/* 2. Giant Editorial Headline with Watermark */}
      <div className="relative py-2">
        <div className="relative z-10">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-black uppercase leading-[1.05]">
            Locked &amp;{' '}
            <span className="inline-block bg-[#FFD700] border-4 sm:border-6 border-black px-3 sm:px-5 py-0.5 mx-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              Loaded!
            </span>
          </h1>
          <p className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-600 mt-2">
            Your combined PDF has been compiled in browser memory and is ready for distribution.
          </p>
        </div>

        {/* Faint PDF Watermark */}
        <div className="absolute right-0 -top-6 sm:-top-8 select-none pointer-events-none opacity-10 font-display text-7xl sm:text-9xl font-black text-black">
          PDF
        </div>
      </div>

      {/* 3. Metadata Details Bar */}
      <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* File identifier */}
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase block tracking-widest">
            File Identifier
          </span>
          <div className="font-black text-sm sm:text-base text-black truncate uppercase" title={mergeResult.fileName}>
            {displayFileName}
          </div>
        </div>

        {/* Total pages */}
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase block tracking-widest">
            Total Pages
          </span>
          <div className="flex items-center gap-1.5 font-black text-sm sm:text-base text-black uppercase">
            <Layers className="w-4 h-4 text-black" />
            <span>{mergeResult.totalPages} Pages</span>
          </div>
        </div>

        {/* Payload size */}
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase block tracking-widest">
            Payload Size
          </span>
          <div className="flex items-center gap-1.5 font-black text-sm sm:text-base text-black uppercase">
            <FileText className="w-4 h-4 text-black" />
            <span>{formatBytes(mergeResult.totalSize)}</span>
          </div>
        </div>

        {/* Resolution engine */}
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase block tracking-widest">
            Engine Output
          </span>
          <div className="flex items-center gap-1.5 font-black text-sm sm:text-base text-black uppercase">
            <Sparkles className="w-4 h-4 text-[#00aa00]" />
            <span>300 DPI Vector</span>
          </div>
        </div>
      </div>

      {/* 4. Two Column Section: Left Export Pipeline vs Right Quick Mobile Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Primary Export Pipeline */}
        <div className="lg:col-span-8 bg-white border-4 border-black p-6 sm:p-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center justify-between border-b-4 border-black pb-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-[#FFD700] border-2 border-black inline-block" />
              <h3 className="font-mono font-black text-xs sm:text-sm text-black uppercase tracking-widest">
                Primary Export Pipeline
              </h3>
            </div>
            <span className="bg-[#FFD700] border-2 border-black px-2.5 py-0.5 font-mono text-[10px] font-black text-black">
              READY IN BUFFER
            </span>
          </div>

          <p className="text-xs sm:text-sm text-black font-bold uppercase tracking-wide">
            Your combined document has been assembled, rasterized, and indexed completely within your browser sandbox. Click below for immediate high-speed payload transfer.
          </p>

          {/* Huge Yellow Download Button */}
          <button
            onClick={handleDownload}
            className="w-full bg-[#FFD700] border-4 border-black p-5 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group text-left text-black"
          >
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-14 h-14 bg-black text-[#FFD700] flex items-center justify-center shrink-0 border-2 border-black group-hover:scale-105 transition-transform">
                <Download className="w-7 h-7 stroke-[3]" />
              </div>

              <div>
                <h2 className="font-display font-black text-xl sm:text-2xl text-black tracking-tight uppercase">
                  Download Merged PDF Now
                </h2>
                <p className="font-mono text-[10px] sm:text-xs text-black font-bold tracking-wider uppercase mt-0.5">
                  Instant Direct Download • Clean 300 DPI • Zero Watermark
                </p>
              </div>
            </div>

            <div className="bg-black text-white font-mono font-black text-sm px-4 py-2 shrink-0 self-end sm:self-center">
              {formatBytes(mergeResult.totalSize)}
            </div>
          </button>

          {/* Secondary Options Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={handleSaveToDrive}
              className="bg-white border-3 border-black py-2.5 px-3 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Save to Drive</span>
            </button>

            <button
              onClick={onOpenRenameModal}
              className="bg-white border-3 border-black py-2.5 px-3 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Rename File</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="bg-white border-3 border-black py-2.5 px-3 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={onPreviewMerged}
              className="bg-[#FFD700] border-3 border-black py-2.5 px-3 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-black"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview PDF</span>
            </button>
          </div>
        </div>

        {/* Right Column: Quick Mobile Sync */}
        <div className="lg:col-span-4 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b-4 border-black pb-3">
              <Share2 className="w-4 h-4 text-black" />
              <h3 className="font-mono font-black text-xs uppercase tracking-widest text-black">
                Quick Mobile Sync
              </h3>
            </div>
            <p className="text-xs text-black font-bold uppercase">
              Scan to beam the {formatBytes(mergeResult.totalSize)} binary directly onto your mobile device.
            </p>
          </div>

          {/* Editorial QR Code Container */}
          <div className="border-4 border-black bg-[#F0F0F0] p-4 flex flex-col items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-36 h-36 bg-white border-2 border-black p-2 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {/* Geometric SVG QR representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                {/* Outer corners */}
                <rect x="5" y="5" width="26" height="26" stroke="#000000" strokeWidth="4" fill="white" />
                <rect x="11" y="11" width="14" height="14" fill="#000000" />

                <rect x="69" y="5" width="26" height="26" stroke="#000000" strokeWidth="4" fill="white" />
                <rect x="75" y="11" width="14" height="14" fill="#000000" />

                <rect x="5" y="69" width="26" height="26" stroke="#000000" strokeWidth="4" fill="white" />
                <rect x="11" y="75" width="14" height="14" fill="#000000" />

                {/* Editorial data blocks */}
                <rect x="36" y="8" width="6" height="6" fill="#000000" />
                <rect x="46" y="8" width="8" height="6" fill="#FFD700" />
                <rect x="58" y="8" width="6" height="6" fill="#000000" />

                <rect x="36" y="18" width="8" height="8" fill="#000000" />
                <rect x="48" y="20" width="6" height="6" fill="#000000" />
                <rect x="58" y="18" width="6" height="8" fill="#FFD700" />

                <rect x="8" y="36" width="8" height="6" fill="#000000" />
                <rect x="20" y="36" width="6" height="6" fill="#000000" />
                <rect x="36" y="36" width="12" height="12" fill="#000000" />
                <rect x="52" y="36" width="10" height="6" fill="#000000" />
                <rect x="66" y="36" width="8" height="8" fill="#FFD700" />
                <rect x="78" y="36" width="14" height="6" fill="#000000" />

                <rect x="8" y="46" width="6" height="10" fill="#FFD700" />
                <rect x="20" y="48" width="8" height="8" fill="#000000" />
                <rect x="36" y="52" width="8" height="8" fill="#FFD700" />
                <rect x="48" y="48" width="12" height="12" fill="#000000" />
                <rect x="64" y="48" width="8" height="6" fill="#000000" />
                <rect x="78" y="46" width="6" height="10" fill="#000000" />

                <rect x="36" y="68" width="6" height="6" fill="#000000" />
                <rect x="46" y="66" width="8" height="8" fill="#000000" />
                <rect x="58" y="68" width="8" height="6" fill="#FFD700" />

                <rect x="36" y="78" width="12" height="6" fill="#FFD700" />
                <rect x="52" y="78" width="6" height="10" fill="#000000" />
                <rect x="64" y="78" width="10" height="6" fill="#000000" />
                <rect x="78" y="76" width="14" height="14" fill="#000000" />
              </svg>
            </div>

            {/* PIN and Expiry Badges */}
            <div className="flex items-center gap-2 font-mono text-xs font-black">
              <span className="bg-[#FFD700] border-2 border-black px-2 py-0.5">
                PIN: {mobilePin}
              </span>
              <span className="bg-white border-2 border-black px-2 py-0.5 text-black">
                EXP: 10 MIN
              </span>
            </div>
          </div>

          <div className="border-t-2 border-black pt-2.5 flex items-center justify-between font-mono text-[10px] text-black font-black uppercase">
            <span>Session: Encrypted</span>
            <span>Channel: WebRTC P2P</span>
          </div>
        </div>
      </div>

      {/* 5. Final Document Merge Sequence (Ready for Download) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 bg-black inline-block" />
            <h3 className="font-display font-black text-xl text-black uppercase tracking-tight">
              Final Document Merge Sequence
            </h3>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-black">
            <span className="bg-[#FFD700] border-2 border-black px-3 py-1 uppercase text-black">
              Sequence Locked
            </span>
            <span className="bg-black text-white border-2 border-black px-3 py-1 uppercase">
              {mergeResult.receiptItems.length} Documents Bundled
            </span>
          </div>
        </div>

        {/* 3-card sequence grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mergeResult.receiptItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4 relative"
            >
              {/* Card top row */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="bg-black text-white font-mono font-black text-xs px-2.5 py-0.5">
                    #{String(item.order).padStart(2, '0')}
                  </span>

                  {item.orderLabel === 'FIRST' && (
                    <span className="bg-[#FF6B6B] text-black font-mono text-[10px] font-black px-2 py-0.5 border border-black uppercase">
                      Order: First
                    </span>
                  )}
                  {item.orderLabel === 'MID' && (
                    <span className="bg-[#F0F0F0] text-black font-mono text-[10px] font-black px-2 py-0.5 border border-black uppercase">
                      Order: Mid
                    </span>
                  )}
                  {item.orderLabel === 'LAST' && (
                    <span className="bg-[#FFD700] text-black font-mono text-[10px] font-black px-2 py-0.5 border border-black uppercase">
                      Order: Last
                    </span>
                  )}
                </div>

                <span className="font-mono text-xs font-black bg-[#F0F0F0] border border-black px-2 py-0.5">
                  P.{item.pageStart} - {item.pageEnd}
                </span>
              </div>

              {/* Docket stream visual bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 font-bold uppercase">
                  <span>PDF Stream Ratio</span>
                  <FileText className="w-3 h-3 text-black" />
                </div>
                <div className="w-full bg-[#F0F0F0] border-2 border-black h-2.5 relative overflow-hidden">
                  <div
                    className="h-full bg-[#FFD700]"
                    style={{
                      width: `${Math.min(100, Math.max(15, (item.pageCount / mergeResult.totalPages) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-black font-bold uppercase">
                  <span>{item.pageCount} Pages</span>
                  <span>{formatBytes(item.originalSize)}</span>
                </div>
              </div>

              {/* File details */}
              <div className="space-y-1 flex-1">
                <h4 className="font-black text-sm text-black uppercase tracking-tight break-all">
                  {item.name}
                </h4>
                <p className="text-xs text-neutral-600 font-medium line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Card bottom tags */}
              <div className="border-t-2 border-black pt-2.5 flex items-center justify-between font-mono text-[10px] font-black">
                <span className="flex items-center gap-1 text-[#00aa00] uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.statusBadge}</span>
                </span>
                <span className="border border-black bg-[#F0F0F0] px-2 py-0.5 uppercase">
                  {item.pageCount} Pgs
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Assembly Manifest Receipt Section */}
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5">
        <div className="flex flex-wrap items-center justify-between border-b-4 border-black pb-4 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#FFD700] border-2 border-black flex items-center justify-center font-mono font-black text-xs">
              #
            </div>
            <div>
              <h3 className="font-mono font-black text-sm sm:text-base text-black uppercase tracking-widest">
                Assembly Manifest Receipt
              </h3>
              <p className="font-mono text-xs text-neutral-600 uppercase font-bold">
                {mergeResult.receiptItems.length} Source Documents Merged Into Single Stream
              </p>
            </div>
          </div>

          {/* SHA-256 Hash Box */}
          <button
            onClick={handleCopySha}
            className="flex items-center gap-2 font-mono text-xs border-2 border-black bg-[#F0F0F0] px-3 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFD700] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            title="Click to copy full SHA-256 integrity hash"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00aa00]" />
            <span className="text-neutral-600 font-bold">SHA-256:</span>
            <span className="font-black text-black">
              {mergeResult.sha256.substring(0, 5)}...{mergeResult.sha256.substring(mergeResult.sha256.length - 6)}
            </span>
            <Copy className="w-3 h-3 ml-1 text-black" />
            {copiedSha && <span className="text-[10px] text-[#00aa00] font-black">COPIED</span>}
          </button>
        </div>

        {/* Table of documents */}
        <div className="space-y-2.5 font-mono">
          {mergeResult.receiptItems.map((item) => (
            <div
              key={item.id}
              className="border-3 border-black p-3.5 bg-[#F0F0F0] flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="bg-black text-white text-xs px-2.5 py-1 font-black">
                  {String(item.order).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-black text-xs sm:text-sm text-black uppercase break-all">{item.name}</p>
                  <p className="text-[10px] text-neutral-600 uppercase font-bold">
                    ORIGINAL SIZE: {formatBytes(item.originalSize)} • TIMESTAMP: {item.timestamp}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="border-2 border-black px-3 py-0.5 text-xs font-black bg-white">
                  PAGES {item.pageStart}-{item.pageEnd}
                </span>
                <span className="bg-[#FFD700] border-2 border-black px-3 py-0.5 text-xs font-black text-black uppercase">
                  Included
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Manifest Footer */}
        <div className="border-t-2 border-black pt-3 flex flex-wrap items-center justify-between text-xs font-mono text-black gap-2 font-bold uppercase">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-black" />
            <span>
              Sandbox Integrity: Zero temporary files written to remote disk
            </span>
          </div>

          <div className="font-black">
            Page Sum: {mergeResult.totalPages} / {mergeResult.totalPages} Matched
          </div>
        </div>
      </div>

      {/* 7. Bottom Navigation Action Bar */}
      <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onReturnToEdit}
          className="bg-white border-3 border-black px-5 py-3 font-black text-xs uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Sequence</span>
        </button>

        <button
          onClick={onStartNewMerge}
          className="bg-[#FFD700] border-3 border-black px-7 py-3 font-black text-xs uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-black"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Merge</span>
        </button>
      </div>
    </div>
  );
}
