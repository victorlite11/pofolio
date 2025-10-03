import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

/*
  ChatBox notes:
  - This component accepts an optional `generateResponse` prop: (messages) => Promise<string>
    If you want to connect a real API, pass a function that accepts the message list and returns
    the assistant's reply as a string. Example adapter file: `src/lib/chatApi.ts` (generateOpenAIResponse).

  - While you don't have an API key, the component will use the built-in `localGenerate` fallback.
    To wire up OpenAI (or another provider) later:

    import { generateOpenAIResponse } from '@/lib/chatApi';
    <ChatBox generateResponse={generateOpenAIResponse} />

  - The included `src/lib/chatApi.ts` (in this project) demonstrates a non-streaming OpenAI request.
*/

type Role = 'user' | 'assistant' | 'system';

interface Message {
  id: string;
  role: Role;
  text: string;
  time?: string;
}

interface ChatBoxProps {
  placeholder?: string;
  systemPrompt?: string;
  /**
   * generateResponse can be either:
   * - a function that returns Promise<string> (non-streaming)
   * - OR an async generator function that yields string chunks: AsyncGenerator<string>
   * If not provided, `localGenerate` will be used as a non-streaming fallback.
   */
  generateResponse?: ((messages: Message[]) => Promise<string>) | ((messages: Message[], signal?: AbortSignal) => AsyncGenerator<string> | Promise<string>);
}

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Simple local generator: rule-based + friendly fallback
async function localGenerate(messages: Message[]) {
  const last = messages[messages.length - 1];
  const text = (last && last.role === 'user') ? last.text.toLowerCase() : '';

  // tiny rule-set
  if (text.includes('hello') || text.includes('hi')) {
    return "Hello! I'm Victor's assistant — how can I help you today?";
  }
  if (text.includes('cv') || text.includes('resume') || text.includes('download')) {
    return "You can download the CV from the Download CV button in the Dev View, or I can open the download for you if you'd like.";
  }
  if (text.includes('projects') || text.includes('demo')) {
    return "I have several projects showcased — Agent Pilgrims, CBT System, and Lesson Planner. Which one would you like to know more about?";
  }

  const canned = [
    "That's interesting — tell me more.",
    "I can help with that. Do you want code samples, explanations, or links?",
    "I don't have access to external APIs here, but I can simulate helpful answers or you can connect an API key in the settings.",
    "Cool — I'm happy to help. What would you like to do next?",
  ];
  // pick a pseudo-random but stable response
  const idx = Math.abs(text.split('').reduce((a,c)=>a + c.charCodeAt(0),0)) % canned.length;
  return canned[idx];
}

export function ChatBox({ placeholder = 'Ask me anything...', systemPrompt, generateResponse }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const base: Message[] = [];
    if (systemPrompt) base.push({ id: 'sys', role: 'system', text: systemPrompt, time: nowTime() });
    return base;
  });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const typingRef = useRef<{ timerIds: number[]; abort?: AbortController }>({ timerIds: [] });
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom on new messages
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // broadcast typing events so UI outside this component (floating toggle) can react
  useEffect(() => {
    try {
      if (typing) {
        window.dispatchEvent(new CustomEvent('chat-typing-start'));
      } else {
        window.dispatchEvent(new CustomEvent('chat-typing-stop'));
      }
    } catch (e) {
      // ignore in environments that restrict CustomEvent
    }
  }, [typing]);

  const stopTyping = () => {
    setTyping(false);
    typingRef.current.timerIds.forEach((id) => clearTimeout(id));
    typingRef.current.timerIds = [];
    // abort any in-flight streaming requests
    if (typingRef.current.abort) {
      typingRef.current.abort.abort();
      typingRef.current.abort = undefined;
    }
  };

  const appendMessage = (m: Message) => setMessages((s) => [...s, m]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: String(Date.now()), role: 'user', text: input.trim(), time: nowTime() };
    appendMessage(userMsg);
    setInput('');
    // start assistant typing
    setTyping(true);

    try {
      const generator = generateResponse;

      const assistantId = `a-${Date.now()}`;
      appendMessage({ id: assistantId, role: 'assistant', text: '', time: nowTime() });

      // If no generator provided, use local non-streaming generator and simulate streaming
      if (!generator) {
        const responseText = await localGenerate([...messages, userMsg]);
        // chunk and animate like before
        const chunks: string[] = [];
        const chunkSize = 12;
        for (let i = 0; i < responseText.length; i += chunkSize) chunks.push(responseText.slice(i, i + chunkSize));

        let current = '';
        typingRef.current.timerIds = [];
        let delay = 0;
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          delay += 90 + Math.random() * 120;
          const t = window.setTimeout(() => {
            current += chunk;
            setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, text: current } : m));
          }, delay);
          typingRef.current.timerIds.push(t);
        }
        const finishT = window.setTimeout(() => {
          setTyping(false);
          typingRef.current.timerIds = [];
        }, delay + 120);
        typingRef.current.timerIds.push(finishT);
      } else {
        // Generator provided. It may be either a streaming async-generator or a promise-returning function.
        // We'll attempt to call it as an async generator first. Provide an AbortController so caller can cancel.
        const ac = new AbortController();
        // store abort so Stop can cancel
        (typingRef.current as any).abort = ac;

        const res = generator([...messages, userMsg], ac.signal as AbortSignal | undefined);

        // If res is an async generator, consume it incrementally
        if (isAsyncIterable(res)) {
          let current = '';
          for await (const chunk of res as AsyncGenerator<string>) {
            current += chunk;
            setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, text: current } : m));
          }
          setTyping(false);
          (typingRef.current as any).abort = undefined;
        } else {
          // Non-streaming promise -> await full response and then animate chunks
          const full = await (res as Promise<string>);
          const chunks: string[] = [];
          const chunkSize = 12;
          for (let i = 0; i < full.length; i += chunkSize) chunks.push(full.slice(i, i + chunkSize));

          let current = '';
          typingRef.current.timerIds = [];
          let delay = 0;
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            delay += 90 + Math.random() * 120;
            const t = window.setTimeout(() => {
              current += chunk;
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, text: current } : m));
            }, delay);
            typingRef.current.timerIds.push(t);
          }
          const finishT = window.setTimeout(() => {
            setTyping(false);
            typingRef.current.timerIds = [];
          }, delay + 120);
          typingRef.current.timerIds.push(finishT);
          (typingRef.current as any).abort = undefined;
        }
      }

    } catch (e) {
      appendMessage({ id: `err-${Date.now()}`, role: 'assistant', text: String((e as Error)?.message ?? 'Sorry, something went wrong.'), time: nowTime() });
      setTyping(false);
    }
  };

  // utility type guard
  const isAsyncIterable = (x: any): x is AsyncIterable<string> => {
    return x && typeof x[Symbol.asyncIterator] === 'function';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-muted/60 rounded-md shadow-md w-full max-w-3xl mx-auto p-4">
      <div ref={listRef} className="h-64 overflow-y-auto p-2 space-y-2 bg-background rounded-md">
        {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.role === 'user' ? 'bg-primary/80 text-white' : 'bg-surface text-foreground'} max-w-[80%] p-2 rounded-md`}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-surface p-2 rounded-md">Typing<span className="animate-pulse">...</span></div>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 p-2 rounded-md bg-background resize-none border border-border"
          rows={2}
        />
        <div className="flex flex-col gap-2">
          <Button onClick={handleSend} size="sm">Send</Button>
          <Button onClick={() => { stopTyping(); }} size="sm" variant="outline">Stop</Button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
