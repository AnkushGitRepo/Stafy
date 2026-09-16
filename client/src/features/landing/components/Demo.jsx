const DEMOS = [
  {
    role: 'HR/Admin',
    link: 'Sign in as HR',
    href: '/login?role=hr',
    tries: ['Add an employee, then deactivate one', 'Open all attendance for today', 'Try approving your own leave request'],
  },
  {
    role: 'Manager',
    link: 'Sign in as manager',
    href: '/login?role=manager',
    tries: ['Approve a request from your team', 'Reject one with a written reason', "Try opening another team's record"],
  },
  {
    role: 'Employee',
    link: 'Sign in as employee',
    href: '/login?role=employee',
    tries: ['Check in, then try checking in again', 'Apply for overlapping leave', 'Cancel an approved leave before it starts'],
  },
];

export function Demo() {
  return (
    <section id="demo" style={{ padding: 'clamp(64px, 10vw, 128px) 24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.953rem, 4vw, 3.052rem)', lineHeight: 1.08, letterSpacing: '-0.025em' }}>Try it as any role.</h2>
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
          {DEMOS.map((panel) => (
            <div key={panel.role} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, letterSpacing: '-0.015em' }}>{panel.role}</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {panel.tries.map((text) => (
                  <li key={text} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'var(--color-text-muted)' }}>
                    <span aria-hidden="true" style={{ flexShrink: 0, width: 6, height: 6, borderRadius: 999, background: 'var(--color-success)', marginTop: 9 }} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: 'auto', fontSize: 15, fontWeight: 500 }}>
                <a href="/login">{panel.link}</a>
              </p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 32 }}>
          <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 24px', borderRadius: 10, background: 'var(--color-primary)', color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 600 }}>
            Try the live demo
          </a>
        </p>
      </div>
    </section>
  );
}
