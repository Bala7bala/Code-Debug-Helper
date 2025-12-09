import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  label?: string;
  className?: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, label, className = '', language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 bg-gray-50 ${className}`}>
      {(label || language) && (
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {label && <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>}
          </div>
          {language && <span className="text-xs font-mono text-gray-400">{language}</span>}
        </div>
      )}
      <div className="relative group">
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200"
          title="Copy Code"
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Clipboard size={16} className="text-gray-600" />}
        </button>
        <pre className="p-4 overflow-x-auto text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};