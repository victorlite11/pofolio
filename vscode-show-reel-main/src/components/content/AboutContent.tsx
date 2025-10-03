export const AboutContent = () => {
  return (
    <div className="space-y-6">
      <div className="font-code">
        <span className="syntax-comment">// About me</span>
        <br />
        <br />
        <span className="syntax-keyword">class</span> <span className="syntax-function">Developer</span> {"{"}
        <br />
        <span className="ml-4">
          <span className="syntax-keyword">constructor</span>() {"{"}
        </span>
        <br />
        <span className="ml-8">
          <span className="syntax-keyword">this</span>.<span className="syntax-variable">name</span> = <span className="syntax-string">'Your Name'</span>;
        </span>
        <br />
        <span className="ml-8">
          <span className="syntax-keyword">this</span>.<span className="syntax-variable">experience</span> = <span className="syntax-string">'5+ years'</span>;
        </span>
        <br />
        <span className="ml-8">
          <span className="syntax-keyword">this</span>.<span className="syntax-variable">location</span> = <span className="syntax-string">'Your Location'</span>;
        </span>
        <br />
        <span className="ml-4">{"}"}</span>
        <br />
        <br />
        <span className="ml-4">
          <span className="syntax-function">getPassion</span>() {"{"}
        </span>
        <br />
        <span className="ml-8">
          <span className="syntax-keyword">return</span> <span className="syntax-string">'Solving complex problems with elegant code'</span>;
        </span>
        <br />
        <span className="ml-4">{"}"}</span>
        <br />
        <br />
        <span className="ml-4">
          <span className="syntax-function">getGoals</span>() {"{"}
        </span>
        <br />
        <span className="ml-8">
          <span className="syntax-keyword">return</span> [
        </span>
        <br />
        <span className="ml-12">
          <span className="syntax-string">'Master new technologies'</span>,
        </span>
        <br />
        <span className="ml-12">
          <span className="syntax-string">'Build impactful software'</span>,
        </span>
        <br />
        <span className="ml-12">
          <span className="syntax-string">'Contribute to open source'</span>
        </span>
        <br />
        <span className="ml-8">];</span>
        <br />
        <span className="ml-4">{"}"}</span>
        <br />
        {"}"}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="text-xl font-bold mb-4 font-sans">Background</h3>
          <p className="text-muted-foreground font-sans">
            I'm a passionate developer with expertise in full-stack development, 
            desktop applications, and embedded systems. I love turning ideas into 
            reality through clean, efficient code.
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="text-xl font-bold mb-4 font-sans">Interests</h3>
          <ul className="space-y-2 text-muted-foreground font-sans">
            <li>• Web Development</li>
            <li>• Software Engineering</li>
            <li>• IoT & Arduino Projects</li>
            <li>• Open Source Contribution</li>
          </ul>
        </div>
      </div>
    </div>
  );
};