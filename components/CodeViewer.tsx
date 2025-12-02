import React, { useState } from 'react';
import { GeneratedFile } from '../types';
import { Copy, Check, FileCode, FileTerminal, FileText } from 'lucide-react';

interface CodeViewerProps {
  files: GeneratedFile[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (files.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-12">
        <div className="w-16 h-16 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <FileCode size={32} className="text-slate-300" />
        </div>
        <p className="text-lg font-medium">No code generated yet</p>
        <p className="text-sm">Fill out the configuration and click Generate</p>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(files[activeTab].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = (filename: string) => {
    if (filename.endsWith('.R')) return <FileCode size={16} className="text-blue-400" />;
    if (filename.endsWith('.sh')) return <FileTerminal size={16} className="text-green-400" />;
    if (filename.endsWith('.md')) return <FileText size={16} className="text-slate-400" />;
    return <FileText size={16} />;
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10">
      {/* Tabs Header */}
      <div className="flex items-center bg-[#252526] overflow-x-auto border-b border-[#3e3e42]">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-r border-[#3e3e42] transition-colors whitespace-nowrap
              ${activeTab === index 
                ? 'bg-[#1e1e1e] text-white' 
                : 'bg-[#2d2d2d] text-slate-400 hover:bg-[#2a2d2e] hover:text-slate-200'}
            `}
          >
            {getIcon(file.filename)}
            {file.filename}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#3e3e42]">
        <span className="text-xs text-slate-500 font-mono">
          {files[activeTab].description}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#333] hover:bg-[#444] rounded transition-all"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto custom-scrollbar relative p-4">
        <pre className="text-sm font-mono text-[#d4d4d4] leading-relaxed">
          <code>{files[activeTab].content}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;