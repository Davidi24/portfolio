import { useEffect, useState } from 'react';
import { FiArrowLeft, FiArrowUpRight } from 'react-icons/fi';
import CustomCursor from '../components/Cursor/CustomCursor';
import experienceData from '../data/experienceData.json';
import './ExperienceDetailPage.css';

type Experience = (typeof experienceData.experiences)[number];

function experienceFromPath(): Experience | undefined {
  const slug = window.location.pathname.split('/').filter(Boolean).at(1);
  return experienceData.experiences.find(item => item.slug === slug);
}

export default function ExperienceDetailPage() {
  const experience = experienceFromPath();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!experience || experience.images.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveImageIndex(index => (index + 1) % experience.images.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [experience]);

  if (!experience) {
    return (
      <main className="experience-page experience-page-not-found">
        <CustomCursor />
        <a className="experience-page-back" href="/#experience" aria-label="Back to experience">
          <FiArrowLeft aria-hidden="true" />
          <span>Back to experience</span>
        </a>
        <section>
          <p>Experience not found</p>
          <h1>This experience item is not available yet.</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="experience-page">
      <CustomCursor />

      <a className="experience-page-back" href="/#experience" aria-label="Back to experience">
        <FiArrowLeft aria-hidden="true" />
        <span>Back to experience</span>
      </a>

      <section className="experience-page-viewer" aria-labelledby="experience-page-title">
        <div className="experience-page-carousel" aria-label={`${experience.title} image carousel`}>
          <figure className="experience-page-carousel-frame">
            {experience.images.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`${experience.title} visual ${index + 1}`}
                className={index === activeImageIndex ? 'is-active' : ''}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </figure>

          <div className="experience-page-carousel-controls" aria-label="Experience images">
            {experience.images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={index === activeImageIndex ? 'is-active' : ''}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={index === activeImageIndex}
                onClick={() => setActiveImageIndex(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="experience-page-content">
          <div className="experience-page-meta">
            <span>{experience.metric}</span>
            <span>{experience.period}</span>
            <span>{experience.label}</span>
          </div>

          <h1 id="experience-page-title">{experience.title}</h1>
          <p className="experience-page-lead">{experience.body}</p>

          <div className="experience-page-tools" aria-label={`${experience.title} tools`}>
            {experience.tools.map(tool => (
              <span key={tool}>{tool}</span>
            ))}
          </div>

          <div className="experience-page-description">
            {experience.description.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="experience-page-highlights" aria-label="Experience highlights">
            {experience.highlights.map(highlight => (
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
