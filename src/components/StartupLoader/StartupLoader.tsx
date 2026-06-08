import { useEffect, useRef, useState } from 'react';
import './StartupLoader.css';

const INTRO_HOLD_MS = 2000;
const INTRO_TOTAL_MS = 3400;
const NAV_TRANSITION_EVENT = 'portfolio:navigation-transition';
const NAV_ENTER_MS = 850;
const NAV_EXIT_DELAY_MS = 90;
const NAV_TOTAL_MS = 2400;

type LoaderMode = 'intro' | 'transition';

type NavigationTransitionDetail = {
  onCovered?: () => void;
};

function isBackForwardNav(): boolean {
  try {
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return entry?.type === 'back_forward';
  } catch {
    return false;
  }
}

export default function StartupLoader() {
  const timersRef = useRef<number[]>([]);
  const [loaderKey, setLoaderKey] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [mode, setMode] = useState<LoaderMode | null>('intro');
  const isBackRef = useRef(isBackForwardNav());

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach(timer => window.clearTimeout(timer));
      timersRef.current = [];
    };

    const lockPage = () => document.documentElement.classList.add('intro-loader-lock');
    const unlockPage = () => document.documentElement.classList.remove('intro-loader-lock');
    const hideLoader = () => {
      setMode(null);
      setIsExiting(false);
      unlockPage();
    };

    lockPage();

    timersRef.current.push(window.setTimeout(() => {
      setIsExiting(true);
    }, INTRO_HOLD_MS));

    timersRef.current.push(window.setTimeout(hideLoader, INTRO_TOTAL_MS));

    const handleNavTransition = (event: Event) => {
      const { onCovered } = (event as CustomEvent<NavigationTransitionDetail>).detail ?? {};

      clearTimers();
      lockPage();
      setLoaderKey(key => key + 1);
      setIsExiting(false);
      setMode('transition');

      timersRef.current.push(window.setTimeout(() => {
        onCovered?.();
      }, NAV_ENTER_MS));

      timersRef.current.push(window.setTimeout(() => {
        setIsExiting(true);
      }, NAV_ENTER_MS + NAV_EXIT_DELAY_MS));

      timersRef.current.push(window.setTimeout(hideLoader, NAV_TOTAL_MS));
    };

    window.addEventListener(NAV_TRANSITION_EVENT, handleNavTransition);

    return () => {
      window.removeEventListener(NAV_TRANSITION_EVENT, handleNavTransition);
      clearTimers();
      unlockPage();
    };
  }, []);

  if (!mode) return null;

  return (
    <div
      key={loaderKey}
      className={`startup-loader startup-loader--${mode}${isExiting ? ' is-exiting' : ''}`}
      aria-label="Page transition"
    >
      <div className="startup-loader__sheet" aria-hidden="true" />
      {mode === 'intro' && (
        <p className="startup-loader__text">
          {isBackRef.current ? 'Redirecting...' : 'Hello!'}
        </p>
      )}
    </div>
  );
}
