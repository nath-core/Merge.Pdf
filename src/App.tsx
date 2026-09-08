import { useState, useEffect } from 'react';
import { UploadedFile, MergeResult, Step } from './types';
import { mergePdfs, generateJobId } from './utils/pdfUtils';
import { Header } from './components/Header';
import { FooterBar } from './components/FooterBar';
import { UploadStep } from './components/UploadStep';
import { ReorderPreviewStep } from './components/ReorderPreviewStep';
import { DownloadShareStep } from './components/DownloadShareStep';
import { RenameModal } from './components/RenameModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('pdf_mash_dark_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [jobId, setJobId] = useState<string>('#MRG-99824');

  // Synchronize true black dark theme with document root & body
  useEffect(() => {
    try {
      localStorage.setItem('pdf_mash_dark_mode', String(isDarkMode));
    } catch {
      // ignore
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#FFFFFF';
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
      document.body.style.backgroundColor = '#FFFFFF';
      document.body.style.color = '#000000';
    }
  }, [isDarkMode]);

  // Preview modal state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    url: string | null;
    data?: Uint8Array | ArrayBuffer | null;
    pageCount?: number;
    size?: number;
  }>({
    isOpen: false,
    title: '',
    url: null,
  });

  // Rename modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);

  // Keyboard shortcuts (SPACE for preview, CMD/CTRL+ENTER for combine, DEL for remove last)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentStep === 'upload' && files.length >= 2) {
          setCurrentStep('reorder');
        } else if (currentStep === 'reorder' && files.length >= 2 && !isMerging) {
          handleExecuteMerge();
        }
      }

      if (e.code === 'Space' && !previewModal.isOpen && !renameModalOpen) {
        if (currentStep === 'download' && mergeResult) {
          e.preventDefault();
          handleOpenMergedPreview();
        } else if (files.length > 0) {
          e.preventDefault();
          handlePreviewFile(files[0]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, files, isMerging, previewModal.isOpen, renameModalOpen, mergeResult]);

  const handlePreviewFile = (file: UploadedFile) => {
    try {
      const blob = new Blob([file.arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPreviewModal({
        isOpen: true,
        title: file.name,
        url,
        data: file.arrayBuffer,
        pageCount: file.pageCount,
        size: file.size,
      });
    } catch (err) {
      console.error('Failed to generate preview for file:', err);
    }
  };

  const handleOpenMergedPreview = () => {
    if (!mergeResult) return;
    setPreviewModal({
      isOpen: true,
      title: mergeResult.fileName,
      url: mergeResult.url,
      data: mergeResult.buffer,
      pageCount: mergeResult.totalPages,
      size: mergeResult.totalSize,
    });
  };

  const handleClosePreview = () => {
    setPreviewModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleExecuteMerge = async (customName?: string) => {
    if (files.length < 2) return;
    setIsMerging(true);
    try {
      const result = await mergePdfs(files, customName);
      setMergeResult(result);
      setJobId(result.jobId);
      setCurrentStep('download');
    } catch (err) {
      console.error('Merge operation failed:', err);
      alert('Failed to combine PDFs. Please ensure all files are valid PDF documents.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleRename = (newName: string) => {
    if (!mergeResult) return;
    setMergeResult((prev) => (prev ? { ...prev, fileName: newName } : null));
  };

  const handleStartNewMerge = () => {
    setFiles([]);
    setMergeResult(null);
    setJobId(generateJobId());
    setCurrentStep('upload');
  };

  const canNavigateToReorder = files.length >= 2;
  const canNavigateToDownload = mergeResult !== null;

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark-theme bg-[#000000] text-white' : 'bg-[#FFFFFF] text-black'}`}>
      {/* Editorial Top Header */}
      <Header
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        canNavigateToReorder={canNavigateToReorder}
        canNavigateToDownload={canNavigateToDownload}
        jobId={jobId}
        executionTime={mergeResult?.executionTimeMs}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentStep === 'upload' && (
          <UploadStep
            files={files}
            setFiles={setFiles}
            onProceed={() => setCurrentStep('reorder')}
            onPreviewFile={handlePreviewFile}
          />
        )}

        {currentStep === 'reorder' && (
          <ReorderPreviewStep
            files={files}
            setFiles={setFiles}
            onProceedToCombine={(customName) => handleExecuteMerge(customName)}
            onBackToUpload={() => setCurrentStep('upload')}
            onPreviewFile={handlePreviewFile}
            onPreviewCustom={(data) => setPreviewModal({ isOpen: true, ...data })}
            isMerging={isMerging}
          />
        )}

        {currentStep === 'download' && mergeResult && (
          <DownloadShareStep
            mergeResult={mergeResult}
            onReturnToEdit={() => setCurrentStep('reorder')}
            onStartNewMerge={handleStartNewMerge}
            onOpenRenameModal={() => setRenameModalOpen(true)}
            onPreviewMerged={handleOpenMergedPreview}
          />
        )}
      </main>

      {/* Persistent Bottom Status Bar */}
      <FooterBar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        statusText={
          isMerging
            ? 'ASSEMBLING STREAM...'
            : currentStep === 'download'
            ? 'PAYLOAD BUFFERED'
            : 'ENGINE READY'
        }
      />

      {/* Rename Dialog Modal */}
      {mergeResult && (
        <RenameModal
          isOpen={renameModalOpen}
          currentName={mergeResult.fileName}
          onClose={() => setRenameModalOpen(false)}
          onRename={handleRename}
        />
      )}

      {/* PDF Viewer Dialog Modal */}
      <PdfPreviewModal
        isOpen={previewModal.isOpen}
        title={previewModal.title}
        url={previewModal.url}
        data={previewModal.data}
        pageCount={previewModal.pageCount}
        size={previewModal.size}
        onClose={handleClosePreview}
      />
    </div>
  );
}
