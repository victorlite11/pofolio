import React from 'react';

export const DeveloperContent: React.FC = () => {
  const repoPath = 'C:\\Users\\Creative Mind Tech\\Downloads\\vscode-show-reel-main';
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Developer Mode</h2>
      <p className="text-sm text-muted-foreground">Instructions to run this portfolio in developer mode from:</p>
      <pre className="p-3 bg-card rounded text-sm">{repoPath}</pre>

      <div className="mt-4">
        <h4 className="font-semibold">Commands</h4>
        <pre className="p-3 bg-muted/20 rounded text-sm">
{`cd "C:\\Users\\Creative Mind Tech\\Downloads\\vscode-show-reel-main"
npm install
npm run dev
# then open http://localhost:5173`}
        </pre>

        <p className="mt-2 text-sm text-muted-foreground">This mode is intended for developers — it exposes code, local paths, and quick-run instructions.</p>
      </div>
    </div>
  );
};

export default DeveloperContent;
