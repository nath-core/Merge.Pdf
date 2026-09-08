import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RotateCcw,
  FileText,
} from 'lucide-react';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }
}

export interface PageDocumentOrigin {
  docName: string;
  docPage: number;
  totalDocPages: number;
}

interface CanvasPdfViewerProps {
  url?: string | null;
  data?: Uint8Array | ArrayBuffer | null;
  title?: string;
  compact?: boolean;
  className?: string;
  onExpand?: () => void;
  pageIntervals?: Array<{ start: number; end: number; name: string; pageCount: number }>;
}

export function CanvasPdfViewer({
  url,
  data,
  title = 'Document Preview',
  compact = false,
  className = '',
  onExpand,
  pageIntervals,
}: CanvasPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<'fit' | number>('fit');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentRenderTask = useRef<pdfjsLib.RenderTask | null>(null);
  const loadingTaskRef = useRef<pdfjsLib.PDFDocumentLoadingTask | null>(null);

  // Load PDF Document when url or data changes
  useEffect(() => {
    let isCancelled = false;

    if (!url && !data) {
      setPdfDoc(null);
      setNumPages(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Cancel any previous loading task
    if (loadingTaskRef.current) {
      try {
        loadingTaskRef.current.destroy();
      } catch {
        // ignore
      }
      loadingTaskRef.current = null;
    }

    const loadDoc = async () => {
      try {
        let loadingTask: pdfjsLib.PDFDocumentLoadingTask;

        if (data) {
          // Clone buffer slice to avoid detached ArrayBuffer issues
          const sourceData = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0));
          loadingTask = pdfjsLib.getDocument({
            data: sourceData,
            cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
            cMapPacked: true,
          });
        } else if (url) {
          loadingTask = pdfjsLib.getDocument({
            url,
            cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
            cMapPacked: true,
          });
        } else {
          return;
        }

        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;

        if (isCancelled) {
          doc.destroy();
          return;
        }

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage((prev) => (prev > doc.numPages ? 1 : prev || 1));
        setIsLoading(false);
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error('CanvasPdfViewer: failed to load PDF document', err);
          setErrorMessage('Could not render PDF stream in canvas.');
          setIsLoading(false);
        }
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
      if (loadingTaskRef.current) {
        try {
          loadingTaskRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [url, data]);

  // Render current page onto canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

      // Cancel ongoing render
      if (currentRenderTask.current) {
        try {
          currentRenderTask.current.cancel();
        } catch {
          // ignore
        }
        currentRenderTask.current = null;
      }

      setIsRenderingPage(true);

      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const containerWidth = containerRef.current.clientWidth - (compact ? 24 : 48);
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        let scale = 1.0;
        if (zoomLevel === 'fit') {
          scale = Math.max(0.2, (containerWidth || 300) / unscaledViewport.width);
        } else {
          scale = zoomLevel;
        }

        const viewport = page.getViewport({ scale });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const transform =
          pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined;

        const renderContext = {
          canvasContext: ctx,
          transform,
          viewport,
        };

        const renderTask = page.render(renderContext);
        currentRenderTask.current = renderTask;

        await renderTask.promise;
        setIsRenderingPage(false);
      } catch (err: unknown) {
        // PDF.js throws an exception when rendering is cancelled
        const isCancelled =
          err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'RenderingCancelledException';
        if (!isCancelled) {
          console.error('CanvasPdfViewer: render error', err);
          setIsRenderingPage(false);
        }
      }
    },
    [pdfDoc, zoomLevel, compact]
  );

  // Trigger render when page or doc or zoom changes
  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, zoomLevel, renderPage]);

  // Handle Resize of container to refit page if in 'fit' mode
  useEffect(() => {
    if (!containerRef.current || zoomLevel !== 'fit') return;

    let timeoutId: number;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (pdfDoc && currentPage > 0) {
          renderPage(currentPage);
        }
      }, 100);
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [pdfDoc, currentPage, zoomLevel, renderPage]);

  // Page Navigation Handlers
  const handlePrev = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setCurrentPage((p) => Math.min(numPages, p + 1));
  };

  const handleFirst = () => {
    setCurrentPage(1);
  };

  const handleLast = () => {
    setCurrentPage(numPages);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      const current = prev === 'fit' ? 1.0 : prev;
      return Math.min(2.5, +(current + 0.25).toFixed(2));
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const current = prev === 'fit' ? 1.0 : prev;
      return Math.max(0.4, +(current - 0.25).toFixed(2));
    });
  };

  const handleResetZoom = () => {
    setZoomLevel('fit');
  };

  // Find origin document for current page if pageIntervals provided
  const currentOriginDoc = pageIntervals?.find(
    (interval) => currentPage >= interval.start && currentPage <= interval.end
  );

  const originDocPageIndex = currentOriginDoc
    ? currentPage - currentOriginDoc.start + 1
    : null;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-neutral-900 border-2 border-black select-none ${className}`}
    >
      {/* Viewer Navigation & Controls Toolbar */}
      <div className="bg-[#121212] border-b-2 border-black p-2 flex flex-wrap items-center justify-between gap-2 text-white text-xs font-mono">
        {/* Left: Page Navigator */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleFirst}
            disabled={currentPage <= 1 || isLoading}
            className="w-7 h-7 bg-white/10 hover:bg-[#FFD700] hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1 || isLoading}
            className="w-7 h-7 bg-white/10 hover:bg-[#FFD700] hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="px-2 py-1 bg-black/60 border border-white/20 font-black text-[11px] flex items-center gap-1 text-white">
            <span className="text-[#FFD700]">{currentPage}</span>
            <span className="text-neutral-500">/</span>
            <span>{numPages || 1}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage >= numPages || isLoading}
            className="w-7 h-7 bg-white/10 hover:bg-[#FFD700] hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleLast}
            disabled={currentPage >= numPages || isLoading}
            className="w-7 h-7 bg-white/10 hover:bg-[#FFD700] hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={isLoading}
            className="w-7 h-7 bg-white/10 hover:bg-[#FFD700] hover:text-black flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className={`px-2 h-7 font-black text-[10px] border border-white/20 flex items-center justify-center transition-colors cursor-pointer ${
              zoomLevel === 'fit'
                ? 'bg-[#FFD700] text-black font-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Fit to Width"
          >
            FIT
          </button>
          <button
            onClick={handleZoomIn}
            disabled={isLoading}
            className="w-7 h-7 bg-white/10 hover:bg-[#FFD700] hover:text-black flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions (Expand, Open in New Tab) */}
        <div className="flex items-center gap-1">
          {onExpand && (
            <button
              onClick={onExpand}
              className="px-2 h-7 bg-white/10 hover:bg-[#FFD700] hover:text-black border border-white/20 flex items-center gap-1 text-[11px] font-black transition-colors cursor-pointer"
              title="Expand to Fullscreen Preview"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">EXPAND</span>
            </button>
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-2 h-7 bg-[#FFD700] text-black hover:bg-yellow-300 font-black border border-black flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
              title="Open raw PDF in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TAB</span>
            </a>
          )}
        </div>
      </div>

      {/* Origin Document Indicator Bar */}
      {currentOriginDoc && (
        <div className="bg-[#1A1A1A] border-b border-white/10 px-3 py-1 flex items-center justify-between text-[10px] font-mono text-neutral-300">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <FileText className="w-3 h-3 text-[#FFD700] shrink-0" />
            <span className="text-neutral-500 uppercase">Source:</span>
            <span className="font-bold text-white uppercase truncate">
              {currentOriginDoc.name}
            </span>
          </div>
          <span className="bg-white/10 border border-white/20 px-1.5 py-0.2 text-[#FFD700] shrink-0 font-bold">
            DOC PG {originDocPageIndex} OF {currentOriginDoc.pageCount}
          </span>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full min-h-[260px] max-h-[580px] overflow-auto flex items-center justify-center p-3 bg-neutral-950">
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-900/90 flex flex-col items-center justify-center gap-2 z-10 text-white">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
            <p className="font-mono text-xs font-black uppercase tracking-wider text-neutral-300">
              Rasterizing Vector Stream...
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 text-center text-white space-y-2">
            <AlertTriangle className="w-8 h-8 text-[#FF6B6B] mx-auto" />
            <p className="font-mono text-xs font-black uppercase text-[#FF6B6B]">
              {errorMessage}
            </p>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD700] text-black font-mono text-xs font-black uppercase border border-black mt-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab Instead</span>
              </a>
            )}
          </div>
        )}

        {/* Active HTML5 Canvas (100% Native, never blocked by Brave) */}
        <canvas
          ref={canvasRef}
          className={`shadow-2xl transition-opacity duration-150 bg-white ${
            isRenderingPage ? 'opacity-80' : 'opacity-100'
          }`}
          style={{ maxWidth: '100%' }}
        />
      </div>

      {/* Bottom Status Ribbon */}
      <div className="bg-[#0A0A0A] border-t-2 border-black px-3 py-1 flex items-center justify-between text-[9px] font-mono text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00] inline-block" />
          <span>HTML5 CANVAS RENDERER // BRAVE-SHIELD COMPATIBLE</span>
        </span>
        <span>
          PAGE {currentPage} OF {numPages || 1}
        </span>
      </div>
    </div>
  );
}
