declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __loaderComplete?: boolean;
  }
}

export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1") return;
  try {
    window.gtag?.("event", name, params);
  } catch {
    /* analytics must never break the page */
  }
}
