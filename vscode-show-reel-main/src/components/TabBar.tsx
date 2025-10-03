import { X } from 'lucide-react';

interface TabBarProps {
  openTabs: string[];
  activeFile: string;
  onTabClick: (fileName: string) => void;
  onTabClose: (fileName: string) => void;
}

export const TabBar = ({ openTabs, activeFile, onTabClick, onTabClose }: TabBarProps) => {
  return (
    <div className="flex bg-background border-b border-border overflow-x-auto">
      {openTabs.map((tab) => (
        <div
          key={tab}
          className={`flex items-center px-4 py-2 border-r border-border min-w-fit cursor-pointer group
            ${activeFile === tab 
              ? 'bg-background text-foreground border-b-2 border-b-primary' 
              : 'bg-muted text-muted-foreground hover:bg-background hover:text-foreground'
            }`}
          onClick={() => onTabClick(tab)}
        >
          <span className="text-sm mr-2">{tab}</span>
          <button
            className="opacity-0 group-hover:opacity-100 hover:bg-border rounded p-1"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab);
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};