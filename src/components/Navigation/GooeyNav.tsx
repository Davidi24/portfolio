import React, { useRef, useEffect, useState } from 'react';
import './GooeyNav.css';

interface GooeyNavItem {
  label: string;
  href: string;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  autoHoverDelay?: number;
}

const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  autoHoverDelay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const pendingTimeouts = useRef<number[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const clearPendingTimeouts = () => {
    pendingTimeouts.current.forEach(id => window.clearTimeout(id));
    pendingTimeouts.current = [];
  };

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = (element: HTMLElement) => {
    const d: [number, number] = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');

      const tid = window.setTimeout(() => {
        pendingTimeouts.current = pendingTimeouts.current.filter(id => id !== tid);
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // Do nothing
          }
        }, t);
      }, 30);
      pendingTimeouts.current.push(tid);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLLIElement>, index: number) => {
    clearPendingTimeouts();
    const liEl = e.currentTarget;
    setHoveredIndex(index);
    updateEffectPosition(liEl);

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach(p => filterRef.current!.removeChild(p));
    }

    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }

    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
  };

  const handleMouseLeave = () => {
    clearPendingTimeouts();
    setHoveredIndex(null);

    if (textRef.current) {
      textRef.current.classList.remove('active');
      textRef.current.style.width = '0';
      textRef.current.style.height = '0';
      textRef.current.innerText = '';
    }

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach(p => filterRef.current!.removeChild(p));
      filterRef.current.classList.remove('active');
      filterRef.current.style.width = '0';
      filterRef.current.style.height = '0';
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (hoveredIndex !== null && navRef.current) {
        const currentLi = navRef.current.querySelectorAll('li')[hoveredIndex] as HTMLElement;
        if (currentLi) updateEffectPosition(currentLi);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [hoveredIndex]);

  useEffect(() => {
    if (autoHoverDelay === undefined) return;

    const startId = window.setTimeout(() => {
      const li = navRef.current?.querySelectorAll('li')[0] as HTMLElement | undefined;
      if (!li) return;

      setHoveredIndex(0);
      updateEffectPosition(li);

      if (textRef.current) {
        textRef.current.classList.remove('active');
        void textRef.current.offsetWidth;
        textRef.current.classList.add('active');
      }
      if (filterRef.current) {
        filterRef.current.querySelectorAll('.particle').forEach(p => filterRef.current!.removeChild(p));
        makeParticles(filterRef.current);
      }

      const endId = window.setTimeout(() => {
        clearPendingTimeouts();
        setHoveredIndex(null);
        if (textRef.current) {
          textRef.current.classList.remove('active');
          textRef.current.style.width = '0';
          textRef.current.style.height = '0';
          textRef.current.innerText = '';
        }
        if (filterRef.current) {
          filterRef.current.querySelectorAll('.particle').forEach(p => filterRef.current!.removeChild(p));
          filterRef.current.classList.remove('active');
          filterRef.current.style.width = '0';
          filterRef.current.style.height = '0';
        }
      }, 1400);

      return () => window.clearTimeout(endId);
    }, autoHoverDelay);

    return () => window.clearTimeout(startId);
  }, []);

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="gooey-nav-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 25 -12" />
          </filter>
        </defs>
      </svg>
      <nav>
        <ul ref={navRef} onMouseLeave={handleMouseLeave}>
          {items.map((item, index) => (
            <li key={index} className={hoveredIndex === index ? 'active' : ''} onMouseEnter={e => handleMouseEnter(e, index)}>
              <a href={item.href}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} />
      <span className="effect text" ref={textRef} />
    </div>
  );
};

export default GooeyNav;
