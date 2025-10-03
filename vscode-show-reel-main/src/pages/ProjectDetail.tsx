import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useProjects } from '@/lib/useProjects';
import { Helmet } from 'react-helmet-async';
import ProjectImage from '@/components/ui/ProjectImage';
import { getAbsoluteUrl } from '@/lib/utils';

export default function ProjectDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { projects, isLoading } = useProjects();

  if (isLoading) return <div className="p-6">Loading...</div>;
  const project = projects.find((p) => p.id === id);
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <div className="p-6">
      <Helmet>
        <title>{project.name} — Portfolio</title>
        <meta name="description" content={project.description} />
        {/* Prefer a configured base URL for canonical/og urls (VITE_PUBLIC_BASE_URL); fall back to current location */}
        {(() => {
          const envBase = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_PUBLIC_BASE_URL;
          const base = envBase || (typeof window !== 'undefined' && window.location ? window.location.origin : undefined);
          const pageUrl = base ? (base.replace(/\/$/, '') + location.pathname) : (typeof window !== 'undefined' ? window.location.href : location.pathname);
          return <link rel="canonical" href={pageUrl} />;
        })()}

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={project.name} />
        <meta property="og:description" content={project.description} />
        {project.image && <meta property="og:image" content={getAbsoluteUrl(project.image)} />}
        {(() => {
          const envBase = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_PUBLIC_BASE_URL;
          const base = envBase || (typeof window !== 'undefined' && window.location ? window.location.origin : undefined);
          const pageUrl = base ? (base.replace(/\/$/, '') + location.pathname) : (typeof window !== 'undefined' ? window.location.href : location.pathname);
          return <meta property="og:url" content={pageUrl} />;
        })()}

        {/* Twitter */}
        <meta name="twitter:card" content={project.image ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={project.name} />
        <meta name="twitter:description" content={project.description} />
        {project.image && <meta name="twitter:image" content={getAbsoluteUrl(project.image)} />}
      </Helmet>
      <Link to="/client" className="text-sm text-muted-foreground">← Back to gallery</Link>
      <div className="mt-4 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ProjectImage src={project.image || '/placeholder.svg'} alt={project.name} className="w-full h-80 object-cover rounded" />
          <h1 className="text-2xl font-bold mt-4">{project.name}</h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
          <div className="mt-4">
            <h4 className="font-semibold">Code</h4>
            <pre className="mt-2 p-4 bg-card rounded text-sm overflow-auto">{project.codeSnippet}</pre>
          </div>
        </div>
        <aside className="p-4 border rounded">
          <h4 className="font-semibold">Details</h4>
          <p className="mt-2">Category: {project.category}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <span key={t} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{t}</span>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-primary text-primary-foreground rounded text-center">View Live</a>}
            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded text-center">View Repo</a>}
          </div>
        </aside>
      </div>
    </div>
  );
}
