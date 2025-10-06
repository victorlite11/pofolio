import React, { useEffect, useRef, useState } from 'react';
import JarvisCommands from './JarvisCommands';

// NOTE: this should match the built asset in dist/assets/jarvis.mp4
const DEFAULT_VIDEO_SRC = '/assets/jarvis.mp4';

export default function JarvisPanel({ videoSrc = DEFAULT_VIDEO_SRC }: { videoSrc?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [listening, setListening] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);
  const [autoBlocked, setAutoBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioAutoBlocked, setAudioAutoBlocked] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [canPlayHint, setCanPlayHint] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const [probeStatus, setProbeStatus] = useState<string | null>(null);
  const [videoSrcState, setVideoSrcState] = useState<string>(videoSrc);
  const [triedBlob, setTriedBlob] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const transcriptTimerRef = useRef<number | null>(null);
  // Prefer local video by default; do not load or show YouTube branding — use local file or show error

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
    // mark speaking state so UI can pulse
    try { setSpeaking(true); } catch (e) {}
    // choose a slightly robotic voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      // prefer English voices with 'Google' or 'Microsoft' where possible
      const pref = voices.find(v => /google|microsoft|chrome/i.test(v.name)) || voices.find(v => /en/ig.test(v.lang)) || voices[0];
      if (pref) utter.voice = pref;
    }
    utter.rate = 1;
    utter.pitch = 0.9;
    utter.onend = () => { try { setSpeaking(false); } catch (e) {} };
    utter.onerror = () => { try { setSpeaking(false); } catch (e) {} };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // Listen for app-level dev view events so Jarvis can narrate UI actions
  useEffect(() => {
    const handler = (evt: any) => {
      const key = evt?.detail?.key || '';
      let phrase = '';
      if (key === 'projects') phrase = 'Opening projects.';
      else if (key === 'about') phrase = 'Opening about section.';
      else if (key === 'hero') phrase = 'Opening hero.';
      else if (key) phrase = `Opening ${key}.`;
      if (phrase) speak(phrase);
    };
    window.addEventListener('devview-open-section', handler as EventListener);
    return () => window.removeEventListener('devview-open-section', handler as EventListener);
  }, []);

  useEffect(() => {
    // autoplay muted visual only when mounted so browsers allow autoplay
    const v = videoRef.current;
    if (v) {
      // keep the video muted by default so we use speechSynthesis for audio
      v.muted = true;
      setAudioMuted(true);
      v.play().catch(() => {});
    }
    // probe canPlayType for common MP4 H.264/AAC
    try {
      const probe = document.createElement('video');
      const hint = probe.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
      setCanPlayHint(hint || null);
      console.log('canPlayType hint for H.264/AAC:', hint);
    } catch (e) {
      setCanPlayHint(null);
    }

    // Probe whether the configured videoSrc is actually reachable (helps in dev where assets may live at root)
    (async () => {
      try {
        setProbeStatus('probing');
        // Prefer public root path first (where you placed jarvis.mp4)
        const primary = '/jarvis.mp4';
        const checkPrimary = await fetch(primary, { method: 'HEAD' });
        if (checkPrimary.ok) {
          setProbeStatus('ok-root');
          setVideoSrcState(primary);
          return;
        }
      } catch (e) {
        // ignore
      }
      try {
        const res = await fetch(videoSrc, { method: 'HEAD' });
        if (res.ok) {
          setProbeStatus('ok');
          setVideoSrcState(videoSrc);
          return;
        }
      } catch (e) {
        // ignore
      }
      // Try common dev location (dist assets)
      try {
        const alt = '/assets/jarvis.mp4';
        const r2 = await fetch(alt, { method: 'HEAD' });
        if (r2.ok) {
          setProbeStatus('fallback-dist');
          setVideoSrcState(alt);
          return;
        }
      } catch (e) {}
      setProbeStatus('missing');
      // If local file missing, mark failed — we intentionally avoid YouTube branding
      setFailed(true);
    })();
    // greeting sequence: try to play intro song half, then tone, then speech
    const playIntroSongOnce = async () => {
      try {
        let a = audioRef.current;
        if (!a) {
          a = new Audio('/song.mpeg');
          a.preload = 'auto';
          a.crossOrigin = 'anonymous';
          audioRef.current = a;
        }
        // wait for metadata so we know duration
        await new Promise<void>((res) => {
          if (a!.readyState > 0 && isFinite(a!.duration) && a!.duration > 0) return res();
          const onMeta = () => { cleanup(); res(); };
          const onErr = () => { cleanup(); res(); };
          const cleanup = () => { try { a!.onloadedmetadata = null; a!.onerror = null; } catch (e) {} };
          a!.onloadedmetadata = onMeta;
          a!.onerror = onErr;
          // start loading
          a!.load();
        });
        const dur = (audioRef.current && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) ? audioRef.current.duration : 6;
        const half = dur / 2;
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.65;
        const playPromise = audioRef.current.play();
        if (playPromise && typeof playPromise.then === 'function') {
          await playPromise.catch((e) => {
            // autoplay blocked
            setAudioAutoBlocked(true);
            throw e;
          });
        }
        setAudioPlaying(true);
        // stop after half duration
        await new Promise((res) => setTimeout(res, Math.max(800, half * 1000)));
        try { audioRef.current.pause(); } catch (e) {}
        setAudioPlaying(false);
      } catch (e) {
        // autoplay blocked or other error
        setAudioAutoBlocked(true);
      }
    };

    (async () => {
      await playIntroSongOnce();
      await playIntroTone();
      speak('Jarvis online. I am ready. Say a command or press the microphone.');
    })();
  }, []);

  // No YouTube integration: keep this component local-video-only to avoid YouTube branding.

  // Voice recognition setup (webkit prefixed fallback)
  const setupRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.lang = 'en-US';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onstart = () => {
      console.log('SpeechRecognition started');
    };
    r.onresult = (evt: any) => {
      try {
        const transcriptRaw = evt?.results?.[0]?.[0]?.transcript;
        const text = (transcriptRaw || '').trim();
        console.log('Jarvis heard:', text);
        if (text) {
          // show on-screen transcript for debugging / UX
          try { setTranscript(text); } catch (e) {}
          // clear previous timer
          try { if (transcriptTimerRef.current) { clearTimeout(transcriptTimerRef.current); transcriptTimerRef.current = null; } } catch (e) {}
          // auto-clear transcript after 6s
          try { transcriptTimerRef.current = window.setTimeout(() => setTranscript(null), 6000); } catch (e) {}
          handleCommand(text.toLowerCase());
        }
      } catch (err) {
        console.warn('Error reading recognition result', err);
      }
    };
    r.onnomatch = (evt: any) => {
      console.log('No speech match', evt);
      try { setTranscript('No match'); } catch (e) {}
      try { if (transcriptTimerRef.current) { clearTimeout(transcriptTimerRef.current); transcriptTimerRef.current = null; } } catch (e) {}
      try { transcriptTimerRef.current = window.setTimeout(() => setTranscript(null), 4000); } catch (e) {}
      speak('I did not understand that. Please try again.');
    };
    r.onend = () => {
      console.log('SpeechRecognition ended');
      setListening(false);
    };
    r.onerror = (e: any) => {
      console.warn('Speech recognition error', e);
      setListening(false);
      // Surface a short TTS message so user knows something went wrong
      try { speak('Voice recognition encountered an error.'); } catch (e) {}
    };
    return r;
  };

  const handleCommand = (text: string) => {
    // normalize and log for debugging
    text = (text || '').toLowerCase();
    console.log('handleCommand received:', text);
    // strip leading wake words like "jarvis" or "hey jarvis"
    text = text.replace(/^\s*(hey\s+)?jarvis\s+/i, '').trim();
    // structured commands
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
    if (text.includes('open') && text.includes('hero')) {
      window.dispatchEvent(new CustomEvent('devview-open-section', { detail: { key: 'hero' } }));
      speak('Opening hero.');
      return;
    }
    if (text.includes('play') || text.includes('start')) {
      try {
        videoRef.current?.play();
        speak('Playing.');
      } catch (e) {}
      return;
    }
    if (text.includes('stop') || text.includes('pause')) {
      try {
        videoRef.current?.pause();
        speak('Paused.');
      } catch (e) {}
      return;
    }
    if (text.includes('original audio') || text.includes('unmute')) {
      // unmute local video if allowed
      try {
        if (videoRef.current) {
          videoRef.current.muted = false;
          setAudioMuted(false);
        }
        speak('Original audio enabled.');
      }
      catch (e) {}
      return;
    }
    if (text.includes('mute') || text.includes('silence')) {
      try {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setAudioMuted(true);
        }
        speak('Original audio muted.');
      }
      catch (e) {}
      return;
    }
    if (text.includes('time')) {
      const t = new Date().toLocaleTimeString();
      speak(`The time is ${t}`);
      return;
    }

    // Generic execute: emit a jarvis-exec event with full text for app-level handlers
    window.dispatchEvent(new CustomEvent('jarvis-exec', { detail: { command: text } }));
    speak(`Executing command: ${text}`);
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
        // Delay the TTS feedback slightly so the recognition session can start
        // (speaking immediately can sometimes interfere with the microphone capture)
        setTimeout(() => { try { speak('Listening'); } catch (e) {} }, 250);
      } catch (e) {
        console.warn(e);
      }
    } else {
      try { r.stop(); } catch (e) {}
      setListening(false);
      // Give a short TTS acknowledgement after stopping
      setTimeout(() => { try { speak('Stopped listening.'); } catch (e) {} }, 100);
    }
  };

  return (
    <>
      <div className="mt-4 p-2 border-t border-vscode-border">
      <div className="text-xs text-vscode-text-dim mb-2">Jarvis</div>
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className={`rounded-full overflow-hidden w-56 h-56 bg-black ring-4 ring-vscode-accent/40 shadow-md relative ${speaking ? 'animate-pulse-slow ring-vscode-accent/70' : ''}`}>
            {failed ? (
              <div className="w-full h-full flex items-center justify-center bg-black text-white text-xs">
                <div className="text-center">
                  <div className="mb-2">Video not supported in this browser</div>
                  <div className="mb-2 text-[10px] text-vscode-text-dim">Browser MP4 H.264/AAC support hint: {canPlayHint ?? 'unknown'}</div>
                  <div className="mb-2 text-[10px] text-vscode-text-dim">Video probe: {probeStatus ?? 'unknown'}</div>
                  <button onClick={() => window.open(videoSrcState, '_blank')} className="text-xs px-2 py-1 rounded bg-vscode-bg-lighter">Open video</button>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={videoSrcState}
                // fill the orb, scale slightly and boost clarity via filters
                className={`w-full h-full object-cover transform-gpu transition-transform duration-300 ${ready ? 'scale-110' : 'scale-100'} filter contrast-110 brightness-105`}
                playsInline
                loop
                muted
                controls
                autoPlay
                poster="/placeholder.svg"
                onCanPlay={() => setReady(true)}
                onError={async () => {
                  setReady(false);
                  // If we haven't tried loading the file via fetch -> blob, attempt that once.
                  if (!triedBlob) {
                    setTriedBlob(true);
                    try {
                      const controller = new AbortController();
                      const id = setTimeout(() => controller.abort(), 20000);
                      const res = await fetch(videoSrcState, { method: 'GET', signal: controller.signal });
                      clearTimeout(id);
                      if (res.ok) {
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        setVideoSrcState(url);
                        // give the video element a moment to update src
                        setTimeout(() => {
                          try { videoRef.current?.load(); videoRef.current?.play().catch(() => {}); } catch (e) {}
                        }, 100);
                        return;
                      }
                    } catch (e) {
                      // fetch failed or aborted; continue to mark failed below
                    }
                  }
                  setFailed(true);
                }}
                onPlay={() => { setAutoBlocked(false); setReady(true); }}
                onPause={() => { /* keep paused state; overlay can show if desired */ }}
              />
            )}
            {/* removed YouTube overlay buttons; local video preferred by default */}
            {/* Loading overlay removed per request */}
            {/* Play overlay when autoplay was blocked or video paused */}
            {autoBlocked && (
              <button
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  // user gesture: try to unmute and play
                  try {
                    v.muted = false;
                    v.play();
                    setAutoBlocked(false);
                    setReady(true);
                    speak('Playing.');
                  } catch (e) {
                    try { v.play(); } catch (e) {}
                  }
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-2xl"
                aria-label="Play Jarvis"
              >
                ▶
              </button>
            )}
            {/* Intro audio play button when autoplay was blocked */}
            {audioAutoBlocked && !audioPlaying && (
              <button
                onClick={async () => {
                  try {
                    setAudioAutoBlocked(false);
                    const a = audioRef.current || (audioRef.current = new Audio('/song.mpeg'));
                    a.currentTime = 0;
                    a.volume = 0.65;
                    await a.play();
                    setAudioPlaying(true);
                    // stop after half duration
                    const dur = (a.duration && isFinite(a.duration) && a.duration > 0) ? a.duration : 6;
                    setTimeout(() => { try { a.pause(); setAudioPlaying(false); } catch (e) {} }, Math.max(800, (dur/2)*1000));
                  } catch (e) {
                    setAudioAutoBlocked(true);
                  }
                }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-vscode-accent text-white flex items-center justify-center shadow-md"
                title="Play intro"
              >
                ▶
              </button>
            )}
          </div>
            {/* small listening / speaking indicator — iconized */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <button
              onClick={toggleListen}
              title="Voice Command"
              aria-pressed={listening}
              className={`w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-colors ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-vscode-bg-lighter text-vscode-text'}`}
            >
              {/* Microphone icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" />
                <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 1 0 2 0v-3.08A7 7 0 0 0 19 11z" />
              </svg>
            </button>

            {/* Help / Commands button */}
            <button title="Commands" onClick={() => setCommandsOpen(true)} className="absolute -top-2 left-2 w-8 h-8 rounded-full bg-vscode-bg-lighter text-vscode-text flex items-center justify-center shadow-sm">
              ?
            </button>

            <button
              onClick={() => { speak('Jarvis reset.'); try { videoRef.current?.pause(); if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.muted = true; } setAudioMuted(true); } catch(e){} }}
              title="Reset"
              className="w-9 h-9 flex items-center justify-center rounded-full shadow-md bg-vscode-bg-lighter text-vscode-text"
            >
              {/* Reset / refresh icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M21 12a9 9 0 1 0-3.02 6.03l.01-.01 1.71-1.71A7 7 0 1 1 19 12h2z" />
                <path d="M12 6v6l5 3" opacity="0.6" />
              </svg>
            </button>

            <button
              onClick={() => {
                const v = videoRef.current;
                if (v) {
                  v.muted = !v.muted;
                  setAudioMuted(!!v.muted);
                  // user gesture: attempt to play so audio will start when unmuted
                  if (!v.muted) {
                    v.play().catch(() => {});
                  }
                  speak(v.muted ? 'Original audio muted' : 'Original audio enabled');
                }
              }}
              title="Toggle Original Audio"
              className="w-9 h-9 flex items-center justify-center rounded-full shadow-md bg-vscode-bg-lighter text-vscode-text"
            >
              {/* Speaker icon (muted vs unmuted) */}
              {audioMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M16.5 12a4.5 4.5 0 0 0-4.5-4.5v9A4.5 4.5 0 0 0 16.5 12z" />
                  <path d="M19 12c0-1.77-.77-3.35-1.98-4.45L19 6l1 1-1 1c.46.62.72 1.37.72 2.18s-.26 1.57-.72 2.18L20 18l-1 1-1.98-1.55C18.23 15.35 19 13.77 19 12z" opacity="0.35" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M5 9v6h4l5 5V4L9 9H5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
      <JarvisCommands open={commandsOpen} onClose={() => setCommandsOpen(false)} onExecute={(t) => handleCommand(t)} />

      {/* On-screen transcript overlay for debugging and accessibility */}
      {transcript && (
        <div className="fixed left-4 bottom-6 z-50 pointer-events-none">
          <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-md shadow-lg max-w-xs break-words">
            <strong className="block text-[11px] text-vscode-text-dim">Heard:</strong>
            <div className="mt-1">{transcript}</div>
          </div>
        </div>
      )}
    </>
  );
}
