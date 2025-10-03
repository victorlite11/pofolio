import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { ProjectData } from './VSCodeLayout';

interface CodeModalProps {
  project: ProjectData;
  onClose: () => void;
}

export const CodeModal = ({ project, onClose }: CodeModalProps) => {
  const [displayedCode, setDisplayedCode] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < project.codeSnippet.length) {
        setDisplayedCode(project.codeSnippet.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [project.codeSnippet, currentIndex]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(project.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatCode = (code: string) => {
    return code.split('\n').map((line, index) => (
      <div key={index} className="flex">
        <span className="text-muted-foreground w-12 text-right pr-3 select-none">
          {index + 1}
        </span>
        <span className="flex-1">
          {line.split(/(\b(?:const|let|var|function|class|if|else|for|while|return|import|export|from|default|async|await)\b|'[^']*'|"[^"]*"|`[^`]*`|\d+|\{|\}|\(|\)|;|,)/g).map((token, i) => {
            if (['const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'from', 'default', 'async', 'await'].includes(token)) {
              return <span key={i} className="syntax-keyword">{token}</span>;
            }
            if (token.match(/^['"`]/)) {
              return <span key={i} className="syntax-string">{token}</span>;
            }
            if (token.match(/^\d+$/)) {
              return <span key={i} className="syntax-number">{token}</span>;
            }
            if (['{', '}', '(', ')', ';', ','].includes(token)) {
              return <span key={i} className="syntax-keyword">{token}</span>;
            }
            return <span key={i}>{token}</span>;
          })}
        </span>
      </div>
    ));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="bg-background border border-border rounded-lg max-w-4xl max-h-[80vh] m-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-muted rounded"
              title="Copy code"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Code content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-sidebar rounded border border-border">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">
                {project.category === 'website' ? 'main.js' : 
                 project.category === 'software' ? 'app.py' : 'sketch.ino'}
              </span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="p-4 font-code text-sm leading-relaxed">
              {formatCode(displayedCode)}
              {currentIndex < project.codeSnippet.length && (
                <span className="border-r-2 border-primary animate-pulse ml-1"></span>
              )}
            </div>
          </div>
        </div>

        {/* Project details */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">View Live</a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded text-sm">View Repo</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};