import React from 'react';
import ClientGallery from '@/components/content/ClientGallery';
import { useNavigate } from 'react-router-dom';

const ClientPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground">← Back</button>
      <div className="mt-4">
        <ClientGallery onProjectClick={(p) => navigate(`/projects/${p.id}`)} />
      </div>
    </div>
  );
};

export default ClientPage;
