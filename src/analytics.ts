import {createContext, useContext} from 'react';

export const PlaytestContext = createContext(false);

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

export function useTrackEvent() {
  const playtesting = useContext(PlaytestContext);
  return (eventName: string, eventData?: AnalyticsProperties) => {
    if (!playtesting) trackEvent(eventName, eventData);
  };
}

