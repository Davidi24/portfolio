import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import './TrueFocus.css';

interface TrueFocusProps {
  sentence?: string;
  separator?: string;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  cycleCount?: number;
  active?: boolean;
  playKey?: number;
  onComplete?: () => void;
}

interface FocusRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function TrueFocus({
  sentence = 'True Focus',
  separator = ' ',
  blurAmount = 5,
  borderColor = '#ffffff',
  glowColor = 'rgba(255, 255, 255, 0.55)',
  animationDuration = 0.45,
  pauseBetweenAnimations = 0.45,
  cycleCount,
  active = true,
  playKey = 0,
  onComplete,
}: TrueFocusProps) {
  const words = sentence.split(separator).filter(Boolean);
  const hasLongWord = words.some(word => word.length >= 7);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusRect, setFocusRect] = useState<FocusRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!active || words.length === 0) return;

    const maxSteps = cycleCount ? words.length * cycleCount : Infinity;
    let step = 0;
    let nextIndex = 0;
    setCurrentIndex(0);

    const interval = window.setInterval(() => {
      step += 1;
      if (step >= maxSteps) {
        window.clearInterval(interval);
        onComplete?.();
        return;
      }

      nextIndex = (nextIndex + 1) % words.length;
      setCurrentIndex(nextIndex);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => window.clearInterval(interval);
  }, [active, animationDuration, pauseBetweenAnimations, cycleCount, onComplete, playKey, words.length]);

  useEffect(() => {
    if (!active) return;

    const updateFocusRect = () => {
      const container = containerRef.current;
      const activeWord = wordRefs.current[currentIndex];
      if (!container || !activeWord) return;

      setFocusRect({
        x: activeWord.offsetLeft,
        y: activeWord.offsetTop,
        width: activeWord.offsetWidth,
        height: activeWord.offsetHeight,
      });
    };

    updateFocusRect();
    window.addEventListener('resize', updateFocusRect);

    return () => window.removeEventListener('resize', updateFocusRect);
  }, [active, currentIndex, words.length]);

  return (
    <div className={`true-focus${hasLongWord ? ' true-focus-long' : ''}`} ref={containerRef} aria-label={sentence}>
      {words.map((word, index) => {
        const isActive = index === currentIndex && active;

        return (
          <span
            key={`${word}-${index}`}
            ref={element => {
              wordRefs.current[index] = element;
            }}
            className="true-focus-word"
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease, opacity ${animationDuration}s ease`,
              opacity: isActive ? 1 : 0.58,
            }}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        className="true-focus-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: active ? 1 : 0,
        }}
        transition={{ duration: animationDuration, ease: 'easeOut' }}
        style={{
          '--border-color': borderColor,
          '--glow-color': glowColor,
        } as CSSProperties}
        aria-hidden="true"
      >
        <span className="true-focus-corner true-focus-corner-top-left" />
        <span className="true-focus-corner true-focus-corner-top-right" />
        <span className="true-focus-corner true-focus-corner-bottom-left" />
        <span className="true-focus-corner true-focus-corner-bottom-right" />
      </motion.div>
    </div>
  );
}
