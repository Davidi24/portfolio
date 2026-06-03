import './ExperienceContainer.css';

export const experiences = [
  {
    bgLabel: 'Jun 2025 - Present',
    period: 'Jun 2025 - Present',
    title: 'Full Stack Development',
    label: 'Product Build',
    metric: '01',
    body: 'Building fast product interfaces, backend flows, and polished user journeys with React, TypeScript, Node, and motion systems.',
    highlights: [
      'Translate ideas into responsive product interfaces with clear user flows.',
      'Connect frontend screens to backend logic, APIs, and structured data.',
      'Keep builds maintainable with reusable components and clean patterns.',
    ],
    tools: ['React', 'TypeScript', 'Node', 'UX'],
  },
  {
    bgLabel: 'Jun 2025 - Present',
    period: 'Jun 2025 - Present',
    title: 'Interactive Experiences',
    label: 'Motion Systems',
    metric: '02',
    body: 'Designing scroll-led sections, animated components, and smooth interactions that make portfolio and product pages feel alive.',
    highlights: [
      'Create scroll transitions, reveal states, and timing that supports the story.',
      'Balance visual energy with performance and predictable interaction.',
      'Use animation to guide attention instead of distracting from the content.',
    ],
    tools: ['GSAP', 'Lenis', 'Motion', 'Story'],
  },
  {
    bgLabel: 'Jun 2025 - Present',
    period: 'Jun 2025 - Present',
    title: 'Scalable Frontend Architecture',
    label: 'Scale Ready',
    metric: '03',
    body: 'Creating reusable components, clean styling patterns, and maintainable structures that are easy to extend.',
    highlights: [
      'Organize UI into practical sections, components, and shared styles.',
      'Improve consistency across layouts, states, spacing, and content rhythm.',
      'Build with future edits in mind so the portfolio can keep growing.',
    ],
    tools: ['Design Systems', 'APIs', 'State', 'Performance'],
  },
];

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

              <a className="experience-roadmap-button" href="#projects">
                View more
              </a>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
