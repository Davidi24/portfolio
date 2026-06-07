import { useEffect } from 'react';
import { ANALYTICS_LOCATION_CHANGE_EVENT, trackTimeOnPage } from './analyticsEvents';

const MIN_TRACKED_SECONDS = 2;

const currentPath = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

export default function PageTimeTracker() {
  useEffect(() => {
    let path = currentPath();
    let startedAt = performance.now();
    let flushedForCurrentPath = false;

    const flush = () => {
      if (flushedForCurrentPath) return;

      const durationSeconds = Math.round((performance.now() - startedAt) / 1000);
      if (durationSeconds >= MIN_TRACKED_SECONDS) {
        trackTimeOnPage(path, durationSeconds);
      }

      flushedForCurrentPath = true;
    };

    const restart = () => {
      flush();
      path = currentPath();
      startedAt = performance.now();
      flushedForCurrentPath = false;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flush();
        return;
      }

      path = currentPath();
      startedAt = performance.now();
      flushedForCurrentPath = false;
    };

    window.addEventListener(ANALYTICS_LOCATION_CHANGE_EVENT, restart);
    window.addEventListener('hashchange', restart);
    window.addEventListener('popstate', restart);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(ANALYTICS_LOCATION_CHANGE_EVENT, restart);
      window.removeEventListener('hashchange', restart);
      window.removeEventListener('popstate', restart);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
