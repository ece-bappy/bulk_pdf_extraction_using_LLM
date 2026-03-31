import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Button } from './ui/Button';
import { extractTextFromPdf } from '../utils/pdfUtils';
import { PromptState } from '../types';
import { generateExampleJson } from '../utils/schemaUtils';

interface HomeProps {
  promptState: PromptState;
  onEditPrompt: () => void;
}

export const Home: React.FC<HomeProps> = ({ promptState, onEditPrompt }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  
  // Track the prompt state used for the current result to detect changes
  const [lastUsedPrompt, setLastUsedPrompt] = useState<PromptState | null>(null);

  // Animation & Logging State
  const [logs, setLogs] = useState<string[]>([]);
  const [scannerText, setScannerText] = useState<string>("Initializing scanner...");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString().split(' ')[0]}] ${message}`]);
  };

  const generateSystemPrompt = () => {
    const jsonStructure = generateExampleJson(promptState.schema);
    return `You are an expert research assistant specializing in ${promptState.expertise || "_____"}.

${promptState.template}

--------------------------------------------------------
RESPONSE FORMAT INSTRUCTION
--------------------------------------------------------
You must output your response strictly as a valid JSON object matching the following schema:

${JSON.stringify(jsonStructure, null, 2)}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      // Reset results if we add new files to force clean batch state.
      setResults(null);
      setError(null);
      setLogs([]);
      setLastUsedPrompt(null);
      setCurrentFileIndex(0);
      setScannerText("Ready to analyze.");
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults(null);
    setLastUsedPrompt(null);
  };

  const clearFiles = () => {
    setFiles([]);
    setResults(null);
    setLastUsedPrompt(null);
    setLogs([]);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setLogs([]);
    setCurrentFileIndex(0);
    
    // Store a snapshot of the prompt config used for this analysis
    setLastUsedPrompt(JSON.parse(JSON.stringify(promptState)));
    
    let sentenceInterval: any = null;
    const aggregatedData: any[] = [];
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemPrompt = generateSystemPrompt();

    try {
      addLog(`Starting batch analysis of ${files.length} documents...`);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileIndex(i);
        addLog(`--- Processing File ${i + 1}/${files.length}: ${file.name} ---`);

        // 1. Text Extraction
        addLog(`Extracting text from ${file.name}...`);
        const extractedText = await extractTextFromPdf(file);
        
        // 2. Scanner Effect Update
        if (sentenceInterval) clearInterval(sentenceInterval);
        
        const sentences = extractedText
          .replace(/\n/g, ' ')
          .match(/[^.!?]+[.!?]+/g) || [];
        
        const validSentences = sentences
          .map(s => s.trim())
          .filter(s => s.length > 40 && s.length < 200);

        if (validSentences.length > 0) {
          sentenceInterval = setInterval(() => {
              const randomIdx = Math.floor(Math.random() * validSentences.length);
              setScannerText(validSentences[randomIdx]);
          }, 1000); // Slowed down from 100ms to 500ms
        } else {
          setScannerText(`Reading ${file.name}...`);
        }

        // 3. AI Request
        addLog("Sending content to Gemini API...");
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: 'application/json'
                },
                contents: extractedText
            });

            const responseText = response.text;
            if (responseText) {
                const jsonResponse = JSON.parse(responseText);
                // Inject Source Filename
                jsonResponse.source_filename = file.name;
                aggregatedData.push(jsonResponse);
                addLog(`Successfully extracted data from ${file.name}`);
            }
        } catch (innerError: any) {
            console.error(innerError);
            addLog(`Error processing ${file.name}: ${innerError.message}`);
            // Push error object to results so we maintain alignment
            aggregatedData.push({
                source_filename: file.name,
                error: "Failed to analyze this document",
                details: innerError.message
            });
        }
        
        // Small delay between requests to be gentle
        if (i < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setResults(aggregatedData);
      addLog("Batch analysis completed successfully.");

    } catch (err: any) {
      console.error(err);
      addLog(`CRITICAL BATCH ERROR: ${err.message}`);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      if (sentenceInterval) clearInterval(sentenceInterval);
      setIsProcessing(false);
      setScannerText("Analysis complete.");
    }
  };

  // Check if current prompt state differs from what was used for the last result
  const hasPromptChanged = results && lastUsedPrompt && JSON.stringify(promptState) !== JSON.stringify(lastUsedPrompt);

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col overflow-y-auto custom-scrollbar relative">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-30 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold font-mono">
                AI
            </div>
            <h1 className="font-bold text-slate-800 text-lg tracking-tight">Research Extractor</h1>
         </div>
         <Button 
            variant="outline"
            size="sm"
            onClick={onEditPrompt}
            className="rounded-none border-slate-300 text-slate-600 hover:text-primary-600"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>}
         >
            Tweak System Prompt
         </Button>
      </header>

      {/* Change Notification Banner */}
      {hasPromptChanged && (
        <div className="sticky top-[73px] z-20 bg-amber-50 border-b border-amber-200 px-6 md:px-12 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
             <span>System prompt has been modified. Results may need refreshing.</span>
          </div>
          <Button 
            size="sm" 
            onClick={handleAnalyze} 
            className="bg-amber-600 hover:bg-amber-700 text-white border-none whitespace-nowrap"
          >
            Re-analyze {files.length} Document{files.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12 space-y-8">
        
        {/* Hero / Upload Section */}
        <section className="bg-white border border-slate-200 p-8 md:p-12 text-center shadow-sm relative overflow-hidden transition-all duration-500 rounded-lg">
           
           {!isProcessing ? (
             <>
               <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Batch Research Data Extraction</h2>
               <p className="text-slate-500 max-w-lg mx-auto mb-8">
                 Upload multiple research paper PDFs. We will analyze each one and compile a consolidated JSON dataset based on your schema.
               </p>

               <div 
                 className={`border-2 border-dashed rounded-lg p-10 transition-colors cursor-pointer ${files.length > 0 ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'}`}
                 onClick={() => fileInputRef.current?.click()}
               >
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    multiple
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />
                  
                  {files.length > 0 ? (
                      <div className="flex flex-col items-center w-full" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 mb-4 text-primary-700 bg-primary-100 px-4 py-1.5 rounded-full text-sm font-medium">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                             {files.length} file{files.length !== 1 ? 's' : ''} selected
                          </div>

                          {/* File List Preview */}
                          <div className="w-full max-w-md bg-white rounded border border-slate-200 overflow-hidden mb-6 text-left max-h-48 overflow-y-auto custom-scrollbar">
                             {files.map((f, idx) => (
                               <div key={idx} className="flex items-center justify-between p-2 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                    <div className="flex items-center gap-2 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                                        <span className="text-xs text-slate-600 truncate max-w-[200px]" title={f.name}>{f.name}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                               </div>
                             ))}
                          </div>
                          
                          <div className="flex gap-3">
                             <Button 
                                variant="secondary"
                                size="md"
                                onClick={(e) => { e.stopPropagation(); clearFiles(); }}
                             >
                                Clear All
                             </Button>
                             <Button 
                                variant="primary" 
                                size="md"
                                onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                                className="shadow-lg shadow-primary-500/30"
                             >
                                Start Batch Analysis
                             </Button>
                          </div>
                          <p className="mt-4 text-xs text-slate-400">
                              Click anywhere in the box to add more PDF files.
                          </p>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span className="font-medium text-slate-700">Click to Upload Research PDFs</span>
                        <span className="text-xs text-slate-400 mt-1">Support multiple file selection</span>
                      </div>
                  )}
               </div>
             </>
           ) : (
             <div className="flex flex-col items-center justify-center py-8">
                {/* Spinner */}
                <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2 animate-pulse">
                    Processing Document {currentFileIndex + 1} of {files.length}
                </h3>
                <p className="text-slate-500 mb-8 font-medium max-w-md truncate px-4 bg-slate-50 py-1 rounded">
                    {files[currentFileIndex]?.name}
                </p>

                {/* Live Scanner Box */}
                <div className="w-full max-w-2xl bg-slate-900 rounded-lg overflow-hidden shadow-xl font-mono text-xs mb-8 text-left relative group border border-slate-800">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50 animate-scan"></div>
                    <div className="p-6 h-32 flex items-center justify-center text-center leading-relaxed">
                        <span className="text-emerald-400/90 drop-shadow-sm">{scannerText}</span>
                    </div>
                    <div className="absolute bottom-2 right-2 text-[10px] text-slate-600 uppercase tracking-wider">Live Context Scan</div>
                </div>

                {/* Terminal Logs */}
                <div className="w-full max-w-2xl bg-black rounded-lg border border-slate-800 p-4 h-48 overflow-y-auto custom-scrollbar text-left font-mono text-xs shadow-inner">
                    {logs.map((log, i) => (
                        <div key={i} className="text-slate-400 border-l-2 border-slate-800 pl-2 mb-1">
                            <span className="text-slate-600 mr-2">{log.split(']')[0]}]</span>
                            <span className="text-slate-300">{log.split(']')[1]}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
             </div>
           )}
        </section>

        {/* Analysis Results */}
        {results && !isProcessing && (
           <section className="bg-white border border-slate-200 shadow-md rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <h3 className="font-bold text-slate-700">Consolidated Dataset ({results.length} items)</h3>
                </div>
                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                            const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "research_data.json";
                            a.click();
                        }}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>}
                    >
                        Download JSON
                    </Button>
                    <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
                    >
                        Copy JSON
                    </Button>
                </div>
             </div>
             <div className="relative">
                 <pre className="bg-slate-900 text-slate-50 p-6 overflow-x-auto text-xs font-mono leading-relaxed max-h-[600px] custom-scrollbar">
                    {JSON.stringify(results, null, 2)}
                 </pre>
             </div>
           </section>
        )}

        {/* Error Display */}
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3 animate-in fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>{error}</span>
            </div>
        )}
      </main>
    </div>
  );
};