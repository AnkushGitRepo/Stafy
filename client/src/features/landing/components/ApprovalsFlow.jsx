import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

const STEPS = [
  { n: '01', title: 'Apply', body: "Pick a type and dates. Weekends aren't counted, and your balance is reserved." },
  { n: '02', title: 'Routed', body: "The request goes to your manager, or to HR if you don't have one." },
  { n: '03', title: 'Decided', body: 'Approved, or rejected with a written reason. Nobody approves their own request.' },
  { n: '04', title: 'Updated', body: 'Balance and dashboards change right away. You can cancel approved leave until the day it starts.' },
];

// M7 — scroll-scrubbed path (no pin, stays within this section): stroke draws
// in and the status card slides along it as the visitor scrolls past.
export function ApprovalsFlow() {
  const [pathProgress, setPathProgress] = useState(0);
  const scopeRef = useRef(null);
  const railRef = useRef(null);
  const pathRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    const g = gsap;
    const path = pathRef.current;
    const card = cardRef.current;
    const scope = scopeRef.current;
    if (!path || !card || !scope) return;

    const len = path.getTotalLength();
    g.set(path, { strokeDasharray: len });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      g.set(path, { strokeDashoffset: 0 });
      g.set(card, { x: Math.max(0, scope.clientWidth - card.offsetWidth) });
      setPathProgress(1);
      return;
    }

    const tween = g.fromTo(
      [path, card],
      { strokeDashoffset: len, x: 0 },
      {
        strokeDashoffset: 0,
        x: () => Math.max(0, scope.clientWidth - card.offsetWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: scope,
          start: 'top 75%',
          end: 'bottom 70%',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => setPathProgress(self.progress),
        },
      },
    );
    return () => tween.scrollTrigger?.kill();
  }, []);

  const pending = pathProgress <= 0.62;

  return (
    <section id="approvals" style={{ padding: 'clamp(64px, 10vw, 128px) 24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.953rem, 4vw, 3.052rem)', lineHeight: 1.08, letterSpacing: '-0.025em' }}>How approvals work</h2>
        <div ref={scopeRef} style={{ marginTop: 48 }}>
          <div ref={railRef} className="approvals-rail" style={{ position: 'relative', height: 64, marginBottom: 8 }}>
            <svg viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 20, width: '100%', height: 4, overflow: 'visible' }}>
              <path d="M0 2 H1200" stroke="var(--color-border)" strokeWidth="4" fill="none" />
              <path ref={pathRef} d="M0 2 H1200" stroke="var(--color-success)" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
            <div
              ref={cardRef}
              style={{ position: 'absolute', top: 0, left: 0, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: '#fff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Casual leave
              {pending ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 999, background: 'var(--color-warning-chip-bg)', color: 'var(--color-warning-chip-text)', fontSize: 12 }}>
                  <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--color-warning)' }} />
                  Pending
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 999, background: 'var(--color-success-chip-bg)', color: 'var(--color-success)', fontSize: 12 }}>
                  <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--color-success)' }} />
                  Approved
                </span>
              )}
            </div>
          </div>
          <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 24 }}>
            {STEPS.map((step) => (
              <li key={step.n} style={{ borderTop: '2px solid var(--color-border)', paddingTop: 20 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>{step.n}</p>
                <h3 style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em' }}>{step.title}</h3>
                <p style={{ marginTop: 8, color: 'var(--color-text-muted)', fontSize: 15 }}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <style>{`
        @media (max-width: 1023px) { .approvals-rail { display: none; } }
      `}</style>
    </section>
  );
}
