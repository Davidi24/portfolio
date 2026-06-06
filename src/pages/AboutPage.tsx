import { FiArrowLeft, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import CustomCursor from '../components/Cursor/CustomCursor';
import aboutData from '../data/aboutData.json';
import './AboutPage.css';

const linkIcons = {
  GitHub: FiGithub,
  LinkedIn: FiLinkedin,
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <CustomCursor />

      <button className="about-page-back" onClick={() => history.back()} aria-label="Back to home">
        <FiArrowLeft aria-hidden="true" />
        <span>Back to home</span>
      </button>

      <section className="about-page-shell" aria-labelledby="about-page-title">
        <aside className="about-page-portrait" aria-label={aboutData.photo.alt}>
          <div className="about-page-portrait-frame">
            <img src={aboutData.photo.src} alt={aboutData.photo.alt} />
          </div>
          <div className="about-page-nameplate">
            <span>{aboutData.role}</span>
            <strong>{aboutData.name}</strong>
          </div>
        </aside>

        <div className="about-page-content">
          <p className="about-page-kicker">About Me</p>
          <h1 id="about-page-title" className="about-page-title-sr">{aboutData.role}</h1>

          <div className="about-page-contact" aria-label="Contact details">
            <a href={`mailto:${aboutData.email}`}>
              <FiMail aria-hidden="true" />
              <span>{aboutData.email}</span>
            </a>
            {aboutData.links.map(link => {
              const Icon = linkIcons[link.label as keyof typeof linkIcons] ?? FiArrowLeft;

              return (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                  <Icon aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>

          <div className="about-page-description">
            {aboutData.description.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="about-page-facts" aria-label="Quick facts">
            {aboutData.quickFacts.map(fact => (
              <div className="about-page-fact" key={fact.label}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </div>
            ))}
          </div>

          <section className="about-page-section about-page-skills-section" aria-labelledby="about-skills-title">
            <h2 id="about-skills-title">Technical Skills</h2>
            <div className="about-page-skills">
              {aboutData.skills.map(group => (
                <article className="about-page-skill-group" key={group.label}>
                  <h3>{group.label}</h3>
                  <div>
                    {group.items.map(item => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
