import React from 'react';
import { AnalysisResult } from '../types';
import { CodeBlock } from './CodeBlock';
import { AlertTriangle, CheckCircle, Lightbulb, GraduationCap, Terminal } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Detected: {result.language}
            </span>
        </div>
        <button onClick={onReset} className="text-sm text-gray-500 hover:text-blue-600 underline">
          Analyze New Code
        </button>
      </div>

      {/* 1. Errors Found */}
      {result.errors.length > 0 ? (
        <section className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="font-semibold text-red-900">Errors Found</h3>
          </div>
          <div className="divide-y divide-red-50">
            {result.errors.map((error, idx) => (
              <div key={idx} className="p-4 hover:bg-red-50/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      {error.type} <span className="text-red-400 mx-1">•</span> {error.line && `Line ${error.line}`}
                    </p>
                    <p className="text-gray-700 mt-1 text-sm">{error.description}</p>
                    {error.fix && (
                      <div className="mt-2 bg-red-50/50 p-2 rounded border border-red-100">
                        <span className="text-xs text-red-400 uppercase font-bold mr-2">Fix:</span>
                        <code className="text-sm text-red-800 font-mono">{error.fix}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-center gap-3">
           <CheckCircle className="text-green-500" size={24} />
           <div>
             <h3 className="font-semibold text-green-800">Great Job!</h3>
             <p className="text-green-700 text-sm">No syntax errors were found in your code.</p>
           </div>
        </div>
      )}

      {/* 2. Correct Syntax */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <CheckCircle className="text-green-500" size={20} />
          Correct Syntax
        </h3>
        <CodeBlock code={result.correctSyntax} className="border-green-200 bg-green-50/30" />
      </section>

      {/* 3. Explanation */}
      <section className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
          <Lightbulb className="text-yellow-600" size={20} />
          Why This Error Happened
        </h3>
        <p className="text-yellow-900 leading-relaxed">
          {result.explanation}
        </p>
      </section>

      {/* 4. Simplified Logic (Optional) */}
      {result.simplifiedLogic && (
        <section>
          <div className="mb-3">
             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="bg-blue-100 p-1 rounded">✨</span>
                Simplified Logic Version
             </h3>
             <p className="text-sm text-gray-500 mt-1">A cleaner way to write the same logic.</p>
          </div>
          <CodeBlock code={result.simplifiedLogic} label="Better Logic" />
        </section>
      )}

      {/* 5. Formatted Final Code */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Formatted Final Code</h3>
        <CodeBlock code={result.formattedCode} label="Final Result" language={result.language} />
      </section>

      {/* 6. Output (Optional) */}
      {result.output && (
        <section className="mt-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700 text-slate-300 text-sm font-medium">
              <Terminal size={14} />
              Output of Fixed Code
           </div>
           <div className="p-4 text-slate-200 font-mono text-sm whitespace-pre-wrap">
              {result.output}
           </div>
        </section>
      )}

      {/* 7. Learning Tips */}
      {result.learningTips && result.learningTips.length > 0 && (
         <section className="border-t border-gray-200 pt-6 mt-8">
            <h3 className="text-md font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <GraduationCap size={18} />
                Quick Tips to Remember
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
                {result.learningTips.map((tip, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">
                        {tip}
                    </div>
                ))}
            </div>
         </section>
      )}
    </div>
  );
};
