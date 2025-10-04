import React, { useEffect, useRef, useState } from "react";
import { Code2, Rocket, Users, Award, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import profilePhoto from "@/assets/profile-photo.jpg";
import { TypewriterEffect } from "./TypewriterEffect";

interface AboutProps {
  currentView: "client" | "dev";
}

export function About({ currentView }: AboutProps) {
  // numeric targets with optional suffix (e.g. '+') so we can animate smoothly
  const stats = [
    { icon: Code2, label: "Projects Completed", value: 50, suffix: "+" },
    { icon: Users, label: "Satisfied Clients", value: 25, suffix: "+" },
    { icon: Award, label: "Years Experience", value: 5, suffix: "+" },
    { icon: Rocket, label: "Technologies", value: 20, suffix: "+" },
  ];

  const [cvReady, setCvReady] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const visible = useVisibility(sectionRef);

  useEffect(() => {
    if (!cvReady) return;
    const el = document.querySelector('a[href="/cv.pdf"]');
    if (!el) return;
    try {
      (el as HTMLElement).animate(
        [
          { transform: "translateY(0px)" },
          { transform: "translateY(-6px)" },
          { transform: "translateY(0px)" },
        ],
        { duration: 700, iterations: 2 }
      );
    } catch {
      /* ignore */
    }
  }, [cvReady]);

  const cvLines = [
    { lineNumber: 1, content: "<strong>PERSONAL PROFILE</strong>" },
    { lineNumber: 2, content: "A highly skilled and innovative professional passionate about technology." },
    { lineNumber: 3, content: "________________________________________" },
    { lineNumber: 4, content: "<strong>PERSONAL DATA</strong>" },
    { lineNumber: 5, content: "Date of Birth: 1st April 1996" },
    { lineNumber: 6, content: "State of Origin: Kogi State" },
    { lineNumber: 7, content: "Local Govt. Area: Idah" },
    { lineNumber: 8, content: "Sex: Male" },
    { lineNumber: 9, content: "Marital Status: Single" },
    { lineNumber: 10, content: "Nationality: Nigerian" },
    { lineNumber: 11, content: "________________________________________" },
    { lineNumber: 12, content: "<strong>SKILLS</strong>" },
    { lineNumber: 13, content: "React, Node, TypeScript, Arduino, Robotics, Ethical Hacking" },
    { lineNumber: 14, content: "________________________________________" },
    { lineNumber: 15, content: "<strong>ACADEMIC</strong>" },
    { lineNumber: 16, content: "Federal Polytechnic, Idah — OND Computer Science" },
    { lineNumber: 17, content: "Open University of Nigeria — BSc Computer Science" },
    { lineNumber: 18, content: "________________________________________" },
    { lineNumber: 19, content: "<strong>WORK EXPERIENCE</strong>" },
    { lineNumber: 20, content: "Canadian Gateway Schools — Coding & Robotics Teacher (2023)" },
    { lineNumber: 21, content: "Hammaston Ltd — IT Support (2015)" },
    { lineNumber: 22, content: "________________________________________" },
    { lineNumber: 23, content: "<strong>REFEREES</strong>" },
    { lineNumber: 24, content: "Available upon request" },
  ];

  const DOWNLOAD_TRIGGER_LINE = 24;

  // small animated counter using requestAnimationFrame for smooth, performant increments
  // tuned for a slower, smooth ease-out count; animation will only start when `start` is true
  function AnimatedCounter({ target, suffix = "", duration = 2000, start = true }: { target: number; suffix?: string; duration?: number; start?: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
      // do not start animation until asked
      if (!start) {
        setCount(0);
        return;
      }

      let raf = 0;
      let startTime: number | null = null;

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const step = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(rawProgress);
        const current = Math.floor(eased * target);
        setCount(current);
        if (rawProgress < 1) {
          raf = requestAnimationFrame(step);
        } else {
          // ensure final exact value
          setCount(target);
        }
      };

      raf = requestAnimationFrame(step);

      return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return (
      <div aria-live="polite" className="text-2xl font-bold">
        {count}
        {suffix}
      </div>
    );
  }

  if (currentView === "dev") {
    return (
      <section id="about" className="py-16 flex items-start gap-8">
        <div className="flex-shrink-0">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-vscode-accent/50 shadow-lg">
            <img src={profilePhoto} alt="Developer Profile" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex-1 font-code text-sm">
          <div className="text-vscode-text-dim mb-4">// Dev View — Typed CV</div>
          <div className="bg-vscode-bg p-4 rounded-md">
            <TypewriterEffect lines={cvLines} speed={22} onLineComplete={(n) => n === DOWNLOAD_TRIGGER_LINE && setCvReady(true)} />

            <div className="mt-4 flex justify-center">
              <a
                href="/cv.pdf"
                download
                className={`inline-flex items-center gap-2 bg-vscode-accent text-white px-3 py-2 rounded text-sm transition-all ${cvReady ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <Download className="w-4 h-4" />
                <span>Download CV</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" ref={(el) => (sectionRef.current = el)} className="py-16 sm:py-24 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl font-bold mb-4">About CreativeMind Technology</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Creative Mind Technology is led by Victor James Ugbede — a full-stack developer and educator focused on web apps, robotics, and teaching coding to the next generation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {stats.map((s, i) => (
              <Card key={i} className="text-center">
                <CardContent>
                  <AnimatedCounter target={s.value as number} suffix={s.suffix} duration={2000} start={visible} />
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// observe visibility after the component mounts so we don't create observer during SSR
function useVisibility(ref: React.RefObject<HTMLElement | null>, rootMargin = "-10% 0px -10% 0px") {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            obs.disconnect(); // we only need to start once
            break;
          }
        }
      },
      { root: null, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin]);

  return isVisible;
}