import { useMemo, useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import CustomCursor from '../components/Cursor/CustomCursor';
import projectsData from '../data/projectsData.json';
import './ProjectDetailPage.css';

type Project = (typeof projectsData.projects)[number] & {
  pageTitle?: string;
  links?: { label: string; href: string }[];
};

function projectFromPath(): Project | undefined {
  const slug = window.location.pathname.split('/').filter(Boolean).at(1);
  return projectsData.projects.find(project => project.slug === slug);
}

export default function ProjectDetailPage() {
  const project = useMemo(() => projectFromPath(), []);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const prev = () => setActiveImageIndex(i => (i - 1 + (project?.images.length ?? 1)) % (project?.images.length ?? 1));
  const next = () => setActiveImageIndex(i => (i + 1) % (project?.images.length ?? 1));

  if (!project) {
    return (
      <main className="project-page project-page-not-found">
        <CustomCursor />
        <button className="project-page-back" onClick={() => history.back()} aria-label="Back to projects">
          <FiArrowLeft aria-hidden="true" />
          <span>Back to projects</span>
        </button>
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

      <button className="project-page-back" onClick={() => history.back()} aria-label="Back to projects">
        <FiArrowLeft aria-hidden="true" />
        <span>Back to projects</span>
      </button>

      <section className="project-page-viewer" aria-labelledby="project-page-title">
        <div className="project-page-carousel" aria-label={`${project.title} image carousel`}>
          <figure className="project-page-carousel-frame">
            {project.images.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`${project.title} screen ${index + 1}`}
                className={index === activeImageIndex ? 'is-active' : ''}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}

            <div className="project-page-carousel-arrows">
              <button type="button" onClick={prev} aria-label="Previous image">
                <FiArrowLeft aria-hidden="true" />
              </button>
              <span className="project-page-carousel-count">
                {activeImageIndex + 1} / {project.images.length}
              </span>
              <button type="button" onClick={next} aria-label="Next image">
                <FiArrowRight aria-hidden="true" />
              </button>
            </div>
          </figure>
        </div>

        <div className="project-page-content">
          <div className="project-page-meta">
            <span>{project.index}</span>
            <span>{project.status}</span>
            <span>{project.category}</span>
          </div>

          <h1 id="project-page-title">{project.pageTitle ?? project.title}</h1>
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

          {project.links && project.links.length > 0 && (
            <div className="project-page-links">
              {project.links.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="project-page-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <FiArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
