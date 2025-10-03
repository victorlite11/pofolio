export interface SocialLink {
  key: string;
  label: string;
  url: string;
}

const socialLinks: SocialLink[] = [
  { key: 'github', label: 'GitHub', url: 'https://github.com/creativemindtech' },
  { key: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/creativemindtech' },
  { key: 'twitter', label: 'Twitter', url: 'https://twitter.com/creativemindtech' },
  { key: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/2347089758476' },
  { key: 'email', label: 'Email', url: 'mailto:creativemindtechnology33@gmail.com' },
  { key: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@codex4507?_t=ZS-90DwPlBNU0t&_r=1' },
];

export default socialLinks;
