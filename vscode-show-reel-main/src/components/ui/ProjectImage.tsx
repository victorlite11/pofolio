import React from 'react';
import ResponsiveImage from './ResponsiveImage';

type ProjectImageProps = {
  src?: string;
  alt?: string;
  className?: string;
};

export const ProjectImage: React.FC<ProjectImageProps> = ({ src, alt = '', className }) => {
  if (!src) return <img src="/placeholder.svg" alt={alt} className={className} />;
  try {
    const url = new URL(src, 'http://example.com');
    // If path contains lovable-uploads, treat as local user upload with responsive variants
    if (url.pathname.startsWith('/lovable-uploads/')) {
      const base = url.pathname.replace(/^\/lovable-uploads\//, '/lovable-uploads/').replace(/\.\w+$/, '');
      return <ResponsiveImage basePath={base} alt={alt} className={className} />;
    }
  } catch (e) {
    // fall through
  }
  return <img src={src} alt={alt} className={className} />;
};

export default ProjectImage;
