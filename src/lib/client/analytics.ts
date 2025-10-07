import "client-only";

/**
 * Client-side analytics utilities
 */

export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") return;

  // Google Analytics 4 example
  if (window.gtag) {
    window.gtag("event", eventName, properties);
  }

  // You can add other analytics services here
  console.log("Analytics event:", eventName, properties);
}

export function pageView(url: string) {
  if (typeof window === "undefined") return;

  if (window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
      page_path: url,
    });
  }
}

// Declare global gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
