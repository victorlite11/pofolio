import React, { useEffect, useMemo, useState } from 'react';

interface Command {
  id: string;
  title: string;
  key?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // lightweight fuzzy matcher: substring + acronym + score by position
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;

    const score = (s: string) => {
      const t = s.toLowerCase();
      const idx = t.indexOf(q);
      if (idx >= 0) return 100 - idx; // earlier match scores higher
      // acronym match: take initials
      const initials = s.split(/\s+/).map(x => x[0]).join('').toLowerCase();
      if (initials.includes(q)) return 50;
      // fallback small score for partial char match
      let match = 0;
      for (let i = 0; i < q.length; i++) {
        if (t.includes(q[i])) match++;
      }
      return match;
    };

    return [...commands].map(c => ({ c, s: Math.max(score(c.title), score(c.id || ''), score(c.key || '')) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(x => x.c);
  }, [commands, query]);

  const activate = (cmd: Command) => {
    // dispatch a global event so layouts/components can handle it
    try {
      window.dispatchEvent(new CustomEvent('devview-open-section', { detail: { key: cmd.id } }));
    } catch (e) {
      // ignore
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center pt-28">
      <div className="w-[640px] max-w-full bg-background border border-border rounded-md shadow-lg">
        <div className="p-3 border-b border-border">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or file name..."
            className="w-full p-2 bg-transparent outline-none"
          />
        </div>
        <div className="max-h-80 overflow-auto">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => activate(c)} className="w-full text-left px-4 py-3 hover:bg-muted/40 flex justify-between items-center">
              <div>
                <div className="font-medium">{c.title}</div>
                {c.key && <div className="text-xs text-muted-foreground">{c.key}</div>}
              </div>
              <div className="text-xs text-muted-foreground">{c.id}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
