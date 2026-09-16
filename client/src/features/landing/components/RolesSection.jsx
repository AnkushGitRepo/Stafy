import { Flip } from 'gsap/Flip';
import { useRef, useState } from 'react';

const ROLES = ['HR/Admin', 'Manager', 'Employee'];

const METRICS = {
  'HR/Admin': [
    { key: 'total', label: 'Total employees', value: 42, dot: 'var(--color-neutral-dot)' },
    { key: 'active', label: 'Active employees', value: 40, dot: 'var(--color-success)' },
    { key: 'present', label: 'Present today', value: 31, dot: 'var(--color-success)' },
    { key: 'onleave', label: 'On leave', value: 2, dot: 'var(--color-info)' },
    { key: 'pending', label: 'Pending leave requests', value: 5, dot: 'var(--color-warning)' },
  ],
  Manager: [
    { key: 'total', label: 'Team members', value: 8, dot: 'var(--color-neutral-dot)' },
    { key: 'present', label: 'Present today', value: 6, dot: 'var(--color-success)' },
    { key: 'onleave', label: 'On leave', value: 1, dot: 'var(--color-info)' },
    { key: 'pending', label: 'Pending approvals', value: 2, dot: 'var(--color-warning)' },
  ],
  Employee: [
    { key: 'today', label: "Today's status", value: 'Present', dot: 'var(--color-success)' },
    { key: 'total', label: 'Total requests', value: 7, dot: 'var(--color-neutral-dot)' },
    { key: 'pending', label: 'Pending', value: 1, dot: 'var(--color-warning)' },
    { key: 'approved', label: 'Approved', value: 5, dot: 'var(--color-success)' },
    { key: 'rejected', label: 'Rejected', value: 1, dot: 'var(--color-danger)' },
  ],
};

const CAN = {
  'HR/Admin': ['Add and edit employees', 'Deactivate accounts', 'See all attendance and leave', 'Approve any request except their own'],
  Manager: ['See their team only', 'Approve or reject team leave with a reason', 'See their own attendance and leave'],
  Employee: ['Check in and out', 'Apply for leave and cancel it', 'See their own history'],
};
const CANNOT = {
  'HR/Admin': ['Approve their own request'],
  Manager: ["See other teams' records", 'Approve their own request'],
  Employee: ["See anyone else's records", 'Approve any request'],
};

// M4 — Flip.from on metric tiles when the role tab changes.
export function RolesSection() {
  const [role, setRole] = useState('HR/Admin');
  const metricsRef = useRef(null);

  function switchRole(next) {
    if (next === role) return;
    const items = metricsRef.current ? Array.from(metricsRef.current.querySelectorAll('[data-flip-id]')) : [];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const state = !reduced && items.length ? Flip.getState(items) : null;
    setRole(next);
    if (state) {
      requestAnimationFrame(() => {
        Flip.from(state, { duration: 0.35, ease: 'power2.inOut', absolute: true, stagger: 0.02 });
      });
    }
  }

  function onKeyDown(e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = ROLES.indexOf(role);
    const next = ROLES[(i + (e.key === 'ArrowRight' ? 1 : ROLES.length - 1)) % ROLES.length];
    switchRole(next);
    document.getElementById('role-tab-' + ROLES.indexOf(next))?.focus();
  }

  return (
    <section id="roles" style={{ padding: 'clamp(64px, 10vw, 128px) 24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.953rem, 4vw, 3.052rem)', lineHeight: 1.08, letterSpacing: '-0.025em', maxWidth: '24ch' }}>
          One system. Each person sees only what&rsquo;s theirs.
        </h2>
        <div role="tablist" aria-label="Roles" onKeyDown={onKeyDown} style={{ marginTop: 32, display: 'inline-flex', padding: 4, gap: 4, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 999, flexWrap: 'wrap' }}>
          {ROLES.map((name, i) => (
            <button
              key={name}
              type="button"
              role="tab"
              id={'role-tab-' + i}
              aria-selected={name === role}
              aria-controls="role-panel"
              tabIndex={name === role ? 0 : -1}
              onClick={() => switchRole(name)}
              style={{ minHeight: 44, padding: '0 20px', borderRadius: 999, border: 0, background: name === role ? 'var(--color-primary)' : 'transparent', color: name === role ? '#fff' : 'var(--color-text-muted)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              {name}
            </button>
          ))}
        </div>
        <div id="role-panel" role="tabpanel" aria-labelledby={'role-tab-' + ROLES.indexOf(role)} style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 32, alignItems: 'start' }}>
          <div className="card" style={{ padding: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)', marginBottom: 20 }}>{role} dashboard</p>
            <ul ref={metricsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 20, fontVariantNumeric: 'tabular-nums' }}>
              {METRICS[role].map((m) => (
                <li key={m.key} data-flip-id={m.key}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-3xl)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    {m.value}
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: m.dot }} />
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)' }}>{m.label}</p>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 10 }}>Can</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CAN[role].map((text) => (
                  <li key={text} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'var(--color-text-muted)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}>
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 10 }}>Cannot</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CANNOT[role].map((text) => (
                  <li key={text} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'var(--color-text-muted)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}>
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
