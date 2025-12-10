import React from 'react';
import { Terminal, X } from 'lucide-react';

interface TerminalOutputProps {
  output: string | null;
  onClose: () => void;
  isVisible: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ output, onClose, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="mt-4 rounded-xl overflow-hidden bg-slate-900 text-slate-200 shadow-lg border border-slate-700 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <Terminal size={14} />
          <span>Console Output</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="p-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-64">
        {output || <span className="text-slate-500 italic">...</span>}
      </div>
    </div>
  );
};
