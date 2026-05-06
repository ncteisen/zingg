type AnalyticsProperty = string | number | boolean | null;
type AnalyticsProperties = Record<string, AnalyticsProperty>;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: AnalyticsProperties) => void;
    };
  }
}

export function trackEvent(
  eventName: string,
  eventData?: AnalyticsProperties
) {
  if (typeof window === 'undefined' || !window.umami) {
    return;
  }

  window.umami.track(eventName, eventData);
}

