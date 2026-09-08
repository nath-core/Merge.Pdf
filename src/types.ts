export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
  timestamp: string;
  description?: string;
  rotation?: number; // 0, 90, 180, 270
  selectedPages?: string; // e.g. "All" or "1-5"
  source?: 'local' | 'drive';
}

export interface MergedFileReceiptItem {
  id: string;
  order: number;
  orderLabel: 'FIRST' | 'MID' | 'LAST';
  name: string;
  originalSize: number;
  pageCount: number;
  pageStart: number;
  pageEnd: number;
  timestamp: string;
  description: string;
  statusBadge: string;
}

export interface MergeResult {
  blob: Blob;
  url: string;
  buffer?: Uint8Array;
  fileName: string;
  totalPages: number;
  totalSize: number;
  executionTimeMs: number;
  sha256: string;
  receiptItems: MergedFileReceiptItem[];
  jobId: string;
}

export type Step = 'upload' | 'reorder' | 'download';
