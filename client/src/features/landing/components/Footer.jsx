import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

const REPO_URL = 'https://github.com/AnkushGitRepo/Stafy';

// M9 — footer capsule watermark rises in once on scroll.
export function Footer() {
  const capsuleRefs = useRef([]);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(capsuleRefs.current, {
        yPercent: 100,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: '#footer', start: 'top 85%', once: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div style={{ background: 'var(--color-dark)', color: '#fff' }}>
      <section aria-label="Try the demo" style={{ padding: 'clamp(64px, 10vw, 128px) 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.953rem, 4vw, 3.052rem)', lineHeight: 1.08, letterSpacing: '-0.025em', maxWidth: '22ch' }}>
            See it working in under a minute.
          </h2>
          <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 24px', borderRadius: 10, background: 'var(--color-success-chip-bg)', color: 'var(--color-primary)', textDecoration: 'none', fontSize: 17, fontWeight: 600 }}>
            Try the live demo
          </a>
        </div>
      </section>

      <footer id="footer" style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--color-dark-border)' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '64px 24px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="26" height="24" viewBox="0 0 26 24" aria-hidden="true">
                <rect x="0" y="12" width="4" height="8" rx="2" fill="var(--color-success)" />
                <rect x="6" y="8" width="4" height="12" rx="2" fill="var(--color-success-chip-bg)" />
                <rect x="12" y="4" width="4" height="16" rx="2" fill="#fff" />
                <rect x="18" y="9" width="4" height="11" rx="2" fill="var(--color-warning)" />
                <rect x="24" y="14" width="2" height="6" rx="1" fill="var(--color-success)" />
              </svg>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', color: '#fff' }}>Stafy</span>
            </div>
            <p style={{ color: 'var(--color-on-dark-muted)', fontSize: 15, maxWidth: '30ch' }}>A small HR system for attendance, leave and approvals.</p>
          </div>
          <nav aria-label="Product">
            <h2 style={{ fontSize: 13, color: 'var(--color-on-dark-faint)', fontWeight: 600, marginBottom: 12 }}>Product</h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
              <li><a href="#product" style={{ color: 'var(--color-success-chip-bg)' }}>Features</a></li>
              <li><a href="#rules" style={{ color: 'var(--color-success-chip-bg)' }}>Rules</a></li>
              <li><a href="#approvals" style={{ color: 'var(--color-success-chip-bg)' }}>Approvals</a></li>
              <li><a href="#security" style={{ color: 'var(--color-success-chip-bg)' }}>Security</a></li>
            </ul>
          </nav>
          <nav aria-label="Project">
            <h2 style={{ fontSize: 13, color: 'var(--color-on-dark-faint)', fontWeight: 600, marginBottom: 12 }}>Project</h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
              <li><a href={REPO_URL} style={{ color: 'var(--color-success-chip-bg)' }}>GitHub repository</a></li>
              <li><a href={`${REPO_URL}/tree/main/docs`} style={{ color: 'var(--color-success-chip-bg)' }}>Documentation</a></li>
              <li><a href={`${REPO_URL}/blob/main/docs/PLANNING.md`} style={{ color: 'var(--color-success-chip-bg)' }}>Planning document</a></li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <h2 style={{ fontSize: 13, color: 'var(--color-on-dark-faint)', fontWeight: 600, marginBottom: 12 }}>Legal</h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
              <li><a href="/privacy" style={{ color: 'var(--color-success-chip-bg)' }}>Privacy policy</a></li>
              <li><a href="/terms" style={{ color: 'var(--color-success-chip-bg)' }}>Terms</a></li>
            </ul>
          </nav>
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
          <p style={{ fontSize: 14, color: 'var(--color-on-dark-faint)' }}>© 2026 Stafy. Built by Ankush for the AppTrait Solutions assessment.</p>
        </div>
        <div aria-hidden="true" style={{ position: 'relative', zIndex: 0, display: 'flex', gap: '1.2vw', alignItems: 'flex-end', height: 'clamp(60px, 9vw, 120px)', padding: '0 24px', opacity: 0.5 }}>
          {[48, 72, 100, 64, 36].map((h, i) => (
            <span
              key={i}
              ref={(el) => (capsuleRefs.current[i] = el)}
              style={{ flex: 1, height: `${h}%`, borderRadius: '999px 999px 0 0', background: i % 2 === 0 ? '#153B2D' : '#17402F' }}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}
