import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatBox from '@/components/ChatBox';
import profilePhoto from '@/assets/profile-photo.jpg';
import { generateOpenAIStream } from '@/lib/chatApi';

export function ChatToggleWidget() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onStart = () => setTyping(true);
    const onStop = () => setTyping(false);
    window.addEventListener('chat-typing-start', onStart as EventListener);
    window.addEventListener('chat-typing-stop', onStop as EventListener);
    return () => {
      window.removeEventListener('chat-typing-start', onStart as EventListener);
      window.removeEventListener('chat-typing-stop', onStop as EventListener);
    };
  }, []);

  // move up when terminal is open so buttons don't overlap
  const [terminalOpen, setTerminalOpen] = useState(false);
  useEffect(() => {
    const onOpen = () => setTerminalOpen(true);
    const onClose = () => setTerminalOpen(false);
    window.addEventListener('terminal-open', onOpen as EventListener);
    window.addEventListener('terminal-close', onClose as EventListener);
    return () => {
      window.removeEventListener('terminal-open', onOpen as EventListener);
      window.removeEventListener('terminal-close', onClose as EventListener);
    };
  }, []);

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed right-6 bottom-24 z-50 w-[360px] max-w-sm bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/5">
            <div className="text-sm font-medium">Victor's Assistant</div>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground px-2 py-1">Close</button>
          </div>
          <div className="p-3">
            <ChatBox
              systemPrompt={"You are a helpful assistant for Victor James portfolio visitor."}
              generateResponse={ (import.meta as any).env?.VITE_OPENAI_KEY ? generateOpenAIStream : undefined }
            />
          </div>
        </div>
      )}

      {/* Floating image toggle button with hover tooltip */}
  <div className={`fixed right-6 ${terminalOpen ? 'bottom-28' : 'bottom-6'} z-50`}>
        <div className="relative group w-14 h-14">
          {/* expanding ripple(s) behind the button */}
          {typing ? (
            // stronger double ripple when typing
            <>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-indigo-500/30 animate-ping" aria-hidden />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-indigo-500/20 animate-ping delay-75" aria-hidden />
            </>
          ) : unread ? (
            // subtle single ripple for unread
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-rose-500/20 animate-ping" aria-hidden />
          ) : (
            // faint static glow for idle
            <span className="absolute inset-0 rounded-full bg-indigo-400/12 filter blur-xl scale-110" aria-hidden />
          )}

          <button
            type="button"
            aria-pressed={open}
            aria-label={open ? 'Close chat' : 'Open chat'}
            onClick={() => { setOpen((s)=>!s); setUnread(false); }}
            className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg focus:outline-none"
          >
            <img src={profilePhoto} alt="Victor" className="w-full h-full object-cover" />
            {/* message icon badge */}
            <span className={`absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md ${typing ? 'bg-indigo-600 animate-pulse' : 'bg-vscode-accent'}`}>
              <MessageSquare className="w-3 h-3" />
            </span>
          </button>

          {/* tooltip appears when hovering the button */}
          <div className="absolute -right-40 bottom-1 hidden group-hover:block">
            <div className="text-sm bg-vscode-bg-light text-vscode-text px-3 py-1 rounded-md shadow">Chat with Victor</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatToggleWidget;
