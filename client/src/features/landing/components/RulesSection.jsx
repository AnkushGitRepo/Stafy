import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

const RULES = [
  { attempt: 'Checking in twice', response: "You're already checked in (9:02 AM).", fg: 'var(--color-warning-chip-text)', bg: 'var(--color-warning-chip-bg)' },
  { attempt: 'Checking out before checking in', response: 'Check in first.', fg: 'var(--color-warning-chip-text)', bg: 'var(--color-warning-chip-bg)' },
  { attempt: 'Leave that overlaps an existing request', response: 'This overlaps your leave on 18–19 Sep.', fg: 'var(--color-danger)', bg: 'var(--color-danger-chip-bg)' },
  { attempt: 'End date before start date', response: "End date can't be before the start date.", fg: 'var(--color-danger)', bg: 'var(--color-danger-chip-bg)' },
  { attempt: 'Checking in on a day of approved leave', response: "You're on approved leave today. Cancel it to check in.", fg: 'var(--color-info)', bg: 'var(--color-info-chip-bg)' },
  { attempt: "Approving another team's request, or your own", response: "You can't approve this request.", fg: 'var(--color-danger)', bg: 'var(--color-danger-chip-bg)' },
];

// M6 — each row reveals once on scroll: attempt text, then the response chip.
export function RulesSection() {
  const rowRefs = useRef([]);
  const repoUrl = 'https://github.com/AnkushGitRepo/Stafy';

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      rowRefs.current.forEach((row) => {
        if (!row) return;
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 85%', once: true } });
        tl.from(row.querySelector('[data-part="attempt"]'), { opacity: 0, y: 8, duration: 0.35, ease: 'power3.out' })
          .from(row.querySelector('[data-part="response"]'), { opacity: 0, x: 12, duration: 0.4, ease: 'power3.out' }, 0.12);
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="rules" style={{ padding: 'clamp(64px, 10vw, 128px) 24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.953rem, 4vw, 3.052rem)', lineHeight: 1.08, letterSpacing: '-0.025em' }}>Rules, not reminders.</h2>
        <p style={{ marginTop: 16, maxWidth: '64ch', fontSize: 'clamp(1rem, 1.3vw, 1.25rem)', color: 'var(--color-text-muted)' }}>
          Every one of these is checked on the server, so hiding a button isn&rsquo;t the only thing stopping it.
        </p>
        <ul style={{ marginTop: 48, display: 'flex', flexDirection: 'column' }}>
          {RULES.map((rule, i) => (
            <li key={rule.attempt} ref={(el) => (rowRefs.current[i] = el)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px 32px', alignItems: 'center', padding: '24px 0', borderTop: '1px solid var(--color-border)' }}>
              <p data-part="attempt" style={{ fontSize: 'clamp(1rem, 1.4vw, 1.25rem)', fontWeight: 500, color: 'var(--color-text)' }}>
                {rule.attempt}
              </p>
              <p data-part="response" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 10, background: rule.bg, color: rule.fg, fontSize: 15, fontWeight: 500 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5" />
                  <path d="M12 16.2v.1" />
                </svg>
                <span>{rule.response}</span>
              </p>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 32, fontSize: 17 }}>
          <a href={`${repoUrl}/blob/main/docs/BUSINESS_RULES.md`}>See all 26 business rules</a>
        </p>
      </div>
    </section>
  );
}
