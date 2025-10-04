import React, { useState, useEffect } from "react";
import { Github, ExternalLink, Filter, Linkedin, Twitter, Mail, Phone, Play } from "lucide-react";
import socialLinks from "@/data/socialLinks";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import cbtImg from "@/assets/cbt.jpg";
import lessonpImg from "@/assets/lessonp.jpg";
import pilgrimImg from "@/assets/pilgrim.jpg";
import profilePhoto from "@/assets/profile-photo.jpg";
import { Skills } from "./Skills";
import { Hero } from "./Hero";
import { Contact } from "./Contact";
import ChatBox from "@/components/ChatBox";
import { generateOpenAIStream } from '@/lib/chatApi';

export interface ProjectsProps {
  currentView: "client" | "dev";
}

const sampleProjects = [
  {
    id: 1,
    title: "Agent Pilgrims",
    description: "AI assistant for pilgrim planning.",
    image: pilgrimImg,
    images: [pilgrimImg],
    technologies: ["React", "TypeScript", "Tailwind"],
    github: "",
    demo: "https://agent-pilgrims-5.onrender.com/",
    category: "web",
  },
  {
    id: 2,
    title: "CBT System",
    description: "Computer based testing platform.",
    image: cbtImg,
    images: [cbtImg],
    technologies: ["React", "Node.js"],
    github: "",
    demo: "",
    category: "web",
  },
  {
    id: 3,
    title: "Lesson Planner",
    description: "Teacher lesson planning app.",
    image: lessonpImg,
    images: [lessonpImg],
    technologies: ["React", "Express"],
    github: "",
    demo: "https://vickyl-3.onrender.com",
    category: "web",
  },
];

