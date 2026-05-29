import './GlitchText.css';

interface GlitchTextProps {
  text: string;
  active: boolean;
  className?: string;
}

export default function GlitchText({ text, active, className = '' }: GlitchTextProps) {
  return (
    <span
      className={`glitch-text${active ? ' glitch-text--active' : ''}${className ? ` ${className}` : ''}`}
      data-text={text}
    >
      {text}
    </span>
  );
}
