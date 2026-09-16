import { Link } from 'react-router';

/** @param {{ title: string, children: import('react').ReactNode }} props */
export function LegalPage({ title, children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 96px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 40, color: 'var(--color-text)' }}>
          <svg width="22" height="20" viewBox="0 0 26 24" aria-hidden="true">
            <rect x="0" y="12" width="4" height="8" rx="2" fill="var(--color-success)" />
            <rect x="6" y="8" width="4" height="12" rx="2" fill="var(--color-accent)" />
            <rect x="12" y="4" width="4" height="16" rx="2" fill="var(--color-primary)" />
            <rect x="18" y="9" width="4" height="11" rx="2" fill="var(--color-warning)" />
            <rect x="24" y="14" width="2" height="6" rx="1" fill="var(--color-success)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Stafy</span>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-3xl)', marginBottom: 8 }}>{title}</h1>
        <p style={{ color: 'var(--color-text-muted-2)', fontSize: 'var(--font-size-sm)', marginBottom: 32 }}>Last updated 15 September 2026.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
