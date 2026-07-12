import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useVisitLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const FORM_ID = import.meta.env.VITE_GOOGLE_FORM_ID;
    const ENTRY_PATH = import.meta.env.VITE_GOOGLE_FORM_ENTRY_PATH;
    const ENTRY_REFERRER = import.meta.env.VITE_GOOGLE_FORM_ENTRY_REFERRER;
    const ENTRY_USER_AGENT = import.meta.env.VITE_GOOGLE_FORM_ENTRY_USER_AGENT;

    // Check if configuration is available
    if (!FORM_ID || !ENTRY_PATH || !ENTRY_REFERRER || !ENTRY_USER_AGENT) {
      if (import.meta.env.DEV) {
        console.warn(
          'Visit Logging is disabled. To enable it, please set Google Form environment variables in your .env file.'
        );
      }
      return;
    }

    const logVisit = async () => {
      const path = location.pathname + location.search;
      const referrer = document.referrer || 'direct';
      const userAgent = navigator.userAgent;

      const formData = new URLSearchParams();
      formData.append(`entry.${ENTRY_PATH}`, path);
      formData.append(`entry.${ENTRY_REFERRER}`, referrer);
      formData.append(`entry.${ENTRY_USER_AGENT}`, userAgent);

      try {
        const url = `https://docs.google.com/forms/u/0/d/e/${FORM_ID}/formResponse`;
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors', // Google Forms submissions are cross-origin, no-cors prevents CORS policy errors
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });
      } catch (error) {
        console.error('Failed to submit visit log to Google Forms:', error);
      }
    };

    logVisit();
  }, [location.pathname, location.search]);
};
