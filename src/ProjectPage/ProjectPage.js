import { Link } from 'react-router-dom';
import './ProjectPage.css';

function ProjectPage({ title, icon, fullBleed, children }) {
  return (
    <div className={`project-page${fullBleed ? ' full-bleed' : ''}`}>
      <div className="project-page-nav">
        <Link to="/" className="back-btn">← Back</Link>
        <span className="project-page-title">
          <span className="project-page-icon">{icon}</span>
          {title}
        </span>
      </div>
      <div className="project-page-body">
        {children}
      </div>
    </div>
  );
}

export default ProjectPage;
