import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import './RotatingText.css';

interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function RotatingText({ words, interval = 1800, className = '' }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState<number | undefined>();
  const wordRef = useRef<HTMLSpanElement>(null);
  const word = words[index] ?? '';

  useEffect(() => {
    if (words.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, words.length]);

  useEffect(() => {
    if (!wordRef.current) return;

    setWidth(wordRef.current.offsetWidth);
  }, [word]);

  return (
    <span
      className={`rotating-text ${className}`.trim()}
      style={{ width } as CSSProperties}
      aria-live="polite"
      aria-label={word}
    >
      <span key={`${word}-${index}`} ref={wordRef} className="rotating-text-word" aria-hidden="true">
        {word.split('').map((letter, letterIndex) => (
          <span
            key={`${letter}-${letterIndex}`}
            className="rotating-text-letter"
            style={{ '--i': letterIndex } as CSSProperties}
          >
            {letter === ' ' ? '\u00a0' : letter}
          </span>
        ))}
      </span>
    </span>
  );
}
