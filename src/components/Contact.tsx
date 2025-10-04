import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ContactProps {
  currentView: 'client' | 'dev';
}

export function Contact({ currentView }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senderType: 'individual',
    companyName: '',
    position: '',
    message: ''
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const MAX_SIZE = Number(import.meta.env.VITE_MAX_ATTACHMENT_SIZE || 5 * 1024 * 1024); // 5MB
  const ALLOWED = (import.meta.env.VITE_ALLOWED_MIME || 'image/png,image/jpeg,image/webp,application/pdf').split(',');
  const { toast } = useToast();

  useEffect(() => {
    // Auto voice prompt on page load if supported.
    // Wait briefly and avoid speaking if another prompt is already playing to prevent overlap.
    try {
      const msg = `Welcome to Creative Mind Technology. If you'd like to send a message, fill out the contact form. You can send as an individual, company, or organization.`;
      const synth = window.speechSynthesis;
      if (synth) {
        const speakNow = () => {
          try {
            const utter = new SpeechSynthesisUtterance(msg);
            utter.rate = 1;
            synth.speak(utter);
          } catch (err) {
            // ignore
          }
        };

        // If something else is speaking, poll until it's finished (short timeout), then speak.
        if (synth.speaking) {
          let attempts = 0;
          const maxAttempts = 50; // ~7.5s max wait
          const timer = setInterval(() => {
            attempts++;
            if (!synth.speaking || attempts >= maxAttempts) {
              clearInterval(timer);
              // give a tiny extra gap to avoid abrupt overlap
              setTimeout(speakNow, 300);
            }
          }, 150);
        } else {
          // small delay so other mount-time prompts can start first
          setTimeout(speakNow, 600);
        }
      }
    } catch (e) {
      // ignore if not supported or blocked
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = (import.meta.env.DEV ? 'http://localhost:4000' : '') + '/api/contact';
      let res;
      if (attachment) {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));
        fd.append('attachment', attachment, attachment.name);
        res = await fetch(url, { method: 'POST', body: fd });
      } else {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      const data = await res.json();
      if (res.ok) {
          toast({ title: 'Message sent!', description: data.message || 'Thank you — I will respond soon.' });
        setFormData({ name: '', email: '', senderType: 'individual', companyName: '', position: '', message: '' });
        setAttachment(null);
      } else {
        toast({ title: 'Send failed', description: data.error || 'Unable to send message right now.' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Network error', description: 'Could not reach the mail server.' });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "creativemindtechnology33@gmail.com",
      href: "mailto:creativemindtechnology33@gmail.com"
    },
    {
      icon: Mail,
      label: "Email",
      value: "codexcmt983@gmail.com",
      href: "mailto:codexcmt983@gmail.com"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "08148562484",
      href: "tel:08148562484"
    },
    {
      icon: Phone,
      label: "WhatsApp",
      value: "07089758476",
      href: "https://wa.me/2347089758476"
    }
  ];

  if (currentView === 'dev') {
    return (
      <section className="py-16">
        <div className="font-code text-sm">
          <div className="text-vscode-text-dim mb-4">
            <span className="text-vscode-accent">50</span>{" "}
            <span className="text-gray-400">// Contact Information</span>
          </div>
          <div className="text-vscode-text-dim mb-4">
            <span className="text-vscode-accent">51</span>{" "}
            <span className="text-purple-400">const</span>{" "}
            <span className="text-blue-300">contact</span>{" "}
            <span className="text-white">=</span>{" "}
            <span className="text-white">{"{"}</span>
          </div>
          <div className="ml-8 space-y-2">
            <div>
              <span className="text-vscode-accent">52</span>{" "}
              <span className="text-blue-300">email</span>
              <span className="text-white">:</span>{" "}
              <span className="text-green-300">['creativemindtechnology33@gmail.com', 'codexcmt983@gmail.com']</span>
              <span className="text-white">,</span>
            </div>
            <div>
              <span className="text-vscode-accent">53</span>{" "}
              <span className="text-blue-300">phone</span>
              <span className="text-white">:</span>{" "}
              <span className="text-green-300">['08148562484', '07089758476 (WhatsApp)']</span>
              <span className="text-white">,</span>
            </div>
            <div>
              <span className="text-vscode-accent">54</span>{" "}
              <span className="text-blue-300">availability</span>
              <span className="text-white">:</span>{" "}
              <span className="text-green-300">'Open for new projects'</span>
              <span className="text-white">,</span>
            </div>
            <div>
              <span className="text-vscode-accent">55</span>{" "}
              <span className="text-blue-300">response_time</span>
              <span className="text-white">:</span>{" "}
              <span className="text-green-300">'Within 24 hours'</span>
            </div>
          </div>
          <div>
            <span className="text-vscode-accent">56</span>{" "}
            <span className="text-white">{"}"}</span>
            <span className="text-white">;</span>
          </div>
        </div>
      </section>
    );
  }

  return (
  <section id="contact" className="py-16 sm:py-24 px-2 sm:px-6 bg-muted/30">
  <div className="max-w-7xl mx-auto">
  <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Let's Work <span className="gradient-text">Together</span>
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to bring your ideas to life? I'm currently available for new projects 
            and would love to discuss how we can collaborate.
          </p>
        </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <p className="text-muted-foreground mb-6">
                Whether you have a project in mind or just want to say hello, 
                I'm always excited to connect with fellow innovators.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="card-hover">
                  <CardContent className="p-4">
                    <a href={info.href} className="flex items-center space-x-4 group">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-glow transition-colors">
                        <info.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{info.label}</div>
                        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {info.value}
                        </div>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Response Time:</strong> I typically respond to messages within 24 hours.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="card-hover">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    value={formData.senderType}
                    onChange={(e) => setFormData({ ...formData, senderType: e.target.value })}
                    className="w-full p-2 rounded border bg-card"
                    aria-label="Sender type"
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="organization">Organization</option>
                    <option value="agent">Agent / Recruiter</option>
                  </select>

                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />

                  {formData.senderType !== 'individual' ? (
                    <Input
                      placeholder="Company / Organization"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  ) : (
                    <Input placeholder="Position (optional)" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                  )}
                </div>

                <div>
                  <Textarea
                    placeholder="Tell me about your project..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Attachment (optional)</label>
                  <input
                    type="file"
                    accept={ALLOWED.join(',')}
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                      if (!f) { setAttachment(null); return; }
                      if (!ALLOWED.includes(f.type)) {
                        toast({ title: 'Invalid file type', description: 'Allowed: ' + ALLOWED.join(', ') });
                        e.currentTarget.value = '';
                        return;
                      }
                      if (f.size > MAX_SIZE) {
                        toast({ title: 'File too large', description: `Max size is ${Math.round(MAX_SIZE / 1024 / 1024)} MB.` });
                        e.currentTarget.value = '';
                        return;
                      }
                      setAttachment(f);
                    }}
                    className="w-full"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}