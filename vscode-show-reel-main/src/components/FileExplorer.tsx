import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  FileCode,
  User,
  Briefcase,
  Settings,
  Code,
  Cpu,
  Mail
} from 'lucide-react';

interface FileExplorerProps {
  activeFile: string;
  onFileClick: (fileName: string) => void;
}

export const FileExplorer = ({ activeFile, onFileClick }: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState(['portfolio', 'src', 'components']);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) 
        ? prev.filter(f => f !== folderName)
        : [...prev, folderName]
    );
  };

  const fileStructure = [
    {
      name: 'portfolio',
      type: 'folder',
      children: [
        {
          name: 'src',
          type: 'folder',
          children: [
            {
              name: 'components',
              type: 'folder',
              children: [
                { name: 'Home.tsx', type: 'file', icon: User },
                { name: 'About.tsx', type: 'file', icon: User },
                { name: 'Skills.tsx', type: 'file', icon: Settings },
                { name: 'Projects.tsx', type: 'file', icon: Briefcase },
                { name: 'WebProjects.tsx', type: 'file', icon: Code },
                { name: 'SoftwareProjects.tsx', type: 'file', icon: Code },
                { name: 'ArduinoProjects.tsx', type: 'file', icon: Cpu },
                { name: 'Contact.tsx', type: 'file', icon: Mail },
              ]
            }
          ]
        }
      ]
    }
  ];

  const renderFile = (file: any, depth = 0) => {
    const isExpanded = expandedFolders.includes(file.name);
    const isActive = activeFile === file.name;

    if (file.type === 'folder') {
      return (
        <div key={file.name}>
          <div 
            className={`file-item flex items-center ${isActive ? 'active' : ''}`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => toggleFolder(file.name)}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {isExpanded ? <FolderOpen size={14} className="ml-1 mr-2" /> : <Folder size={14} className="ml-1 mr-2" />}
            <span className="text-sm">{file.name}</span>
          </div>
          {isExpanded && file.children && (
            <div>
              {file.children.map((child: any) => renderFile(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const IconComponent = file.icon || FileCode;

    return (
      <div
        key={file.name}
        className={`file-item flex items-center ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 24}px` }}
        onClick={() => onFileClick(file.name)}
      >
        <IconComponent size={14} className="mr-2 syntax-keyword" />
        <span className="text-sm">{file.name}</span>
      </div>
    );
  };

  return (
    <div className="w-80 file-explorer min-h-full">
      <div className="p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Explorer
        </h3>
        <div>
          {fileStructure.map(item => renderFile(item))}
        </div>
      </div>
    </div>
  );
};