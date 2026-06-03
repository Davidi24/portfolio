import { useEffect, useRef, useState } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import CardSwap, { Card } from "./CardSwap";
import './About.css';

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
  const [mobileCardIndex, setMobileCardIndex] = useState(0);
  const [exitingMobileCardIndex, setExitingMobileCardIndex] = useState<number | null>(null);
  const mobileCardIndexRef = useRef(0);
  const mobileCarouselAnimatingRef = useRef(false);
  const mobileExitTimerRef = useRef<number | null>(null);

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
          <span className="about-title-line">I'm David, a software</span>
          <span className="about-title-line">engineer turning complex</span>
          <span className="about-title-line">ideas into software that</span>
          <span className="about-title-line">feels simple, powerful,</span>
          <span className="about-title-line">and worth using.</span>
        </h2>

        <div className="about-stats">
          <div className="about-stat">
            <span className="about-stat-number">+3</span>
            <span className="about-stat-label">Years of Experience</span>
          </div>
          <div className="about-stat-divider" aria-hidden="true" />
          <div className="about-stat">
            <span className="about-stat-number">+10</span>
            <span className="about-stat-label">Projects</span>
          </div>
        </div>

        <a href="#contact" className="about-cta" aria-label="Go to contact section">
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
