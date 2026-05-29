import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Projects.css';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    index: '01',
    title: 'Motion Portfolio',
    type: 'Portfolio System',
    body: 'A cinematic portfolio flow with smooth scroll, scroll-led storytelling, animated navigation, and strong visual rhythm.',
    tags: ['React', 'GSAP', 'Lenis'],
  },
  {
    index: '02',
    title: 'SaaS Interface',
    type: 'Product Dashboard',
    body: 'A clean operational interface focused on fast scanning, reusable UI pieces, and calm data-heavy layouts.',
    tags: ['TypeScript', 'UI Systems', 'API'],
  },
  {
    index: '03',
    title: 'Interactive Web Scene',
    type: 'Creative Build',
    body: 'A high-polish web experience with layered motion, responsive composition, and micro-interactions that feel intentional.',
    tags: ['Three.js', 'Motion', 'UX'],
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        {
          width: '100vw',
          marginLeft: '0vw',
          y: 0,
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
        },
        {
          width: '68vw',
          marginLeft: '16vw',
          y: -160,
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'bottom 92%',
            end: 'bottom 8%',
            scrub: 1.4,
          },
        }
      );

      gsap.fromTo(
        ['.projects-kicker', '.projects-heading', '.projects-lead'],
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 58%',
            end: 'top 18%',
            scrub: 0.7,
          },
        }
      );

      gsap.fromTo(
        '.project-card',
        { opacity: 0, y: 140, rotateX: -12 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.16,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 74%',
            end: 'bottom 70%',
            scrub: 0.9,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="projects-section relative z-[3] -mt-[48vh] min-h-[360vh] w-screen overflow-hidden bg-[#1e1e1e] px-[clamp(1.5rem,6vw,6rem)] pb-[clamp(9rem,14vw,15rem)] pt-[clamp(3rem,6vw,6rem)] text-[#f5f5f5] [will-change:width,transform,border-radius] max-[720px]:px-4"
    >
      <div className="relative z-[1] mx-auto max-w-[96rem]">
        <div className="grid grid-cols-[minmax(9rem,0.22fr)_1fr] items-start gap-[clamp(2rem,5vw,6rem)] mb-[clamp(5rem,10vw,10rem)] max-[980px]:grid-cols-1">
          <p className="projects-kicker projects-muted m-0 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[#c6f435]">
            My Projects
          </p>
          <h2 className="projects-heading projects-text m-0 max-w-[72rem] text-[clamp(3.6rem,7.6vw,9.2rem)] font-medium leading-[0.92] tracking-normal text-[#f5f5f5]">
            Selected builds with clean systems, sharp motion, and product-level polish.
          </h2>
          <p className="projects-lead projects-muted col-start-2 mx-0 mb-0 mt-[-2rem] max-w-[48rem] text-[clamp(1.2rem,1.9vw,1.8rem)] leading-[1.55] text-[#dad7d2] max-[980px]:col-auto max-[980px]:mt-0">
            Each project is shaped around performance, interaction, and a clear user path from the first scroll to the final click.
          </p>
        </div>

        <div className="projects-grid grid grid-cols-3 gap-[clamp(1rem,2vw,1.8rem)] [perspective:1200px] max-[980px]:grid-cols-1">
          {projects.map((project, index) => (
            <article
              className={[
                'project-card project-card-bg project-border project-text flex min-h-[36rem] flex-col justify-between rounded-[1.6rem] border border-[rgba(245,245,245,0.16)] bg-[#2a2a2a] p-[clamp(1.4rem,2.5vw,2.4rem)] text-[#f5f5f5] shadow-[0_30px_80px_rgba(0,0,0,0.18)] [transform-origin:50%_100%] will-change-[transform,opacity] max-[980px]:min-h-[28rem]',
                index === 1 ? 'mt-[clamp(3rem,8vw,8rem)] max-[980px]:mt-0' : '',
                index === 2 ? 'mt-[clamp(6rem,13vw,13rem)] max-[980px]:mt-0' : '',
              ].join(' ')}
              key={project.title}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-full bg-[#c6f435] font-extrabold text-[#111111]">
                  {project.index}
                </span>
                <span className="project-type projects-muted m-0 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[#dad7d2]">
                  {project.type}
                </span>
              </div>
              <h3 className="projects-text mx-0 mb-6 mt-auto text-[clamp(2.5rem,4vw,5.2rem)] font-medium leading-[0.95] tracking-normal text-[#f5f5f5]">
                {project.title}
              </h3>
              <p className="projects-muted m-0 max-w-[30rem] text-[clamp(1rem,1.25vw,1.2rem)] leading-[1.65] text-[#dad7d2]">
                {project.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-[0.55rem]" aria-label={`${project.title} tools`}>
                {project.tags.map((tag) => (
                  <span
                    className="project-tag project-card-bg project-border project-text rounded-full border border-[rgba(245,245,245,0.16)] bg-[#2a2a2a] px-[0.85rem] py-[0.55rem] text-[0.82rem] font-semibold text-[#f5f5f5]"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
