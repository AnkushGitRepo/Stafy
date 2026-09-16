import { Link } from 'react-router';

import { useDocumentHead } from '../../../lib/useDocumentHead.js';

// Intentional soft-404 (SPA route, HTTP 200) — ADR-016 known limitation.
export function NotFoundPage() {
  useDocumentHead({ title: 'Page not found — Stafy', noindex: true });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', background: 'var(--color-bg)' }}>
      <svg width="26" height="24" viewBox="0 0 26 24" aria-hidden="true" style={{ marginBottom: 24 }}>
        <rect x="0" y="12" width="4" height="8" rx="2" fill="var(--color-success)" />
        <rect x="6" y="8" width="4" height="12" rx="2" fill="var(--color-accent)" />
        <rect x="12" y="4" width="4" height="16" rx="2" fill="var(--color-primary)" />
        <rect x="18" y="9" width="4" height="11" rx="2" fill="var(--color-warning)" />
        <rect x="24" y="14" width="2" height="6" rx="1" fill="var(--color-success)" />
      </svg>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-3xl)', color: 'var(--color-text-muted-2)' }}>404</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-2xl)', marginTop: 8 }}>Page not found</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 8, maxWidth: '48ch' }}>The page you're looking for doesn't exist or has moved.</p>
      <Link
        to="/"
        style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 24px', borderRadius: 10, background: 'var(--color-primary)', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}
      >
        Back to Stafy
      </Link>
    </div>
  );
}
