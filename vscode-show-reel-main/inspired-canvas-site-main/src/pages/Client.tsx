import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Calendar, CheckCircle, Zap, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Client = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Web Development",
      description: "Custom websites and web applications tailored to your business needs",
      price: "Starting at $2,500",
      features: ["Responsive Design", "SEO Optimized", "CMS Integration", "Analytics Setup"]
    },
    {
      title: "E-Commerce Solutions",
      description: "Complete online store setup with payment processing and inventory management",
      price: "Starting at $5,000",
      features: ["Payment Gateway", "Inventory System", "Order Management", "Mobile App"]
    },
    {
      title: "Consulting & Strategy",
      description: "Technical consultation and digital transformation strategy for your business",
      price: "$150/hour",
      features: ["Technical Audit", "Architecture Planning", "Team Training", "Ongoing Support"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Tech Startup Inc.",
      text: "Outstanding work! The team delivered exactly what we needed, on time and within budget.",
      rating: 5
    },
    {
      name: "Mike Chen",
      company: "E-Commerce Co.",
      text: "Our new platform increased sales by 40% in the first quarter. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="container mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Transform Your Business with Custom Technology
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            I help businesses leverage technology to grow, streamline operations, 
            and create exceptional digital experiences for their customers.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="default" size="lg" className="glow-primary">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Consultation
            </Button>
            <Button variant="outline" size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Get Quote
            </Button>
          </div>
        </section>

        {/* Why Choose Me */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Me</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="surface-card transition-smooth text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Quick turnaround times without compromising on quality. Your project launches on schedule.
                </p>
              </CardContent>
            </Card>
            
            <Card className="surface-card transition-smooth text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Reliable & Secure</h3>
                <p className="text-muted-foreground">
                  Built with security in mind and backed by ongoing support to ensure your solution stays strong.
                </p>
              </CardContent>
            </Card>
            
            <Card className="surface-card transition-smooth text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Client-Focused</h3>
                <p className="text-muted-foreground">
                  Your success is my priority. I work closely with you to understand and exceed your expectations.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Services & Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="surface-card transition-smooth hover:glow-primary">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="text-2xl font-bold text-primary mb-6">{service.price}</div>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Clients Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="surface-card transition-smooth">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-primary rounded-full mr-1"></div>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="surface-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h2>
              <p className="text-muted-foreground mb-6">
                Let's discuss how I can help transform your business with custom technology solutions.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="default" className="glow-primary">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Free Consultation
                </Button>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Client;