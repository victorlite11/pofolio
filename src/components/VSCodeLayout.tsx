import React, { useEffect, useState } from "react";
import { 
  File, 
  Folder, 
  FolderOpen, 
  Search, 
  GitBranch, 
  Bug, 
  Settings,
  Terminal,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommandPalette from './CommandPalette';
import FakeTerminal from './FakeTerminal';
import JarvisPanel from './JarvisPanel';
// ChatToggleWidget is provided globally by the top-level layout (Portfolio)

interface VSCodeLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function VSCodeLayout({ children, className }: VSCodeLayoutProps) {
  const [activeTab, setActiveTab] = useState('portfolio.tsx');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeFile, setActiveFile] = useState('portfolio.tsx');
  const [openTabs, setOpenTabs] = useState(['portfolio.tsx']);
  const [activeIcon, setActiveIcon] = useState('explorer');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const [srcExpanded, setSrcExpanded] = useState(true);
  const [componentsExpanded, setComponentsExpanded] = useState(true);
  const files = [
    { name: 'src', type: 'folder', expanded: srcExpanded },
    { name: 'components', type: 'folder', expanded: componentsExpanded, indent: 1 },
    ...(srcExpanded && componentsExpanded ? [
      { name: 'Hero.tsx', type: 'file', indent: 2 },
      { name: 'About.tsx', type: 'file', indent: 2 },
      { name: 'Projects.tsx', type: 'file', indent: 2 },
    ] : srcExpanded && !componentsExpanded ? [] : !srcExpanded ? [] : []),
    ...(srcExpanded ? [
      { name: 'portfolio.tsx', type: 'file', indent: 1 },
    ] : []),
    { name: 'package.json', type: 'file', indent: 0 },
    { name: 'README.md', type: 'file', indent: 0 },
  ];

  // Tabs are now dynamic

  // keyboard shortcuts: Ctrl/Cmd+P opens command palette; Ctrl+1..7 open sections
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (meta && /^[1-7]$/.test(e.key)) {
        const map: Record<string,string> = {
          '1':'hero','2':'about','3':'social','4':'chat','5':'skills','6':'projects','7':'contact'
        };
        const key = map[e.key];
        if (key) {
          try { window.dispatchEvent(new CustomEvent('devview-open-section', { detail: { key } })); } catch (err) {}
          setActiveTab(key);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={cn("flex h-screen bg-vscode-bg text-vscode-text font-code", className)}>
      {/* Activity Bar */}
      <div className="w-12 bg-vscode-sidebar border-r border-vscode-border flex flex-col items-center py-4 space-y-4">
        <button onClick={() => setActiveIcon('explorer')} className={`focus:outline-none ${activeIcon==='explorer'?'bg-vscode-bg-lighter':''} rounded p-1 group`}>
          <File className={`w-6 h-6 ${activeIcon==='explorer'?'text-vscode-accent':'text-vscode-text-dim group-hover:text-vscode-text'}`} />
        </button>
        <button onClick={() => setActiveIcon('search')} className={`focus:outline-none ${activeIcon==='search'?'bg-vscode-bg-lighter':''} rounded p-1 group`}>
          <Search className={`w-6 h-6 ${activeIcon==='search'?'text-vscode-accent':'text-vscode-text-dim group-hover:text-vscode-text'}`} />
        </button>
        <button onClick={() => setActiveIcon('git')} className={`focus:outline-none ${activeIcon==='git'?'bg-vscode-bg-lighter':''} rounded p-1 group`}>
          <GitBranch className={`w-6 h-6 ${activeIcon==='git'?'text-vscode-accent':'text-vscode-text-dim group-hover:text-vscode-text'}`} />
        </button>
        <button onClick={() => setActiveIcon('bug')} className={`focus:outline-none ${activeIcon==='bug'?'bg-vscode-bg-lighter':''} rounded p-1 group`}>
          <Bug className={`w-6 h-6 ${activeIcon==='bug'?'text-vscode-accent':'text-vscode-text-dim group-hover:text-vscode-text'}`} />
        </button>
        <div className="flex-1" />
        <button onClick={() => setActiveIcon('settings')} className={`focus:outline-none ${activeIcon==='settings'?'bg-vscode-bg-lighter':''} rounded p-1 group`}>
          <Settings className={`w-6 h-6 ${activeIcon==='settings'?'text-vscode-accent':'text-vscode-text-dim group-hover:text-vscode-text'}`} />
        </button>
      </div>

      {/* Sidebar */}
      {!sidebarCollapsed && (
        <div className="w-64 bg-vscode-bg-light border-r border-vscode-border">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-vscode-text mb-4">EXPLORER</h3>
            <div className="space-y-1">
              {files.map((file, index) => {
                const isActive = activeFile === file.name;
                const scrollMap: Record<string, string> = {
                  'Hero.tsx': 'hero',
                  'About.tsx': 'about',
                  'Projects.tsx': 'projects',
                  'portfolio.tsx': '',
                  'package.json': '',
                  'README.md': '',
                };
                const handleClick = () => {
                  if (file.type === 'folder') {
                    if (file.name === 'src') setSrcExpanded((prev) => !prev);
                    if (file.name === 'components') setComponentsExpanded((prev) => !prev);
                  } else {
                    setActiveFile(file.name);
                    setActiveTab(file.name);
                    if (!openTabs.includes(file.name)) {
                      setOpenTabs([...openTabs, file.name]);
                    }
                    if (scrollMap[file.name]) {
                      const el = document.getElementById(scrollMap[file.name]);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }
                  }
                };
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center py-1 px-2 text-sm cursor-pointer hover:bg-vscode-bg-lighter rounded transition-colors",
                      isActive && file.type === 'file' && "bg-vscode-bg-lighter"
                    )}
                    style={{ paddingLeft: `${8 + (file.indent || 0) * 16}px` }}
                    onClick={handleClick}
                  >
                    {file.type === 'folder' ? (
                      file.expanded ? (
                        <FolderOpen className="w-4 h-4 mr-2 text-vscode-warning" />
                      ) : (
                        <Folder className="w-4 h-4 mr-2 text-vscode-warning" />
                      )
                    ) : (
                      <File className="w-4 h-4 mr-2 text-vscode-accent" />
                    )}
                    <span className={isActive && file.type === 'file' ? "text-vscode-text" : "text-vscode-text-dim"}>
                      {file.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <JarvisPanel />
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div className="h-10 bg-vscode-bg-light border-b border-vscode-border flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-vscode-border">
          {openTabs.map((tab) => (
            <div
              key={tab}
              className={cn(
                "h-full px-4 flex items-center text-sm cursor-pointer border-r border-vscode-border transition-colors",
                activeTab === tab 
                  ? "bg-vscode-bg text-vscode-text" 
                  : "text-vscode-text-dim hover:text-vscode-text"
              )}
              onClick={() => { setActiveTab(tab); setActiveFile(tab); }}
            >
              <File className="w-4 h-4 mr-2" />
              {tab}
              <button
                className="ml-2 text-vscode-text-dim hover:text-vscode-error focus:outline-none"
                onClick={e => {
                  e.stopPropagation();
                  setOpenTabs(openTabs.filter(t => t !== tab));
                  if (activeTab === tab && openTabs.length > 1) {
                    const nextTab = openTabs.find(t => t !== tab) || 'portfolio.tsx';
                    setActiveTab(nextTab);
                    setActiveFile(nextTab);
                  }
                }}
                aria-label={`Close ${tab}`}
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex-1" />
          <div className="px-4 flex items-center space-x-2">
            <Play className="w-4 h-4 text-vscode-success cursor-pointer" />
            <button title="Toggle Terminal" onClick={() => {
              const next = !terminalOpen;
              setTerminalOpen(next);
              try { window.dispatchEvent(new CustomEvent(next ? 'terminal-open' : 'terminal-close')); } catch (e) {}
            }} className="ml-2 text-vscode-text-dim hover:text-vscode-text">Terminal</button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Command Palette */}
        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          commands={[
            { id: 'hero', title: 'Open: Hero', key: 'Ctrl+1' },
            { id: 'about', title: 'Open: About', key: 'Ctrl+2' },
            { id: 'social', title: 'Open: Social', key: 'Ctrl+3' },
            { id: 'chat', title: 'Open: AI Chat', key: 'Ctrl+4' },
            { id: 'skills', title: 'Open: Skills', key: 'Ctrl+5' },
            { id: 'projects', title: 'Open: Projects', key: 'Ctrl+6' },
            { id: 'contact', title: 'Open: Contact', key: 'Ctrl+7' },
          ]}
        />
  <FakeTerminal open={terminalOpen} onClose={() => setTerminalOpen(false)} />

        {/* Status Bar */}
        <div className="h-6 bg-vscode-accent text-vscode-bg text-xs flex items-center px-4 space-x-4">
          <span>main</span>
          <span>TypeScript React</span>
          <span>UTF-8</span>
          <div className="flex-1" />
          <span>Ln 1, Col 1</span>
        </div>
      </div>
      {/* Site-wide Chat Toggle is provided by the top-level Portfolio component */}
    </div>
  );
}