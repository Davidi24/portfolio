import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowUpRight } from 'react-icons/fi';
import CardSwap, { Card } from "./CardSwap";
import aboutData from '../../data/aboutData.json';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const stat1 = aboutData.quickFacts[0];
const stat2 = aboutData.quickFacts[1];
const stat1Target = parseInt(stat1.value.replace('+', ''), 10);
const stat2Target = parseInt(stat2.value.replace('+', ''), 10);

const aboutCards = [
  {
    kicker: 'About Me',
    title: 'Full Stack Developer',
    body: 'I build reliable applications with expressive interfaces, thoughtful systems, and a strong eye for interaction.',
    className: 'about-card-dark',
  },
  {
    kicker: 'Focus',
    title: 'Creative Engineering',
    body: 'I like turning complex ideas into smooth products with React, TypeScript, GSAP, and sharp frontend architecture.',
    className: 'about-card-lime',
  },
  {
    kicker: 'Process',
    title: 'Details Matter',
    body: 'From layout rhythm to motion timing, I care about the small choices that make an experience feel finished.',
    className: 'about-card-white',
  },
  {
    kicker: 'Approach',
    title: 'Product Thinking',
    body: 'I balance clean UX, performance, and maintainable code so ideas can grow without becoming heavy.',
    className: 'about-card-soft-lime',
  },
  {
    kicker: 'Strength',
    title: 'Calm Execution',
    body: 'I move fast with structure, keeping the build focused, polished, and easy to keep improving.',
    className: 'about-card-cool-gray',
  },
];

export default function AboutMe() {
  const [statYears, setStatYears] = useState(0);
  const [statProjects, setStatProjects] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [mobileCardIndex, setMobileCardIndex] = useState(0);
  const [exitingMobileCardIndex, setExitingMobileCardIndex] = useState<number | null>(null);
  const mobileCardIndexRef = useRef(0);
  const mobileCarouselAnimatingRef = useRef(false);
  const mobileExitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        let y = 0;
        const yId = window.setInterval(() => {
          y += 1;
          setStatYears(y);
          if (y >= stat1Target) window.clearInterval(yId);
        }, 120);

        let p = 0;
        const pId = window.setInterval(() => {
          p += 1;
          setStatProjects(p);
          if (p >= stat2Target) window.clearInterval(pId);
        }, 120);
      },
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    mobileCardIndexRef.current = mobileCardIndex;
  }, [mobileCardIndex]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (mobileCarouselAnimatingRef.current) return;

      mobileCarouselAnimatingRef.current = true;
      const exitingIndex = mobileCardIndexRef.current;
      setExitingMobileCardIndex(exitingIndex);

      mobileExitTimerRef.current = window.setTimeout(() => {
        const nextIndex = (exitingIndex + 1) % aboutCards.length;
        mobileCardIndexRef.current = nextIndex;
        setMobileCardIndex(nextIndex);
        setExitingMobileCardIndex(null);
        mobileCarouselAnimatingRef.current = false;
      }, 700);
    }, 2500);

    return () => {
      window.clearInterval(interval);
      if (mobileExitTimerRef.current !== null) {
        window.clearTimeout(mobileExitTimerRef.current);
      }
    };
  }, []);

  return (
    <section id="about" className="about-section">
      <div className="about-inner">
      <div className="about-content">
        <p className="about-kicker">About Me</p>
        <h2>
          {aboutData.headingLines.map((line) => (
            <span key={line} className="about-title-line">{line}</span>
          ))}
        </h2>

        <div className="about-stats" ref={statsRef}>
          <div className="about-stat">
            <span className="about-stat-number">+{statYears}</span>
            <span className="about-stat-label">{stat1.label}</span>
          </div>
          <div className="about-stat-divider" aria-hidden="true" />
          <div className="about-stat">
            <span className="about-stat-number">+{statProjects}</span>
            <span className="about-stat-label">{stat2.label}</span>
          </div>
        </div>

        <a href="/about" className="about-cta" aria-label="Open full about me page">
          <span className="about-cta-label">About Me</span>
          <span className="about-cta-bridge" />
          <span className="about-cta-arrow" aria-hidden="true">
            <FiArrowUpRight className="about-cta-arrow-icon" />
          </span>
        </a>
      </div>

      <div className="about-photo" aria-label="David" />

      <div className="about-cards">
        <CardSwap
          width="var(--about-card-width)"
          height="var(--about-card-height)"
          cardDistance={96}
          verticalDistance={112}
          delay={4200}
          pauseOnHover
          skewAmount={5}
        >
          {aboutCards.map(card => (
            <Card key={card.title} customClass={`about-card ${card.className}`}>
              <span className="about-card-kicker">{card.kicker}</span>
              <div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </Card>
          ))}
        </CardSwap>
      </div>

      <div className="about-mobile-cards" aria-label="About carousel">
        {aboutCards.map((card, index) => {
          let visualOffset = index - mobileCardIndex;
          if (visualOffset < 0) visualOffset += aboutCards.length;
          const stackPosition = exitingMobileCardIndex === index
            ? 'exiting'
            : visualOffset <= 2
              ? String(visualOffset)
              : 'hidden';

          return (
            <article
              key={card.title}
              className={`about-mobile-card ${card.className}`}
              data-stack={stackPosition}
              aria-hidden={visualOffset !== 0}
            >
              <span className="about-card-kicker">{card.kicker}</span>
              <div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </article>
          );
        })}
      </div>
      </div>{/* end about-inner */}
    </section>
  );
}
