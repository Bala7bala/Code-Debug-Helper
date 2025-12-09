import React, { useState } from 'react';
import { AppState, AnalysisResult } from './types';
import { analyzeCode } from './services/geminiService';
import { Button } from './components/Button';
import { ResultCard } from './components/ResultCard';
import { HowItWorksModal } from './components/HowItWorksModal';
import { Code, Bug, Wand2, Terminal } from 'lucide-react';

const INITIAL_CODE = `public class Main {
  public static void main(String[] args) {
    int a = 10
    if(a = 10) {
      System.out.println("Hello World")
    }
  }
}`;

const App: React.FC = () => {
  const [code, setCode] = useState(INITIAL_CODE);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      const data = await analyzeCode(code);
      setResult(data);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Oops! Something went wrong analyzing your code. Please check your internet or try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />

      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Bug size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Code Debug Helper</h1>
              <p className="text-xs text-slate-500 hidden sm:block">For CS Students</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setShowHowItWorks(true)}
               className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
             >
               How it works
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: Input */}
          <div className={`lg:col-span-5 flex flex-col h-full ${appState === AppState.RESULTS ? 'hidden lg:flex' : ''}`}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Paste your broken code</h2>
              <p className="text-slate-600">Don't worry about errors. We'll find them, explain them, and fix them for you.</p>
            </div>

            <div className="flex-1 min-h-[400px] flex flex-col relative group">
              <div className="absolute top-0 left-0 right-0 h-10 bg-gray-100 rounded-t-xl border border-gray-300 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto text-xs font-mono text-gray-500 flex items-center gap-1">
                  <Terminal size={12} /> editor
                </div>
              </div>
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full pt-12 p-4 bg-slate-50 border border-gray-300 rounded-xl font-mono text-sm leading-6 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none shadow-sm"
                placeholder="// Paste your C, Java, Python or JS code here..."
                spellCheck={false}
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none font-mono">
                {code.split('\n').length} lines
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button 
                onClick={handleAnalyze} 
                disabled={!code.trim() || appState === AppState.ANALYZING}
                isLoading={appState === AppState.ANALYZING}
                className="w-full flex-1 shadow-lg shadow-blue-200"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Fix My Code
              </Button>
            </div>
            
            {appState === AppState.ERROR && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                {errorMsg}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-7">
            {appState === AppState.IDLE && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-20 lg:py-0 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="p-4 bg-blue-50 rounded-full mb-4 text-blue-400">
                   <Code size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-600">Ready to Debug</h3>
                <p className="max-w-xs mx-auto mt-2 text-sm">Paste your code on the left and hit the fix button to see magic happen.</p>
              </div>
            )}

            {appState === AppState.ANALYZING && (
              <div className="h-full flex flex-col items-center justify-center py-20 lg:py-0">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wand2 className="text-blue-600 w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-800">Scanning for bugs...</h3>
                <p className="text-slate-500 text-sm mt-1">Checking syntax, logic, and style.</p>
              </div>
            )}

            {appState === AppState.RESULTS && result && (
               <ResultCard result={result} onReset={handleReset} />
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;