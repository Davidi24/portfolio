import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import './RotatingText.css';

interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function RotatingText({ words, interval = 1800, className = '' }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [width, setWidth] = useState<number | undefined>();
  const wordRef = useRef<HTMLSpanElement>(null);
  const word = words[index] ?? '';
  const EXIT_MS = 420;

  useEffect(() => {
    if (words.length < 2) return;
    const timer = window.setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % words.length);
        setIsExiting(false);
      }, EXIT_MS);
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
      <span
        key={index}
        ref={wordRef}
        className={`rotating-text-word${isExiting ? ' rotating-text-word--exit' : ''}`}
        aria-hidden="true"
      >
        {word.split('').map((letter, letterIndex) => (
          <span
            key={letterIndex}
            className="rotating-text-letter"
            style={{ '--i': letterIndex } as CSSProperties}
          >
            {letter === ' ' ? ' ' : letter}
          </span>
        ))}
      </span>
    </span>
  );
}
