import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VideosProps {
  currentView?: 'client' | 'dev';
}

// Replace these objects with your real YouTube data
const VIDEOS = [
  { id: 'dQw4w9WgXcQ', title: 'Intro to CreativeMind', desc: 'Quick intro to my channel and work' },
  { id: '3JZ_D3ELwOQ', title: 'Arduino Weather Station', desc: 'Building a multi-sensor Arduino weather station' },
  { id: 'M7lc1UVf-VE', title: 'Project Highlights', desc: 'Highlights from recent projects' },
];

export function Videos({ currentView = 'client' }: VideosProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<any>(null);

  const openVideo = (video: any) => {
    setActive(video);
    setOpen(true);
  };

  return (
    <section id="videos" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Videos</h3>
            <p className="text-muted-foreground">Recent videos from my YouTube channel.</p>
          </div>
          <div>
            <Badge variant="secondary">YouTube</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.map((v) => (
            <div key={v.id} className="group bg-card rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
              <div className="relative">
                <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={() => openVideo(v)} className="bg-black/50 hover:bg-black/60 text-white rounded-full p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 22v-20l18 10-18 10z" /></svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="font-semibold mb-1">{v.title}</div>
                <div className="text-sm text-muted-foreground mb-3">{v.desc}</div>
                <div className="flex items-center justify-between">
                  <Button size="sm" variant="ghost" onClick={() => openVideo(v)}>Watch</Button>
                  <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground">Open on YouTube →</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl w-[95vw]">
            <DialogHeader>
              <DialogTitle>{active?.title}</DialogTitle>
              <DialogDescription>{active?.desc}</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {active && (
                <div className="w-full h-[60vh] bg-black rounded overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${active.id}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={active.title}
                  />
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <DialogClose>
                <Button>Close</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

export default Videos;
