import { useEffect, useState } from 'react';
import { FiArrowLeft, FiArrowUpRight } from 'react-icons/fi';
import CustomCursor from '../components/Cursor/CustomCursor';
import projectsData from '../data/projectsData.json';
import './ProjectDetailPage.css';

type Project = (typeof projectsData.projects)[number];

function projectFromPath(): Project | undefined {
  const slug = window.location.pathname.split('/').filter(Boolean).at(1);
  return projectsData.projects.find(project => project.slug === slug);
}

export default function ProjectDetailPage() {
  const project = projectFromPath();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!project || project.images.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveImageIndex(index => (index + 1) % project.images.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [project]);

  if (!project) {
    return (
      <main className="project-page project-page-not-found">
        <CustomCursor />
        <a className="project-page-back" href="/#projects" aria-label="Back to work">
          <FiArrowLeft aria-hidden="true" />
          <span>Back to work</span>
        </a>
        <section>
          <p>Project not found</p>
          <h1>This work item is not available yet.</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="project-page">
      <CustomCursor />

      <a className="project-page-back" href="/#projects" aria-label="Back to work">
        <FiArrowLeft aria-hidden="true" />
        <span>Back to work</span>
      </a>

      <section className="project-page-viewer" aria-labelledby="project-page-title">
        <div className="project-page-carousel" aria-label={`${project.title} image carousel`}>
          <figure className="project-page-carousel-frame">
            {project.images.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`${project.title} screen ${index + 1}`}
                className={index === activeImageIndex ? 'is-active' : ''}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}

            <div className="project-page-carousel-dots" aria-label="Project images">
              {project.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={index === activeImageIndex ? 'is-active' : ''}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === activeImageIndex}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </div>
          </figure>
        </div>

        <div className="project-page-content">
          <div className="project-page-meta">
            <span>{project.index}</span>
            <span>{project.status}</span>
            <span>{project.category}</span>
          </div>

          <h1 id="project-page-title">{project.title}</h1>
          <p className="project-page-lead">{project.body}</p>

          <div className="project-page-tags" aria-label={`${project.title} technologies`}>
            {project.tags.map(tag => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="project-page-description">
            {project.description.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="project-page-highlights" aria-label="Project highlights">
            {project.highlights.map(highlight => (
              <span key={highlight}>
                <FiArrowUpRight aria-hidden="true" />
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
