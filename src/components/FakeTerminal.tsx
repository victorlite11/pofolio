import React, { useState, useRef } from 'react';

export function FakeTerminal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [lines, setLines] = useState<string[]>(['Welcome to Victor\'s terminal. Type "help" for commands.']);
  const [input, setInput] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  if (!open) return null;

  try { window.dispatchEvent(new CustomEvent('terminal-open')); } catch (e) {}

  const availableCommands = {
    help: 'Show this help text',
    clear: 'Clear the terminal output',
    close: 'Close the terminal',
    'download-cv': 'Download CV (saves cv.pdf)',
    'open-projects': 'Open Projects section',
    contact: 'Scroll to contact section',
    theme: 'Toggle theme: theme <light|dark>',
    echo: 'Echo text back',
    ping: 'Ping the server',
    'list-projects': 'List project titles',
    time: 'Show current time',
    github: 'Open GitHub profile',
  } as Record<string, string>;

  const run = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    setLines((l) => [...l, `> ${trimmed}`]);
    const [base, ...rest] = trimmed.split(' ');
    const restStr = rest.join(' ');

    switch (base) {
      case 'help':
        setLines((l) => [...l, 'Available commands:']);
        Object.entries(availableCommands).forEach(([k, v]) => setLines((l) => [...l, `${k.padEnd(15)} - ${v}`]));
        break;
      case 'clear':
        setLines([]);
        break;
      case 'close':
        onClose();
        break;
      case 'echo':
        setLines((l) => [...l, restStr]);
        break;
      case 'download-cv':
        try {
          const a = document.createElement('a');
          a.href = '/cv.pdf';
          a.download = 'cv.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setLines((l) => [...l, 'CV download started...']);
        } catch (e) { setLines((l) => [...l, 'Failed to start download']); }
        break;
      case 'open-projects':
        try { document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); setLines((l) => [...l, 'Opening Projects...']); } catch (e) { setLines((l) => [...l, 'Failed to open projects']); }
        break;
      case 'contact':
        try { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setLines((l) => [...l, 'Opening Contact...']); } catch (e) { setLines((l) => [...l, 'Failed to open contact']); }
        break;
      case 'theme':
        if (rest[0] === 'dark' || rest[0] === 'light') {
          try { localStorage.setItem('theme', rest[0]); document.body.className = rest[0] === 'dark' ? 'dark' : 'client-view'; setLines((l) => [...l, `Theme set to ${rest[0]}`]); } catch (e) { setLines((l) => [...l, 'Failed to set theme']); }
        } else {
          setLines((l) => [...l, 'Usage: theme <light|dark>']);
        }
        break;
      case 'ping':
        setLines((l) => [...l, 'PONG']);
        break;
      case 'list-projects':
        try {
          const titles = ['Agent Pilgrims', 'CBT System', 'Lesson Planner'];
          setLines((l) => [...l, ...titles.map((t) => `- ${t}`)]);
        } catch (e) { setLines((l) => [...l, 'No projects found']); }
        break;
      case 'time':
        setLines((l) => [...l, new Date().toString()]);
        break;
      case 'github':
        try { window.open('https://github.com/creativemindtech', '_blank'); setLines((l) => [...l, 'Opening GitHub...']); } catch (e) { setLines((l) => [...l, 'Failed to open GitHub']); }
        break;
      default:
        setLines((l) => [...l, `Unknown command: ${trimmed}`]);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    }
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-40 bg-black text-white p-3 border-t border-vscode-border">
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono">Terminal</div>
        <div>
          <button className="mr-2" onClick={() => setLines([])}>Clear</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      <div ref={ref} className="h-40 overflow-auto bg-black/80 p-2 font-mono text-sm">
        {lines.map((ln, i) => <div key={i}>{ln}</div>)}
      </div>
      <div className="mt-2 flex">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} className="flex-1 p-2 bg-black/90 border border-white/10" />
        <button onClick={() => { run(input); setInput(''); }} className="ml-2">Run</button>
      </div>
    </div>
  );
}

export default FakeTerminal;
