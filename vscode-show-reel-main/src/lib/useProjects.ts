import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export type ProjectCategory = 'website' | 'software' | 'arduino';

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  technologies: string[];
  codeSnippet?: string;
  image?: string;
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
}

const LOCAL_KEY = 'portfolio_projects_v1';

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function fetchProjectsFromPublic() {
  // prefer API when configured
  if (API_BASE) {
    try {
      const token = localStorage.getItem('admin_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/projects`, { headers });
      if (res.ok) {
        return (await res.json()) as ProjectData[];
      }
      // fallthrough to static file
    } catch (e) {
      // ignore and fallback
    }
  }

  try {
    const res = await fetch('/data/projects.json');
    if (!res.ok) throw new Error('Failed to load projects.json');
    const data = await res.json();
    return data as ProjectData[];
  } catch (err) {
    // If fetch fails (dev server offline), try localStorage fallback
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw) as ProjectData[];
    return [] as ProjectData[];
  }
}

export function useProjects(query?: { search?: string; category?: ProjectCategory | 'all' }) {
  const qc = useQueryClient();

  const projectsQuery = useQuery<ProjectData[]>({
    queryKey: ['projects'],
    queryFn: fetchProjectsFromPublic,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const projects = projectsQuery.data ?? [];

  const filtered = useMemo(() => {
    const s = query?.search?.toLowerCase() ?? '';
    const cat = query?.category ?? 'all';
    return projects.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!s) return true;
      return (
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.technologies.join(' ').toLowerCase().includes(s)
      );
    });
  }, [projects, query?.search, query?.category]);

  // Simple local mutations that persist to localStorage and invalidate query
  const persist = (items: ProjectData[]) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
    qc.setQueryData(['projects'], items);
  };

  const addProject = (p: ProjectData) => {
    if (API_BASE) {
      // try server create
      const token = localStorage.getItem('admin_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify(p),
      })
        .then((r) => r.json())
  .then(() => qc.invalidateQueries({ queryKey: ['projects'] }))
        .catch(() => {
          const next = [...projects, p];
          persist(next);
        });
    } else {
      const next = [...projects, p];
      persist(next);
    }
  };

  const updateProject = (id: string, patch: Partial<ProjectData>) => {
    if (API_BASE) {
      const token = localStorage.getItem('admin_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`${API_BASE}/api/projects/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(patch),
      })
        .then((r) => r.json())
  .then(() => qc.invalidateQueries({ queryKey: ['projects'] }))
        .catch(() => {
          const next = projects.map((p) => (p.id === id ? { ...p, ...patch } : p));
          persist(next);
        });
    } else {
      const next = projects.map((p) => (p.id === id ? { ...p, ...patch } : p));
      persist(next);
    }
  };

  const removeProject = (id: string) => {
    if (API_BASE) {
  const token = localStorage.getItem('admin_token');
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  fetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE', headers })
        .then((r) => r.json())
  .then(() => qc.invalidateQueries({ queryKey: ['projects'] }))
        .catch(() => {
          const next = projects.filter((p) => p.id !== id);
          persist(next);
        });
    } else {
      const next = projects.filter((p) => p.id !== id);
      persist(next);
    }
  };

  return {
    ...projectsQuery,
    projects,
    filtered,
    addProject,
    updateProject,
    removeProject,
  };
}
