import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SkillsProps {
  currentView: 'client' | 'dev';
}

export function Skills({ currentView }: SkillsProps) {
  const skillCategories = [
    {
      title: "Frontend",
      skills: [
        { name: "React", level: 95 },
        { name: "TypeScript", level: 90 },
        { name: "Next.js", level: 85 },
        { name: "Tailwind CSS", level: 90 },
        { name: "Vue.js", level: 80 }
      ]
    },
    {
      title: "Backend",
      skills: [
        { name: "Node.js", level: 90 },
        { name: "Python", level: 85 },
        { name: "PostgreSQL", level: 80 },
        { name: "MongoDB", level: 85 },
        { name: "GraphQL", level: 75 }
      ]
    },
    {
      title: "Tools & DevOps",
      skills: [
        { name: "Git", level: 95 },
        { name: "Docker", level: 80 },
        { name: "AWS", level: 75 },
        { name: "Vercel", level: 90 },
        { name: "Firebase", level: 85 }
      ]
    },
    {
      title: "Arduino, Robotics & Sensors",
      skills: [
        { name: "Arduino Programming", level: 95 },
        { name: "Robotics Design", level: 90 },
        { name: "Sensor Integration", level: 92 },
        { name: "Embedded C/C++", level: 88 }
      ]
    }
  ];

  const technologies = [
    "React", "TypeScript", "Node.js", "Python", "Next.js", 
    "Tailwind CSS", "PostgreSQL", "MongoDB", "Docker", "AWS",
    "GraphQL", "Redux", "Vue.js", "Express", "Firebase"
  ];

  if (currentView === 'dev') {
    return (
      <section className="py-16">
        <div className="font-code text-sm">
          <div className="text-vscode-text-dim mb-4">
            <span className="text-vscode-accent">40</span>{" "}
            <span className="text-gray-400">// Skills & Technologies</span>
          </div>
          <div className="text-vscode-text-dim mb-4">
            <span className="text-vscode-accent">41</span>{" "}
            <span className="text-purple-400">interface</span>{" "}
            <span className="text-yellow-300">Developer</span>{" "}
            <span className="text-white">{"{"}</span>
          </div>
          <div className="ml-8 space-y-2">
            <div>
              <span className="text-vscode-accent">42</span>{" "}
              <span className="text-blue-300">frontend</span>
              <span className="text-white">:</span>{" "}
              <span className="text-white">[</span>
              <span className="text-green-300">'React'</span>
              <span className="text-white">,</span>{" "}
              <span className="text-green-300">'TypeScript'</span>
              <span className="text-white">,</span>{" "}
              <span className="text-green-300">'Next.js'</span>
              <span className="text-white">];</span>
            </div>
            <div>
              <span className="text-vscode-accent">43</span>{" "}
              <span className="text-blue-300">backend</span>
              <span className="text-white">:</span>{" "}
              <span className="text-white">[</span>
              <span className="text-green-300">'Node.js'</span>
              <span className="text-white">,</span>{" "}
              <span className="text-green-300">'Python'</span>
              <span className="text-white">,</span>{" "}
              <span className="text-green-300">'PostgreSQL'</span>
              <span className="text-white">];</span>
            </div>
            <div>
              <span className="text-vscode-accent">44</span>{" "}
              <span className="text-blue-300">devops</span>
              <span className="text-white">:</span>{" "}
              <span className="text-white">[</span>
              <span className="text-green-300">'Docker'</span>
              <span className="text-white">,</span>{" "}
              <span className="text-green-300">'AWS'</span>
              <span className="text-white">,</span>{" "}
              <span className="text-green-300">'Git'</span>
              <span className="text-white">];</span>
            </div>
            <div>
              <span className="text-vscode-accent">45</span>{" "}
              <span className="text-blue-300">experience</span>
              <span className="text-white">:</span>{" "}
              <span className="text-orange-400">5</span>
              <span className="text-white">;</span>{" "}
              <span className="text-gray-400">// years</span>
            </div>
          </div>
          <div>
            <span className="text-vscode-accent">46</span>{" "}
            <span className="text-white">{"}"}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
  <section id="skills" className="py-16 sm:py-24 px-2 sm:px-6">
  <div className="max-w-7xl mx-auto">
  <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Skills & <span className="gradient-text">Technologies</span>
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive toolkit built through years of experience in modern web development.
          </p>
        </div>

        {/* Skill Categories with Progress Bars */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 sm:mb-16">
          {skillCategories.map((category, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center">{category.title}</h3>
                <div className="space-y-4">
                  {category.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Tags */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8">Technologies I Work With</h3>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {technologies.map((tech) => (
              <Badge 
                key={tech} 
                variant="secondary" 
                className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}