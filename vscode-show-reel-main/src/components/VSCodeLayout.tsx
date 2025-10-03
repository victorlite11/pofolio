import { useState } from 'react';
import { FileExplorer } from './FileExplorer';
import { TabBar } from './TabBar';
import { MainContent } from './MainContent';
import { CodeModal } from './CodeModal';
import ThemePanel from './ThemePanel';

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  category: 'website' | 'software' | 'arduino';
  technologies: string[];
  codeSnippet?: string;
  image?: string;
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
}

export const VSCodeLayout = () => {
  const [activeFile, setActiveFile] = useState('Dashboard');
  const [openTabs, setOpenTabs] = useState(['Dashboard']);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);

  const addTab = (fileName: string) => {
    if (!openTabs.includes(fileName)) {
      setOpenTabs([...openTabs, fileName]);
    }
    setActiveFile(fileName);
  };

  const closeTab = (fileName: string) => {
    const newTabs = openTabs.filter(tab => tab !== fileName);
    setOpenTabs(newTabs);
    if (activeFile === fileName) {
      setActiveFile(newTabs[newTabs.length - 1] || 'Home.tsx');
    }
  };

  const handleProjectClick = (project: ProjectData) => {
    setSelectedProject(project);
  };

  return (
    <div className={`h-screen flex flex-col ${activeFile === 'Client' ? 'client-theme' : 'vs-code-theme'}`}>
      {/* Top bar */}
      {activeFile === 'Client' ? (
        <div className="h-20 bg-gradient-to-r from-primary/80 to-indigo-600 text-white flex items-center px-6">
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold">Showcase — Client View</h1>
            <div className="text-sm opacity-90">Beautiful, curated presentation of projects</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveFile('Client')} className="px-4 py-2 rounded bg-white text-primary">Client</button>
            <button onClick={() => setActiveFile('Developer')} className="px-4 py-2 rounded border border-white/30">Developer</button>
            {/* CV Download - visible in client header for quick access */}
            <a href="/cv/JAMES_UGBEDE_victor_cv.pdf" download className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-white/95 text-primary rounded shadow-sm hover:bg-white transition-colors text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="opacity-90"><path d="M.5 9.9V14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9.9a.5.5 0 0 0-1 0V14a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1V9.9a.5.5 0 0 0-1 0z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l2.5 2.5a.5.5 0 0 1-.708.708L8.5 2.207V9.5a.5.5 0 0 1-1 0V2.207L5.56 4.354a.5.5 0 1 1-.707-.707l2.793-2.5z"/></svg>
              <span className="font-sans">Download CV</span>
            </a>
            {/* Theme settings button (only in client view) */}
            <button aria-label="Theme settings" onClick={() => setThemeOpen(true)} className="ml-3 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-primary shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.3 17.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.28-.39 1.51-1a1.65 1.65 0 0 0-.33-1.82L4.3 5.3A2 2 0 1 1 7.13 2.47l.06.06c.5.5 1.2.7 1.82.33.7-.4 1.5-.4 2.2 0 .6.37 1.32.17 1.82-.33l.06-.06A2 2 0 1 1 16.9 4.3l-.06.06c-.5.5-.7 1.2-.33 1.82.4.7.4 1.5 0 2.2-.37.6-.17 1.32.33 1.82l.06.06A2 2 0 1 1 19.4 15z"></path></svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="h-12 bg-sidebar border-b border-sidebar-border flex items-center px-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 text-center text-sm text-muted-foreground">
            Portfolio - Visual Studio Code
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={() => setActiveFile('Client')} className="px-3 py-1 bg-primary text-primary-foreground rounded">Client</button>
            <button onClick={() => setActiveFile('Developer')} className="px-3 py-1 border rounded">Developer</button>
          </div>
        </div>
      )}

      {/* Tab bar - hidden in Client (GUI) mode */}
      {activeFile !== 'Client' && (
        <TabBar 
          openTabs={openTabs} 
          activeFile={activeFile} 
          onTabClick={setActiveFile}
          onTabClose={closeTab}
        />
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Hide the file explorer in Client mode to give a full GUI experience */}
        {activeFile !== 'Client' && <FileExplorer activeFile={activeFile} onFileClick={addTab} />}
        <MainContent activeFile={activeFile} onProjectClick={handleProjectClick} />
      </div>

      {/* Code Modal */}
      {selectedProject && (
        <CodeModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {/* Theme Panel */}
      <ThemePanel open={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  );
};