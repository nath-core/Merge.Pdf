import { useState, useEffect, useRef, type Dispatch, type SetStateAction, type DragEvent } from 'react';
import { UploadedFile } from '../types';
import { formatBytes, mergePdfs } from '../utils/pdfUtils';
import { CanvasPdfViewer } from './CanvasPdfViewer';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  RotateCw,
  Eye,
  FileText,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  FileCheck2,
  Maximize2,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface ReorderPreviewStepProps {
  files: UploadedFile[];
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>;
  onProceedToCombine: (customName?: string) => void;
  onBackToUpload: () => void;
  onPreviewFile: (file: UploadedFile) => void;
  onPreviewCustom?: (previewData: { title: string; url: string; data?: Uint8Array | ArrayBuffer | null; pageCount?: number; size?: number }) => void;
  isMerging: boolean;
}

export function ReorderPreviewStep({
  files,
  setFiles,
  onProceedToCombine,
  onBackToUpload,
  onPreviewFile,
  onPreviewCustom,
  isMerging,
}: ReorderPreviewStepProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [outputName, setOutputName] = useState('Combined_Project_Files_v1');
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [livePreviewBuffer, setLivePreviewBuffer] = useState<Uint8Array | null>(null);
  const [isCompilingPreview, setIsCompilingPreview] = useState<boolean>(false);
  const [previewTotalPages, setPreviewTotalPages] = useState<number>(0);
  const [previewTotalBytes, setPreviewTotalBytes] = useState<number>(0);

  const activeUrlRef = useRef<string | null>(null);

  // Compile real-time live preview whenever files order, rotation, or composition changes
  useEffect(() => {
    let isCancelled = false;

    if (files.length === 0) {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
      setLivePreviewUrl(null);
      setLivePreviewBuffer(null);
      return;
    }

    setIsCompilingPreview(true);

    const timer = setTimeout(async () => {
      try {
        const result = await mergePdfs(files, outputName);
        if (!isCancelled) {
          if (activeUrlRef.current) {
            URL.revokeObjectURL(activeUrlRef.current);
          }
          activeUrlRef.current = result.url;
          setLivePreviewUrl(result.url);
          setLivePreviewBuffer(result.buffer || null);
          setPreviewTotalPages(result.totalPages);
          setPreviewTotalBytes(result.totalSize);
        } else {
          URL.revokeObjectURL(result.url);
        }
      } catch (err) {
        console.error('Failed to generate real-time live PDF preview:', err);
      } finally {
        if (!isCancelled) {
          setIsCompilingPreview(false);
        }
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [files, outputName]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
    };
  }, []);

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const rotateFile = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextRot = ((f.rotation || 0) + 90) % 360;
          return { ...f, rotation: nextRot };
        }
        return f;
      })
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setFiles((prev) => {
      const copy = [...prev];
      const [draggedItem] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, draggedItem);
      return copy;
    });
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const reverseOrder = () => {
    setFiles((prev) => [...prev].reverse());
  };

  // Calculate page offsets for each document
  let cumulative = 1;
  const pageIntervals = files.map((file) => {
    const start = cumulative;
    const end = cumulative + file.pageCount - 1;
    cumulative = end + 1;
    return { start, end };
  });

  const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0);
  const totalRawBytes = files.reduce((acc, f) => acc + f.size, 0);

  const handleExecute = () => {
    const finalName = outputName.trim()
      ? outputName.trim().endsWith('.pdf')
        ? outputName.trim()
        : `${outputName.trim()}.pdf`
      : undefined;
    onProceedToCombine(finalName);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Editorial Page Header */}
      <div className="flex flex-wrap items-end justify-between border-b-8 border-black pb-4 gap-4">
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-widest bg-[#FFD700] border-2 border-black px-2.5 py-0.5 inline-block mb-2">
            PROTOCOL 02 // SEQUENCE & REVIEW
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase italic leading-none tracking-tight">
            Rearrange & Review
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reverseOrder}
            className="border-4 border-black bg-white hover:bg-[#FFD700] px-3.5 py-2 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-black" />
            <span>REVERSE ORDER</span>
          </button>
          <p className="text-xs sm:text-sm font-black uppercase max-w-[200px] text-right tracking-widest text-neutral-700 hidden sm:block">
            DRAG CARDS TO CHANGE MERGING ORDER
          </p>
        </div>
      </div>

      {/* 3-Section Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Status Bar */}
        <section className="lg:col-span-3 border-4 border-black bg-[#F0F0F0] p-6 flex flex-col gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <p className="text-xs font-black uppercase mb-2 tracking-widest text-black">
              STATUS
            </p>
            <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-2xl uppercase tracking-tight text-black">
                {files.length} FILES
              </p>
              <p className="text-xs font-bold uppercase text-neutral-600 mt-0.5">
                Ready to merge
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase mb-1 tracking-widest text-black">
              TOTAL SIZE
            </p>
            <p className="text-4xl font-black italic tracking-tight text-black">
              {formatBytes(totalRawBytes)}
            </p>
            <p className="text-xs font-bold uppercase text-neutral-500 mt-1">
              {totalPages} CUMULATIVE PAGES
            </p>
          </div>

          <div className="mt-auto pt-4 border-t-4 border-black">
            <button
              onClick={onBackToUpload}
              className="w-full bg-[#00FF00] border-4 border-black py-4 font-black uppercase text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#00e600] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>+ Add More</span>
            </button>
          </div>
        </section>

        {/* Center: Rearrange Cards Canvas */}
        <section className="lg:col-span-5 p-6 sm:p-7 bg-[#FF6B6B]/10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <h3 className="font-black text-lg uppercase italic text-black">
              Merge Sequence ({files.length})
            </h3>
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-600">
              CLICK PREVIEW OR DRAG TO REORDER
            </span>
          </div>

          <div className="flex flex-col gap-4">
          {files.map((file, index) => {
            const isFirst = index === 0;
            const isLast = index === files.length - 1;
            const interval = pageIntervals[index];

            return (
              <div
                key={file.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 border-4 border-black p-4 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative transition-all ${
                  draggedIndex === index
                    ? 'opacity-40 border-dashed bg-[#FFD700]/30'
                    : 'hover:-translate-y-0.5'
                }`}
              >
                {/* Big Italic Opacity Index Number */}
                <span className="text-4xl sm:text-5xl font-black opacity-20 italic select-none w-12 shrink-0 text-center font-display">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Thumbnail / Page view trigger */}
                <div
                  onClick={() => onPreviewFile(file)}
                  className="w-12 h-14 bg-[#FAF9F5] border-2 border-black flex flex-col items-center justify-center shrink-0 cursor-pointer hover:bg-[#FFD700] transition-colors relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="Click to preview this document"
                >
                  <FileText className="w-6 h-6 text-black" />
                  <span className="text-[8px] font-mono font-black mt-0.5 uppercase">
                    VIEW
                  </span>
                  {file.rotation ? (
                    <div className="absolute top-0 right-0 bg-black text-white text-[8px] font-mono px-1 font-bold">
                      {file.rotation}°
                    </div>
                  ) : null}
                </div>

                {/* Document Metadata */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-base sm:text-lg uppercase truncate text-black">
                    {file.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs font-bold uppercase text-neutral-500">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span>{file.pageCount} PAGES</span>
                    <span>•</span>
                    <span className="bg-[#F0F0F0] border border-black px-1.5 py-0 text-[10px] text-black font-black">
                      P.{interval.start}-{interval.end}
                    </span>
                    {file.rotation ? (
                      <span className="bg-[#FFD700] border border-black px-1.5 py-0 text-[10px] text-black font-black">
                        ROTATED {file.rotation}°
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Action Buttons: Up, Down, Rotate, Remove */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={isFirst}
                    className={`w-9 h-9 border-3 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                      isFirst
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-400 shadow-none'
                        : 'bg-[#FFD700] hover:bg-yellow-300 text-black cursor-pointer'
                    }`}
                    title="Move up"
                  >
                    ↑
                  </button>

                  <button
                    onClick={() => moveDown(index)}
                    disabled={isLast}
                    className={`w-9 h-9 border-3 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                      isLast
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-400 shadow-none'
                        : 'bg-[#FFD700] hover:bg-yellow-300 text-black cursor-pointer'
                    }`}
                    title="Move down"
                  >
                    ↓
                  </button>

                  <button
                    onClick={() => rotateFile(file.id)}
                    className="w-9 h-9 border-3 border-black bg-white hover:bg-neutral-100 flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-black" />
                  </button>

                  <button
                    onClick={() => removeFile(file.id)}
                    disabled={files.length <= 2}
                    className={`w-9 h-9 border-3 border-black flex items-center justify-center font-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                      files.length <= 2
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-400 shadow-none'
                        : 'bg-black text-white hover:bg-neutral-800 cursor-pointer'
                    }`}
                    title={files.length <= 2 ? 'At least 2 files required' : 'Remove document'}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </section>

        {/* Right Section: Output Filename, Live Preview Frame, and Merge CTA */}
        <section className="lg:col-span-4 border-4 border-black bg-white p-5 sm:p-6 flex flex-col gap-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {/* Output Filename Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-black">
                Output Filename
              </label>
              <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">
                TARGET IDENTIFIER
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                className="w-full border-4 border-black p-3 font-black text-sm uppercase focus:outline-none focus:bg-yellow-50 bg-[#F0F0F0]"
                placeholder="Combined_Project_Files"
              />
              <span className="bg-black text-[#FFD700] border-4 border-l-0 border-black px-3.5 py-3 font-mono text-sm font-black select-none">
                .PDF
              </span>
            </div>
          </div>

          {/* REAL-TIME LIVE OUTPUT PREVIEW CONTAINER (In place of Live Assembly Manifest) */}
          <div className="border-4 border-black bg-[#F0F0F0] relative overflow-hidden flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Live Preview Top Bar */}
            <div className="w-full bg-black text-white px-3 py-2 flex items-center justify-between border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#FFD700]" />
                <span className="font-mono text-xs font-black uppercase tracking-wider text-white">
                  LIVE OUTPUT PREVIEW
                </span>
              </div>
              <div>
                {isCompilingPreview ? (
                  <span className="bg-[#FFD700] text-black px-2 py-0.5 font-mono text-[10px] font-black flex items-center gap-1 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>SYNCING...</span>
                  </span>
                ) : (
                  <span className="bg-[#00FF00] text-black px-2 py-0.5 font-mono text-[10px] font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping inline-block" />
                    <span>LIVE READY</span>
                  </span>
                )}
              </div>
            </div>

            {/* Sub-bar showing live stream status */}
            <div className="bg-[#FAF9F5] border-b-2 border-black px-3 py-1.5 flex items-center justify-between text-[10px] font-mono font-black text-neutral-700">
              <span>STREAM: {previewTotalPages || totalPages} PAGES</span>
              <span>PAYLOAD: {formatBytes(previewTotalBytes || totalRawBytes)}</span>
            </div>

            {/* Live PDF Canvas Viewer (100% Brave-shield & Sandbox safe) */}
            <div className="relative w-full bg-neutral-950 overflow-hidden flex flex-col">
              {livePreviewUrl || livePreviewBuffer ? (
                <CanvasPdfViewer
                  url={livePreviewUrl}
                  data={livePreviewBuffer}
                  compact={true}
                  className="w-full"
                  onExpand={() => {
                    if ((livePreviewUrl || livePreviewBuffer) && onPreviewCustom) {
                      onPreviewCustom({
                        title: `${outputName.trim() || 'Merged_Output'}.pdf`,
                        url: livePreviewUrl || '',
                        data: livePreviewBuffer,
                        pageCount: previewTotalPages || totalPages,
                        size: previewTotalBytes || totalRawBytes,
                      });
                    }
                  }}
                  pageIntervals={files.map((file, idx) => ({
                    start: pageIntervals[idx].start,
                    end: pageIntervals[idx].end,
                    name: file.name,
                    pageCount: file.pageCount,
                  }))}
                />
              ) : (
                <div className="p-8 text-center text-white font-mono space-y-2">
                  <Loader2 className="w-8 h-8 mx-auto text-[#FFD700] animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Assembling Real-Time Preview...
                  </p>
                </div>
              )}
            </div>

            {/* Quick action bar beneath preview */}
            <div className="p-2.5 bg-[#F0F0F0] border-t-2 border-black flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if ((livePreviewUrl || livePreviewBuffer) && onPreviewCustom) {
                      onPreviewCustom({
                        title: `${outputName.trim() || 'Merged_Output'}.pdf`,
                        url: livePreviewUrl || '',
                        data: livePreviewBuffer,
                        pageCount: previewTotalPages || totalPages,
                        size: previewTotalBytes || totalRawBytes,
                      });
                    }
                  }}
                  disabled={!livePreviewUrl && !livePreviewBuffer}
                  className="flex-1 bg-white hover:bg-[#FFD700] border-2 border-black py-2 px-3 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-black"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-black" />
                  <span>FULLSCREEN PREVIEW</span>
                </button>
                {livePreviewUrl && (
                  <a
                    href={livePreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white hover:bg-neutral-100 border-2 border-black py-2 px-3 font-black text-xs uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all cursor-pointer text-black shrink-0"
                    title="Open live preview in separate browser tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-black" />
                    <span>POP OUT</span>
                  </a>
                )}
              </div>
              <p className="text-[10px] font-mono font-bold uppercase text-neutral-600 text-center">
                ✦ LIVE PREVIEW UPDATES AS YOU REARRANGE OR ROTATE
              </p>
            </div>
          </div>

          {/* Merge & Download Primary Action */}
          <button
            onClick={handleExecute}
            disabled={isMerging || files.length < 2}
            className="w-full bg-[#FF6B6B] border-4 border-black py-4 font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff4f4f] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 text-black"
          >
            {isMerging ? (
              <>
                <span className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" />
                <span>COMPILING...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-6 h-6 text-black" />
                <span>Merge & Download</span>
              </>
            )}
          </button>
        </section>
      </div>
    </div>
  );
}
