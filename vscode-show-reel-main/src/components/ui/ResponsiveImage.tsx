import React from 'react';

type ResponsiveImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  // basePath should be the path without extension and width suffix; e.g. '/lovable-uploads/victorlight'
  basePath: string;
  alt: string;
  sizes?: string;
};

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ basePath, alt, sizes = '(max-width: 640px) 320px, (max-width: 1024px) 640px, 1280px', className, ...imgProps }) => {
  const jpegSrc = `${basePath}-640w.jpeg`;
  const jpegSrcSet = `${basePath}-320w.jpeg 320w, ${basePath}-640w.jpeg 640w, ${basePath}-1280w.jpeg 1280w, ${basePath}@2x.jpeg 2x`;
  const webpSrcSet = `${basePath}-320w.webp 320w, ${basePath}-640w.webp 640w, ${basePath}-1280w.webp 1280w`;
  const webpFallback = `${basePath}.webp`;

  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img src={jpegSrc} srcSet={jpegSrcSet} sizes={sizes} alt={alt} className={className} {...imgProps} />
    </picture>
  );
};

export default ResponsiveImage;
