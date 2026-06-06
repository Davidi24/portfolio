import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ExperienceContainer, { experiences } from './ExperienceContainer';
import './ExperienceIntro.css';

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceIntro() {
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const panelRef       = useRef<HTMLDivElement>(null);
  const periodLayerRef = useRef<HTMLDivElement>(null);
  const panelIntroRef  = useRef<HTMLDivElement>(null);

  const charRefs      = useRef<(HTMLSpanElement | null)[][]>(experiences.map(() => []));
  const prevActiveRef = useRef(0);
  const [activeExperience, setActiveExperience] = useState(0);
  const [revealedExperience, setRevealedExperience] = useState(-1);

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
    let currentRevealedExperience = -1;
    const proxy = { progress: 0 };

    const ctx = gsap.context(() => {
      const experienceScrollDistance = () => Math.round(window.innerHeight * 2);
      const getSmallPanelState = () => {
        if (window.innerWidth <= 620) {
          return {
            width: '86vw',
            height: '50vh',
            minHeight: '50vh',
            borderRadius: 0,
            y: 90,
            scaleX: 1,
            scaleY: 1,
          };
        }

        if (window.innerWidth <= 980) {
          return {
            width: '76vw',
            height: '48vh',
            minHeight: '48vh',
            borderRadius: 0,
            y: 110,
            scaleX: 1,
            scaleY: 1,
          };
        }

        if (window.innerWidth <= 1400) {
          return {
            width: '66vw',
            height: '46vh',
            minHeight: '46vh',
            borderRadius: 0,
            y: 130,
            scaleX: 1,
            scaleY: 1,
          };
        }

        return {
          width: '58vw',
          height: '44vh',
          minHeight: '44vh',
          borderRadius: 0,
          y: 140,
          scaleX: 1,
          scaleY: 1,
        };
      };
      const smallPanelState = getSmallPanelState();
      const fullPanelState = {
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        borderRadius: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      };
      const topExitPanelState = {
        ...smallPanelState,
        y: 0,
      };
      const roadmapTrack = roadmap.querySelector<HTMLElement>('.experience-roadmap-track');
      const roadmapRouteFirstPath = roadmap.querySelector<SVGPathElement>('.experience-roadmap-route-path--first');
      const roadmapRouteThirdPath = roadmap.querySelector<SVGPathElement>('.experience-roadmap-route-path--third');
      const firstPathMultiplier =
        window.innerWidth >= 2000 ? 10.5 : window.innerWidth >= 1800 ? 8.5 : 1.65;
      const thirdPathDrawSpan = window.innerWidth >= 1800 ? 0.36 : 0.55;

      const roadmapCards = gsap.utils.toArray<HTMLElement>('.experience-roadmap-card', roadmap);
      const clampOpacity = gsap.utils.clamp(0, 1);
      const updateRoadmapCardOpacity = () => {
        const isMobile = window.innerWidth <= 980;

        if (isMobile) {
          roadmapCards.forEach((card) => { card.style.opacity = '1'; });
        } else {
          const fadeEnd   = -window.innerHeight * 0.07;
          const fadeStart = window.innerHeight * 0.22;
          roadmapCards.forEach((card) => {
            const top = card.getBoundingClientRect().top;
            const progress = clampOpacity((top - fadeEnd) / (fadeStart - fadeEnd));
            const opacity = progress * progress * (3 - 2 * progress);
            card.style.opacity = String(opacity);
          });
        }

        if (roadmapTrack) {
          const trackFadeEnd   = -window.innerHeight * 0.07;
          const trackFadeStart = window.innerHeight * 0.22;
          const trackTop = roadmapTrack.getBoundingClientRect().top;
          roadmapTrack.style.setProperty(
            '--roadmap-line-fade-end',
            `${Math.max(0, trackFadeEnd - trackTop)}px`
          );
          roadmapTrack.style.setProperty(
            '--roadmap-line-fade-start',
            `${Math.max(1, trackFadeStart - trackTop)}px`
          );
        }
      };

      gsap.fromTo(
        panel,
        smallPanelState,
        {
          ...fullPanelState,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        panel,
        fullPanelState,
        {
          ...topExitPanelState,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: wrapper,
            start: 'bottom bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      gsap.to(proxy, {
        progress: 1,
        ease: 'none',
        onUpdate() {
          const totalExpProgress = proxy.progress * experiences.length;
          const next = Math.min(experiences.length - 1, Math.floor(totalExpProgress));
          const revealedNext = proxy.progress <= 0.001 ? -1 : next;
          if (next !== currentExperience) {
            currentExperience = next;
            setActiveExperience(next);
          }
          if (revealedNext !== currentRevealedExperience) {
            currentRevealedExperience = revealedNext;
            setRevealedExperience(revealedNext);
          }
          roadmapTrack?.style.setProperty('--roadmap-fill', `${proxy.progress * 100}%`);
          if (roadmapRouteFirstPath) {
            roadmapRouteFirstPath.style.strokeDashoffset = String(1 - Math.min(1, proxy.progress * firstPathMultiplier));
          }
          if (roadmapRouteThirdPath) {
            const thirdRouteProgress = Math.max(0, Math.min(1, (proxy.progress - 0.56) / thirdPathDrawSpan));
            roadmapRouteThirdPath.style.strokeDashoffset = String(1 - thirdRouteProgress);
          }
        },
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${experienceScrollDistance()}`,
          scrub: 1,
        },
      });

      gsap.fromTo(
        roadmap,
        { y: '0vh' },
        {
          y: '-200vh',
          ease: 'none',
          onUpdate: updateRoadmapCardOpacity,
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: () => `+=${experienceScrollDistance()}`,
            scrub: 1,
          },
        }
      );

      updateRoadmapCardOpacity();

      // Header scrolls out while the date settles into its sticky top position.
      const introTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 0.34)}`,
          scrub: true,
        },
      });

      introTimeline
        .to(panelIntro, { y: -420, ease: 'none' }, 0)
        .fromTo(periodLayer, { y: 76 }, { y: 0, ease: 'none' }, 0);

    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} id="experience" className="experience-scroll-wrapper">
      <section className="experience-intro" aria-label="Experience">
        <div className="experience-intro-bg" />

        <div ref={panelRef} className="experience-intro-panel">

          {/* Intro header — scrolls out on scroll */}
          <div ref={panelIntroRef} className="experience-panel-intro">
            <p className="experience-panel-kicker">Experience</p>
          </div>

          {/* Roadmap — behind date layer */}
          <ExperienceContainer activeIndex={revealedExperience} />

          {/* Date text — rendered last so it paints on top of roadmap */}
          <div ref={periodLayerRef} className="experience-period-layer" aria-hidden="true">
            {experiences.map((exp, i) => {
              const sepIdx = exp.bgLabel.indexOf(' - ');
              const leftPart      = sepIdx >= 0 ? exp.bgLabel.slice(0, sepIdx) : exp.bgLabel;
              const rightPart     = sepIdx >= 0 ? exp.bgLabel.slice(sepIdx + 3) : '';
              const dashCharIdx   = sepIdx + 1;
              const rightStartIdx = sepIdx + 3;
              return (
                <div key={i} className="experience-period">
                  <div className="experience-period-left">
                    {leftPart.split('').map((ch, j) => (
                      <span key={j} className="experience-period-char" ref={(el) => { if (!charRefs.current[i]) charRefs.current[i] = []; charRefs.current[i][j] = el; }}>
                        {ch}
                      </span>
                    ))}
                  </div>
                  <span className="experience-period-char" ref={(el) => { if (!charRefs.current[i]) charRefs.current[i] = []; charRefs.current[i][dashCharIdx] = el; }}>
                    -
                  </span>
                  <div className="experience-period-right">
                    {rightPart.split('').map((ch, j) => (
                      <span key={j} className="experience-period-char" ref={(el) => { if (!charRefs.current[i]) charRefs.current[i] = []; charRefs.current[i][rightStartIdx + j] = el; }}>
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </div>
  );
}
