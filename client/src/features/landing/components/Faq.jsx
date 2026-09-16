import gsap from 'gsap';
import { useRef, useState } from 'react';

const FAQS = [
  { q: "Who approves a manager's leave?", a: "Their own reporting manager, or HR if they don't have one. Nobody can approve their own request." },
  { q: "Can I cancel leave after it's approved?", a: 'Yes, until the day it starts. If you want a half day instead, cancel and apply for a half day.' },
  { q: 'Why does it say I was absent?', a: 'A past working day with no check-in and no approved leave counts as absent. Today shows "Not checked in" until the day ends.' },
  { q: 'Which time zone does Stafy use?', a: 'India Standard Time for check-in, check-out and "today".' },
  { q: 'What happens when an employee is deactivated?', a: "They're signed out on their next request and their pending leave requests are cancelled." },
  { q: 'Is this a production product?', a: 'No. Stafy was built as a practical assessment for AppTrait Solutions. Demo data can be reset at any time.' },
];

// M8 — accordion panel height + opacity on open.
export function Faq() {
  const [openIndex, setOpenIndex] = useState(null);
  const panelRefs = useRef([]);

  const toggle = (i) => {
    const willOpen = openIndex !== i;
    setOpenIndex(willOpen ? i : null);
    if (willOpen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(() => {
        const panelEl = panelRefs.current[i];
        if (panelEl) gsap.from(panelEl, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.inOut' });
      });
    }
  };

  return (
    <section id="faq" style={{ padding: 'clamp(64px, 10vw, 128px) 24px clamp(64px, 10vw, 128px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.953rem, 4vw, 3.052rem)', lineHeight: 1.08, letterSpacing: '-0.025em' }}>Questions</h2>
        <ul style={{ marginTop: 48, maxWidth: 820 }}>
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            const panelId = `faq-panel-${i}`;
            return (
              <li key={item.q} style={{ borderTop: '1px solid var(--color-border)' }}>
                <h3>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    style={{
                      width: '100%',
                      display: 'flex',
                      gap: 24,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 0',
                      background: 'none',
                      border: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: 'clamp(1.125rem, 1.6vw, 1.25rem)',
                      letterSpacing: '-0.01em',
                      minHeight: 44,
                    }}
                  >
                    {item.q}
                    <span aria-hidden="true" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: 'var(--color-surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" style={{ opacity: open ? 0 : 1 }} />
                      </svg>
                    </span>
                  </button>
                </h3>
                {open && (
                  <div id={panelId} ref={(el) => (panelRefs.current[i] = el)} style={{ overflow: 'hidden' }}>
                    <p style={{ padding: '0 0 24px', maxWidth: '64ch', color: 'var(--color-text-muted)', fontSize: 16 }}>{item.a}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
