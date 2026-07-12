import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GOOGLE_FORM_CONFIG } from '../config/analytics';

const getCachedLocation = async (): Promise<string> => {
  const cached = sessionStorage.getItem('visitor_location');
  if (cached) return cached;
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      const locationStr = `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''} (${data.ip || ''})`
        .replace(/^,\s*|,\s*$/, '') // Clean up any leading/trailing commas
        .trim();
      sessionStorage.setItem('visitor_location', locationStr || 'Unknown');
      return locationStr || 'Unknown';
    }
  } catch (e) {
    // Fail silently, will retry on next page navigation if sessionStorage isn't set
  }
  return 'Unknown';
};

export const useVisitLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const FORM_ID = GOOGLE_FORM_CONFIG.formId;
    const ENTRY_PATH = GOOGLE_FORM_CONFIG.entryPath;
    const ENTRY_REFERRER = GOOGLE_FORM_CONFIG.entryReferrer;
    const ENTRY_USER_AGENT = GOOGLE_FORM_CONFIG.entryUserAgent;
    const ENTRY_LOCATION = GOOGLE_FORM_CONFIG.entryLocation;
    const ENTRY_TIMEZONE = GOOGLE_FORM_CONFIG.entryTimezone;
    const ENTRY_CUSTOM_REF = GOOGLE_FORM_CONFIG.entryCustomRef;

    if (!FORM_ID || !ENTRY_PATH || !ENTRY_REFERRER || !ENTRY_USER_AGENT) {
      if (import.meta.env.DEV) {
        console.warn(
          'Visit Logging is disabled. To enable it, please set Google Form environment variables in your .env file.'
        );
      }
      return;
    }

    const logVisit = async (customPath?: string) => {
      const path = customPath || (location.pathname + location.search);
      const referrer = document.referrer || 'direct';
      const userAgent = navigator.userAgent;

      // Extract custom ref from URL parameters (e.g. ?ref=recruiter_john)
      const urlParams = new URLSearchParams(location.search);
      const urlRef = urlParams.get('ref');
      if (urlRef) {
        sessionStorage.setItem('visitor_ref', urlRef);
      }
      const customRef = urlRef || sessionStorage.getItem('visitor_ref') || 'none';

      // Detect timezone
      let timezone = 'Unknown';
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
      } catch (e) {
        // Fallback
      }

      // Fetch cached location
      const visitorLocation = await getCachedLocation();

      const formData = new URLSearchParams();
      formData.append(`entry.${ENTRY_PATH}`, path);
      formData.append(`entry.${ENTRY_REFERRER}`, referrer);
      formData.append(`entry.${ENTRY_USER_AGENT}`, userAgent);

      // Append optional fields if they are defined in environment variables
      if (ENTRY_LOCATION) {
        formData.append(`entry.${ENTRY_LOCATION}`, visitorLocation);
      }
      if (ENTRY_TIMEZONE) {
        formData.append(`entry.${ENTRY_TIMEZONE}`, timezone);
      }
      if (ENTRY_CUSTOM_REF) {
        formData.append(`entry.${ENTRY_CUSTOM_REF}`, customRef);
      }

      try {
        const url = `https://docs.google.com/forms/u/0/d/e/${FORM_ID}/formResponse`;
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors', // Google Forms submissions are cross-origin
          keepalive: true, // Allow request to complete even if tab/page is unloading
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });
      } catch (error) {
        console.error('Failed to submit visit log to Google Forms:', error);
      }
    };

    // Log the current route navigation
    logVisit();

    // Catch clicks on external links (like Portfolio)
    const handleOutboundClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href) {
        try {
          const url = new URL(target.href);
          // If destination origin is different, it is an outbound click
          if (url.origin !== window.location.origin) {
            logVisit(`outbound:${target.href}`);
          }
        } catch (err) {
          // Invalid URL, skip
        }
      }
    };

    document.addEventListener('click', handleOutboundClick);

    return () => {
      document.removeEventListener('click', handleOutboundClick);
    };
  }, [location.pathname, location.search]);
};
