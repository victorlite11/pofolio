import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onExecute: (text: string) => void;
};

const commands: Array<{ cmd: string; hint: string }> = [
  { cmd: 'Open projects', hint: 'Opens the Projects section' },
  { cmd: 'Open about', hint: 'Opens the About section' },
  { cmd: 'Open hero', hint: 'Goes to the top / hero area' },
  { cmd: 'Take me back to client view', hint: 'Switches to client/public view' },
  { cmd: 'Open chatbot', hint: 'Opens the chatbot panel' },
  { cmd: 'Open contact form', hint: 'Opens the contact form' },
  { cmd: 'Play', hint: 'Plays Jarvic video or audio' },
  { cmd: 'Pause', hint: 'Pauses playback' },
  { cmd: 'Unmute', hint: 'Enables original audio' },
  { cmd: 'Mute', hint: 'Mutes audio' },
  { cmd: 'What time is it', hint: 'Jarvic will speak the current time' },
  { cmd: 'Reset', hint: 'Resets Jarvic playback to start' },
  { cmd: 'Help', hint: 'Show this list' },
];

export default function JarvisCommands({ open, onClose, onExecute }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-96 max-w-full bg-white dark:bg-[#0e1012] rounded-md shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Jarvic — Voice Commands</h3>
          <button onClick={onClose} className="text-xs px-2 py-1 rounded bg-vscode-bg-lighter">Close</button>
        </div>

        <p className="text-xs text-vscode-text-dim mb-3">Speak any of the commands below or click to run them.</p>

        <div className="grid grid-cols-1 gap-2">
          {commands.map((c) => (
            <button key={c.cmd} onClick={() => { onExecute(c.cmd); onClose(); }} className="text-left p-2 rounded hover:bg-vscode-bg-lighter">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{c.cmd}</div>
                  <div className="text-[11px] text-vscode-text-dim">{c.hint}</div>
                </div>
                <div className="text-xs text-vscode-text-dim">Say</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
