import { Link } from 'react-router';

/** @param {{ children: import('react').ReactNode }} props */
export function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--color-bg)',
      }}
    >
      <Link to="/" aria-label="Stafy home" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, color: 'var(--color-text)' }}>
        <svg width="26" height="24" viewBox="0 0 26 24" aria-hidden="true">
          <rect x="0" y="12" width="4" height="8" rx="2" fill="var(--color-success)" />
          <rect x="6" y="8" width="4" height="12" rx="2" fill="var(--color-accent)" />
          <rect x="12" y="4" width="4" height="16" rx="2" fill="var(--color-primary)" />
          <rect x="18" y="9" width="4" height="11" rx="2" fill="var(--color-warning)" />
          <rect x="24" y="14" width="2" height="6" rx="1" fill="var(--color-success)" />
        </svg>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>Stafy</span>
      </Link>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        {children}
      </div>
    </div>
  );
}