export function Projects({ currentView }: ProjectsProps) {
  // Shared client view state
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const filters = ["all", "web", "mobile", "hardware"];
  const filteredProjects = sampleProjects.filter((p) => activeFilter === "all" || p.category === activeFilter);

  // Dev View state
  const devSections = [
    { key: "hero", label: "Hero" },
    { key: "about", label: "About" },
    { key: "social", label: "Social" },
    { key: "chat", label: "AI Chat" },
    { key: "skills", label: "Skills & Technologies" },
    { key: "projects", label: "Projects" },
    { key: "contact", label: "Contact" },
  ];
  type Tab = { key: string; pinned?: boolean; group?: string | null };
  const [openTabs, setOpenTabs] = useState<Tab[]>([{ key: 'hero', pinned: false }]);
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [jsonOpenIds, setJsonOpenIds] = useState<number[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSectionClick = (key: string) => {
    setOpenTabs((prev) => (prev.some(t => t.key === key) ? prev : [...prev, { key, pinned: false }]));
    setActiveTab(() => key);
    // If opening the hero tab in Dev View, trigger the Hero's speech (use a small event dispatch)
    if (key === "hero") {
      // dispatch a custom event so Hero can optionally listen in Dev Mode
      try {
        window.dispatchEvent(new CustomEvent('devview-open-hero'));
      } catch (e) {
        // ignore
      }
    }
    if (key === "skills") setSkillsModalOpen(true);
  };

  // listen for global commands (from CommandPalette or keyboard shortcuts)
  useEffect(() => {
    const onOpen = (e: Event) => {
      try {
        const detail: any = (e as CustomEvent).detail;
        const key = detail?.key;
        if (key) handleSectionClick(key);
      } catch (err) {}
    };
    window.addEventListener('devview-open-section', onOpen as EventListener);
    return () => window.removeEventListener('devview-open-section', onOpen as EventListener);
  }, []);
  const handleTabClose = (key: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((tab) => tab.key !== key);
      // if closing the active tab, pick the first remaining tab
      if (activeTab === key) {
        setActiveTab(next.length ? next[0].key : 'hero');
      }
      return next;
    });
  };

  // persist openTabs and activeTab
  useEffect(() => {
    const stored = localStorage.getItem('dev_open_tabs');
    const storedActive = localStorage.getItem('dev_active_tab');
    if (stored) {
      try { const parsed: Tab[] = JSON.parse(stored); setOpenTabs(parsed); } catch (e) {}
    }
    if (storedActive) setActiveTab(storedActive);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('dev_open_tabs', JSON.stringify(openTabs)); } catch (e) {}
  }, [openTabs]);

  useEffect(() => {
    try { localStorage.setItem('dev_active_tab', activeTab); } catch (e) {}
  }, [activeTab]);

  // drag reorder handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/tab-index', String(index));
  };
  const onDropTab = (e: React.DragEvent, index: number) => {
    const from = Number(e.dataTransfer.getData('text/tab-index'));
    if (Number.isNaN(from)) return;
    setOpenTabs((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(index, 0, item);
      return copy;
    });
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const renderDevSection = (key: string) => {
    switch (key) {
      case "hero":
        return (
          <div className="p-0">
            <Hero currentView="dev" />
          </div>
        );
      case "about":
        return (
          <div className="p-6">
            <div className="font-code text-lg mb-2">About</div>
            <div className="mb-4">About section content.</div>
            <div className="mt-4">
              <Button size="sm" onClick={() => {
                const a = document.createElement('a');
                a.href = '/cv.pdf';
                a.download = 'cv.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}>Download CV</Button>
            </div>
          </div>
        );
      case "skills":
        return (
          <div className="p-6">
            <div className="font-code text-lg mb-2">Skills & Technologies</div>
            <Button size="sm" onClick={() => setSkillsModalOpen(true)}>Open Skills Modal</Button>
          </div>
        );
      case "social": {
        // render social links dynamically from data/socialLinks.ts
        const iconMap: Record<string, any> = {
          github: Github,
          linkedin: Linkedin,
          twitter: Twitter,
          whatsapp: Phone,
          email: Mail,
          tiktok: TikTokIcon,
        };

        return (
          <div className="p-6">
            <div className="font-code text-lg mb-4">Social</div>
            <div className="flex flex-col gap-3">
              {socialLinks.map((s) => {
                const Icon = iconMap[s.key] || ExternalLink;
                return (
                  <Button key={s.key} variant="ghost" onClick={() => window.open(s.url, '_blank')} className="justify-start">
                    <Icon className="w-5 h-5 mr-3" /> {s.label}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      }
      case "chat":
        return (
          <div className="p-6">
            <div className="font-code text-lg mb-4">AI Chat</div>
            <ChatBox systemPrompt={"You are a helpful assistant for Victor James portfolio visitor."} />
          </div>
        );
      case "projects":
        return (
          <div className="p-6">
            <div className="font-code text-lg mb-4">Projects</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sampleProjects.map((project) => (
                <div key={project.id} className="p-3 bg-surface rounded-md shadow-sm">
                  <div className="flex items-start gap-4">
                    <img src={project.image} alt={project.title} className="w-28 h-20 object-cover rounded-md cursor-pointer" onClick={() => { setSelectedProject(project); setModalOpen(true); }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{project.title}</div>
                        <div className="text-xs text-muted-foreground">{project.category}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{project.description}</div>
                      <div className="flex gap-2 mt-3">
                        {project.github ? (
                          <Button size="sm" variant="outline" onClick={() => window.open(project.github, '_blank')}><Github className="w-4 h-4 mr-2" />Code</Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled><Github className="w-4 h-4 mr-2" />Code</Button>
                        )}

                        {project.demo ? (
                          <>
                            <Button size="sm" onClick={() => window.open(project.demo, '_blank')}><ExternalLink className="w-4 h-4 mr-2" />Demo</Button>
                            <Button size="sm" onClick={() => { setPreviewUrl(project.demo); setPreviewOpen(true); }} variant="outline">Preview</Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => { setSelectedProject(project); setModalOpen(true); }}><ExternalLink className="w-4 h-4 mr-2" />Details</Button>
                        )}

                        <Button size="sm" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(project, null, 2)); }} variant="ghost">Copy JSON</Button>
                        <Button size="sm" variant={jsonOpenIds.includes(project.id) ? 'default' : 'outline'} onClick={() => {
                          setJsonOpenIds((prev) => prev.includes(project.id) ? prev.filter(id => id !== project.id) : [...prev, project.id]);
                        }}>{jsonOpenIds.includes(project.id) ? 'Hide JSON' : 'Quick JSON'}</Button>
                      </div>
                    </div>
                  </div>

                  {jsonOpenIds.includes(project.id) && (
                    <pre className="mt-3 p-2 bg-background/60 rounded text-xs overflow-auto max-h-40">{JSON.stringify(project, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="p-6">
            <Contact currentView="client" />
          </div>
        );
      default:
        return null;
    }
  };

  if (currentView === "dev") {
    return (
      <section id="devview" className="py-16 flex items-start gap-0">
        <div className="w-48 bg-vscode-bg-dark border-r border-vscode-border flex flex-col">
          {devSections.map((sec) => (
            <button
              type="button"
              key={sec.key}
              className={`w-full px-4 py-3 text-left font-code text-sm border-b border-vscode-border hover:bg-vscode-bg-lighter ${
                activeTab === sec.key ? "bg-vscode-bg-lighter font-bold" : ""
              }`}
              onClick={() => handleSectionClick(sec.key)}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {/* toolbar above tabs: right-aligned actions like Download CV */}
          <div className="flex items-center justify-between border-b border-vscode-border bg-vscode-bg-light px-4">
            <div />
            <div className="py-2">
              <Button size="sm" onClick={() => {
                const a = document.createElement('a');
                a.href = '/cv.pdf';
                a.download = 'cv.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}>Download CV</Button>
            </div>
          </div>
          <div className="flex border-b border-vscode-border bg-vscode-bg-light">
            <div className="flex transition-all duration-200 ease-in-out">
              {openTabs.map((tabObj, idx) => (
                <div
                  key={tabObj.key}
                  draggable
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDropTab(e, idx)}
                  className={`px-6 py-2 cursor-pointer font-code text-sm border-r border-vscode-border flex items-center gap-2 ${
                    activeTab === tabObj.key ? "bg-vscode-bg-lighter font-bold" : ""
                  } ${tabObj.pinned ? 'opacity-95' : ''}`}
                  onClick={() => setActiveTab(tabObj.key)}
                >
                  {devSections.find((s) => s.key === tabObj.key)?.label || tabObj.key}
                  <button type="button" className="ml-2 text-xs text-vscode-text-dim hover:text-vscode-error" onClick={(e) => { e.stopPropagation(); handleTabClose(tabObj.key); }}>&times;</button>
                  <button type="button" className="ml-2 text-xs text-vscode-text-dim hover:text-vscode-text" onClick={(e) => { e.stopPropagation(); setOpenTabs(prev => prev.map(p => p.key === tabObj.key ? {...p, pinned: !p.pinned} : p)); }} title="Pin tab">{tabObj.pinned ? '📌' : '📍'}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-vscode-bg-light min-h-[400px]">{renderDevSection(activeTab)}</div>
        </div>

        <Dialog open={skillsModalOpen} onOpenChange={setSkillsModalOpen}>
          <DialogContent className="max-w-5xl w-[90vw]">
            {/* Compact skills modal for Dev View: two-column grid with progress bars */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <DialogHeader>
                    <DialogTitle>Skills & Technologies</DialogTitle>
                    <DialogDescription>A compact view of skill proficiencies.</DialogDescription>
                  </DialogHeader>
                </div>
                <div className="text-sm text-muted-foreground">Experience: 5+ years</div>
              </div>

              {/* Define categories compactly (kept small to avoid duplicating a large dataset) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className="font-semibold mb-3">Frontend</h4>
                  {[
                    { name: 'React', level: 95 },
                    { name: 'TypeScript', level: 90 },
                    { name: 'Next.js', level: 85 },
                    { name: 'Tailwind CSS', level: 90 }
                  ].map((s) => (
                    <div key={s.name} className="mb-3">
                      <div className="flex justify-between mb-1 text-sm"><span>{s.name}</span><span className="text-muted-foreground">{s.level}%</span></div>
                      <Progress value={s.level} className="h-2" />
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Backend & Tools</h4>
                  {[
                    { name: 'Node.js', level: 90 },
                    { name: 'Python', level: 85 },
                    { name: 'Docker', level: 80 },
                    { name: 'AWS', level: 75 }
                  ].map((s) => (
                    <div key={s.name} className="mb-3">
                      <div className="flex justify-between mb-1 text-sm"><span>{s.name}</span><span className="text-muted-foreground">{s.level}%</span></div>
                      <Progress value={s.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {['React','TypeScript','Node.js','Python','Tailwind CSS','Docker','AWS','PostgreSQL','MongoDB'].map(t => <Badge key={t}>{t}</Badge>)}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <DialogClose />
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    );
  }

  // Client/projects view
  return (
    <section id="projects" className="py-16 sm:py-24 px-2 sm:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Featured <span className="gradient-text">Projects</span></h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8">A showcase of recent work.</p>

          <div className="flex justify-center gap-2 flex-wrap">
            {filters.map((filter) => (
              <Button key={filter} variant={activeFilter === filter ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(filter)} className="capitalize">
                <Filter className="w-4 h-4 mr-2" />{filter === 'all' ? 'All Projects' : filter}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="card-hover overflow-hidden group">
              <div className="relative overflow-hidden">
                <img src={project.image} alt={project.title} className="w-full h-48 object-cover" onClick={() => { setSelectedProject(project); setModalOpen(true); }} />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                <p className="text-muted-foreground mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((t) => <Badge key={t}>{t}</Badge>)}
                </div>
                <div className="flex gap-2">
                  {project.github ? (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => window.open(project.github, '_blank')}><Github className="w-4 h-4 mr-2" />Code</Button>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1" disabled><Github className="w-4 h-4 mr-2" />Code</Button>
                  )}

                  {project.demo ? (
                    <Button size="sm" className="flex-1" onClick={() => window.open(project.demo, '_blank')}><ExternalLink className="w-4 h-4 mr-2" />Demo</Button>
                  ) : (
                    <Button size="sm" className="flex-1" onClick={() => { setSelectedProject(project); setModalOpen(true); }}><ExternalLink className="w-4 h-4 mr-2" />Details</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            {selectedProject && <ProjectModalContent project={selectedProject} onOpenImage={(img:string)=>{ setLightboxImg(img); setLightboxOpen(true); }} />}
            <DialogClose />
          </DialogContent>
        </Dialog>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent>
            <div className="w-full h-[70vh]">
              {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-full" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
              ) : (
                <div className="p-4">No preview available</div>
              )}
            </div>
            <DialogClose />
          </DialogContent>
        </Dialog>

        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent>
            <div className="w-full h-full flex items-center justify-center">
              {lightboxImg ? <img src={lightboxImg} alt="Preview" className="max-w-full max-h-[80vh] object-contain" /> : <div className="w-full h-64 bg-muted flex items-center justify-center">No image</div>}
            </div>
            <DialogClose />
          </DialogContent>
        </Dialog>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.open('https://github.com/creativemindtech', '_blank')}
          >
            View All Projects
            <ExternalLink className="w-5 h-5 ml-2" />
          </Button>
        </div>
        {/* chat widget removed from here; provided globally by ChatToggleWidget */}
      </div>
    </section>
  );
}

function ProjectModalContent({ project, onOpenImage }: { project:any; onOpenImage?: (img:string)=>void }){
  const [main, setMain] = useState<string | null>(project.images && project.images.length ? project.images[0] : project.image || null);

  useEffect(()=>{
    setMain(project.images && project.images.length ? project.images[0] : project.image || null);
  }, [project]);

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{project.title}</DialogTitle>
        <DialogDescription>{project.description}</DialogDescription>
      </DialogHeader>
      <div className="mt-4">
        {main ? <img src={main} alt={project.title} className="w-full h-64 object-cover rounded-md" /> : <div className="w-full h-64 bg-muted flex items-center justify-center">No preview available</div>}
      </div>
      {project.images && project.images.length>0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {project.images.map((img:string)=> (
            <img key={img} src={img} className="w-20 h-14 object-cover rounded cursor-pointer" onClick={()=>{ setMain(img); onOpenImage?.(img); }} />
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        {project.github ? (
          <Button onClick={()=>window.open(project.github, '_blank')} variant="outline">View Code</Button>
        ) : (
          <Button variant="outline" disabled>View Code</Button>
        )}

        {project.demo ? (
          <Button onClick={()=>window.open(project.demo, '_blank')}>Open Demo</Button>
        ) : (
          <Button disabled>Open Demo</Button>
        )}
      </div>
      <div className="mt-4">
        <strong>Technologies:</strong>
        <div className="flex flex-wrap gap-2 mt-2">{project.technologies.map((t:string)=>(<Badge key={t}>{t}</Badge>))}</div>
      </div>
    </div>
  );
}