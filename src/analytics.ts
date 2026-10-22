import {createContext, useContext} from 'react';

export const PlaytestContext = createContext(false);

type AnalyticsProperty = string | number | boolean | null;
type AnalyticsProperties = Record<string, AnalyticsProperty>;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: AnalyticsProperties) => void | PromiseLike<unknown>;
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

  try {
    // Tracking is optional: neither synchronous throws nor rejected requests may
    // interrupt local play or create an unhandled rejection.
    const result = window.umami.track(eventName, eventData);
    if (result) void Promise.resolve(result).catch(() => {});
  } catch {
    // Keep gameplay usable if the provider fails.
  }
}

export function useTrackEvent() {
  const playtesting = useContext(PlaytestContext);
  return (eventName: string, eventData?: AnalyticsProperties) => {
    if (!playtesting) trackEvent(eventName, eventData);
  };
}

