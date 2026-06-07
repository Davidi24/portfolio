import { track } from '@vercel/analytics';

export const ANALYTICS_LOCATION_CHANGE_EVENT = 'portfolio:analytics-location-change';
export const CV_DOWNLOAD_TRACKED_EVENT = 'portfolio:cv-download-click';

type CvDownloadEvent = {
  source: string;
  language?: string;
};

export function trackCvDownload({ source, language }: CvDownloadEvent) {
  track('CV Download Clicked', {
    source,
    language: language ?? 'default',
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CV_DOWNLOAD_TRACKED_EVENT, {
      detail: {
        source,
        language: language ?? 'default',
      },
    }));
  }
}

export function trackTimeOnPage(path: string, durationSeconds: number) {
  track('Time On Page', {
    path: path.slice(0, 255),
    durationSeconds,
  });
}
