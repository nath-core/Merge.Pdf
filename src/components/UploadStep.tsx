import { useState, useRef, type DragEvent, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { UploadedFile } from '../types';
import { parsePdfFile, formatBytes, createDemoDocket, createDemoDocument } from '../utils/pdfUtils';
import {
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Layers,
  Cloud,
  HardDrive,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';

interface UploadStepProps {
  files: UploadedFile[];
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>;
  onProceed: () => void;
  onPreviewFile: (file: UploadedFile) => void;
}

interface SampleDriveDoc {
  id: string;
  name: string;
  pages: number;
  subtitle: string;
  color: [number, number, number];
  sizeApprox: string;
}

const SAMPLE_DRIVE_DOCS: SampleDriveDoc[] = [
  {
    id: 'gdrive-1',
    name: 'DRIVE_Q2_REVENUE_EXPANSION.PDF',
    pages: 8,
    subtitle: 'Quarterly Executive Revenue Summary & Variance Analysis',
    color: [0.15, 0.45, 0.95],
    sizeApprox: '142 KB',
  },
  {
    id: 'gdrive-2',
    name: 'DRIVE_STRATEGIC_PLAN_2025.PDF',
    pages: 5,
    subtitle: 'Five-Year Enterprise Architecture & Operations Roadmap',
    color: [0.05, 0.65, 0.35],
    sizeApprox: '98 KB',
  },
  {
    id: 'gdrive-3',
    name: 'DRIVE_LEGAL_COMPLIANCE_REVIEW.PDF',
    pages: 4,
    subtitle: 'Statutory Governance Verification & Certificate of Counsel',
    color: [0.85, 0.25, 0.25],
    sizeApprox: '76 KB',
  },
  {
    id: 'gdrive-4',
    name: 'DRIVE_BOARD_MINUTES_CONFIDENTIAL.PDF',
    pages: 3,
    subtitle: 'Minutes of Extraordinary Meeting of Directors',
    color: [0.55, 0.2, 0.75],
    sizeApprox: '64 KB',
  },
];

export function UploadStep({ files, setFiles, onProceed, onPreviewFile }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [selectedDriveDocIds, setSelectedDriveDocIds] = useState<string[]>(['gdrive-1', 'gdrive-2']);
  const [isImportingDrive, setIsImportingDrive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilesAdded = async (fileList: FileList | File[], source: 'local' | 'drive' = 'local') => {
    setErrorMessage(null);
    setIsProcessingFiles(true);

    try {
      const validPdfFiles: File[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          validPdfFiles.push(file);
        }
      }

      if (validPdfFiles.length === 0) {
        setErrorMessage('Please select valid PDF documents (.pdf). Other formats are ignored.');
        setIsProcessingFiles(false);
        return;
      }

      const parsedPromises = validPdfFiles.map(async (file) => {
        const parsed = await parsePdfFile(file);
        return {
          ...parsed,
          source,
          description: source === 'drive' ? 'Imported from connected Google Drive.' : parsed.description,
        };
      });
      const newParsed = await Promise.all(parsedPromises);

      setFiles((prev) => [...prev, ...newParsed]);
    } catch (err) {
      console.error('Error parsing uploaded PDFs:', err);
      setErrorMessage('Failed to read one or more PDF files. Please ensure they are valid and uncorrupted.');
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files, 'local');
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files, 'local');
    }
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleLoadDemoDocket = async () => {
    setIsLoadingDemo(true);
    setErrorMessage(null);
    try {
      const demoDocket = await createDemoDocket();
      setFiles(demoDocket);
    } catch (err) {
      console.error('Failed to generate demo docket:', err);
      setErrorMessage('Failed to generate sample files.');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleToggleDriveDoc = (id: string) => {
    setSelectedDriveDocIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleImportSelectedDriveDocs = async () => {
    if (selectedDriveDocIds.length === 0) return;
    setIsImportingDrive(true);
    try {
      const docsToImport = SAMPLE_DRIVE_DOCS.filter((doc) => selectedDriveDocIds.includes(doc.id));
      const generatedFiles: File[] = [];

      for (const doc of docsToImport) {
        const file = await createDemoDocument(doc.name, doc.pages, doc.subtitle, doc.color);
        generatedFiles.push(file);
      }

      await handleFilesAdded(generatedFiles, 'drive');
      setIsDriveModalOpen(false);
    } catch (err) {
      console.error('Failed to import Google Drive files:', err);
      setErrorMessage('Failed to import documents from Google Drive.');
    } finally {
      setIsImportingDrive(false);
    }
  };

  const totalPagesCount = files.reduce((acc, f) => acc + f.pageCount, 0);
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Editorial Page Header */}
      <div className="flex flex-wrap items-end justify-between border-b-8 border-black pb-4 gap-4">
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-widest bg-[#FFD700] border-2 border-black px-2.5 py-0.5 inline-block mb-2">
            PROTOCOL 01 // INGESTION
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase italic leading-none tracking-tight">
            Upload & Ingest
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-black uppercase max-w-[280px] text-left sm:text-right tracking-widest text-neutral-700">
          SELECT 2+ PDF DOCUMENTS TO ASSEMBLE AUTHORITATIVE DOCKET
        </p>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="bg-[#ffdad6] border-4 border-black p-4 text-[#93000a] font-mono text-xs font-black uppercase tracking-wider flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <AlertCircle className="w-5 h-5 shrink-0 text-black" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Column Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Editorial Sidebar */}
        <aside className="lg:col-span-4 border-4 border-black bg-[#F0F0F0] p-6 flex flex-col gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {/* Status Box */}
          <div>
            <p className="text-xs font-black uppercase mb-2 tracking-widest text-black">
              INGESTION STATUS
            </p>
            <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-2xl uppercase tracking-tight">
                {files.length} {files.length === 1 ? 'FILE' : 'FILES'}
              </p>
              <p className="text-xs font-bold uppercase text-neutral-600 mt-0.5">
                {files.length >= 2 ? 'READY TO REARRANGE & MERGE' : 'NEED AT LEAST 2 TO COMBINE'}
              </p>
            </div>
          </div>

          {/* Total Size & Page Count */}
          <div>
            <p className="text-xs font-black uppercase mb-1 tracking-widest text-black">
              TOTAL PAYLOAD SIZE
            </p>
            <p className="text-4xl font-black italic tracking-tight text-black">
              {formatBytes(totalSizeBytes)}
            </p>
            <div className="mt-2 pt-2 border-t-2 border-black flex justify-between text-xs font-black uppercase">
              <span className="text-neutral-600">PAGES READY</span>
              <span>{totalPagesCount} PAGES</span>
            </div>
          </div>

          {/* Action Buttons: Add Local, Add Drive, Demo Docket */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white border-4 border-black py-3 px-4 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFD700] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HardDrive className="w-4 h-4 text-black" />
              <span>+ ADD LOCAL FILES</span>
            </button>

            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="w-full bg-[#E8F0FE] border-4 border-black py-3 px-4 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#D2E3FC] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer text-black"
            >
              <Cloud className="w-4 h-4 text-[#1A73E8]" />
              <span>+ IMPORT FROM GOOGLE DRIVE</span>
            </button>

            <button
              onClick={handleLoadDemoDocket}
              disabled={isLoadingDemo}
              className="w-full bg-[#00FF00] border-4 border-black py-3 px-4 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#00e600] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Instantly loads 3 sample financial & audit PDFs"
            >
              <Sparkles className="w-4 h-4 text-black fill-black" />
              <span>{isLoadingDemo ? 'GENERATING...' : '+ LOAD DEMO DOCKET (3 PDFs)'}</span>
            </button>
          </div>

          {/* Primary Action Button to Proceed */}
          <div className="pt-2 border-t-4 border-black">
            <button
              onClick={onProceed}
              disabled={files.length < 2 || isProcessingFiles}
              className={`w-full border-4 border-black py-4 px-4 font-black uppercase text-base flex items-center justify-center gap-2 transition-all ${
                files.length >= 2 && !isProcessingFiles
                  ? 'bg-[#FF6B6B] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff4f4f] active:shadow-none active:translate-x-1 active:translate-y-1 cursor-pointer'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed border-neutral-400'
              }`}
            >
              <span>CONTINUE TO ARRANGE</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[10px] font-mono font-bold uppercase text-neutral-500 text-center mt-2 tracking-wider">
              {files.length >= 2 ? 'MINIMUM REQUIREMENTS MET' : 'LOCKS UNTIL 2 FILES LOADED'}
            </p>
          </div>
        </aside>

        {/* Right Section: Dropzone + Ingested File Cards */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Main Drag & Drop Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-4 transition-all p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-4 ${
              isDragging
                ? 'border-black bg-[#FFD700] border-solid scale-[1.01]'
                : 'border-dashed border-black bg-white'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileInputChange}
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
            />

            <div className="w-16 h-16 bg-[#FFD700] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <UploadCloud className="w-9 h-9 text-black" />
            </div>

            <div>
              <h3 className="font-black text-2xl sm:text-3xl uppercase italic tracking-tight">
                {isDragging ? 'DROP DOCUMENTS HERE' : 'DRAG & DROP OR CHOOSE SOURCE'}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 mt-1">
                Zero server transmission • 100% processed client-side in WebAssembly memory
              </p>
            </div>

            {/* Prominent dual selection buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-white hover:bg-[#FFD700] border-4 border-black py-3 px-4 font-black uppercase text-xs sm:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer text-black"
              >
                <HardDrive className="w-4 h-4 text-black" />
                <span>LOCAL STORAGE</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDriveModalOpen(true)}
                className="flex-1 bg-[#E8F0FE] hover:bg-[#D2E3FC] border-4 border-black py-3 px-4 font-black uppercase text-xs sm:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer text-black"
              >
                <Cloud className="w-4 h-4 text-[#1A73E8]" />
                <span>GOOGLE DRIVE</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] font-black uppercase mt-1">
              <span className="bg-[#F0F0F0] border-2 border-black px-2.5 py-0.5">
                FORMAT: .PDF
              </span>
              <span className="bg-[#FFD700] border-2 border-black px-2.5 py-0.5">
                MINIMUM: 2 FILES
              </span>
              <span className="bg-[#00FF00] border-2 border-black px-2.5 py-0.5">
                LOCAL OR DRIVE
              </span>
            </div>
          </div>

          {/* Ingested Queue Cards */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b-4 border-black pb-2 gap-2">
              <h3 className="font-black text-xl uppercase italic">
                Ingested Documents ({files.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-neutral-100 border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>LOCAL</span>
                </button>
                <button
                  onClick={() => setIsDriveModalOpen(true)}
                  className="bg-[#E8F0FE] hover:bg-[#D2E3FC] border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all flex items-center gap-1 cursor-pointer text-black"
                >
                  <Cloud className="w-3 h-3 text-[#1A73E8]" />
                  <span>DRIVE</span>
                </button>
              </div>
            </div>

            {files.length === 0 && (
              <div className="border-4 border-black p-10 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center space-y-3">
                <Layers className="w-12 h-12 mx-auto text-neutral-400 opacity-60" />
                <p className="font-mono text-xs font-black uppercase tracking-widest text-neutral-600">
                  NO DOCUMENTS IN QUEUE. DROP FILES ABOVE OR LOAD FROM LOCAL DISK OR GOOGLE DRIVE.
                </p>
              </div>
            )}

            {files.length > 0 && (
              <div className="flex flex-col gap-4">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 sm:gap-6 border-4 border-black p-4 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative transition-transform hover:-translate-y-0.5"
                  >
                    {/* Big Italic Opacity Index Stamp */}
                    <span className="text-4xl sm:text-5xl font-black opacity-20 italic select-none w-14 shrink-0 text-center">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Document details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-black text-base sm:text-lg uppercase truncate text-black">
                          {file.name}
                        </p>
                        {file.source === 'drive' ? (
                          <span className="bg-[#E8F0FE] text-[#1A73E8] border-2 border-black px-1.5 py-0.2 text-[9px] font-mono font-black uppercase flex items-center gap-1 shrink-0">
                            <Cloud className="w-3 h-3" />
                            <span>GOOGLE DRIVE</span>
                          </span>
                        ) : (
                          <span className="bg-[#F0F0F0] text-neutral-700 border-2 border-black px-1.5 py-0.2 text-[9px] font-mono font-black uppercase flex items-center gap-1 shrink-0">
                            <HardDrive className="w-3 h-3" />
                            <span>LOCAL DISK</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        {formatBytes(file.size)} • {file.pageCount} PAGES • INGESTED {file.timestamp}
                      </p>
                    </div>

                    {/* Action Buttons: Preview & Remove */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onPreviewFile(file)}
                        className="w-10 h-10 border-4 border-black bg-[#FFD700] hover:bg-yellow-300 flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                        title="Instant page preview"
                      >
                        <FileText className="w-5 h-5 text-black" />
                      </button>

                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="w-10 h-10 border-4 border-black bg-black text-white hover:bg-neutral-800 flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                        title="Remove from docket"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Google Drive Document Ingestion Modal */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#1A73E8] border-b-4 border-black p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Cloud className="w-6 h-6 text-white" />
                <h3 className="font-black text-lg uppercase tracking-wider">
                  GOOGLE DRIVE DOCUMENT PICKER
                </h3>
              </div>
              <button
                onClick={() => setIsDriveModalOpen(false)}
                className="w-8 h-8 bg-black text-white border-2 border-white flex items-center justify-center font-black hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-[#E8F0FE] border-2 border-black p-3 text-xs font-bold text-[#1A73E8] flex items-center justify-between">
                <span>CONNECTED CLOUD WORKSPACE: Google Drive</span>
                <span className="font-mono text-[10px] bg-white border border-black px-1.5 py-0.5 text-black font-black">
                  ONLINE
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                SELECT PDF DOCKETS FROM YOUR GOOGLE DRIVE TO IMPORT:
              </p>

              <div className="space-y-2.5">
                {SAMPLE_DRIVE_DOCS.map((doc) => {
                  const isChecked = selectedDriveDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleToggleDriveDoc(doc.id)}
                      className={`p-3.5 border-4 border-black flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#FFD700] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 -translate-y-0.5'
                          : 'bg-[#F0F0F0] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-black text-white' : 'bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-sm uppercase truncate text-black">
                            {doc.name}
                          </p>
                          <p className="text-[11px] font-bold text-neutral-600 uppercase">
                            {doc.pages} PAGES • {doc.sizeApprox} • {doc.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] font-mono font-bold uppercase text-neutral-500 text-center pt-2">
                ✦ IMPORTED DRIVE DOCUMENTS WILL REMAIN IN YOUR DOCKET ALONGSIDE LOCAL UPLOADS
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-4 border-black bg-[#FAF9F5] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
                className="bg-white border-4 border-black px-4 py-2.5 font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 cursor-pointer text-black"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleImportSelectedDriveDocs}
                disabled={selectedDriveDocIds.length === 0 || isImportingDrive}
                className="bg-[#00FF00] hover:bg-[#00e600] border-4 border-black px-6 py-2.5 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer text-black"
              >
                {isImportingDrive ? (
                  <span>FETCHING FROM DRIVE...</span>
                ) : (
                  <span>IMPORT SELECTED ({selectedDriveDocIds.length})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
