import './ExperienceContainer.css';
import experienceData from '../../data/experienceData.json';

interface ExperienceItem {
  slug: string;
  bgLabel: string;
  period: string;
  title: string;
  label: string;
  metric: string;
  body: string;
  highlights: readonly string[];
  tools: readonly string[];
  employmentType?: string;
}

export const experiences = experienceData.experiences as readonly ExperienceItem[];

interface ExperienceContainerProps {
  activeIndex?: number;
}

export default function ExperienceContainer({ activeIndex = -1 }: ExperienceContainerProps) {
  return (
    <section className="experience-roadmap" aria-label="Experience roadmap">
      <svg className="experience-roadmap-route" viewBox="0 0 1200 3000" preserveAspectRatio="none" aria-hidden="true">
        <path
          className="experience-roadmap-route-path experience-roadmap-route-path--draw experience-roadmap-route-path--first"
          d="M 2240 955 C 1905 1078 1760 755 1380 755 C 1000 755 620 1090 250 1225 C -85 1348 -360 1268 -610 1025"
          pathLength={1}
        />
        <path
          className="experience-roadmap-route-path experience-roadmap-route-path--draw experience-roadmap-route-path--third"
          d="M 2440 1610 C 2060 1668 1710 1815 1450 2050 C 1265 2218 1198 2390 1285 2558 C 1396 2774 1665 2830 2230 3040"
          pathLength={1}
        />
      </svg>

      <div className="experience-roadmap-track" aria-hidden="true" />
      <div className="experience-roadmap-points" aria-hidden="true">
        {experiences.map((item, i) => (
          <span
            key={item.metric}
            className={`experience-roadmap-point experience-roadmap-point--${i + 1}${i <= activeIndex ? ' is-passed' : ''}${i === activeIndex ? ' is-active' : ''}`}
          />
        ))}
      </div>

      {experiences.map((item, i) => (
        <article
          key={item.metric}
          className={`experience-roadmap-card experience-roadmap-card--${i % 2 === 0 ? 'left' : 'right'} experience-roadmap-card--tone-${i + 1}${i === activeIndex ? ' is-active' : ''}`}
        >
          <div className="experience-roadmap-marker">
            <span className="experience-roadmap-marker-index">{item.metric}</span>
            <span className="experience-roadmap-marker-rule" />
          </div>

          <div className="experience-roadmap-content">
            <h3>{item.title}</h3>
            {item.employmentType && (
              <span className="experience-employment-type">{item.employmentType}</span>
            )}

            <ul className="experience-roadmap-highlights">
              {item.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>

            <div className="experience-roadmap-footer">
              <div className="experience-roadmap-tools" aria-label={`${item.title} tools`}>
                {item.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
