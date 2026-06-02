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

export default function ExperienceContainer({ activeIndex = 0 }: ExperienceContainerProps) {
  return (
    <section className="experience-roadmap" aria-label="Experience roadmap">
      <div className="experience-roadmap-track" aria-hidden="true" />

      {experiences.map((item, i) => (
        <article
          key={item.metric}
          className={`experience-roadmap-card experience-roadmap-card--${i % 2 === 0 ? 'left' : 'right'} experience-roadmap-card--tone-${i + 1}${i === activeIndex ? ' is-active' : ''}`}
        >
          <div className="experience-roadmap-marker">
            <span>{item.metric}</span>
          </div>

          <div className="experience-roadmap-content">
            <div className="experience-roadmap-meta">
              <span>{item.period}</span>
              <span>{item.label}</span>
            </div>

            <h3>{item.title}</h3>
            <p>{item.body}</p>

            <div className="experience-roadmap-tools" aria-label={`${item.title} tools`}>
              {item.tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
