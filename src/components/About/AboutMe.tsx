import { FiArrowUpRight } from 'react-icons/fi';
import CardSwap, { Card } from "./CardSwap";
import './About.css';

export default function AboutMe() {
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
          <Card customClass="about-card about-card-dark">
            <span className="about-card-kicker">About Me</span>
            <div>
              <h3>Full Stack Developer</h3>
              <p>I build reliable applications with expressive interfaces, thoughtful systems, and a strong eye for interaction.</p>
            </div>
          </Card>
          <Card customClass="about-card about-card-lime">
            <span className="about-card-kicker">Focus</span>
            <div>
              <h3>Creative Engineering</h3>
              <p>I like turning complex ideas into smooth products with React, TypeScript, GSAP, and sharp frontend architecture.</p>
            </div>
          </Card>
          <Card customClass="about-card about-card-white">
            <span className="about-card-kicker">Process</span>
            <div>
              <h3>Details Matter</h3>
              <p>From layout rhythm to motion timing, I care about the small choices that make an experience feel finished.</p>
            </div>
          </Card>
          <Card customClass="about-card about-card-soft-lime">
            <span className="about-card-kicker">Approach</span>
            <div>
              <h3>Product Thinking</h3>
              <p>I balance clean UX, performance, and maintainable code so ideas can grow without becoming heavy.</p>
            </div>
          </Card>
          <Card customClass="about-card about-card-cool-gray">
            <span className="about-card-kicker">Strength</span>
            <div>
              <h3>Calm Execution</h3>
              <p>I move fast with structure, keeping the build focused, polished, and easy to keep improving.</p>
            </div>
          </Card>
        </CardSwap>
      </div>
      </div>{/* end about-inner */}
    </section>
  );
}
