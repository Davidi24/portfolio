import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PortfolioFinale.css';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    index: '01',
    title: 'Motion Portfolio',
    category: 'Portfolio System',
    year: '2026',
    body: 'A cinematic portfolio flow built around scroll timing, responsive composition, and clean motion direction.',
    tags: ['React', 'GSAP', 'Lenis'],
    images: ['/video/frames/frame-022.jpg', '/video/frames/frame-040.jpg', '/video/frames/frame-058.jpg'],
  },
  {
    index: '02',
    title: 'Product Interface',
    category: 'Dashboard UX',
    year: '2026',
    body: 'A focused product surface for scanning information quickly, moving between states, and keeping UI systems reusable.',
    tags: ['TypeScript', 'Design Systems', 'API'],
    images: ['/video/frames/frame-086.jpg', '/video/frames/frame-104.jpg', '/video/frames/frame-122.jpg'],
  },
  {
    index: '03',
    title: 'Interactive Scene',
    category: 'Creative Build',
    year: '2026',
    body: 'An expressive web scene with layered visuals, tactile micro-interactions, and a strong first-scroll moment.',
    tags: ['Motion', 'Frontend', 'UX'],
    images: ['/video/frames/frame-148.jpg', '/video/frames/frame-166.jpg', '/video/frames/frame-184.jpg'],
  },
  {
    index: '04',
    title: 'Commerce Flow',
    category: 'Web Experience',
    year: '2026',
    body: 'A polished customer journey with fast browsing, direct calls to action, and a clean visual system ready for real products.',
    tags: ['React', 'UX', 'Performance'],
    images: ['/video/frames/frame-032.jpg', '/video/frames/frame-118.jpg', '/video/frames/frame-192.jpg'],
  },
];

const education = [
  {
    label: 'Bachelor',
    title: 'Bachelor Degree',
    body: 'Core software engineering foundation across programming, databases, web systems, and practical problem solving.',
  },
  {
    label: 'Master',
    title: 'Master Degree',
    body: 'Advanced practice focused on deeper systems thinking, project execution, research, and modern development workflows.',
  },
];

const educationImage = '/video/frames/frame-154.jpg';

const socials = [
  {
    label: 'LinkedIn',
    href: '#',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'WhatsApp',
    href: '#',
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z',
  },
  {
    label: 'GitHub',
    href: '#',
    path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z',
  },
];

type Project = (typeof projects)[number];

function WorkFolder({ project }: { project: Project }) {
  const [state, setState] = useState<'idle' | 'open' | 'force-closed'>('idle');

  const handleClick = () =>
    setState(s => s === 'open' ? 'force-closed' : 'open');

  const handleMouseLeave = () => {
    if (state === 'force-closed') setState('idle');
  };

  return (
    <div
      className={`work-folder${state === 'open' ? ' is-open' : state === 'force-closed' ? ' is-force-closed' : ''}`}
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
          <figure className="work-folder-paper" key={image}>
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
            <h2 id="work-heading" className="work-title" aria-label="My work">
              <span>My</span>
              <span>Work</span>
            </h2>
            <div className="work-hero-copy work-reveal">
              <p>
                A sharper project shelf for portfolio pieces, product interfaces, and interactive builds.
              </p>
            </div>
          </div>

          <div className="work-projects">
            {projects.map((project) => (
              <article className="work-project" key={project.title}>
                <div className="work-project-meta">
                  <span>{project.index}</span>
                  <span>{project.year}</span>
                </div>

                <div className="work-project-copy">
                  <p>{project.category}</p>
                  <h3>{project.title}</h3>
                </div>

                <p className="work-project-body">{project.body}</p>

                <div className="work-tags" aria-label={`${project.title} technologies`}>
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <WorkFolder project={project} />

                <a className="work-project-button" href="#contact">View more</a>
              </article>
            ))}
          </div>
        </section>

        <section id="education" className="finale-education" aria-labelledby="education-heading">
          <div className="finale-section-head finale-reveal">
            <p>Education</p>
            <h3 id="education-heading">Learning that keeps the build sharp.</h3>
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
            <h3>Have a product, interface, or motion-heavy idea to build?</h3>
            <div className="finale-contact-actions">
              <a className="finale-contact-primary" href="mailto:hello@david.dev">Start a conversation</a>
              <div className="finale-contact-socials" aria-label="Social links">
                {socials.map((social) => (
                  <a key={social.label} href={social.href} aria-label={social.label}>
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
