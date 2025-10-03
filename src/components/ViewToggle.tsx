import { Monitor, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  currentView: 'client' | 'dev';
  onViewChange: (view: 'client' | 'dev') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-full">
      <Button
        variant={currentView === 'client' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('client')}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
          currentView === 'client' 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Monitor className="w-4 h-4 mr-2" />
        Client View
      </Button>
      <Button
        variant={currentView === 'dev' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('dev')}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
          currentView === 'dev' 
            ? "bg-vscode-accent text-vscode-bg shadow-md" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Code2 className="w-4 h-4 mr-2" />
        Dev View
      </Button>
    </div>
  );
}