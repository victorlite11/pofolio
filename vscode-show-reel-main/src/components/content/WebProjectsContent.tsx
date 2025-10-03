import React, { useMemo, useState } from 'react';
import { ProjectData } from '../VSCodeLayout';
import ContactForm from './ContactForm';
import ProjectImage from '@/components/ui/ProjectImage';
import { Github, ExternalLink } from 'lucide-react';

interface WebProjectsContentProps {
  onProjectClick: (project: ProjectData) => void;
}

export const WebProjectsContent: React.FC<WebProjectsContentProps> = ({ onProjectClick }) => {
  const [filter, setFilter] = useState<'all' | 'website' | 'software' | 'arduino'>('all');

  const projects: ProjectData[] = [
    { id: '1', name: 'E-Commerce', description: 'Full-stack store with payments', category: 'website', technologies: ['React', 'Node.js', 'Stripe'], image: '/lovable-uploads/victorlight-640w.jpeg' },
    { id: '2', name: 'Tasker', description: 'Task management PWA', category: 'website', technologies: ['React', 'Firebase', 'PWA'], image: '/lovable-uploads/victorlight-320w.jpeg' },
    { id: '3', name: 'Dashboard', description: 'Analytics & reporting', category: 'website', technologies: ['Next.js', 'TypeScript'], image: '/lovable-uploads/victorlight-1280w.jpeg' },
  ];

  const visible = useMemo(() => projects.filter(p => filter === 'all' ? true : p.category === filter), [projects, filter]);

  const heroImages = ['/lovable-uploads/victorlight-1280w.jpeg', '/lovable-uploads/victorlight-640w.jpeg', '/lovable-uploads/victorlight-320w.jpeg'];
  const [index, setIndex] = useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIndex(i => (i - 1 + heroImages.length) % heroImages.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIndex(i => (i + 1) % heroImages.length); };

  return (
    <div className="container mx-auto space-y-8">
      <header className="hero grid md:grid-cols-2 gap-6 items-center bg-gradient-to-r from-white to-indigo-50 rounded-lg p-8">
        <div>
          <h1 className="text-4xl font-extrabold mb-3">Hi, I&apos;m <span className="text-primary">VictorLight</span></h1>
          <p className="text-lg text-muted-foreground mb-4">I build performant, accessible, and beautiful web experiences.</p>
          <div className="flex gap-3">
            <a href="#projects" className="btn">View Projects</a>
            <a href="/cv/JAMES_UGBEDE_victor_cv.pdf" download className="btn bg-secondary">Download CV</a>
          </div>
          <div className="mt-6">
            <div className="text-sm"><strong>Email:</strong> <a href="mailto:creativemindtechnology33@gmail.com" className="text-primary">creativemindtechnology33@gmail.com</a></div>
            <div className="text-sm mt-1"><strong>Phone:</strong> <a href="tel:08148562484" className="text-primary">08148562484</a></div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden shadow-lg relative">
          <img src={heroImages[index]} alt="hero" className="w-full h-80 object-cover rounded-lg" />
          <button onClick={prev} className="carousel-control left">‹</button>
          <button onClick={next} className="carousel-control right">›</button>
        </div>
      </header>

      <section id="projects">
        <h2 className="section-title">Projects</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button className={`px-3 py-2 rounded ${filter === 'all' ? 'bg-primary text-white' : 'bg-white border'}`} onClick={() => setFilter('all')}>All</button>
            <button className={`px-3 py-2 rounded ${filter === 'website' ? 'bg-primary text-white' : 'bg-white border'}`} onClick={() => setFilter('website')}>Web</button>
            <button className={`px-3 py-2 rounded ${filter === 'software' ? 'bg-primary text-white' : 'bg-white border'}`} onClick={() => setFilter('software')}>Software</button>
            <button className={`px-3 py-2 rounded ${filter === 'arduino' ? 'bg-primary text-white' : 'bg-white border'}`} onClick={() => setFilter('arduino')}>Arduino</button>
          </div>

          <div className="text-sm text-muted-foreground">{visible.length} projects</div>
        </div>

        <div className="projects-grid">
          {visible.map(p => (
            <article key={p.id} className="project-card hover:shadow-2xl" onClick={() => onProjectClick(p)}>
              <div className="project-img">
                <ProjectImage src={p.image || '/placeholder.svg'} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="project-info">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-muted-foreground mt-2">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    {p.technologies.map(t => <span key={t} className="skill mr-2">{t}</span>)}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href="#" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-primary"><Github /></a>
                    <a href="#" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-primary"><ExternalLink /></a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact">
        <h2 className="section-title">Get in touch</h2>
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">@</div>
              <div>
                <h3>Email</h3>
                <p>creativemindtechnology33@gmail.com</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">☎</div>
              <div>
                <h3>Phone</h3>
                <p>08148562484</p>
              </div>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebProjectsContent;