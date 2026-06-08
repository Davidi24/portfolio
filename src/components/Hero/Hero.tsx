import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowUpRight } from 'react-icons/fi';
import TrueFocus from './TrueFocus';
import GlitchText from './GlitchText';
import RotatingText from '../Experience/RotatingText';
// @ts-expect-error React Bits JS-CSS registry item is intentionally installed as JSX.
import InfiniteMenu from '../ReactBits/InfiniteMenu.jsx';
import { trackCvDownload } from '../Analytics/analyticsEvents';
import heroData from '../../data/heroData.json';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

type HeroPhraseMode = 'focus' | 'rotate';
type HeroMediaMode = 'photos' | 'menu';

interface HeroPhrase {
  text: string;
  mode: HeroPhraseMode;
  media: HeroMediaMode;
  staticWord?: string;
  rotatingWords?: readonly string[];
}

const socials = heroData.socials;

const PHRASES = heroData.expanded.phrases as readonly HeroPhrase[];

const ROTATING_PHRASE_DURATION_MS = 4300;
const ROTATING_WORD_INTERVAL_MS = 1500;
const PHOTO_FRAME_INTERVAL_MS = 300;
const MENU_ADVANCES_BEFORE_NEXT = 4;
const MENU_AUTO_ADVANCE_DELAY_MS = 900;
const MENU_AUTO_ADVANCE_DURATION_MS = 1200;
const ABOUT_SHRINK_START_TIME = 8.55;
const ABOUT_SHRINK_TO_FOCUS_DURATION = 1.45;
const ABOUT_SHRINK_TO_TITLE_DURATION = 2.15;

interface HeroRotatingPhraseProps {
  text: string;
  staticWord?: string;
  rotatingWords?: readonly string[];
  active: boolean;
  playKey: number;
  onComplete: () => void;
}

function HeroRotatingPhrase({ text, staticWord, rotatingWords, active, playKey, onComplete }: HeroRotatingPhraseProps) {
  const words = text.split(' ').filter(Boolean);
  const rotatingWord = words.at(-1) ?? text;
  const displayWords = rotatingWords && rotatingWords.length > 0 ? rotatingWords : [rotatingWord];
  const staticText = staticWord ?? words.slice(0, -1).join(' ');

  useEffect(() => {
    if (!active) return;

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, ROTATING_PHRASE_DURATION_MS);

    return () => {
      window.clearTimeout(completeTimer);
    };
  }, [active, onComplete, playKey, text]);

  return (
    <span className="hero-rotating-text" aria-label={text}>
      {staticText && <span className="hero-rotating-text-static">{staticText}</span>}
      <RotatingText
        key={`${playKey}-${text}`}
        words={[...displayWords]}
        interval={ROTATING_WORD_INTERVAL_MS}
        className="hero-rotating-text-badge"
      />
    </span>
  );
}

type PhraseMode = (typeof PHRASES)[number]['mode'];
type MediaMode = (typeof PHRASES)[number]['media'];

const isPhraseMode = (mode: PhraseMode, phraseIndex: number) =>
  PHRASES[phraseIndex]?.mode === mode;

const isMediaMode = (mode: MediaMode, phraseIndex: number) =>
  PHRASES[phraseIndex]?.media === mode;

const focusAnimationDurationFor = (phraseIndex: number) =>
  PHRASES[phraseIndex]?.text === 'latest technologies' ? 0.9 : 0.5;

const focusPauseBetweenAnimationsFor = (phraseIndex: number) =>
  PHRASES[phraseIndex]?.text === 'latest technologies' ? 0.75 : 0.45;

const PHOTO_SETS = [
  heroData.expanded.photoFrames1,
  heroData.expanded.photoFrames2,
  heroData.expanded.photoFrames3,
];
const PHRASE_TO_PHOTO_SET: Record<number, number> = { 0: 0, 2: 1, 3: 2 };
const heroMenuItems = heroData.expanded.menuItems;

interface HeroRotatingMenuProps {
  onAdvanceComplete: () => void;
}

function HeroRotatingMenu({ onAdvanceComplete }: HeroRotatingMenuProps) {
  return (
    <div className="hero-rotating-menu" aria-hidden="true">
      <InfiniteMenu
        items={heroMenuItems}
        scale={0.9}
        autoAdvanceDelay={MENU_AUTO_ADVANCE_DELAY_MS}
        autoAdvanceDuration={MENU_AUTO_ADVANCE_DURATION_MS}
        onAutoAdvanceComplete={onAdvanceComplete}
        textureCellSize={1024}
      />
    </div>
  );
}

export default function Hero() {
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const iAnchorRef  = useRef<HTMLDivElement>(null);
  const iRef        = useRef<HTMLDivElement>(null);
  const mobileActionsRef = useRef<HTMLDivElement>(null);
  const sequenceStartedRef = useRef(false);
  const expandedScrollCueShownRef = useRef(false);
  const forwardCycleCompletedRef = useRef(false);
  const menuAdvanceCountRef = useRef(0);
  const phraseIndexRef = useRef(0);
  const phraseTimerRef = useRef<number | null>(null);
  const expandedScrollCueStartYRef = useRef<number | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [focusActive, setFocusActive] = useState(false);
  const slideshowSlotRef = useRef<0 | 1>(0);
  const [slideshowSrcs, setSlideshowSrcs] = useState<[string, string]>([PHOTO_SETS[0][0], PHOTO_SETS[0][0]]);
  const [slideshowActiveSlot, setSlideshowActiveSlot] = useState<0 | 1>(0);
  const [focusPlayKey, setFocusPlayKey] = useState(0);
  const [mediaActive, setMediaActive] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [showExpandedScrollCue, setShowExpandedScrollCue] = useState(false);

  const showExpandedScrollCueOnce = useCallback(() => {
    if (expandedScrollCueShownRef.current) return;

    expandedScrollCueShownRef.current = true;
    expandedScrollCueStartYRef.current = window.scrollY;
    setShowExpandedScrollCue(true);
  }, []);

  const advanceToNextPhrase = useCallback(() => {
    if (phraseTimerRef.current !== null) {
      window.clearTimeout(phraseTimerRef.current);
      phraseTimerRef.current = null;
    }

    const reachedEnd = phraseIndexRef.current >= PHRASES.length - 1;
    if (reachedEnd) {
      showExpandedScrollCueOnce();
    }

    const next = reachedEnd ? 0 : phraseIndexRef.current + 1;
    phraseIndexRef.current = next;
    setPhraseIndex(next);
    forwardCycleCompletedRef.current = false;
    menuAdvanceCountRef.current = 0;
    setMediaActive(false);
    setFocusActive(true);
    setFocusPlayKey(k => k + 1);
  }, [showExpandedScrollCueOnce]);

  const handleMenuAdvanceComplete = useCallback(() => {
    if (!sequenceStartedRef.current || !forwardCycleCompletedRef.current) return;
    if (!isMediaMode('menu', phraseIndexRef.current)) return;

    menuAdvanceCountRef.current += 1;

    if (menuAdvanceCountRef.current >= MENU_ADVANCES_BEFORE_NEXT) {
      advanceToNextPhrase();
    }
  }, [advanceToNextPhrase]);

  const handlePhraseComplete = useCallback(() => {
    if (!sequenceStartedRef.current || forwardCycleCompletedRef.current) return;

    forwardCycleCompletedRef.current = true;
    menuAdvanceCountRef.current = 0;
    setFocusActive(false);
    setFrameIndex(0);
    setMediaActive(true);
  }, []);

  useEffect(() => {
    if (!showExpandedScrollCue) return;

    const dismissCueOnScroll = () => {
      const startY = expandedScrollCueStartYRef.current ?? window.scrollY;
      if (Math.abs(window.scrollY - startY) > 6) {
        setShowExpandedScrollCue(false);
      }
    };

    window.addEventListener('scroll', dismissCueOnScroll, { passive: true });
    return () => window.removeEventListener('scroll', dismissCueOnScroll);
  }, [showExpandedScrollCue]);

  useEffect(() => {
    [...PHOTO_SETS.flat(), ...heroMenuItems.map(item => item.image)].forEach(src => {
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
    const full = heroData.typedSubtitle;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedSubtitle(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 65);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!mediaActive || !isMediaMode('photos', phraseIndex)) return;

    const set = PHOTO_SETS[PHRASE_TO_PHOTO_SET[phraseIndex] ?? 0] ?? PHOTO_SETS[0];
    const src = set[frameIndex] ?? set[0];
    const next: 0 | 1 = slideshowSlotRef.current === 0 ? 1 : 0;
    setSlideshowSrcs(prev => { const n = [...prev] as [string, string]; n[next] = src; return n; });
    setSlideshowActiveSlot(next);
    slideshowSlotRef.current = next;
  }, [frameIndex, phraseIndex, mediaActive]);

  useEffect(() => {
    if (!mediaActive || !isMediaMode('photos', phraseIndex)) return;

    const set = PHOTO_SETS[PHRASE_TO_PHOTO_SET[phraseIndex] ?? 0] ?? PHOTO_SETS[0];
    const setLength = set.length;
    let currentIndex = 0;
    let timerId: number;

    const tick = () => {
      currentIndex += 1;
      if (currentIndex >= setLength) {
        advanceToNextPhrase();
        return;
      }
      setFrameIndex(currentIndex);
      timerId = window.setTimeout(tick, PHOTO_FRAME_INTERVAL_MS);
    };

    timerId = window.setTimeout(tick, PHOTO_FRAME_INTERVAL_MS);
    return () => window.clearTimeout(timerId);
  }, [mediaActive, phraseIndex, advanceToNextPhrase]);

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
    const cssVar = (property: string, fallback: string) => {
      const raw = getComputedStyle(iAnchor).getPropertyValue(property).trim();
      // Minified CSS strips leading zeros (0.14em -> .14em); GSAP can't parse
      // a bare leading decimal and resolves it to 0, so restore it here.
      return raw ? raw.replace(/^(-?)\.(\d)/, '$10.$2') : fallback;
    };
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
    const usesFlatExpandedLetter = () => window.innerWidth <= 1150;
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
      const isLargeMonitorViewport = window.innerWidth >= 1700 && window.innerWidth <= 2200;
      const maxWidthRatio = window.innerWidth <= 1150 ? 0.99 : isLaptopViewport ? 0.76 : isMidMonitorViewport ? 0.68 : isLargeMonitorViewport ? 0.68 : 0.62;
      return Math.min(viewportLength('--hero-i-expanded-width', 'x', maxWidthRatio), window.innerWidth * maxWidthRatio);
    };
    const expandedTargetHeight = () => {
      const isLaptopViewport = window.innerWidth >= 1000 && window.innerWidth < 1300;
      const maxHeightRatio = window.innerWidth <= 1150 ? 0.68 : isLaptopViewport ? 0.82 : 0.68;
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
      backgroundColor: '#0e0e0e',
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
      expandedScrollCueShownRef.current = false;
      forwardCycleCompletedRef.current = false;
      menuAdvanceCountRef.current = 0;
      expandedScrollCueStartYRef.current = null;
      setPhraseIndex(0);
      sequenceStartedRef.current = false;
      setFocusActive(false);
      setMediaActive(false);
      setShowExpandedScrollCue(false);
      setFrameIndex(0);
    };

    const startFocusSequence = () => {
      if (sequenceStartedRef.current) return;

      sequenceStartedRef.current = true;
      expandedScrollCueShownRef.current = false;
      forwardCycleCompletedRef.current = false;
      menuAdvanceCountRef.current = 0;
      expandedScrollCueStartYRef.current = null;
      setShowExpandedScrollCue(false);
      setFrameIndex(0);
      setMediaActive(false);
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
        onReverseComplete: () => setMediaActive(false),
      }, 0.06)
      .to(iLetter, {
        x: expandedX,
        y: expandedY,
        scale: expandedScale,
        z: expandedZ,
        width: expandedWidth,
        height: expandedHeight,
        backgroundColor: '#0e0e0e',
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
      .to(iLetter, {
        x: centerX,
        y: centerY,
        scale: focusScale,
        z: focusDepth,
        width: initialWidth,
        height: initialHeight,
        textShadow: '0 0.06em 0.16em rgba(17, 17, 17, 0.2)',
        duration: ABOUT_SHRINK_TO_FOCUS_DURATION,
        ease: 'power3.inOut',
        onStart: resetSequence,
        onUpdate: lockILetterToViewportCenter,
        onComplete: lockILetterToViewportCenter,
        onReverseComplete: () => {
          sequenceStartedRef.current = false;
          startFocusSequence();
        },
      }, ABOUT_SHRINK_START_TIME)
      .to([backingText, subtitle, mobileActions].filter(Boolean), {
        opacity: 1,
        scale: 1,
        y: 0,
        z: 0,
        filter: 'blur(0px)',
        duration: ABOUT_SHRINK_TO_TITLE_DURATION,
        ease: 'power3.out',
      }, ABOUT_SHRINK_START_TIME + ABOUT_SHRINK_TO_FOCUS_DURATION)
      .to(iLetter, {
        x: 0,
        y: 0,
        scale: 1,
        z: 0,
        width: initialWidth,
        height: initialHeight,
        textShadow: '0 0 0 rgba(17, 17, 17, 0)',
        duration: ABOUT_SHRINK_TO_TITLE_DURATION,
        ease: 'power3.out',
        onComplete: resetSequence,
      }, ABOUT_SHRINK_START_TIME + ABOUT_SHRINK_TO_FOCUS_DURATION)
      .to({}, {
        duration: 0.01,
        onStart: () => { setMediaActive(false); resetSequence(); },
        onReverseComplete: resetSequence,
      })
      .to({}, { duration: 0.001 });

    return () => { tl.kill(); };
  }, []);

  return (
    <div className="hero-wrapper">
    <section id="home" className="hero-stage">
      <div className="hero-bg" aria-hidden="true" />

      <aside className="left-sidebar">
        <img src={heroData.logo.src} alt={heroData.logo.alt} className="sidebar-logo" />

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
        <p ref={subtitleRef} className="hero-subtitle">{typedSubtitle}</p>
        <div ref={titleRef} className="hero-title" role="heading" aria-level={1} aria-label={heroData.title.ariaLabel}>
          <div className="hero-title-row hero-title-back"><GlitchText text={heroData.title.top} active={glitchActive} /></div>
          <div className="hero-title-row hero-engineer-row">
            <span className="hero-title-back hero-title-fragment">{heroData.title.engineerPrefix}</span>
            <div ref={iAnchorRef} className="hero-title-i-anchor">
              <div ref={iRef} className="hero-title-i">
                <div className={`hero-title-i-focus ${focusActive && isPhraseMode('focus', phraseIndex) ? 'is-visible' : ''}`}>
                  <TrueFocus
                    sentence={PHRASES[phraseIndex].text}
                    active={focusActive && isPhraseMode('focus', phraseIndex)}
                    playKey={focusPlayKey}
                    cycleCount={1}
                    onComplete={handlePhraseComplete}
                    blurAmount={4}
                    borderColor="#ffffff"
                    glowColor="rgba(255, 255, 255, 0.58)"
                    animationDuration={focusAnimationDurationFor(phraseIndex)}
                    pauseBetweenAnimations={focusPauseBetweenAnimationsFor(phraseIndex)}
                  />
                </div>
                <div className={`hero-title-i-rotating ${focusActive && isPhraseMode('rotate', phraseIndex) ? 'is-visible' : ''}`}>
                  <HeroRotatingPhrase
                    text={PHRASES[phraseIndex].text}
                    staticWord={PHRASES[phraseIndex].staticWord}
                    rotatingWords={PHRASES[phraseIndex].rotatingWords}
                    active={focusActive && isPhraseMode('rotate', phraseIndex)}
                    playKey={focusPlayKey}
                    onComplete={handlePhraseComplete}
                  />
                </div>
                {([0, 1] as const).map(slot => (
                  <img
                    key={slot}
                    src={slideshowSrcs[slot]}
                    alt=""
                    aria-hidden="true"
                    className={`hero-title-i-slideshow ${mediaActive && isMediaMode('photos', phraseIndex) && slot === slideshowActiveSlot ? 'is-visible' : ''}`}
                    onError={e => { e.currentTarget.src = PHOTO_SETS[0][0]; }}
                  />
                ))}
                <div className={`hero-title-i-menu ${mediaActive && isMediaMode('menu', phraseIndex) ? 'is-visible' : ''}`}>
                  {mediaActive && isMediaMode('menu', phraseIndex) && (
                    <HeroRotatingMenu
                      key={`hero-menu-${phraseIndex}-${focusPlayKey}`}
                      onAdvanceComplete={handleMenuAdvanceComplete}
                    />
                  )}
                </div>
              </div>
            </div>
            <span className="hero-title-back hero-title-fragment">{heroData.title.engineerSuffix}</span>
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
          <a
            href={heroData.cv.href}
            download
            className="mobile-cv-button"
            aria-label={heroData.cv.label}
            onClick={() => trackCvDownload({ source: 'mobile-hero' })}
          >
            <span className="mobile-cv-label">{heroData.cv.label}</span>
            <span className="mobile-cv-bridge" />
            <span className="mobile-cv-arrow" aria-hidden="true">
              <FiArrowUpRight className="mobile-cv-arrow-icon" />
            </span>
          </a>
        </div>
      </div>

      <div className={`hero-scroll${showExpandedScrollCue ? ' is-expanded-cue' : ''}`}>
        <span>{heroData.scrollLabel}</span>
        <svg width="1" height="48" viewBox="0 0 1 48" aria-hidden="true">
          <line className="hero-scroll-line" x1="0.5" y1="0" x2="0.5" y2="36" stroke="currentColor" strokeWidth="1" />
          <polyline className="hero-scroll-arrow" points="-4,30 0.5,38 5,30" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </section>
    </div>
  );
}
