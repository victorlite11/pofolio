import { Download, Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TypewriterEffect } from "./TypewriterEffect";
import heroImage from "@/assets/hero-bg.jpg";
import profilePhoto from "@/assets/profile-photo.jpg";
import profilePhoto1 from "@/assets/profile-photo1.jpeg";
import profilePhoto2 from "@/assets/profile-photo2.jpeg";
import profilePhoto3 from "@/assets/profile-photo3.jpeg";
import profilePhoto4 from "@/assets/profile-photo4.jpeg";
import profilePhoto5 from "@/assets/profile-photo5.jpeg";
import profilePhoto6 from "@/assets/profile-photo6.jpeg";
import profilePhoto7 from "@/assets/profile-photo7.jpeg";
import profilePhoto8 from "@/assets/profile-photo8.jpeg";
import arduino1 from "@/assets/arduino1.jpeg";
import arduino2 from "@/assets/arduino2.jpeg";

interface HeroProps {
  currentView: 'client' | 'dev';
}

import React, { useState, useEffect } from "react";

const profileImages = [
  profilePhoto,
  profilePhoto1,
  profilePhoto2,
  profilePhoto3,
  profilePhoto4,
  profilePhoto5,
  profilePhoto6,
  profilePhoto7,
  profilePhoto8,
  arduino1,
  arduino2,
];

