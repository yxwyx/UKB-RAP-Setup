import React, { useState } from 'react';
import { SetupConfig, GeneratedFile, GeneratorStatus } from './types';
import { generateREnvironment } from './services/geminiService';
import CodeViewer from './components/CodeViewer';
import { 
  Server, 
  Package, 
  Cpu, 
  Play, 
  Loader2, 
  AlertCircle, 
  Github, 
  Database 
} from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<SetupConfig>({
    goal: 'Analyze GWAS summary statistics and perform visualization',
    packages: 'data.table, ggplot2, dplyr',
    rVersion: '4.3',
    includeBioconductor: false,
    includeTidyverse: true,
  });

  const [status, setStatus] = useState<GeneratorStatus>(GeneratorStatus.IDLE);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      setError("API Key is missing. Please set the API_KEY environment variable.");
      return;
    }

    setStatus(GeneratorStatus.GENERATING);
    setError(null);
    setSummary("");

    try {
      const result = await generateREnvironment(config);
      setGeneratedFiles(result.files);
      setSummary(result.summary);
      setStatus(GeneratorStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(GeneratorStatus.ERROR);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar / Configuration Panel */}
      <div className="w-full md:w-[450px] flex-shrink-0 flex flex-col h-full bg-white border-r border-slate-200 overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 rounded-lg">
              <Server className="text-brand-600" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">UKB-RAP Setup</h1>
          </div>
          <p className="text-sm text-slate-500">
            Generate reproducible R environments for the UK Biobank Research Analysis Platform.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 p-6 space-y-6">
          
          {/* Goal Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Cpu size={16} />
              Analysis Goal
            </label>
            <textarea
              value={config.goal}
              onChange={(e) => setConfig({ ...config, goal: e.target.value })}
              className="w-full h-24 px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none placeholder:text-slate-400"
              placeholder="Describe your analysis (e.g., 'Run quality control on PLINK binary files')"
            />
          </div>

          {/* Packages Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Package size={16} />
              R Packages
            </label>
            <input
              type="text"
              value={config.packages}
              onChange={(e) => setConfig({ ...config, packages: e.target.value })}
              className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none placeholder:text-slate-400"
              placeholder="e.g., survival, glmnet, Seurat"
            />
            <p className="text-xs text-slate-500">Comma separated package names.</p>
          </div>

          {/* R Version & Flags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">R Version</label>
              <select
                value={config.rVersion}
                onChange={(e) => setConfig({ ...config, rVersion: e.target.value })}
                className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="4.3">4.3.x (Recommended)</option>
                <option value="4.2">4.2.x</option>
                <option value="4.1">4.1.x</option>
                <option value="4.0">4.0.x</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={config.includeTidyverse}
                onChange={(e) => setConfig({ ...config, includeTidyverse: e.target.checked })}
                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-slate-700">Include Tidyverse</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={config.includeBioconductor}
                onChange={(e) => setConfig({ ...config, includeBioconductor: e.target.checked })}
                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Include Bioconductor</span>
                <span className="text-xs text-slate-500">Adds BiocManager and repo config</span>
              </div>
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={status === GeneratorStatus.GENERATING}
            className={`
              w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all shadow-lg shadow-brand-500/20
              ${status === GeneratorStatus.GENERATING 
                ? 'bg-brand-400 cursor-not-allowed' 
                : 'bg-brand-600 hover:bg-brand-700 active:transform active:scale-95'}
            `}
          >
            {status === GeneratorStatus.GENERATING ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Building Environment...
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                Generate Configuration
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-xs text-slate-400">
            Powered by Gemini 2.5 Flash
          </p>
        </div>
      </div>

      {/* Main Content / Code Viewer */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 p-4 md:p-6">
        
        {/* Context Summary Bar */}
        {status === GeneratorStatus.SUCCESS && summary && (
          <div className="mb-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 animate-fade-in-up">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Database className="text-emerald-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Environment Strategy</h3>
              <p className="text-sm text-slate-600 mt-1">{summary}</p>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0">
          <CodeViewer files={generatedFiles} />
        </div>

        {/* Helper Note */}
        {status === GeneratorStatus.SUCCESS && (
           <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-2">
             <span className="flex items-center gap-2">
               <Github size={14} />
               Ready to be pushed to GitHub
             </span>
             <span>
               System Dependencies are automatically inferred based on requested R packages.
             </span>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;