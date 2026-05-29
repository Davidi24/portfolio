import RotatingText from './RotatingText';
import './ExperienceHeader.css';

export default function ExperienceHeader() {
  return (
    <div className="experience-intro-copy">
      <p className="experience-intro-kicker">Experience</p>
      <span className="experience-intro-accent" aria-hidden="true" />
      <h2>
        Designed, built, and shipped{' '}
        <span className="experience-intro-with">
          with <RotatingText words={['care ', 'precision ', 'motion ', 'clarity ']} />
        </span>
      </h2>
    </div>
  );
}