export function Hero({ currentView }: HeroProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [speechBlocked, setSpeechBlocked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setAnimating(true);
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % profileImages.length);
        setFade(true);
        setAnimating(false);
      }, 400); // animation duration
    }, 2500); // image change interval
    return () => clearInterval(interval);
  }, []);

  // Speech synthesis: welcome message on load with graceful fallback
  const speakLines = (lines: string[]) => {
    if (!lines || !lines.length) return;
    if (!('speechSynthesis' in window)) {
      setSpeechBlocked(true);
      return;
    }
    try {
      // cancel any existing utterances
      (window as any).speechSynthesis.cancel();
      lines.forEach((text, i) => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        utter.pitch = 1;
        utter.lang = 'en-US';
        utter.onend = () => {
          if (i === lines.length - 1) setHasSpoken(true);
        };
        (window as any).speechSynthesis.speak(utter);
      });
    } catch (e) {
      setSpeechBlocked(true);
    }
  };

  useEffect(() => {
    // Try to speak after a short delay on load. Browsers may block this until user interaction.
    const lines = [
      'Welcome to Mr. Victor James professional portfolio.',
      'I am Victor James Ugbede, founder of Creative Mind Technology. Also known as victorlight or codex.',
      'I build web and desktop applications, Arduino projects, and write code in C and C++.',
      'Use the navigation or the buttons to view projects, download my CV, or contact me.'
    ];

    const t = setTimeout(() => {
      try {
        speakLines(lines);
      } catch (e) {
        setSpeechBlocked(true);
      }
    }, 600);

    return () => clearTimeout(t);
  }, []);

  // Listen for Dev View open event to trigger speech when hero tab is opened
  useEffect(() => {
    const handler = () => {
      if (hasSpoken) return; // don't re-speak
      const lines = [
        'Welcome to Mr. Victor James professional portfolio.',
        'I am Victor James Ugbede, founder of Creative Mind Technology. Also known as victorlight or codex.',
        'I build web and desktop applications, Arduino projects, and write code in C and C++.',
        'Use the navigation or the buttons to view projects, download my CV, or contact me.'
      ];
      try {
        speakLines(lines);
      } catch (e) {
        setSpeechBlocked(true);
      }
    };

    window.addEventListener('devview-open-hero', handler as EventListener);
    return () => window.removeEventListener('devview-open-hero', handler as EventListener);
  }, [hasSpoken]);
  const handleDownloadCV = () => {
    // Create a downloadable CV
    const link = document.createElement('a');
  link.href = '/cv.pdf';
  link.download = 'cv.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const codeLines = [
    {
      lineNumber: 1,
      content: '<span class="text-vscode-text-dim"><span class="text-vscode-accent">1</span> <span class="text-purple-400">const</span> <span class="text-blue-300">developer</span> <span class="text-white">=</span> <span class="text-yellow-300">{</span></span>',
      delay: 30
    },
    {
      lineNumber: 2,
  content: '<span class="text-vscode-accent">2</span>   <span class="text-blue-300">name</span><span class="text-white">:</span> <span class="text-green-300">\'Victor James Ugbede\'</span><span class="text-white">,</span>',
      delay: 30
    },
    {
      lineNumber: 3,
      content: '<span class="text-vscode-accent">3</span>   <span class="text-blue-300">aliases</span><span class="text-white">:</span> <span class="text-green-300">[\'victorlight\', \'codex\']</span><span class="text-white">,</span>',
      delay: 30
    },
    {
      lineNumber: 4,
      content: '<span class="text-vscode-accent">4</span>   <span class="text-blue-300">about</span><span class="text-white">:</span> <span class="text-green-300">\'Founder of Creative Mind Technology. I design web applications, desktop apps/software, build Arduino projects, and write code in C and C++. Proficient in HTML, CSS, JS, TypeScript, React, frontend & backend dev, Express.js, etc.\'</span><span class="text-white">,</span>',
      delay: 40
    },
    {
      lineNumber: 5,
      content: '<span class="text-vscode-accent">5</span>   <span class="text-blue-300">skills</span><span class="text-white">:</span> <span class="text-white">[</span><span class="text-green-300">\'HTML\'</span><span class="text-white">,</span> <span class="text-green-300">\'CSS\'</span><span class="text-white">,</span> <span class="text-green-300">\'JavaScript\'</span><span class="text-white">,</span> <span class="text-green-300">\'TypeScript\'</span><span class="text-white">,</span> <span class="text-green-300">\'React\'</span><span class="text-white">,</span> <span class="text-green-300">\'C\'</span><span class="text-white">,</span> <span class="text-green-300">\'C++\'</span><span class="text-white">,</span> <span class="text-green-300">\'Express.js\'</span><span class="text-white">],</span>',
      delay: 40
    },
    {
      lineNumber: 6,
      content: '<span class="text-vscode-accent">6</span>   <span class="text-blue-300">passion</span><span class="text-white">:</span> <span class="text-green-300">\'Building innovative solutions\'</span><span class="text-white">,</span>',
      delay: 30
    },
    {
      lineNumber: 7,
      content: '<span class="text-vscode-accent">7</span>   <span class="text-blue-300">founder</span><span class="text-white">:</span> <span class="text-green-300">\'Creative Mind Technology\'</span><span class="text-white">,</span>',
      delay: 30
    },
    {
      lineNumber: 8,
      content: '<span class="text-vscode-accent">8</span>   <span class="text-blue-300">downloadCV</span><span class="text-white">:</span> <span class="text-purple-400">() =&gt;</span> <button class="text-vscode-accent hover:underline cursor-pointer">\'click-here.pdf\'</button><span class="text-white">,</span>',
      delay: 40
    },
    {
      lineNumber: 9,
      content: '<span class="text-vscode-text-dim"><span class="text-vscode-accent">9</span> <span class="text-yellow-300">}</span><span class="text-white">;</span></span>',
      delay: 100
    }
  ];

  if (currentView === 'dev') {
    return (
      <section className="relative py-8 flex flex-col md:flex-row items-start gap-6 md:gap-8">
        {/* Animated Profile Photo */}
        <div className="flex-shrink-0 mb-6 md:mb-0">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-xl overflow-hidden border-2 border-vscode-accent animate-pulse shadow-xl">
            <img
              src={profileImages[currentImage]}
              alt="CreativeMind Technology - Full Stack Developer"
              className={`w-full h-full object-cover transition-all duration-400 ${fade ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-90 rotate-6'} ${animating ? 'shadow-2xl' : ''}`}
              style={{ willChange: 'transform, opacity' }}
            />
            <div className="absolute inset-0 bg-vscode-accent/10 hover:bg-vscode-accent/20 transition-colors"></div>
          </div>
          <div className="mt-2 text-xs text-vscode-text-dim text-center">{`./profile${currentImage === 0 ? '' : '-' + currentImage}.jpg`}</div>
        </div>

        {/* Animated Code with Typewriter Effect */}
  <div className="flex-1 min-w-0">
          <TypewriterEffect 
            lines={codeLines} 
            speed={12}
          />
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-vscode-bg-light border-vscode-border text-vscode-text hover:bg-vscode-bg-lighter"
              onClick={() => window.open('https://github.com/creativemindtech', '_blank')}
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-vscode-bg-light border-vscode-border text-vscode-text hover:bg-vscode-bg-lighter"
              onClick={() => window.open('https://linkedin.com/in/creativemindtech', '_blank')}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-vscode-bg-light border-vscode-border text-vscode-text hover:bg-vscode-bg-lighter"
              onClick={handleContactClick}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
      </div>

  <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Profile Section */}
          <div className="order-2 lg:order-1 mb-8 lg:mb-0">
            <div className="animate-float">
              <Badge variant="secondary" className="mb-6 px-4 py-2">
                <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Available for Projects
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">CreativeMind</span>
              <br />
              <span className="text-foreground">Technology</span>
            </h1>

            <p className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-8 max-w-2xl">
              Full Stack Developer crafting innovative web solutions with modern technologies.
              Specialized in React, TypeScript, and creating exceptional user experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={handleDownloadCV}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-6 text-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download CV
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg border-primary/20 hover:border-primary"
                onClick={handleViewProjects}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                View Projects
              </Button>
              {/* Voice enable button */}
              <div>
                <Button
                  size="lg"
                  variant={hasSpoken ? 'outline' : 'default'}
                  onClick={() => {
                    const lines = [
                      'Welcome to Mr. Victor James professional portfolio.',
                      'I am Victor James Ugbede, founder of Creative Mind Technology. Also known as victorlight or codex.',
                      'I build web and desktop applications, Arduino projects, and write code in C and C++.',
                      'Use the navigation or the buttons to view projects, download my CV, or contact me.'
                    ];
                    speakLines(lines);
                  }}
                >
                  Enable Voice
                </Button>
              </div>
            </div>

            <div className="flex justify-center sm:justify-start gap-4 sm:gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => window.open('https://github.com/creativemindtech', '_blank')}
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => window.open('https://linkedin.com/in/creativemindtech', '_blank')}
              >
                <Linkedin className="w-5 h-5 mr-2" />
                LinkedIn
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={handleContactClick}
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact
              </Button>
            </div>
          </div>

          {/* Animated Profile Photo */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-glow animate-float">
                <img
                  src={profileImages[currentImage]}
                  alt="CreativeMind Technology - Full Stack Developer"
                  className={`w-full h-full object-cover transition-all duration-400 ${fade ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-90 rotate-6'} ${animating ? 'shadow-2xl' : ''}`}
                  style={{ willChange: 'transform, opacity' }}
                />
                <div className="absolute inset-0 bg-gradient-primary/20 hover:bg-gradient-primary/30 transition-colors"></div>
              </div>
              {/* Floating elements around photo */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary-glow rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="mt-2 text-xs text-vscode-text-dim text-center">{`./profile${currentImage === 0 ? '' : '-' + currentImage}.jpg`}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-primary-glow/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
    </section>
  );
}