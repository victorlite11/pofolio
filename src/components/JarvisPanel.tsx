import React, { useEffect, useRef, useState } from 'react';

// NOTE: adjust this path if your asset filename is different
const DEFAULT_VIDEO_SRC = '/assets/jarvis.mp4';

export default function JarvisPanel({ videoSrc = DEFAULT_VIDEO_SRC }: { videoSrc?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [listening, setListening] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Utility: play a short tech intro tone via WebAudio
  const playIntroTone = async () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 440; // A4
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      // ramp up and down quickly
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      setTimeout(() => { try { o.stop(); ctx.close(); } catch (e) {} }, 500);
    } catch (e) {
      // ignore audio errors
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    // choose a slightly robotic voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      // prefer English voices with 'Google' or 'Microsoft' where possible
      const pref = voices.find(v => /google|microsoft|chrome/i.test(v.name)) || voices.find(v => /en/ig.test(v.lang)) || voices[0];
      if (pref) utter.voice = pref;
    }
    utter.rate = 1;
    utter.pitch = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    // autoplay muted when mounted so browsers allow autoplay
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
    // small greeting
    (async () => {
      await playIntroTone();
      speak('Jarvis online. I am ready. Say a command or press the microphone.');
    })();
  }, []);

  // Voice recognition setup (webkit prefixed fallback)
  const setupRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.lang = 'en-US';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (evt: any) => {
      const text = evt.results[0][0].transcript.trim();
      console.log('Jarvis heard:', text);
      handleCommand(text.toLowerCase());
    };
    r.onend = () => {
      setListening(false);
    };
    r.onerror = (e: any) => {
      console.warn('Speech recognition error', e);
      setListening(false);
    };
    return r;
  };

  const handleCommand = (text: string) => {
    // simple set of commands
    if (text.includes('open') && text.includes('projects')) {
      window.dispatchEvent(new CustomEvent('devview-open-section', { detail: { key: 'projects' } }));
      speak('Opening projects.');
      return;
    }
    if (text.includes('open') && text.includes('about')) {
      window.dispatchEvent(new CustomEvent('devview-open-section', { detail: { key: 'about' } }));
      speak('Opening about section.');
      return;
    }
    if (text.includes('play') || text.includes('start')) {
      try { videoRef.current?.play(); speak('Playing.'); } catch (e) {}
      return;
    }
    if (text.includes('stop') || text.includes('pause')) {
      try { videoRef.current?.pause(); speak('Paused.'); } catch (e) {}
      return;
    }
    if (text.includes('time')) {
      const t = new Date().toLocaleTimeString();
      speak(`The time is ${t}`);
      return;
    }
    // fallback
    speak(`I heard: ${text}`);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) recognitionRef.current = setupRecognition();
    const r = recognitionRef.current;
    if (!r) {
      speak('Voice commands are not supported in this browser.');
      return;
    }
    if (!listening) {
      try {
        r.start();
        setListening(true);
        speak('Listening.');
      } catch (e) {
        console.warn(e);
      }
    } else {
      try { r.stop(); } catch (e) {}
      setListening(false);
      speak('Stopped listening.');
    }
  };

  return (
    <div className="mt-4 p-2 border-t border-vscode-border">
      <div className="text-xs text-vscode-text-dim mb-1">Jarvis</div>
      <div className="bg-vscode-bg rounded overflow-hidden">
        <video ref={videoRef} src={videoSrc} className="w-full h-36 object-cover bg-black" playsInline loop muted />
        <div className="p-2 flex items-center justify-between space-x-2">
          <div className="flex-1">
            <button
              className="text-xs px-2 py-1 rounded bg-vscode-accent text-vscode-bg"
              onClick={() => {
                const v = videoRef.current;
                if (v) {
                  if (v.paused) { v.muted = false; v.play().catch(()=>{}); speak('Playing now.'); }
                  else { v.pause(); speak('Paused.'); }
                }
              }}
            >
              Play/Pause
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={toggleListen} title="Voice Command" className={`text-xs px-2 py-1 rounded ${listening ? 'bg-vscode-error text-white' : 'bg-vscode-bg-lighter'}`}>
              {listening ? 'Listening...' : 'Voice'}
            </button>
            <button onClick={() => { speak('Jarvis reset.'); try { videoRef.current?.pause(); videoRef.current!.currentTime = 0; } catch(e){} }} title="Reset" className="text-xs px-2 py-1 rounded bg-vscode-bg-lighter">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
