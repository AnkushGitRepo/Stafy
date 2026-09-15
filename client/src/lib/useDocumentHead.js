import { useEffect } from 'react';

/**
 * Minimal per-route <title>/robots management for this SPA (no
 * react-helmet dependency needed for three pages).
 * @param {{ title: string, noindex?: boolean }} options
 */
export function useDocumentHead({ title, noindex = false }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let meta;
    if (noindex) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex';
      document.head.appendChild(meta);
    }

    return () => {
      document.title = prevTitle;
      if (meta) document.head.removeChild(meta);
    };
  }, [title, noindex]);
}
