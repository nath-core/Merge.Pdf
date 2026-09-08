import { X, ExternalLink, Download, FileText } from 'lucide-react';
import { formatBytes } from '../utils/pdfUtils';
import { CanvasPdfViewer } from './CanvasPdfViewer';

interface PdfPreviewModalProps {
  isOpen: boolean;
  title: string;
  url: string | null;
  data?: Uint8Array | ArrayBuffer | null;
  pageCount?: number;
  size?: number;
  onClose: () => void;
}

export function PdfPreviewModal({
  isOpen,
  title,
  url,
  data,
  pageCount,
  size,
  onClose,
}: PdfPreviewModalProps) {
  if (!isOpen || (!url && !data)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div className="bg-white border-4 border-black w-full max-w-5xl h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black p-3 sm:p-4 bg-[#FFD700]">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-6 h-6 text-black shrink-0" />
            <h3 className="font-mono font-black text-sm sm:text-base text-black truncate uppercase">
              {title}
            </h3>
            {pageCount !== undefined && (
              <span className="bg-black text-white text-xs font-mono font-black px-2 py-0.5 shrink-0 hidden sm:inline-block">
                {pageCount} {pageCount === 1 ? 'PAGE' : 'PAGES'}
              </span>
            )}
            {size !== undefined && (
              <span className="bg-white border-2 border-black text-xs font-mono font-black px-2 py-0.5 shrink-0 hidden sm:inline-block">
                {formatBytes(size)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {url && (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-2 border-black bg-white hover:bg-neutral-100 p-1.5 cursor-pointer flex items-center gap-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all text-black"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Pop Out</span>
                </a>
                <a
                  href={url}
                  download={title}
                  className="border-2 border-black bg-white hover:bg-neutral-100 p-1.5 cursor-pointer flex items-center gap-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all text-black"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="border-2 border-black bg-[#FF6B6B] hover:bg-red-500 text-black p-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded Canvas Viewer (Zero iframes, Brave-safe) */}
        <div className="flex-1 w-full bg-[#121212] p-2 relative overflow-hidden flex flex-col">
          <CanvasPdfViewer
            url={url}
            data={data}
            title={title}
            className="w-full h-full flex-1"
          />
        </div>

        {/* Footer info */}
        <div className="border-t-4 border-black p-3 bg-[#F0F0F0] flex flex-wrap items-center justify-between text-xs font-mono text-black font-bold">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00FF00] rounded-full inline-block" />
            <span>DIRECT VECTOR RENDERER // BRAVE &amp; SANDBOX COMPLIANT</span>
          </span>
          <button
            onClick={onClose}
            className="border-2 border-black bg-white hover:bg-neutral-100 px-4 py-1 font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all text-black"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
