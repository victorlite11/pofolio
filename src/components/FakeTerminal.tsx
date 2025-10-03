import React, { useState, useRef } from 'react';

export function FakeTerminal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [lines, setLines] = useState<string[]>(['Welcome to Victor\'s terminal. Type "help" for commands.']);
  const [input, setInput] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  if (!open) return null;

  try { window.dispatchEvent(new CustomEvent('terminal-open')); } catch (e) {}

  const run = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    setLines((l) => [...l, `> ${trimmed}`]);
    if (trimmed === 'help') {
      setLines((l) => [...l, 'Commands: help, echo <text>, clear']);
    } else if (trimmed.startsWith('echo ')) {
      setLines((l) => [...l, trimmed.slice(5)]);
    } else if (trimmed === 'clear') {
      setLines([]);
    } else {
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
