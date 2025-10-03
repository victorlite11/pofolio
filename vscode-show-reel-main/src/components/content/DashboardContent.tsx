import React from 'react';
import { useProjects } from '@/lib/useProjects';

export const DashboardContent: React.FC = () => {
  const { projects, isLoading } = useProjects();

  const inspiredPath = 'C:\\Users\\Creative Mind Tech\\Downloads\\vscode-show-reel-main\\inspired-canvas-site-main';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded bg-card">
          <h3 className="font-semibold">Featured Local Project</h3>
          <p className="text-sm text-muted-foreground mt-2">Inspired Canvas — local project</p>
          <p className="text-xs text-muted-foreground mt-2">Path: <code className="bg-muted/20 px-1 rounded">{inspiredPath}</code></p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => { navigator.clipboard?.writeText(inspiredPath); alert('Path copied to clipboard'); }} className="px-3 py-2 bg-primary text-primary-foreground rounded">Copy Path</button>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('To preview this local project, run it from its folder (see Developer mode).'); }} className="px-3 py-2 border rounded">Preview</a>
          </div>
        </div>

        <div className="p-4 border rounded bg-card">
          <h3 className="font-semibold">Quick Stats</h3>
          <p className="mt-2">Total projects: <strong>{isLoading ? '—' : projects.length}</strong></p>
          <p className="mt-1 text-sm text-muted-foreground">Use the Client view to browse your work in a marketplace-style gallery.</p>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded bg-muted/30">
        <h4 className="font-semibold">Getting started</h4>
        <ol className="list-decimal ml-5 mt-2 text-sm text-muted-foreground">
          <li>Use the "Client" button in the top bar to view a marketplace-like gallery of your sites and software.</li>
          <li>Use the "Developer" button to see instructions for launching the portfolio locally in developer mode.</li>
        </ol>
      </div>
    </div>
  );
};

export default DashboardContent;
