import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ExperienceContainer, { experiences } from './ExperienceContainer';
import RotatingText from './RotatingText';
import './ExperienceIntro.css';

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceIntro() {
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const panelRef       = useRef<HTMLDivElement>(null);
  const frameImgRef    = useRef<HTMLImageElement>(null);
  const periodLayerRef = useRef<HTMLDivElement>(null);
  const panelIntroRef  = useRef<HTMLDivElement>(null);

  const charRefs      = useRef<(HTMLSpanElement | null)[][]>(experiences.map(() => []));
  const prevActiveRef = useRef(0);
  const [activeExperience, setActiveExperience] = useState(0);

  // Init background date chars
  useEffect(() => {
    experiences.forEach((_, i) => {
      const chars = charRefs.current[i].filter((c): c is HTMLSpanElement => c !== null);
      if (!chars.length) return;
      gsap.set(chars, {
        yPercent: i === 0 ? 0 : 100,
        opacity:  i === 0 ? 1 : 0,
      });
    });
  }, []);

  // Animate background date chars on experience change
  useEffect(() => {
    const prev = prevActiveRef.current;
    if (prev === activeExperience) return;
    prevActiveRef.current = activeExperience;

    const prevChars = charRefs.current[prev].filter((c): c is HTMLSpanElement => c !== null);
    const nextChars = charRefs.current[activeExperience].filter((c): c is HTMLSpanElement => c !== null);

    if (prevChars.length) {
      gsap.to(prevChars, {
        yPercent: -100, opacity: 0, duration: 0.65, stagger: 0.03,
        ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
      });
    }
    if (nextChars.length) {
      gsap.fromTo(nextChars,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.035,
          ease: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  }, [activeExperience]);

  useEffect(() => {
    const wrapper     = wrapperRef.current;
    const panel       = panelRef.current;
    const periodLayer = periodLayerRef.current;
    const panelIntro  = panelIntroRef.current;
    const roadmap     = panel?.querySelector<HTMLElement>('.experience-roadmap');
    if (!wrapper || !panel || !roadmap || !periodLayer || !panelIntro) return;

    let currentExperience = 0;
    const proxy = { progress: 0 };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panel,
        { width: '58vw', height: '44vh', minHeight: '44vh', borderRadius: '2.8rem', marginTop: '16vh', y: 140 },
        {
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          borderRadius: 0,
          marginTop: 0,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: wrapper, start: 'top bottom', end: 'top top', scrub: true },
        }
      );

      gsap.to(proxy, {
        progress: 1,
        ease: 'none',
        onUpdate() {
          const totalExpProgress = proxy.progress * experiences.length;
          const next = Math.min(experiences.length - 1, Math.floor(totalExpProgress));
          if (next !== currentExperience) {
            currentExperience = next;
            setActiveExperience(next);
          }
          if (frameImgRef.current) {
            const frame = Math.max(1, Math.round(proxy.progress * 200));
            frameImgRef.current.src = `/video/frames/frame-${String(frame).padStart(3, '0')}.jpg`;
          }
        },
        scrollTrigger: { trigger: wrapper, start: 'top top', end: 'bottom bottom', scrub: 1 },
      });

      gsap.fromTo(
        roadmap,
        { y: '0vh' },
        {
          y: '-200vh',
          ease: 'none',
          scrollTrigger: { trigger: wrapper, start: 'top top', end: 'bottom bottom', scrub: 1 },
        }
      );

      // Intro text scrolls up and out
      gsap.to(panelIntro, {
        y: '-18vh',
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: wrapper, start: 'top top', end: '20% bottom', scrub: true },
      });

      // Date rises from below title to top, then sticks
      gsap.fromTo(
        periodLayer,
        { y: '16vh' },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.4,
          },
        }
      );
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} id="experience" className="experience-scroll-wrapper">
      <section className="experience-intro" aria-label="Experience">
        <div className="experience-intro-bg" />

        <div ref={panelRef} className="experience-intro-panel">

          {/* Frame image */}
          <img ref={frameImgRef} src="/video/frames/frame-001.jpg" className="experience-frame-bg" aria-hidden="true" alt="" />

          {/* Intro header — scrolls out on scroll */}
          <div ref={panelIntroRef} className="experience-panel-intro">
            <p className="experience-panel-kicker">Experience</p>
            <h2 className="experience-panel-heading">
              Built through projects, iteration, and <RotatingText words={['craft', 'code', 'motion', 'systems', 'ideas']} />.
            </h2>
          </div>

          {/* Roadmap — behind date layer */}
          <ExperienceContainer activeIndex={activeExperience} />

          {/* Date text — rendered last so it paints on top of roadmap */}
          <div ref={periodLayerRef} className="experience-period-layer" aria-hidden="true">
            {experiences.map((exp, i) => (
              <div key={i} className="experience-period">
                {exp.bgLabel.split('').map((ch, j) => (
                  <span
                    key={j}
                    className="experience-period-char"
                    ref={(el) => {
                      if (!charRefs.current[i]) charRefs.current[i] = [];
                      charRefs.current[i][j] = el;
                    }}
                  >
                    {ch === ' ' ? ' ' : ch}
                  </span>
                ))}
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
