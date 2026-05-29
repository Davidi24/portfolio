import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Education.css';

gsap.registerPlugin(ScrollTrigger);

const education = [
  {
    label: 'Foundation',
    title: 'Software Engineering',
    body: 'Computer science fundamentals, clean architecture, databases, APIs, and the discipline behind reliable full stack work.',
  },
  {
    label: 'Frontend',
    title: 'Interactive UI Craft',
    body: 'Deep practice with React, TypeScript, responsive systems, animation timing, accessibility, and high-polish interfaces.',
  },
  {
    label: 'Always Learning',
    title: 'Modern Web Tools',
    body: 'Continual learning across GSAP, Lenis, Three.js, product thinking, and the details that make digital work feel premium.',
  },
];

export default function Education() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ['.education-kicker', '.education-heading', '.education-lead'],
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
            end: 'top 28%',
            scrub: 0.8,
          },
        }
      );

      gsap.fromTo(
        '.education-card',
        { opacity: 0, y: 90, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.education-list',
            start: 'top 78%',
            end: 'bottom 78%',
            scrub: 0.8,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="education" ref={sectionRef} className="education-section">
      <div className="education-inner">
        <div className="education-copy">
          <p className="education-kicker">Education</p>
          <h2 className="education-heading">Learning that keeps the build sharp.</h2>
          <p className="education-lead">
            My education is a mix of software fundamentals, constant practice, and studying how polished products are designed, built, and shipped.
          </p>
        </div>

        <div className="education-list">
          {education.map((item, index) => (
            <article className="education-card" key={item.title}>
              <span className="education-number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p>{item.label}</p>
                <h3>{item.title}</h3>
                <span>{item.body}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
