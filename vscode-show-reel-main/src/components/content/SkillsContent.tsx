export const SkillsContent = () => {
  const skillCategories = [
    {
      title: 'Frontend',
      skills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Next.js']
    },
    {
      title: 'Backend',
      skills: ['Node.js', 'Python', 'Express.js', 'REST APIs', 'GraphQL', 'PostgreSQL', 'MongoDB']
    },
    {
      title: 'Desktop Software',
      skills: ['Electron', 'Python Tkinter', 'C#/.NET', 'Java', 'Qt Framework']
    },
    {
      title: 'Arduino/IoT',
      skills: ['Arduino IDE', 'C/C++', 'ESP32', 'Raspberry Pi', 'Sensors', 'Circuit Design']
    },
    {
      title: 'Tools & Others',
      skills: ['Git', 'Docker', 'VS Code', 'Figma', 'Linux', 'AWS', 'Firebase']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="font-code">
        <span className="syntax-comment">// My technical skills</span>
        <br />
        <br />
        <span className="syntax-keyword">const</span> <span className="syntax-variable">skills</span> = {"{"}
        <br />
        <span className="ml-4">
          <span className="syntax-string">frontend</span>: [<span className="syntax-string">'React'</span>, <span className="syntax-string">'TypeScript'</span>, <span className="syntax-string">'Next.js'</span>],
        </span>
        <br />
        <span className="ml-4">
          <span className="syntax-string">backend</span>: [<span className="syntax-string">'Node.js'</span>, <span className="syntax-string">'Python'</span>, <span className="syntax-string">'PostgreSQL'</span>],
        </span>
        <br />
        <span className="ml-4">
          <span className="syntax-string">desktop</span>: [<span className="syntax-string">'Electron'</span>, <span className="syntax-string">'Python'</span>, <span className="syntax-string">'C#'</span>],
        </span>
        <br />
        <span className="ml-4">
          <span className="syntax-string">embedded</span>: [<span className="syntax-string">'Arduino'</span>, <span className="syntax-string">'C++'</span>, <span className="syntax-string">'ESP32'</span>]
        </span>
        <br />
        {"}"};
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {skillCategories.map((category) => (
          <div key={category.title} className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-bold mb-4 font-sans text-primary">
              {category.title}
            </h3>
            <div className="space-y-2">
              {category.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center space-x-2 p-2 bg-muted/50 rounded text-sm font-sans"
                >
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-border">
        <h3 className="text-xl font-bold mb-4 font-sans">Always Learning</h3>
        <p className="text-muted-foreground font-sans">
          Technology evolves rapidly, and I'm committed to continuous learning. 
          Currently exploring AI/ML integration, advanced React patterns, and IoT security.
        </p>
      </div>
    </div>
  );
};