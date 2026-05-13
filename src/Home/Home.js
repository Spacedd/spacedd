import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/spookyArty.svg';
import projects from '../projects';
import './Home.css';

const TAGS = ['all', 'game', 'visual', 'util'];

function Home() {
  const [activeTag, setActiveTag] = useState('all');

  const visible = activeTag === 'all'
    ? projects
    : projects.filter(p => p.tag === activeTag);

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <img src={logo} alt="Spacedd" className="hero-logo" />
        <h1 className="hero-title">my happy space(dd)</h1>
        <p className="hero-sub">
          A collection of interactive React projects — games, experiments,
          and demos built for fun and learning.
        </p>
        <div className="hero-stats">
          <span><strong>{projects.length}</strong> projects</span>
          <span><strong>React</strong> stack</span>
          <span><strong>Open</strong> source</span>
        </div>
      </section>

      {/* Filters */}
      <div className="filter-bar">
        {TAGS.map(tag => (
          <button
            key={tag}
            className={`filter-btn${activeTag === tag ? ' active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="project-grid">
        {visible.map(project => (
          <Link
            key={project.slug}
            to={`/${project.slug}`}
            className="project-card"
          >
            <div className="card-header">
              <span className="card-icon">{project.icon}</span>
              <span className="card-arrow">→</span>
            </div>
            <h2 className="card-title">{project.title}</h2>
            <p className="card-desc">{project.description}</p>
            <div className="card-footer">
              <span className="badge">{project.tag.charAt(0).toUpperCase() + project.tag.slice(1)}</span>
              <span className="card-tech">{project.tech}</span>
            </div>
          </Link>
        ))}
      </div>
    <footer className="site-footer">
        Built with React &nbsp;·&nbsp; Spacedd &nbsp;·&nbsp; 2024
      </footer>
    </main>
  );
}

export default Home;
