interface UmamiPayload {
  website: string;
  hostname: string;
  url: string;
  referrer: string;
  title: string;
  language: string;
  screen: string;
  name?: string;
  data?: Record<string, string | number>;
}

interface Window {
  umami?: { track: (payload: UmamiPayload) => void };
}
