import { useState, useEffect } from 'react';
import { Download, Github, Linkedin, Mail } from 'lucide-react';
import ResponsiveImage from '../ui/ResponsiveImage';
import { Button } from '../ui/button';

export const HomeContent = () => {
  const [displayedCode, setDisplayedCode] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const codeText = `// Hi, I'm a Developer
const developer = {
  name: 'VictorLight James Ugbede',
  title: 'Full Stack Developer',
  skills: ['React', 'Next.js',
    'TypeScript', 'Node.js, javascript',
    'HTML', 'CSS'],
  passion: 'Building beautiful web experiences'
};

console.log("Welcome to my digital world!");`;

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < codeText.length) {
        setDisplayedCode(codeText.slice(0, currentIndex + 1));
        setCurrentIndex((prev) => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [codeText, currentIndex]);

  const formatCode = (code: string) => {
    return code.split('\n').map((line, index) => (
      <div key={index} className="flex">
        <span className="text-muted-foreground w-8 text-right pr-3 select-none text-xs">
          {index + 1}
        </span>
        <span className="flex-1">
          {line.split(/(\b(?:const|let|var|function|class|if|else|for|while|return|import|export|from|default|async|await|console)\b|'[^']*'|"[^"]*"|`[^`]*`|\d+|\{|\}|\(|\)|;|,|\[|\])/g).map((token, i) => {
            if (['const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'from', 'default', 'async', 'await', 'console'].includes(token)) {
              return <span key={i} className="syntax-keyword">{token}</span>;
            }
            if (token.match(/^['"`]/)) {
              return <span key={i} className="syntax-string">{token}</span>;
            }
            if (token.match(/^\d+$/)) {
              return <span key={i} className="syntax-number">{token}</span>;
            }
            if (['{', '}', '(', ')', ';', ',', '[', ']'].includes(token)) {
              return <span key={i} className="syntax-keyword">{token}</span>;
            }
            return <span key={i}>{token}</span>;
          })}
        </span>
      </div>
    ));
  };

  const handleDownloadCV = () => {
    // Create a simple CV download - you can replace this with your actual CV file
  const cvContent = `VictorLight James Ugbede - Full Stack Developer

Contact Information:
Email: victor.onyemaechi@example.com
Phone: +234 xxx xxx xxxx
Location: Nigeria
LinkedIn: linkedin.com/in/victor-onyemaechi
                  <a
                    href="/public/cv/VictorLight_James_Ugbede_CV.pdf"
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-sans font-medium"
                  >
                    <span>Download CV (PDF)</span>
                  </a>
                  <a
                    href="/public/cv/VictorLight_James_Ugbede_CV.docx"
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-sans font-medium"
                  >
                    <span>Download CV (Word)</span>
                  </a>
• Backend: Node.js, Python, Express.js, REST APIs, GraphQL
• Databases: PostgreSQL, MongoDB, SQLite
• Desktop Development: Electron, Python Tkinter, C#/.NET
• Arduino/IoT: Arduino IDE, ESP32, C/C++, Raspberry Pi
• Tools: Git, Docker, VS Code, Linux, AWS, Firebase

Projects:
• E-Commerce Platform - Full-stack web application with React and Node.js
• Smart Home Controller - ESP32-based IoT system with web dashboard
• File Organizer Pro - Desktop automation tool with Python
• Weather Station - Multi-sensor Arduino project with data logging`;

    const blob = new Blob([cvContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
  link.download = 'VictorLight_James_Ugbede_CV.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center">
      <div className="grid lg:grid-cols-2 gap-12 w-full">
        {/* Code Section */}
        <div className="space-y-6 fade-in-up">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-sans">
              <span className="syntax-comment">// </span>
              <span className="gradient-text">Welcome to my</span>
            </h1>
            <h1 className="text-4xl md:text-5xl font-bold font-sans gradient-text">
              portfolio
            </h1>
            <div className="text-lg text-muted-foreground font-sans">
              &lt;<span className="syntax-keyword">Portfolio</span> /&gt;
            </div>
          </div>

          <div className="bg-sidebar rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
              <span className="text-sm text-muted-foreground">Home.tsx</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="p-4 font-code text-sm leading-relaxed min-h-[300px]">
              {formatCode(displayedCode)}
              {currentIndex < codeText.length && (
                <span className="border-r-2 border-primary animate-pulse ml-1"></span>
              )}
            </div>
          </div>

            <div className="flex items-center space-x-4">
              <Button asChild>
                <a href="/cv/JAMES_UGBEDE_victor_cv.pdf" download className="inline-flex items-center gap-2">
                  <Download size={18} />
                  <span>Download CV (PDF)</span>
                </a>
              </Button>

              <Button variant="secondary" asChild>
                <a href="/cv/JAMES_UGBEDE_victor_cv.doc" download className="inline-flex items-center gap-2">
                  <span>Download CV (Word)</span>
                </a>
              </Button>

              <div className="flex space-x-3">
                <a
                  href="https://github.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Github size={20} className="text-muted-foreground hover:text-primary" />
                </a>
                <a
                  href="https://linkedin.com/in/yourprofile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Linkedin size={20} className="text-muted-foreground hover:text-primary" />
                </a>
                <a
                  href="mailto:your.email@example.com"
                  className="p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Mail size={20} className="text-muted-foreground hover:text-primary" />
                </a>
              </div>
            </div>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center justify-center space-y-6 fade-in-up">
          <div className="relative float-animation">
              <div className="w-80 h-96 rounded-xl overflow-hidden border-4 border-primary profile-image shadow-2xl transform hover:scale-105 transition-transform duration-300">
              {/* Use reusable responsive image component */}
              <ResponsiveImage
                basePath="/lovable-uploads/victorlight"
                alt="VictorLight James Ugbede - Full Stack Developer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-background border border-border rounded-lg px-6 py-3 shadow-lg">
                <h3 className="text-xl font-bold font-sans text-center">VictorLight James Ugbede</h3>
                <p className="text-sm text-muted-foreground font-sans text-center">Full Stack Developer</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4 max-w-md">
            <p className="text-lg text-muted-foreground font-sans">
              I create digital solutions that bridge the gap between innovative ideas and real-world applications.
            </p>
            
            <div className="flex justify-center space-x-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-sans">React</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-sans">Node.js</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-sans">Arduino</span>
            </div>
          </div>
        </div>
      </div>
      {/* Floating contact CTA */}
      <a href="mailto:your.email@example.com" className="fixed right-6 bottom-6 z-40 inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-full shadow-lg hover:scale-105 transform transition">Contact / Hire</a>
    </div>
  );
};