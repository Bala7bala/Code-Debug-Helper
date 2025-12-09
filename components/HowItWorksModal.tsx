import React from 'react';
import { X, CheckCircle, Search, FileCode } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="p-6 pt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">How it works</h2>
          <p className="text-slate-600 text-sm mb-8">Debug your code in 3 simple steps.</p>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <FileCode size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">1. Paste Code</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Paste your broken code into the editor. We support Java, Python, C++, C, and JavaScript.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Search size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">2. Instant Analysis</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Our AI scans for syntax errors, logic flaws, and bad practices instantly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">3. Learn & Fix</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Get corrected code, clear explanations, and simplified logic suggestions.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-2">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 outline-none"
          >
            Got it, let's debug!
          </button>
        </div>
      </div>
    </div>
  );
};
