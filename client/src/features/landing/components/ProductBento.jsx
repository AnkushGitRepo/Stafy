import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

const DIRECTORY = [
  { name: 'Priya Shah', dept: 'People', role: 'HR/Admin', status: 'Active', fg: 'var(--color-success)', bg: 'var(--color-success-chip-bg)', dot: 'var(--color-success)' },
  { name: 'Arjun Mehta', dept: 'Design', role: 'Manager', status: 'Active', fg: 'var(--color-success)', bg: 'var(--color-success-chip-bg)', dot: 'var(--color-success)' },
  { name: 'Karan Joshi', dept: 'Engineering', role: 'Employee', status: 'Inactive', fg: 'var(--color-neutral-dot)', bg: 'var(--color-neutral-chip-bg)', dot: 'var(--color-neutral-dot)' },
];

const MONTH_DOTS = { P: 'var(--color-success)', H: 'var(--color-warning)', A: 'var(--color-danger)', L: 'var(--color-info)', W: 'var(--color-neutral-dot)' };
const MONTH_PATTERN = 'WPPPPPWWPPPHPWWPPLLPWWPPPPAWWPP';
const MONTH_LABEL = { P: 'present', H: 'half day', A: 'absent', L: 'leave', W: 'weekend' };
const LEGEND = [
  { name: 'Present', dot: 'var(--color-success)' },
  { name: 'Half day', dot: 'var(--color-warning)' },
  { name: 'Absent', dot: 'var(--color-danger)' },
  { name: 'Leave', dot: 'var(--color-info)' },
  { name: 'Weekend', dot: 'var(--color-neutral-dot)' },
];

const BALANCES = [
  { name: 'Casual', text: '8 of 12 left', pct: '66.7%' },
  { name: 'Sick', text: '10 of 10 left', pct: '100%' },
  { name: 'Earned', text: '13 of 15 left', pct: '86.7%' },
];

const QUEUE_ALL = [
  { id: 'q1', initials: 'AS', name: 'Aarav Sharma', detail: 'Sick leave, 22 Sep, 1 day' },
  { id: 'q2', initials: 'NK', name: 'Neha Kulkarni', detail: 'Earned leave, 25–26 Sep, 2 days' },
];

const AUDIT = [
  { time: '10:14 AM', text: 'Priya Shah (HR) deactivated Karan Joshi' },
  { time: '9:48 AM', text: "Arjun Mehta (Manager) approved Riya Sen's casual leave" },
  { time: '9:02 AM', text: 'Riya Sen checked in' },
];

function Panel({ dataBento, style, children }) {
  return (
    <div data-bento={dataBento} style={{ gridColumn: 'span 12', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, ...style }}>
      {children}
    </div>
  );
}

