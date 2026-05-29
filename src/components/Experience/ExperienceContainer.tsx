import { useRef } from 'react';
import type { CSSProperties } from 'react';
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
  onCardRef: (el: HTMLElement | null, index: number) => void;
}

export default function ExperienceContainer({ onCardRef }: ExperienceContainerProps) {
  // Stable ref callbacks — created once so React doesn't re-call them on every render
  const stableRefs = useRef<Array<(el: HTMLElement | null) => void>>([]);
  if (stableRefs.current.length === 0) {
    stableRefs.current = experiences.map((_, i) => (el: HTMLElement | null) => onCardRef(el, i));
  }

  return (
    <section className="experience-container" aria-label="Experience">
      {experiences.map((item, i) => (
        <article
          key={i}
          ref={stableRefs.current![i]}
          className={`experience-card experience-card--tone-${i + 1}`}
          style={{ '--experience-line-progress': '0%' } as CSSProperties}
        >
          <div className="experience-card-top">
            <span className="experience-card-number">{item.metric}</span>
            <span className="experience-card-period">{item.period}</span>
          </div>

          <div className="experience-card-title">
            <span>{item.label}</span>
            <h3>{item.title}</h3>
          </div>

          <p className="experience-card-body">{item.body}</p>

          <ol className="experience-card-highlights" aria-label={`${item.title} focus areas`}>
            {item.highlights.map((highlight, index) => (
              <li key={highlight}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{highlight}</p>
              </li>
            ))}
          </ol>

          <div className="experience-card-footer">
            <div className="experience-card-tools" aria-label={`${item.title} tools`}>
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
