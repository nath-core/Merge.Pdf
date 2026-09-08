import { useState, type FormEvent } from 'react';
import { Edit3, Check, X } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export function RenameModal({ isOpen, currentName, onClose, onRename }: RenameModalProps) {
  const [name, setName] = useState(currentName.replace(/\.pdf$/i, ''));

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalName = name.trim().endsWith('.pdf') ? name.trim() : `${name.trim()}.pdf`;
    onRename(finalName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
      <div className="bg-white border-4 border-black p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b-4 border-black pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#FFD700] border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Edit3 className="w-5 h-5 text-black" />
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-black">
              Rename Output Payload
            </h3>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black p-1 bg-[#F0F0F0] hover:bg-[#FF6B6B] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-mono text-neutral-600 uppercase font-bold">
          Specify a custom identifier for the merged PDF before initiating download transfer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest block text-black">
              Target Filename
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Merged_Document_Name"
                className="w-full bg-[#F0F0F0] border-4 border-black px-3.5 py-3 font-black text-base uppercase focus:outline-none focus:bg-yellow-50"
                autoFocus
              />
              <span className="bg-black text-[#FFD700] border-4 border-l-0 border-black px-4 py-3 font-mono text-base font-black">
                .pdf
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-3 border-black px-4 py-2.5 font-black text-xs uppercase bg-white hover:bg-neutral-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#FFD700] border-3 border-black px-6 py-2.5 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:bg-yellow-300 flex items-center gap-1.5 cursor-pointer text-black"
            >
              <Check className="w-4 h-4" />
              <span>Apply Identifier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
