import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProjects, ProjectData } from '@/lib/useProjects';

const ProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  category: z.enum(['website', 'software', 'arduino']),
  technologies: z.string().optional(),
  codeSnippet: z.string().optional(),
  featured: z.boolean().optional(),
});

type FormValues = z.infer<typeof ProjectSchema>;

export default function Admin() {
  const { projects, addProject, updateProject, removeProject, isLoading } = useProjects();
  const [editing, setEditing] = useState<ProjectData | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(ProjectSchema),
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!editing) reset();
    else
      reset({
        id: editing.id,
        name: editing.name,
        description: editing.description,
        category: editing.category,
        technologies: editing.technologies?.join(', '),
        codeSnippet: editing.codeSnippet,
        featured: !!editing.featured,
      });
  }, [editing]);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    setToken(t);
  }, []);

  const onSubmit = (data: FormValues) => {
    const payload: ProjectData = {
      id: data.id || crypto.randomUUID(),
      name: data.name,
      description: data.description || '',
      category: data.category,
      technologies: data.technologies ? data.technologies.split(',').map((s) => s.trim()) : [],
      codeSnippet: data.codeSnippet,
      featured: !!data.featured,
    };

    const doSave = async (imageUrl?: string) => {
      const withImage = { ...payload, image: imageUrl } as ProjectData;
      if (editing) {
        updateProject(editing.id, withImage);
      } else {
        addProject(withImage);
      }
      setEditing(null);
    };

    if (file) {
      // upload file
      const base = import.meta.env.VITE_API_BASE || '';
      const token = localStorage.getItem('admin_token');
      const form = new FormData();
      form.append('file', file);
      fetch(`${base}/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      })
        .then((r) => r.json())
        .then((json) => doSave(json.url))
        .catch(() => doSave(undefined));
    } else {
      doSave(undefined);
    }
  };

  const doLogin = async (password: string) => {
    try {
      const base = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${base}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!res.ok) throw new Error('Login failed');
      const json = await res.json();
      localStorage.setItem('admin_token', json.token);
      setToken(json.token);
    } catch (e) {
      alert('Login failed');
    }
  };

  const doLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Admin</h2>
        {token ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Logged in</span>
            <button onClick={doLogout} className="px-3 py-1 border rounded">Logout</button>
          </div>
        ) : null}
      </div>

      {!token ? (
        <LoginPanel onLogin={doLogin} />
      ) : (
        <>
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-xl">
              <input {...register('id')} type="hidden" />
              <div>
                <label className="block text-sm">Name</label>
                <input {...register('name')} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea {...register('description')} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm">Category</label>
                <select {...register('category')} className="w-full px-3 py-2 border rounded">
                  <option value="website">Website</option>
                  <option value="software">Software</option>
                  <option value="arduino">Arduino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Technologies (comma separated)</label>
                <input {...register('technologies')} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm">Code Snippet</label>
                <textarea {...register('codeSnippet')} className="w-full px-3 py-2 border rounded" rows={6} />
              </div>
              <div>
                <label className="block text-sm">Image (optional)</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex items-center gap-2">
                <input {...register('featured')} type="checkbox" />
                <label className="text-sm">Featured (show in hero)</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded">Save</button>
                <button type="button" onClick={() => { setEditing(null); reset(); }} className="px-4 py-2 border rounded">Clear</button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Existing Projects</h3>
            {isLoading && <div>Loading...</div>}
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              {projects.map((p) => (
                <div key={p.id} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-muted-foreground">{p.category}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(p)} className="px-2 py-1 border rounded">Edit</button>
                      <button onClick={() => removeProject(p.id)} className="px-2 py-1 border rounded text-red-600">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LoginPanel({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState('');
  return (
    <div className="p-4 border rounded max-w-md">
      <h3 className="font-semibold mb-2">Admin Login</h3>
      <p className="text-sm text-muted-foreground mb-2">Enter admin password to receive a token.</p>
      <div className="flex gap-2">
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="flex-1 px-3 py-2 border rounded" />
        <button onClick={() => onLogin(password)} className="px-3 py-2 bg-primary text-primary-foreground rounded">Login</button>
      </div>
    </div>
  );
}
