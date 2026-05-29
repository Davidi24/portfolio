import { useEffect, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const current = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      current.current.x = lerp(current.current.x, target.current.x, 0.12);
      current.current.y = lerp(current.current.y, target.current.y, 0.12);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px)`;
      }

      rafId.current = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" />;
}
