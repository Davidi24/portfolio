import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ExperienceContainer, { experiences } from './ExperienceContainer';
import './ExperienceIntro.css';

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceIntro() {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const frameImgRef  = useRef<HTMLImageElement>(null);

  // One ref slot per card
  const cardRefs          = useRef<(HTMLElement | null)[]>([null, null, null]);
  const initializedCards  = useRef<Set<number>>(new Set());
  const currentActiveCard = useRef<number>(-1);

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

  const handleCardRef = useCallback((el: HTMLElement | null, index: number) => {
    cardRefs.current[index] = el;
    if (el && !initializedCards.current.has(index)) {
      initializedCards.current.add(index);
      el.style.transform = 'translateY(100vh)';
      el.style.setProperty('--experience-line-progress', '0%');

      el.addEventListener('click', () => {
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          if (i === index) {
            card.classList.remove('experience-card--dimmed');
          } else {
            card.classList.add('experience-card--dimmed');
          }
        });
        currentActiveCard.current = index;
      });
    } else if (!el) {
      initializedCards.current.delete(index);
    }
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const panel   = panelRef.current;
    if (!wrapper || !panel) return;

    let currentExperience = 0;
    const proxy = { progress: 0 };

    const ctx = gsap.context(() => {
      // Panel entry
      gsap.fromTo(
        panel,
        { width: '58vw', height: '44vh', minHeight: '44vh', borderRadius: '2.8rem', marginTop: '16vh', y: 140 },
        {
          width: '100vw', height: '100vh', minHeight: '100vh',
          borderRadius: 0, marginTop: 0, y: 0, ease: 'none',
          scrollTrigger: { trigger: wrapper, start: 'top bottom', end: 'top top', scrub: true },
        }
      );

      // Main scroll proxy — drives cards and background
      gsap.to(proxy, {
        progress: 1,
        ease: 'none',
        onUpdate() {
          // Cards cascade: each starts 0.18 after the previous, takes 0.3 to arrive
          experiences.forEach((_, i) => {
            const el = cardRefs.current[i];
            if (!el) return;
            const windowStart = i * 0.18;
            const rawProg     = Math.max(0, Math.min(1, (proxy.progress - windowStart) / 0.3));
            // Ease-out cubic for snappy entry
            const localProg   = 1 - Math.pow(1 - rawProg, 3);
            el.style.transform = `translateY(${(1 - localProg) * 100}vh)`;
            el.style.setProperty('--experience-line-progress', `${localProg * 100}%`);

            // When card has fully arrived, dim the previous active card
            if (rawProg > 0.85 && i > currentActiveCard.current) {
              const prev = currentActiveCard.current;
              if (prev >= 0 && cardRefs.current[prev]) {
                cardRefs.current[prev]!.classList.add('experience-card--dimmed');
              }
              currentActiveCard.current = i;
              el.classList.remove('experience-card--dimmed');
            }
          });

          // Background date text
          const totalExpProgress = proxy.progress * experiences.length;
          const next = Math.min(experiences.length - 1, Math.floor(totalExpProgress));
          if (next !== currentExperience) {
            currentExperience = next;
            setActiveExperience(next);
          }

          // Frame image
          if (frameImgRef.current) {
            const frame = Math.max(1, Math.round(proxy.progress * 200));
            frameImgRef.current.src = `/video/frames/frame-${String(frame).padStart(3, '0')}.jpg`;
          }
        },
        scrollTrigger: { trigger: wrapper, start: 'top top', end: 'bottom bottom', scrub: 1 },
      });

      // Panel exit
      gsap.fromTo(
        panel,
        { width: '100vw', height: '100vh', minHeight: '100vh', borderRadius: 0, marginTop: 0, y: 0 },
        {
          width: '58vw', height: '44vh', minHeight: '44vh',
          borderRadius: '2.8rem', marginTop: '16vh', y: 140, ease: 'none',
          scrollTrigger: { trigger: wrapper, start: 'bottom bottom', end: 'bottom top', scrub: true },
        }
      );
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="experience-scroll-wrapper">
      <section className="experience-intro" aria-label="Experience">
        <div className="experience-intro-bg" />

        <div ref={panelRef} className="experience-intro-panel">

          {/* Frame image */}
          <img ref={frameImgRef} src="/video/frames/frame-001.jpg" className="experience-frame-bg" aria-hidden="true" alt="" />

          {/* Background date text — top of panel */}
          <div className="experience-period-layer" aria-hidden="true">
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

          <ExperienceContainer onCardRef={handleCardRef} />
        </div>
      </section>
    </div>
  );
}
