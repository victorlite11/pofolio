import { ProjectData } from '../VSCodeLayout';
import { Code, Monitor, Cpu } from 'lucide-react';
import { useState } from 'react';
import { useProjects } from '@/lib/useProjects';

interface ProjectsContentProps {
  onProjectClick: (project: ProjectData) => void;
}

export const ProjectsContent = ({ onProjectClick }: ProjectsContentProps) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'website' | 'software' | 'arduino'>('all');
  const { projects, filtered, isLoading } = useProjects({ category: activeCategory === 'all' ? 'all' : activeCategory });

  const counts = {
    website: projects.filter((p) => p.category === 'website').length,
    software: projects.filter((p) => p.category === 'software').length,
    arduino: projects.filter((p) => p.category === 'arduino').length,
    total: projects.length,
  };

  const projectCategories = [
    {
      key: 'website',
      title: 'Web Development',
      icon: Code,
      description: 'Modern web applications using React, TypeScript, and Node.js',
      count: counts.website,
      color: 'text-blue-400'
    },
    {
      key: 'software',
      title: 'Desktop Software',
      icon: Monitor,
      description: 'Cross-platform desktop applications and system tools',
      count: counts.software,
      color: 'text-green-400'
    },
    {
      key: 'arduino',
      title: 'Arduino Projects',
      icon: Cpu,
      description: 'IoT devices, sensors, and embedded system solutions',
      count: counts.arduino,
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="font-code">
        <span className="syntax-comment">// Project portfolio overview</span>
        <br />
        <br />
        <span className="syntax-keyword">const</span> <span className="syntax-variable">portfolio</span> = {"{"}
        <br />
        <span className="ml-4">
          <span className="syntax-string">totalProjects</span>: <span className="syntax-number">25</span>,
        </span>
        <br />
        <span className="ml-4">
          <span className="syntax-string">categories</span>: [<span className="syntax-string">'Web'</span>, <span className="syntax-string">'Desktop'</span>, <span className="syntax-string">'Arduino'</span>],
        </span>
        <br />
        <span className="ml-4">
          <span className="syntax-string">status</span>: <span className="syntax-string">'Always building something new'</span>
        </span>
        <br />
        {"}"};
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {projectCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div
              key={category.title}
              className={`project-card group ${activeCategory === category.key ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <IconComponent className={`w-8 h-8 ${category.color}`} />
                <h3 className="text-xl font-bold font-sans">{category.title}</h3>
              </div>
              
              <p className="text-muted-foreground font-sans mb-4">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {isLoading ? '—' : category.count}
                </span>
                <span className="text-sm text-muted-foreground">
                  Projects
                </span>
              </div>
              
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setActiveCategory(category.key as any)} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-sans">
                  Explore Projects
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-card rounded-lg border border-border">
        <h3 className="text-xl font-bold mb-4 font-sans">Featured Projects</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.slice(0, 4).map((p) => (
            <div key={p.id} className="p-4 bg-muted/50 rounded border border-border cursor-pointer" onClick={() => onProjectClick(p)}>
              <h4 className="font-semibold font-sans mb-2">{p.name}</h4>
              <p className="text-sm text-muted-foreground font-sans">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};