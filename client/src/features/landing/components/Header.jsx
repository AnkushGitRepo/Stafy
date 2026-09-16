import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

const LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#rules', label: 'Rules' },
  { href: '#approvals', label: 'Approvals' },
  { href: '#security', label: 'Security' },
  { href: '#faq', label: 'FAQ' },
];

// M3 — header background fade-in past 24px scroll, hide on scroll-down past 120px.
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const bgRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      let last = 0;
      const trigger = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const y = self.scroll();
          gsap.to(bgRef.current, { opacity: y > 24 ? 1 : 0, duration: 0.25, overwrite: true });
          if (Math.abs(y - last) > 8) {
            const down = y > last && y > 120;
            gsap.to(headerRef.current, { y: down ? -90 : 0, duration: 0.25, ease: 'power2.inOut', overwrite: true });
            last = y;
          }
        },
      });
      return () => trigger.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <>
      <a
        href="#main"
        style={{
          position: 'absolute',
          left: -9999,
          top: 8,
          zIndex: 100,
          background: 'var(--color-primary)',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 10,
          textDecoration: 'none',
        }}
        onFocus={(e) => (e.currentTarget.style.left = '16px')}
        onBlur={(e) => (e.currentTarget.style.left = '-9999px')}
      >
        Skip to content
      </a>

      <header ref={headerRef} id="top" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, willChange: 'transform' }}>
        <div ref={bgRef} style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', opacity: 0 }} />
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#top" aria-label="Stafy home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--color-text)', flexShrink: 0 }}>
            <svg width="26" height="24" viewBox="0 0 26 24" aria-hidden="true">
              <rect x="0" y="12" width="4" height="8" rx="2" fill="var(--color-success)" />
              <rect x="6" y="8" width="4" height="12" rx="2" fill="var(--color-accent)" />
              <rect x="12" y="4" width="4" height="16" rx="2" fill="var(--color-primary)" />
              <rect x="18" y="9" width="4" height="11" rx="2" fill="var(--color-warning)" />
              <rect x="24" y="14" width="2" height="6" rx="1" fill="var(--color-success)" />
            </svg>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', fontSize: 22 }}>Stafy</span>
          </a>
          <nav aria-label="Sections" className="landing-nav-desktop" style={{ display: 'none', gap: 4, marginLeft: 8 }}>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} style={{ padding: '8px 12px', borderRadius: 10, color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
                {l.label}
              </a>
            ))}
          </nav>
          <div style={{ flex: 1 }} />
          <a href="/login" className="landing-signin-link" style={{ display: 'none', padding: '8px 4px', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
            Sign in
          </a>
          <a
            href="/login"
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              padding: '0 20px',
              borderRadius: 10,
              background: 'var(--color-primary)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Try the live demo
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            className="landing-menu-button"
            style={{ flexShrink: 0, width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', padding: '16px 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>Stafy</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, cursor: 'pointer' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav aria-label="Sections" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 24 }}>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{ padding: '14px 0', fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none', borderBottom: '1px solid var(--color-border)' }}
              >
                {l.label}
              </a>
            ))}
            <a href="/login" style={{ padding: '14px 0', fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none' }}>
              Sign in
            </a>
          </nav>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .landing-nav-desktop { display: flex !important; }
          .landing-signin-link { display: inline-flex !important; }
          .landing-menu-button { display: none !important; }
        }
      `}</style>
    </>
  );
}
