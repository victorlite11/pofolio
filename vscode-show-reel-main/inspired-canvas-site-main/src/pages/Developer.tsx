import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Developer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-4xl space-y-8">
          
          {/* Profile Card */}
          <Card className="bg-card text-card-foreground rounded-2xl border shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">VD</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Victor Developer
              </h1>
              <p className="text-muted-foreground mb-6">
                Full-Stack Developer & UI/UX Designer
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="default" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Skills Card */}
            <Card className="bg-card text-card-foreground rounded-2xl border shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">React & TypeScript</span>
                    <div className="w-16 h-2 bg-muted rounded-full">
                      <div className="w-14 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Node.js & APIs</span>
                    <div className="w-16 h-2 bg-muted rounded-full">
                      <div className="w-12 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">UI/UX Design</span>
                    <div className="w-16 h-2 bg-muted rounded-full">
                      <div className="w-13 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Work Card */}
            <Card className="bg-card text-card-foreground rounded-2xl border shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Work</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">Portfolio Website</h3>
                      <p className="text-xs text-muted-foreground">Interactive role-based experience</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">E-Commerce App</h3>
                      <p className="text-xs text-muted-foreground">React + Node.js full-stack</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">Mobile Dashboard</h3>
                      <p className="text-xs text-muted-foreground">React Native analytics app</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-card text-card-foreground rounded-2xl border shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default">
                  View Full Portfolio
                </Button>
                <Button variant="outline">
                  Download Resume
                </Button>
                <Button variant="outline">
                  Schedule Call
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Developer;