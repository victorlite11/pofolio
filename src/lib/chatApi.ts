/**
 * chatApi.ts
 *
 * Placeholder / adapter file for wiring a real chat API (OpenAI, Anthropic, etc.).
 * This file exports a single async function `generateOpenAIResponse(messages)` which
 * returns a Promise<string> (the assistant's reply). It uses `import.meta.env.VITE_OPENAI_KEY`
 * so you can store the API key in a Vite .env file (e.g. `VITE_OPENAI_KEY=sk-...`).
 *
 * Notes:
 * - The example below shows a simple non-streaming request to OpenAI's Chat Completions
 *   endpoint. If you want streaming, you can adapt it to use the streaming API and
 *   pass partial chunks into the UI.
 * - Do NOT commit your real API key to source control. Use an .env file and add it to .gitignore.
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

/**
 * Async generator that yields partial content chunks from OpenAI's streaming chat API.
 * The function accepts an optional AbortSignal so callers can cancel the request.
 */
export async function* generateOpenAIStream(messages: Message[], signal?: AbortSignal): AsyncGenerator<string> {
  const key = (import.meta as any).env?.VITE_OPENAI_KEY as string | undefined;
  if (!key) {
    throw new Error('Missing VITE_OPENAI_KEY environment variable. Add it to your .env file.');
  }

  const payload = {
    model: 'gpt-4o-mini',
    messages: messages.map((m) => ({ role: m.role, content: m.text })),
    temperature: 0.7,
    max_tokens: 1024,
    stream: true,
  } as any;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${body}`);
  }

  if (!res.body) {
    throw new Error('No response body from OpenAI streaming endpoint.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    // OpenAI stream sends event lines starting with "data: "
    const parts = buf.split(/\n\n/);
    // keep the last partial chunk in buffer
    buf = parts.pop() || '';

    for (const part of parts) {
      const line = part.trim();
      if (!line) continue;
      if (!line.startsWith('data:')) continue;
      const data = line.replace(/^data:\s*/, '').trim();
      if (data === '[DONE]') {
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const choice = parsed.choices && parsed.choices[0];
        // OpenAI streaming delta may carry content in choice.delta.content
        const delta = choice?.delta;
        const content = delta?.content ?? choice?.message?.content ?? '';
        if (content) yield content;
      } catch (err) {
        // ignore parse errors for partials
      }
    }
  }
}

/**
 * Convenience wrapper: collects the streaming response into a single string.
 */
export async function generateOpenAIResponse(messages: Message[], signal?: AbortSignal): Promise<string> {
  let out = '';
  try {
    for await (const chunk of generateOpenAIStream(messages, signal)) {
      out += chunk;
    }
  } catch (e) {
    // rethrow so callers can handle errors
    throw e;
  }
  return out;
}

// Example usage (in your component):
// import { generateOpenAIResponse, generateOpenAIStream } from '@/lib/chatApi';
// <ChatBox generateResponse={generateOpenAIStream} />
