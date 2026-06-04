import RotatingText from './RotatingText';
import experienceData from '../../data/experienceData.json';
import './ExperienceHeader.css';

const { header } = experienceData;

export default function ExperienceHeader() {
  return (
    <div className="experience-intro-copy">
      <p className="experience-intro-kicker">{header.kicker}</p>
      <span className="experience-intro-accent" aria-hidden="true" />
      <h2>
        {header.headingStart}{' '}
        <span className="experience-intro-with">
          {header.headingWith} <RotatingText words={[...header.rotatingWords]} />
        </span>
      </h2>
    </div>
  );
}
