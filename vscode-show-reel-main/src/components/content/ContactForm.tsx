import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Message sent — thank you!');
        setName(''); setEmail(''); setPhone(''); setMessage('');
      } else {
        setStatus(data.error || 'Failed to send message');
      }
    } catch (err) {
      setStatus('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-card p-4 rounded-md border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="px-3 py-2 rounded border bg-background" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" type="email" className="px-3 py-2 rounded border bg-background" required />
      </div>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="px-3 py-2 rounded border bg-background w-full" />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message" rows={5} className="w-full px-3 py-2 rounded border bg-background" required />
      <div className="flex items-center justify-between">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded">{loading ? 'Sending...' : 'Send Message'}</button>
        {status && <div className="text-sm text-muted-foreground">{status}</div>}
      </div>
    </form>
  );
};

export default ContactForm;