// M5 — month-grid dots scale in on scroll; approve button exits a queue row.
export function ProductBento() {
  const [approved, setApproved] = useState(false);
  const monthGridRef = useRef(null);
  const queueRowRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!monthGridRef.current) return;
      const dots = monthGridRef.current.querySelectorAll('[data-anim="m5-dot"]');
      gsap.from(dots, {
        scale: 0,
        duration: 0.3,
        ease: 'power3.out',
        stagger: 0.01,
        scrollTrigger: { trigger: monthGridRef.current, start: 'top 80%', once: true },
      });
    });
    return () => mm.revert();
  }, []);

  const month = MONTH_PATTERN.split('').map((c, i) => ({
    n: i + 1,
    dot: MONTH_DOTS[c],
    bg: c === 'W' ? 'var(--color-neutral-chip-bg)' : 'var(--color-surface)',
    fg: c === 'W' ? 'var(--color-neutral-dot)' : 'var(--color-text)',
    label: `${i + 1} Sep: ${MONTH_LABEL[c]}`,
  }));

  const queue = approved ? QUEUE_ALL.slice(1) : QUEUE_ALL;

  const handleApprove = () => {
    if (approved) {
      setApproved(false);
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (queueRowRef.current && !reduced) {
      gsap.to(queueRowRef.current, { opacity: 0, x: 24, duration: 0.3, ease: 'power2.inOut', onComplete: () => setApproved(true) });
    } else {
      setApproved(true);
    }
  };

  return (
    <section id="product" style={{ padding: 'clamp(64px, 10vw, 128px) 24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.953rem, 4vw, 3.052rem)', lineHeight: 1.08, letterSpacing: '-0.025em' }}>What&rsquo;s inside</h2>
        <p style={{ marginTop: 16, maxWidth: '64ch', fontSize: 'clamp(1rem, 1.3vw, 1.25rem)', color: 'var(--color-text-muted)' }}>Six modules, each doing one job. Everything below is real product UI.</p>

        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }} className="bento-grid">
          <Panel dataBento="directory">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, letterSpacing: '-0.015em' }}>Employee directory</h3>
                <p style={{ marginTop: 8, maxWidth: '52ch', color: 'var(--color-text-muted)' }}>Search and filter the team. Deactivated people stay in the record and lose access.</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 40, padding: '0 14px', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-muted-2)', fontSize: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M16.5 16.5L21 21" />
                  </svg>
                  Search employees
                </span>
                <span style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 6, background: 'var(--color-surface-2)', fontSize: 14, fontWeight: 500 }}>Department</span>
                <span style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 6, background: 'var(--color-surface-2)', fontSize: 14, fontWeight: 500 }}>Status</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 15 }}>
                <caption style={{ textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted-2)', paddingBottom: 10 }}>Sample directory rows</caption>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', textAlign: 'left' }}>
                    <th scope="col" style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, color: 'var(--color-text-muted)' }}>Name</th>
                    <th scope="col" style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, color: 'var(--color-text-muted)' }}>Department</th>
                    <th scope="col" style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, color: 'var(--color-text-muted)' }}>Role</th>
                    <th scope="col" style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, color: 'var(--color-text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DIRECTORY.map((emp) => (
                    <tr key={emp.name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th scope="row" style={{ padding: 14, fontWeight: 500, textAlign: 'left' }}>{emp.name}</th>
                      <td style={{ padding: 14, color: 'var(--color-text-muted)' }}>{emp.dept}</td>
                      <td style={{ padding: 14, color: 'var(--color-text-muted)' }}>{emp.role}</td>
                      <td style={{ padding: 14 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: emp.bg, color: emp.fg, fontSize: 13, fontWeight: 600 }}>
                          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: emp.dot }} />
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel dataBento="attendance">
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, letterSpacing: '-0.015em' }}>Attendance</h3>
              <p style={{ marginTop: 8, maxWidth: '52ch', color: 'var(--color-text-muted)' }}>A month at a glance. Every day carries a status, never a colour alone.</p>
            </div>
            <ul ref={monthGridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
              {month.map((day) => (
                <li key={day.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 0', borderRadius: 6, background: day.bg }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: day.fg }}>{day.n}</span>
                  <span role="img" aria-label={day.label} data-anim="m5-dot" style={{ width: 7, height: 7, borderRadius: 999, background: day.dot }} />
                </li>
              ))}
            </ul>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {LEGEND.map((item) => (
                <li key={item.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text-muted)' }}>
                  <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: item.dot }} />
                  {item.name}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel dataBento="leave">
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, letterSpacing: '-0.015em' }}>Leave with balance</h3>
              <p style={{ marginTop: 8, maxWidth: '52ch', color: 'var(--color-text-muted)' }}>Balance is reserved when you apply, and weekends aren&rsquo;t counted.</p>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, fontVariantNumeric: 'tabular-nums' }}>
              {BALANCES.map((bal) => (
                <li key={bal.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>{bal.name}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{bal.text}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: 'var(--color-success)', width: bal.pct }} />
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)', marginBottom: 6 }}>Type</p>
                <p style={{ minHeight: 44, display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 15 }}>Casual</p>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)', marginBottom: 6 }}>Dates</p>
                <p style={{ minHeight: 44, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
                  18 Sep <span aria-hidden="true" style={{ color: 'var(--color-text-muted-2)' }}>to</span> 19 Sep
                </p>
              </div>
              <span style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 20px', borderRadius: 10, background: 'var(--color-surface-2)', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600 }}>Apply for leave</span>
            </div>
          </Panel>

          <Panel dataBento="approvals">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, letterSpacing: '-0.015em' }}>Team approvals</h3>
                <p style={{ marginTop: 8, maxWidth: '52ch', color: 'var(--color-text-muted)' }}>A manager&rsquo;s queue holds their team only. Deciding a request removes it.</p>
              </div>
              <button type="button" onClick={handleApprove} style={{ minHeight: 44, padding: '0 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: '#fff', fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer' }}>
                {approved ? 'Reset queue' : "Approve Aarav's request"}
              </button>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {queue.map((req, i) => (
                <li key={req.id} ref={i === 0 ? queueRowRef : undefined} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', padding: 14, border: '1px solid var(--color-border)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span aria-hidden="true" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 999, background: 'var(--color-success-chip-bg)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
                      {req.initials}
                    </span>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 15 }}>{req.name}</p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)', fontVariantNumeric: 'tabular-nums' }}>{req.detail}</p>
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'var(--color-warning-chip-bg)', color: 'var(--color-warning-chip-text)', fontSize: 13, fontWeight: 600 }}>
                    <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--color-warning)' }} />
                    Pending
                  </span>
                </li>
              ))}
            </ul>
            {approved && <p style={{ fontSize: 14, color: 'var(--color-accent)', fontWeight: 500 }}>Approved. Aarav&rsquo;s balance and the dashboards updated.</p>}
          </Panel>

          <Panel dataBento="dashboards" style={{ background: 'var(--color-dark)', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, letterSpacing: '-0.015em', color: '#fff' }}>Dashboards from live data</h3>
              <p style={{ marginTop: 8, color: 'var(--color-on-dark-muted)', maxWidth: '44ch' }}>Counts come from the database, not a design file.</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
              {['var(--color-success)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-dark-border-2)'].map((c, i) => (
                <span key={i} style={{ flex: 1, height: 12, borderRadius: 999, background: c }} />
              ))}
            </div>
          </Panel>

          <Panel dataBento="audit">
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, letterSpacing: '-0.015em' }}>Audit log</h3>
              <p style={{ marginTop: 8, maxWidth: '52ch', color: 'var(--color-text-muted)' }}>Who changed what, and when.</p>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column' }}>
              {AUDIT.map((entry, i) => (
                <li key={entry.time} style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 16, padding: '14px 0', borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}>
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted-2)', fontVariantNumeric: 'tabular-nums' }}>{entry.time}</span>
                  <span style={{ fontSize: 15, color: 'var(--color-text-muted)' }}>{entry.text}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          [data-bento="directory"] { grid-column: span 7; }
          [data-bento="attendance"] { grid-column: span 5; }
          [data-bento="leave"] { grid-column: span 5; }
          [data-bento="approvals"] { grid-column: span 7; }
          [data-bento="dashboards"] { grid-column: span 4; }
          [data-bento="audit"] { grid-column: span 8; }
        }
      `}</style>
    </section>
  );
}
