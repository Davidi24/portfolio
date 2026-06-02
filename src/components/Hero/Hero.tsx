import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowUpRight } from 'react-icons/fi';
import TrueFocus from './TrueFocus';
import GlitchText from './GlitchText';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

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

const PHRASES = [
  'What I do',
  'modern software',
  'latest technologies',
  'creative solutions',
  'scalable systems',
];

const heroFrameImages = [
  'https://picsum.photos/id/1015/1600/1000',
  'https://picsum.photos/id/1016/1600/1000',
  'https://picsum.photos/id/1025/1600/1000',
  'https://picsum.photos/id/1035/1600/1000',
  'https://picsum.photos/id/1043/1600/1000',
  'https://picsum.photos/id/1050/1600/1000',
  'https://picsum.photos/id/1060/1600/1000',
  'https://picsum.photos/id/1067/1600/1000',
  'https://picsum.photos/id/1074/1600/1000',
  'https://picsum.photos/id/1080/1600/1000',
  'https://picsum.photos/id/1081/1600/1000',
  'https://picsum.photos/id/1084/1600/1000',
];

export default function Hero() {
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const iAnchorRef  = useRef<HTMLDivElement>(null);
  const iRef        = useRef<HTMLDivElement>(null);
  const mobileActionsRef = useRef<HTMLDivElement>(null);
  const sequenceStartedRef = useRef(false);
  const forwardCycleCompletedRef = useRef(false);
  const phraseIndexRef = useRef(0);
  const phraseTimerRef = useRef<number | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [focusActive, setFocusActive] = useState(false);
  const [focusPlayKey, setFocusPlayKey] = useState(0);
  const [imagesActive, setImagesActive] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  const handleFocusComplete = useCallback(() => {
    forwardCycleCompletedRef.current = true;
    setFocusActive(false);
    setFrameIndex(0);
    setImagesActive(true);

    phraseTimerRef.current = window.setTimeout(() => {
      phraseTimerRef.current = null;
      const next = (phraseIndexRef.current + 1) % PHRASES.length;
      phraseIndexRef.current = next;
      setPhraseIndex(next);
      setImagesActive(false);
      setFocusActive(true);
      setFocusPlayKey(k => k + 1);
    }, 3000);
  }, []);

  useEffect(() => {
    heroFrameImages.forEach(src => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    let loop: number;
    const trigger = () => {
      setGlitchActive(true);
      window.setTimeout(() => setGlitchActive(false), 650);
    };
    trigger();
    loop = window.setInterval(trigger, 4000);
    return () => {
      window.clearInterval(loop);
    };
  }, []);

  useEffect(() => {
    if (!imagesActive) return;

    const frameTimer = window.setInterval(() => {
      setFrameIndex(index => (index + 1) % heroFrameImages.length);
    }, 180);

    const nudgeTimer = window.setTimeout(() => {
      window.scrollBy({ top: 160, behavior: 'smooth' });
    }, 6000);

    return () => {
      window.clearInterval(frameTimer);
      window.clearTimeout(nudgeTimer);
    };
  }, [imagesActive]);

  useEffect(() => {
    const subtitle = subtitleRef.current;
    const title    = titleRef.current;
    const iAnchor  = iAnchorRef.current;
    const iLetter  = iRef.current;
    const mobileActions = mobileActionsRef.current;
    if (!subtitle || !title || !iAnchor || !iLetter) return;

    const backingText = title.querySelectorAll<HTMLElement>('.hero-title-back');
    const focusDepth = 360;
    const perspective = () => parseFloat(getComputedStyle(title).perspective) || 1200;
    const projectedScale = () => perspective() / Math.max(perspective() - focusDepth, 1);
    const cssVar = (property: string, fallback: string) =>
      getComputedStyle(iAnchor).getPropertyValue(property).trim() || fallback;
    const viewportLength = (property: string, axis: 'x' | 'y', fallbackRatio: number) => {
      const value = cssVar(property, '');
      const amount = parseFloat(value);
      const viewportSize = axis === 'x' ? window.innerWidth : window.innerHeight;

      if (!Number.isFinite(amount)) return viewportSize * fallbackRatio;
      if (value.endsWith('vw')) return window.innerWidth * amount / 100;
      if (value.endsWith('vh')) return window.innerHeight * amount / 100;
      if (value.endsWith('%')) return viewportSize * amount / 100;
      if (value.endsWith('px')) return amount;

      return viewportSize * fallbackRatio;
    };
    const initialWidth = () => cssVar('--hero-i-visual-width', cssVar('--hero-i-width', '0.12em'));
    const initialHeight = () => cssVar('--hero-i-visual-height', cssVar('--hero-i-height', '0.78em'));
    const centeredXForWidth = (width: number) => {
      const rect = iAnchor.getBoundingClientRect();
      return window.innerWidth / 2 - (rect.left + width / 2);
    };

    const centeredYForHeight = (height: number) => {
      const rect = iAnchor.getBoundingClientRect();
      return window.innerHeight / 2 - (rect.bottom - height / 2);
    };

    const currentILetterWidth = () => iLetter.offsetWidth || iAnchor.getBoundingClientRect().width;
    const currentILetterHeight = () => iLetter.offsetHeight || iAnchor.getBoundingClientRect().height;
    const centerX = () => centeredXForWidth(currentILetterWidth());
    const centerY = () => centeredYForHeight(currentILetterHeight());
    const focusScale = () => {
      const rect = iAnchor.getBoundingClientRect();
      const targetScale = window.innerWidth <= 720 ? 3.2 : 3;
      const maxScale = (window.innerHeight * 0.55) / rect.height;
      return Math.min(targetScale, maxScale);
    };
    const usesFlatExpandedLetter = () => window.innerWidth <= 800;
    const expandedTransformFactor = () =>
      usesFlatExpandedLetter() ? 1 : Math.max(focusScale() * projectedScale(), 1);
    const currentProjection = () => {
      const z = parseFloat(String(gsap.getProperty(iLetter, 'z'))) || 0;
      const scale = parseFloat(String(gsap.getProperty(iLetter, 'scale'))) || 1;
      const p = perspective();
      return Math.max(scale * (p / Math.max(p - z, 1)), 1);
    };
    const lockILetterToViewportCenter = () => {
      gsap.set(iLetter, {
        x: centeredXForWidth(currentILetterWidth()),
        y: centeredYForHeight(currentILetterHeight()),
      });

      const projection = currentProjection();
      for (let i = 0; i < 4; i += 1) {
        const rect = iLetter.getBoundingClientRect();
        const currentX = parseFloat(String(gsap.getProperty(iLetter, 'x'))) || 0;
        const currentY = parseFloat(String(gsap.getProperty(iLetter, 'y'))) || 0;

        gsap.set(iLetter, {
          x: currentX + (window.innerWidth / 2 - (rect.left + rect.width / 2)) / projection,
          y: currentY + (window.innerHeight / 2 - (rect.top + rect.height / 2)) / projection,
        });
      }
    };
    const expandedTargetWidth = () => {
      const isLaptopViewport = window.innerWidth >= 1000 && window.innerWidth < 1300;
      const isMidMonitorViewport = window.innerWidth >= 1300 && window.innerWidth <= 1600;
      const maxWidthRatio = window.innerWidth <= 800 ? 0.99 : isLaptopViewport ? 0.76 : isMidMonitorViewport ? 0.68 : 0.62;
      return Math.min(viewportLength('--hero-i-expanded-width', 'x', maxWidthRatio), window.innerWidth * maxWidthRatio);
    };
    const expandedTargetHeight = () => {
      const isLaptopViewport = window.innerWidth >= 1000 && window.innerWidth < 1300;
      const maxHeightRatio = window.innerWidth <= 800 ? 0.68 : isLaptopViewport ? 0.82 : 0.68;
      return Math.min(viewportLength('--hero-i-expanded-height', 'y', maxHeightRatio), window.innerHeight * maxHeightRatio);
    };
    const expandedWidthPx = () => expandedTargetWidth() / expandedTransformFactor();
    const expandedHeightPx = () => expandedTargetHeight() / expandedTransformFactor();
    const expandedWidth = () => `${expandedWidthPx()}px`;
    const expandedHeight = () => `${expandedHeightPx()}px`;
    const expandedX = () => centeredXForWidth(expandedWidthPx());
    const expandedY = () => centeredYForHeight(expandedHeightPx());
    const expandedScale = () => usesFlatExpandedLetter() ? 1 : focusScale();
    const expandedZ = () => usesFlatExpandedLetter() ? 0 : focusDepth;

    gsap.set([subtitle, backingText, mobileActions].filter(Boolean), {
      opacity: 1,
      scale: 1,
      y: 0,
      z: 0,
      filter: 'blur(0px)',
      force3D: true,
    });
    gsap.set(iLetter, {
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      opacity: 1,
      width: initialWidth(),
      height: initialHeight(),
      backgroundColor: '#1a1a16',
      borderRadius: '0px',
      transformOrigin: '50% 50%',
      textShadow: '0 0 0 rgba(17, 17, 17, 0)',
      force3D: true,
    });

    const resetSequence = () => {
      if (phraseTimerRef.current !== null) {
        window.clearTimeout(phraseTimerRef.current);
        phraseTimerRef.current = null;
      }
      phraseIndexRef.current = 0;
      setPhraseIndex(0);
      sequenceStartedRef.current = false;
      setFocusActive(false);
      setFrameIndex(0);
    };

    const startFocusSequence = () => {
      if (sequenceStartedRef.current) return;

      sequenceStartedRef.current = true;
      forwardCycleCompletedRef.current = false;
      setFrameIndex(0);
      setImagesActive(false);
      setFocusActive(true);
      setFocusPlayKey(key => key + 1);
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-wrapper',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    tl
      .to(backingText, {
        opacity: 0.14,
        scale: 0.78,
        z: -520,
        filter: 'blur(2.6px)',
        duration: 1.8,
        ease: 'power3.out',
        stagger: { each: 0.04, from: 'center' },
      }, 0)
      .to(subtitle, {
        opacity: 0.16,
        y: '-2vh',
        z: -420,
        filter: 'blur(2px)',
        duration: 1.5,
        ease: 'power3.out',
      }, 0)
      .to(mobileActions, {
        opacity: 0,
        y: '2vh',
        z: -420,
        filter: 'blur(2px)',
        duration: 1.5,
        ease: 'power3.out',
      }, 0)
      .to(iLetter,  {
        x: centerX,
        y: centerY,
        scale: focusScale,
        z: focusDepth,
        textShadow: '0 0.06em 0.16em rgba(17, 17, 17, 0.2)',
        duration: 1.8,
        ease: 'power3.out',
        onReverseComplete: () => setImagesActive(false),
      }, 0.06)
      .to(iLetter, {
        x: expandedX,
        y: expandedY,
        scale: expandedScale,
        z: expandedZ,
        width: expandedWidth,
        height: expandedHeight,
        backgroundColor: '#000000',
        borderRadius: '0px',
        duration: 1.25,
        ease: 'power3.inOut',
        onUpdate: lockILetterToViewportCenter,
        onComplete: lockILetterToViewportCenter,
        onReverseComplete: lockILetterToViewportCenter,
      })
      .to({}, {
        duration: 0.01,
        onStart: startFocusSequence,
        onReverseComplete: resetSequence,
      })
      .to({}, {
        duration: 8,
        onReverseComplete: resetSequence,
      })
      .to({}, {
        duration: 0.01,
        onStart: () => { setImagesActive(false); resetSequence(); },
        onReverseComplete: () => {
          sequenceStartedRef.current = false;
          startFocusSequence();
        },
      })
      .to({}, { duration: 0.001 });

    return () => { tl.kill(); };
  }, []);

  return (
    <div className="hero-wrapper">
    <section id="home" className="hero-stage">
      <div className="hero-bg" aria-hidden="true" />

      <aside className="left-sidebar">
        <img src="/logo.png" alt="David logo" className="sidebar-logo" />

        <div className="social-icons">
          {socials.map(({ label, href, path }) => (
            <a key={label} href={href} aria-label={label} className="social-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={path} />
              </svg>
            </a>
          ))}
        </div>
      </aside>

      <div className="hero-center">
        <p ref={subtitleRef} className="hero-subtitle">Hi, I am David</p>
        <div ref={titleRef} className="hero-title" role="heading" aria-level={1} aria-label="Software Engineer">
          <div className="hero-title-row hero-title-back"><GlitchText text="Software" active={glitchActive} /></div>
          <div className="hero-title-row hero-engineer-row">
            <span className="hero-title-back hero-title-fragment">Eng</span>
            <div ref={iAnchorRef} className="hero-title-i-anchor">
              <div ref={iRef} className="hero-title-i">
                <div className={`hero-title-i-focus ${focusActive ? 'is-visible' : ''}`}>
                  <TrueFocus
                    sentence={PHRASES[phraseIndex]}
                    active={focusActive}
                    playKey={focusPlayKey}
                    cycleCount={1}
                    onComplete={handleFocusComplete}
                    blurAmount={4}
                    borderColor="#ffffff"
                    glowColor="rgba(255, 255, 255, 0.58)"
                    animationDuration={0.5}
                    pauseBetweenAnimations={0.45}
                  />
                </div>
                <img
                  src={heroFrameImages[frameIndex]}
                  alt=""
                  className={`hero-title-i-slideshow ${imagesActive ? 'is-visible' : ''}`}
                  aria-hidden="true"
                  onError={event => {
                    event.currentTarget.src = heroFrameImages[0];
                  }}
                />
              </div>
            </div>
            <span className="hero-title-back hero-title-fragment">neer</span>
          </div>
        </div>

        <div ref={mobileActionsRef} className="mobile-hero-actions">
          <div className="mobile-social-icons" aria-label="Social links">
            {socials.map(({ label, href, path }) => (
              <a key={label} href={href} aria-label={label} className="mobile-social-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
          <a href="/cv.pdf" download className="mobile-cv-button" aria-label="Download CV">
            <span className="mobile-cv-label">Download CV</span>
            <span className="mobile-cv-bridge" />
            <span className="mobile-cv-arrow" aria-hidden="true">
              <FiArrowUpRight className="mobile-cv-arrow-icon" />
            </span>
          </a>
        </div>
      </div>

      <div className="hero-scroll">
        <span>Scroll to Explore</span>
        <svg width="1" height="48" viewBox="0 0 1 48" aria-hidden="true">
          <line x1="0.5" y1="0" x2="0.5" y2="36" stroke="currentColor" strokeWidth="1" />
          <polyline points="-4,30 0.5,38 5,30" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </section>
    </div>
  );
}
