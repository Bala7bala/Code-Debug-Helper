import React, { useState, useRef } from 'react';
import { AppState, AnalysisResult } from './types';
import { analyzeCode, executeCode } from './services/geminiService';
import { Button } from './components/Button';
import { ResultCard } from './components/ResultCard';
import { HowItWorksModal } from './components/HowItWorksModal';
import { TerminalOutput } from './components/TerminalOutput';
import { Code, Bug, Wand2, Terminal, Upload, Camera, FileText, X, Image as ImageIcon, Play } from 'lucide-react';

const INITIAL_CODE = `public class Main {
  public static void main(String[] args) {
    int a = 10
    if(a = 10) {
      System.out.println("Hello World")
    }
  }
}`;

interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64
}

const App: React.FC = () => {
  const [code, setCode] = useState(INITIAL_CODE);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  
  // Execution state
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!code.trim() && !attachment) return;

    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    setShowTerminal(false); // Hide terminal if re-analyzing

    try {
      const data = await analyzeCode(code, attachment ? { mimeType: attachment.mimeType, data: attachment.data } : undefined);
      setResult(data);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Oops! Something went wrong analyzing your code. Please check your internet or try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleRun = async () => {
    if (!code.trim() && !attachment) return;

    setAppState(AppState.EXECUTING);
    setErrorMsg(null);
    setExecutionOutput(null);
    setShowTerminal(true);

    try {
        const output = await executeCode(code, attachment ? { mimeType: attachment.mimeType, data: attachment.data } : undefined);
        setExecutionOutput(output);
        setAppState(AppState.IDLE); // Go back to idle after run
    } catch (err) {
        setExecutionOutput("Error: Could not execute code.");
        setAppState(AppState.IDLE);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setErrorMsg(null);
    setAttachment(null);
    setShowTerminal(false);
    setExecutionOutput(null);
  };

  const processFile = (file: File) => {
    const isCodeFile = 
      file.type.startsWith('text/') || 
      file.name.endsWith('.js') || 
      file.name.endsWith('.ts') || 
      file.name.endsWith('.py') || 
      file.name.endsWith('.java') || 
      file.name.endsWith('.c') || 
      file.name.endsWith('.cpp') || 
      file.name.endsWith('.cs');

    if (isCodeFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCode(text);
        setAttachment(null);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        setAttachment({
          name: file.name,
          mimeType: file.type,
          data: base64String
        });
        if (code === INITIAL_CODE) setCode("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-white">
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,application/pdf,.txt,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.cs,.html,.css,.json"
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
        capture="environment"
      />

      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-20">
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
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Paste or Upload Code</h2>
              <p className="text-slate-600">Upload an image, PDF, or file, or just paste your code below.</p>
            </div>

            <div className="flex-1 min-h-[400px] flex flex-col relative group">
              {/* Toolbar */}
              <div className="h-12 bg-gray-50 rounded-t-xl border border-gray-300 border-b-0 flex items-center px-3 justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-3 text-xs font-mono text-gray-400 flex items-center gap-1">
                    <Terminal size={12} /> editor
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Upload File"
                  >
                    <Upload size={16} />
                  </button>
                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Use Camera"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 relative flex flex-col">
                <textarea 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 w-full p-4 bg-white border border-gray-300 border-t-0 rounded-b-xl font-mono text-sm leading-6 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none shadow-sm z-0"
                  placeholder="// Paste code here or upload a file..."
                  spellCheck={false}
                />
                
                {attachment && (
                  <div className="absolute bottom-4 left-4 right-4 bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between shadow-sm z-10 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-white p-1.5 rounded-md border border-blue-100 flex-shrink-0">
                        {attachment.mimeType.includes('image') ? <ImageIcon size={20} className="text-blue-500" /> : <FileText size={20} className="text-blue-500" />}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-blue-900 truncate">{attachment.name}</p>
                        <p className="text-[10px] text-blue-600 uppercase">{attachment.mimeType.split('/')[1]} file</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAttachment(null)}
                      className="p-1 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={handleAnalyze} 
                disabled={(!code.trim() && !attachment) || appState === AppState.ANALYZING || appState === AppState.EXECUTING}
                isLoading={appState === AppState.ANALYZING}
                className="flex-1 shadow-lg shadow-blue-200"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                {attachment ? 'Analyze File' : 'Fix My Code'}
              </Button>

              <Button 
                onClick={handleRun}
                variant="secondary"
                disabled={(!code.trim() && !attachment) || appState === AppState.ANALYZING || appState === AppState.EXECUTING}
                isLoading={appState === AppState.EXECUTING}
                className="px-6"
                title="Run Code"
              >
                 <Play className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Terminal Output */}
            <TerminalOutput 
                isVisible={showTerminal} 
                output={executionOutput} 
                onClose={() => setShowTerminal(false)} 
            />

            {appState === AppState.ERROR && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                {errorMsg}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-7">
            {appState === AppState.IDLE && !showTerminal && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-20 lg:py-0 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="p-4 bg-blue-50 rounded-full mb-4 text-blue-400">
                   <Code size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-600">Ready to Debug</h3>
                <p className="max-w-xs mx-auto mt-2 text-sm">Paste your code, upload a file, or take a picture to get started.</p>
              </div>
            )}

            {(appState === AppState.ANALYZING || appState === AppState.EXECUTING) && (
              <div className="h-full flex flex-col items-center justify-center py-20 lg:py-0">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {appState === AppState.ANALYZING ? (
                        <Wand2 className="text-blue-600 w-6 h-6 animate-pulse" />
                    ) : (
                        <Terminal className="text-blue-600 w-6 h-6 animate-pulse" />
                    )}
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-800">
                  {appState === AppState.ANALYZING ? (attachment ? 'Reading file & scanning...' : 'Scanning for bugs...') : 'Running code...'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                    {appState === AppState.ANALYZING ? 'Checking syntax, logic, and style.' : 'Simulating execution environment.'}
                </p>
              </div>
            )}

            {appState === AppState.RESULTS && result && (
               <ResultCard result={result} onReset={handleReset} />
            )}
            
            {/* Show nice placeholder if terminal is open on mobile/desktop but results are empty */}
            {showTerminal && appState === AppState.IDLE && !result && (
               <div className="hidden lg:flex h-full flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="p-4 bg-gray-100 rounded-full mb-4 text-gray-400">
                        <Terminal size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">Console Active</h3>
                    <p className="max-w-xs mx-auto mt-2 text-sm">Check the terminal output on the left.</p>
               </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
