import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import projectsData from '../../data/projectsData.json';
import educationData from '../../data/educationData.json';
import contactData from '../../data/contactData.json';
import './PortfolioFinale.css';

gsap.registerPlugin(ScrollTrigger);

const projects = projectsData.projects;
const education = educationData.items;
const educationImage = educationData.image;

type Project = (typeof projects)[number];

function WorkFolder({ project }: { project: Project }) {
  const [state, setState] = useState<'idle' | 'open' | 'force-closed'>('idle');
  const folderClassName = [
    'work-folder',
    project.slug === 'jupyter-reproducibility' ? 'work-folder--stretch-images' : '',
    state === 'open' ? 'is-open' : state === 'force-closed' ? 'is-force-closed' : '',
  ].filter(Boolean).join(' ');

  const handleClick = () =>
    setState(s => s === 'open' ? 'force-closed' : 'open');

  const handleMouseLeave = () => {
    if (state === 'force-closed') setState('idle');
  };

  return (
    <div
      className={folderClassName}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} image folder`}
      aria-expanded={state === 'open'}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
      <div className="work-folder-back" />
      <div className="work-folder-tab">
        <span>{project.index}</span>
      </div>

      <div className="work-folder-papers" aria-hidden="true">
        {project.images.map((image, index) => (
          <figure className="work-folder-paper" key={`${image}-${index}`}>
            <img src={image} alt="" loading="lazy" />
            <figcaption>{String(index + 1).padStart(2, '0')}</figcaption>
          </figure>
        ))}
      </div>

      <div className="work-folder-front">
        <span>{project.category}</span>
        <span>Open</span>
      </div>
    </div>
  );
}

export default function PortfolioFinale() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.set('.work-title span', { yPercent: 112 });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.work-title span',
        { yPercent: 112 },
        {
          yPercent: 0,
          stagger: 0.06,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.work-hero',
            start: 'top 76%',
            end: 'top 20%',
            scrub: 0.9,
          },
        }
      );

      gsap.fromTo(
        '.work-reveal',
        { opacity: 0, y: 70 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.work-hero',
            start: 'top 70%',
            end: 'bottom 52%',
            scrub: 0.8,
          },
        }
      );

      gsap.utils.toArray<HTMLElement>('.work-project').forEach((card) => {
        const children = Array.from(card.children);
        gsap.fromTo(
          children,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              end: 'top 58%',
              scrub: 0.6,
            },
          }
        );
      });

      gsap.fromTo(
        '.finale-reveal',
        { opacity: 0, y: 70 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.finale-education',
            start: 'top 76%',
            end: 'bottom 70%',
            scrub: 0.9,
          },
        }
      );

      const darkModeBg = '#1e1e1e';
      const endTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.finale-contact',
          start: 'top 72%',
          end: 'bottom bottom',
          scrub: 0.7,
        },
      });

      endTl
        .to([section, document.body], { backgroundColor: darkModeBg, ease: 'none' }, 0)
        .to(section, {
          '--education-rule-opacity': 0,
          '--education-accent': '#c6f435',
          '--edu-img-bg-1': '#484848',
          '--edu-img-bg-2': '#3a3a3a',
          ease: 'none',
        }, 0)
        .to('.finale-section-head h3, .finale-education-item h4, .finale-education-item > span', {
          color: '#f5f5f5',
          ease: 'none',
        }, 0)
        .to('.finale-section-head p', {
          backgroundColor: '#c6f435',
          color: '#111111',
          ease: 'none',
        }, 0)
        .to('.finale-education-item p, .finale-education-item small', {
          color: 'rgba(245, 245, 245, 0.7)',
          ease: 'none',
        }, 0)
        .to('.finale-contact-panel', { borderColor: 'rgba(245, 245, 245, 0.16)', ease: 'none' }, 0)
        .to('.finale-contact-panel h3', { color: '#f5f5f5', ease: 'none' }, 0)
        .to('.finale-contact-panel p, .finale-footer', { color: 'rgba(245, 245, 245, 0.68)', ease: 'none' }, 0)
        .to('.finale-contact-primary', {
          backgroundColor: '#c6f435',
          borderColor: '#c6f435',
          color: '#111111',
          ease: 'none',
        }, 0)
        .to('.finale-contact-phone', {
          color: '#f5f5f5',
          ease: 'none',
        }, 0)
        .to('.finale-contact-socials a', {
          borderColor: 'rgba(245, 245, 245, 0.18)',
          color: '#f5f5f5',
          ease: 'none',
        }, 0)
        .to('.finale-footer a', { color: '#c6f435', ease: 'none' }, 0);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="finale-section" aria-label="My work and contact">
      <div className="finale-inner">
        <section id="projects" className="work-section" aria-labelledby="work-heading">
          <div className="work-hero">
            <p className="work-kicker work-reveal">Selected Projects</p>
            <h2 id="work-heading" className="work-title" aria-label="My projects">
              <span>My</span>
              <span>Projects</span>
            </h2>
          </div>

          <div className="work-projects">
            {projects.map((project) => (
              <article className="work-project" key={project.title}>
                <div className="work-project-meta">
                  <span>{project.index}</span>
                  <span>{project.status}</span>
                </div>

                <div className="work-project-copy">
                  <p>{project.category}</p>
                  <h3>
                    {project.title.split(' ').map((word, i) => (
                      <span key={i} className="work-title-word">{word}</span>
                    ))}
                  </h3>
                </div>

                <p className="work-project-body">{project.body}</p>

                <div className="work-tags" aria-label={`${project.title} technologies`}>
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <WorkFolder project={project} />

                <a className="work-project-button" href={`/work/${project.slug}`}>View more</a>
              </article>
            ))}
          </div>
        </section>

        <section id="education" className="finale-education" aria-labelledby="education-heading">
          <div className="finale-section-head finale-reveal">
            <p>Education</p>
            <h3 id="education-heading">{educationData.sectionHeading}</h3>
          </div>

          <div className="finale-education-grid">
            <article className="finale-education-item finale-reveal">
              <span>01</span>
              <div>
                <p>{education[0].label}</p>
                <h4>{education[0].title}</h4>
                <small>{education[0].body}</small>
              </div>
            </article>

            <figure className="finale-education-image finale-reveal">
              <img src={educationImage} alt="Education visual" loading="lazy" />
            </figure>

            <article className="finale-education-item finale-reveal">
              <span>02</span>
              <div>
                <p>{education[1].label}</p>
                <h4>{education[1].title}</h4>
                <small>{education[1].body}</small>
              </div>
            </article>
          </div>
        </section>

        <section id="contact" className="finale-contact" aria-label="Contact">
          <div className="finale-contact-panel finale-reveal">
            <p>Contact</p>
            <h3>{contactData.heading}</h3>
            <div className="finale-contact-actions">
              <a className="finale-contact-primary" href={contactData.cta.href}>{contactData.cta.label}</a>
              <a className="finale-contact-phone" href={contactData.phone.href} aria-label={`Call ${contactData.phone.display}`}>
                {contactData.phone.display}
              </a>
              <div className="finale-contact-socials" aria-label="Social links">
                {contactData.socials.map((social) => (
                  <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="finale-footer">
          <span>David Portfolio</span>
          <span>Full Stack Developer</span>
          <a href="#" aria-label="Back to top">Back to top</a>
        </footer>
      </div>
    </section>
  );
}
