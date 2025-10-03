import { Mail, Github, Linkedin, Phone, MapPin } from 'lucide-react';

export const ContactContent = () => {
  return (
    <div className="space-y-6">
      <div className="font-code">
        <span className="syntax-comment">// Get in touch</span>
        <br />
        <br />
        <span className="syntax-keyword">const</span> <span className="syntax-variable">contact</span> = {"{"}
        <br />
        <span className="ml-4">
          <span className="syntax-string">email</span>: <span className="syntax-string">"your.email@example.com"</span>,
        </span>
        <br />
        <span className="ml-4">
          <span className="syntax-string">github</span>: <span className="syntax-string">"github.com/yourusername"</span>,
        </span>
        <br />
        <span className="ml-4">
          <span className="syntax-string">linkedin</span>: <span className="syntax-string">"linkedin.com/in/yourprofile"</span>,
        </span>
        <br />
        <span className="ml-4">
          <span className="syntax-string">availability</span>: <span className="syntax-string">"Open for opportunities"</span>
        </span>
        <br />
        {"}"};
        <br />
        <br />
        <span className="syntax-comment">// Let's collaborate!</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold font-sans">Let's Connect</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <Mail className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-semibold font-sans">Email</h4>
                <p className="text-sm text-muted-foreground">your.email@example.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <Github className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-semibold font-sans">GitHub</h4>
                <p className="text-sm text-muted-foreground">github.com/yourusername</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <Linkedin className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-semibold font-sans">LinkedIn</h4>
                <p className="text-sm text-muted-foreground">linkedin.com/in/yourprofile</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <Phone className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-semibold font-sans">Phone</h4>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <MapPin className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-semibold font-sans">Location</h4>
                <p className="text-sm text-muted-foreground">Your City, Country</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold font-sans">Send a Message</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium font-sans mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium font-sans mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium font-sans mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                placeholder="Project collaboration"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium font-sans mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-sans resize-none"
                placeholder="Tell me about your project or idea..."
              ></textarea>
            </div>
            
            <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-sans font-medium">
              Send Message
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-border">
        <h3 className="text-xl font-bold mb-4 font-sans">Open to Opportunities</h3>
        <p className="text-muted-foreground font-sans mb-4">
          I'm always interested in discussing new projects, creative ideas, or opportunities to be part of your visions.
          Whether you're looking for a developer, collaborator, or just want to chat about technology, feel free to reach out!
        </p>
        <div className="flex flex-wrap gap-4">
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-sans">
            Freelance Projects
          </span>
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-sans">
            Full-time Roles
          </span>
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-sans">
            Collaboration
          </span>
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-sans">
            Mentoring
          </span>
        </div>
      </div>
    </div>
  );
};