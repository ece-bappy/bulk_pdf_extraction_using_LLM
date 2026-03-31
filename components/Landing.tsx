import React from 'react';
import { Button } from './ui/Button';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-100">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold font-mono">
                AI
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">Research Extractor</span>
         </div>
         <Button variant="primary" size="sm" onClick={onGetStarted}>
            Launch App
         </Button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-16 pb-12 px-6 text-center max-w-6xl mx-auto w-full">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium mb-8 border border-primary-100">
           <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
           Now supporting batch processing
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl leading-tight">
          Turn Research Papers into <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Structured Data</span> instantly.
        </h1>
        
        <p className="text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed">
           Stop manually copying data from PDFs. Define your schema, upload your research articles, and let our AI agent extract precise, structured insights in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
           <Button 
              size="lg" 
              onClick={onGetStarted}
              className="shadow-xl shadow-primary-500/20 text-lg px-8"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>}
           >
              Get Started for Free
           </Button>
           <Button 
              variant="secondary" 
              size="lg"
              onClick={() => window.open("https://www.youtube.com/watch?v=G5nSm73o4bw", "_blank")}
              className="text-lg px-8"
           >
              Watch Demo
           </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl">
           <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">PDF to JSON</h3>
              <p className="text-slate-500 text-sm">Upload standard research PDFs and get clean, valid JSON output ready for analysis or database import.</p>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Custom Schema</h3>
              <p className="text-slate-500 text-sm">Define exactly what data points you need. Our visual builder makes creating complex schemas effortless.</p>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Batch Analysis</h3>
              <p className="text-slate-500 text-sm">Process dozens of papers in one go. Get a single consolidated dataset for your meta-analysis.</p>
           </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-sm">
         <p>&copy; {new Date().getFullYear()} Research Extractor. Powered by Gemini 2.5.</p>
      </footer>
    </div>
  );
};