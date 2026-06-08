export const ANALYTICS_LOCATION_CHANGE_EVENT = 'portfolio:analytics-location-change';
export const CV_DOWNLOAD_TRACKED_EVENT = 'portfolio:cv-download-click';

type CvDownloadEvent = {
  source: string;
  language?: string;
};

export function trackCvDownload({ source, language }: CvDownloadEvent) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CV_DOWNLOAD_TRACKED_EVENT, {
      detail: {
        source,
        language: language ?? 'default',
      },
    }));
  }
}
