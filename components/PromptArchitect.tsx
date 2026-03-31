import React, { useState } from 'react';
import { SchemaField, PromptState } from '../types';
import { SchemaEditor } from './SchemaBuilder/SchemaEditor';
import { Button } from './ui/Button';
import { generateExampleJson } from '../utils/schemaUtils';

interface PromptArchitectProps {
  state: PromptState;
  setState: React.Dispatch<React.SetStateAction<PromptState>>;
  onBack: () => void;
}

export const PromptArchitect: React.FC<PromptArchitectProps> = ({ state, setState, onBack }) => {
  const [copied, setCopied] = useState(false);

  const generatePrompt = (currentState: PromptState) => {
      const jsonStructure = generateExampleJson(currentState.schema);
      return `You are an expert research assistant specializing in ${currentState.expertise || "_____"}.

${currentState.template}

--------------------------------------------------------
RESPONSE FORMAT INSTRUCTION
--------------------------------------------------------
You must output your response strictly as a valid JSON object matching the following schema:

${JSON.stringify(jsonStructure, null, 2)}`;
  };

  const finalPrompt = generatePrompt(state);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      
      {/* Left Panel - Editor */}
      <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col h-full border-r border-slate-200 overflow-y-auto custom-scrollbar bg-white">
        <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onBack}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>}
                >
                    Back
                </Button>
                <h1 className="text-lg font-bold text-slate-800">Prompt Architect</h1>
             </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto w-full space-y-8 pb-20">
          
          {/* Expertise Section */}
          <section className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
              1. Domain Expertise
            </label>
            <div className="flex items-center gap-0 border border-slate-200 rounded-none bg-white">
              <div className="bg-slate-50 px-4 py-3 border-r border-slate-200 text-slate-500 text-sm font-medium select-none">
                You are an expert in
              </div>
              <input
                type="text"
                value={state.expertise}
                onChange={(e) => setState(prev => ({ ...prev, expertise: e.target.value }))}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 px-4 py-2 placeholder-slate-300 font-medium outline-none"
                placeholder="e.g. Molecular Biology"
              />
            </div>
          </section>

          {/* Template Editor */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                2. Task Instructions
              </label>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1">Use {'{{variable}}'} for placeholders</span>
            </div>
            <textarea
              value={state.template}
              onChange={(e) => setState(prev => ({ ...prev, template: e.target.value }))}
              className="w-full h-40 p-4 bg-white border border-slate-200 rounded-none text-sm text-slate-800 leading-relaxed focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all shadow-sm resize-none font-mono outline-none"
              placeholder="Describe the core task..."
            />
          </section>

          {/* Schema Builder */}
          <section className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
              3. Output JSON Schema
            </label>
            <p className="text-sm text-slate-500 mb-2">Define the exact JSON structure the AI must return.</p>
            
            <SchemaEditor 
              schema={state.schema} 
              onChange={(newSchema) => setState(prev => ({ ...prev, schema: newSchema }))}
            />
          </section>

        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-slate-50 h-full flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Live Preview
          </h2>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleCopy}
            className={copied ? "bg-emerald-600 hover:bg-emerald-700 rounded-none" : "rounded-none"}
            icon={copied ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            }
          >
            {copied ? 'Copied!' : 'Copy System Prompt'}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-100">
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <pre className="text-slate-700 text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap">
              {finalPrompt}
            </pre>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 text-blue-800">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Usage Tip</h3>
            <p className="text-xs leading-relaxed">
              This preview shows exactly what will be sent to the AI as the System Instruction. The extracted PDF content will be appended as the user message.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};