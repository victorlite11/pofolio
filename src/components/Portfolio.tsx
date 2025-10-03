import { useState, useEffect } from "react";
import { ViewToggle } from "./ViewToggle";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { VSCodeLayout } from "./VSCodeLayout";
import ChatToggleWidget from './ChatToggleWidget';
import { Hero } from "./Hero";
import { About } from "./About";
import { Projects } from "./Projects";
import { Skills } from "./Skills";
import { Contact } from "./Contact";
import { cn } from "@/lib/utils";

export function Portfolio() {
  const [currentView, setCurrentView] = useState<'client' | 'dev'>('client');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.body.className = currentView === 'dev' ? 'dev-view' : theme === 'dark' ? 'dark' : 'client-view';
  }, [currentView, theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const content = (
    <div className="w-full">
      <Hero currentView={currentView} />
      <About currentView={currentView} />
      <Projects currentView={currentView} />
      <Skills currentView={currentView} />
      <Contact currentView={currentView} />
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500",
      currentView === 'dev' ? "bg-vscode-bg" : "bg-background"
    )}>
      {/* View Toggle & Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        <Button
          variant="ghost"
          size="icon"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {currentView === 'dev' ? (
        <VSCodeLayout>
          <div className="p-6 overflow-auto">
            {content}
          </div>
        </VSCodeLayout>
      ) : (
        <div className="overflow-auto">
          {content}
        </div>
      )}
      {/* Site-wide chat toggle */}
      <ChatToggleWidget />
    </div>
  );
}