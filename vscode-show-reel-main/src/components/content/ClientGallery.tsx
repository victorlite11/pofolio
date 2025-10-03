import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useProjects } from '@/lib/useProjects';
import ProjectImage from '@/components/ui/ProjectImage';
import ContactForm from './ContactForm';
import useEmblaCarousel from 'embla-carousel-react';

export const ClientGallery: React.FC<{ onProjectClick: (p: any) => void }> = ({ onProjectClick }) => {
  const { filtered, projects, isLoading } = useProjects({ category: 'all' });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'website' | 'software' | 'arduino'>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('fav_projects') || '{}');
    } catch {
      return {};
    }
  });
  const [lightbox, setLightbox] = useState<any>(null);

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (category === 'all' ? filtered : filtered.filter((p) => p.category === category)).filter((p) => {
      if (!s) return true;
      return p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.technologies.join(' ').toLowerCase().includes(s);
    });
  }, [filtered, search, category]);

  if (isLoading) return <div>Loading gallery...</div>;

  const featured = projects.filter((p) => (p as any).featured);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

  useEffect(() => {
    if (!emblaApi || featured.length <= 1) return;
    const t = setInterval(() => {
      emblaApi.scrollNext();
      setCarouselIndex((i) => (i + 1) % featured.length);
    }, 4000);
    return () => clearInterval(t);
  }, [emblaApi, featured.length]);

  useEffect(() => {
    try {
      localStorage.setItem('fav_projects', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const toggleFav = (id: string) => {
    setFavorites((s) => ({ ...s, [id]: !s[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-lg overflow-hidden">
        {featured.length > 0 ? (
          <div className="relative">
            {/* Embla carousel for featured images */}
            <div className="embla" ref={emblaRef}>
              <div className="embla__container flex">
                {featured.map((f, idx) => (
                  <div key={f.id} className="embla__slide min-w-full">
                    <ProjectImage src={f.image || '/placeholder.svg'} alt={f.name} className="w-full h-64 md:h-80 object-cover rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 flex items-end p-6">
              <div className="max-w-2xl bg-black/30 p-4 rounded-md shadow-lg">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white gradient-text">{featured[carouselIndex]?.name}</h2>
                <p className="text-sm text-white/90 mt-2 leading-relaxed">{featured[carouselIndex]?.description}</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => onProjectClick(featured[carouselIndex])} className="px-4 py-2 bg-white text-primary rounded shadow-sm hover:shadow-md transition">View Project</button>
                  {featured[carouselIndex]?.liveUrl && <a href={featured[carouselIndex].liveUrl} target="_blank" rel="noreferrer" className="px-4 py-2 border border-white/30 rounded text-white/90">Live site</a>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary/80 to-indigo-600 text-white rounded-lg p-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">Showcase — Selected work</h1>
              <p className="mt-2 text-sm opacity-90 max-w-xl">Beautiful, curated presentation of websites and software projects. Click any card to view code and details.</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button onClick={() => setCategory('all')} className={`px-4 py-2 rounded ${category === 'all' ? 'bg-white text-primary' : 'bg-white/10'}`}>All</button>
              <button onClick={() => setCategory('website')} className={`px-4 py-2 rounded ${category === 'website' ? 'bg-white text-primary' : 'bg-white/10'}`}>Websites</button>
              <button onClick={() => setCategory('software')} className={`px-4 py-2 rounded ${category === 'software' ? 'bg-white text-primary' : 'bg-white/10'}`}>Software</button>
              <button onClick={() => setCategory('arduino')} className={`px-4 py-2 rounded ${category === 'arduino' ? 'bg-white text-primary' : 'bg-white/10'}`}>Arduino</button>
            </div>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects, tech, or descriptions..." className="flex-1 px-4 py-2 border rounded bg-card" />
        <div className="text-sm text-muted-foreground">{visible.length} results</div>
      </div>

      {/* Contact info and form */}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
          {/* Grid of project cards (existing) */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {visible.map((p) => (
              <div key={p.id} className="relative group project-card" onClick={() => onProjectClick(p)}>
                <div className="overflow-hidden rounded-t-lg relative">
                  <ProjectImage src={p.image || '/placeholder.svg'} alt={p.name} className="w-full h-44 md:h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
                  <button onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }} className={`favorite-button ${favorites[p.id] ? 'fav' : ''}`} aria-label="favorite">★</button>
                  {p.featured && <div className="ribbon">Featured</div>}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{p.description}</p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {p.technologies.slice(0, 3).map((t: string) => (
                      <span key={t} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="md:col-span-1 space-y-4">
          <div className="bg-card p-4 rounded border border-border">
            <h4 className="font-semibold">Contact</h4>
            <p className="text-sm text-muted-foreground mt-2">Phone: <a href="tel:08148562484" className="text-primary">08148562484</a></p>
            <p className="text-sm text-muted-foreground">Email: <a href="mailto:creativemindtechnology33@gmail.com" className="text-primary">creativemindtechnology33@gmail.com</a></p>
            <p className="text-sm text-muted-foreground mt-3">Prefer to send a message? Use the form below and I'll get back to you.</p>
          </div>

          <ContactForm />
        </aside>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visible.map((p) => (
          <div key={p.id} className="relative group project-card" onClick={() => onProjectClick(p)}>
            <div className="overflow-hidden rounded-t-lg relative">
              <ProjectImage src={p.image || '/placeholder.svg'} alt={p.name} className="w-full h-44 md:h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
              <button onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }} className={`favorite-button ${favorites[p.id] ? 'fav' : ''}`} aria-label="favorite">★</button>
              {p.featured && <div className="ribbon">Featured</div>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{p.description}</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                {p.technologies.slice(0, 3).map((t: string) => (
                  <span key={t} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">{t}</span>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
              <div className="p-4 w-full transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white">View →</div>
                  <div className="flex gap-2">
                    {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="px-3 py-1 bg-white/10 rounded text-white text-xs">Live</a>}
                    {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="px-3 py-1 bg-white/10 rounded text-white text-xs">Repo</a>}
                    <button onClick={(e) => { e.stopPropagation(); setLightbox(p); }} className="px-3 py-1 bg-white/10 rounded text-white text-xs">Preview</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visible.length === 0 && <div className="text-center text-muted-foreground">No projects match your search.</div>}
    </div>
  );
};

export default ClientGallery;
