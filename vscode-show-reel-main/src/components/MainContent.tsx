import { HomeContent } from './content/HomeContent';
import { AboutContent } from './content/AboutContent';
import { SkillsContent } from './content/SkillsContent';
import { ProjectsContent } from './content/ProjectsContent';
import { WebProjectsContent } from './content/WebProjectsContent';
import { SoftwareProjectsContent } from './content/SoftwareProjectsContent';
import { ArduinoProjectsContent } from './content/ArduinoProjectsContent';
import { ContactContent } from './content/ContactContent';
import { DashboardContent } from './content/DashboardContent';
import { ClientGallery } from './content/ClientGallery';
import { DeveloperContent } from './content/DeveloperContent';
import { ProjectData } from './VSCodeLayout';

interface MainContentProps {
  activeFile: string;
  onProjectClick: (project: ProjectData) => void;
}

export const MainContent = ({ activeFile, onProjectClick }: MainContentProps) => {
  const renderContent = () => {
    switch (activeFile) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'Client':
        return <ClientGallery onProjectClick={onProjectClick} />;
      case 'Developer':
        return <DeveloperContent />;
      case 'Home.tsx':
        return <HomeContent />;
      case 'About.tsx':
        return <AboutContent />;
      case 'Skills.tsx':
        return <SkillsContent />;
      case 'Projects.tsx':
        return <ProjectsContent onProjectClick={onProjectClick} />;
      case 'WebProjects.tsx':
        return <WebProjectsContent onProjectClick={onProjectClick} />;
      case 'SoftwareProjects.tsx':
        return <SoftwareProjectsContent onProjectClick={onProjectClick} />;
      case 'ArduinoProjects.tsx':
        return <ArduinoProjectsContent onProjectClick={onProjectClick} />;
      case 'Contact.tsx':
        return <ContactContent />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};