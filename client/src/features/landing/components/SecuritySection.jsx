const LAYERS = [
  { name: 'Browser', text: "Hides what you can't use. Never trusted on its own.", bg: 'var(--color-surface)', border: 'var(--color-border)', fg: 'var(--color-text)', body: 'var(--color-text-muted)' },
  { name: 'API checks', text: 'Checks your role and team on every request. Records outside your scope return not found.', bg: 'var(--color-success-chip-bg)', border: '#CBE8D8', fg: 'var(--color-primary)', body: 'var(--color-text-muted)' },
  { name: 'Database constraints', text: 'Blocks duplicate check-ins and overlapping leave even if a request slips through.', bg: 'var(--color-dark)', border: 'var(--color-dark)', fg: '#FFFFFF', body: 'var(--color-on-dark-muted)' },
];

const FACTS = [
  'Session cookies are unreadable by scripts.',
  'No database keys are shipped to the browser.',
  'Passwords are handled by Supabase Auth.',
  'Deactivated accounts lose access on their next request.',
];

// No dedicated motion id in the design's own M1–M9 table — this section is
// intentionally static (a security claim animating in reads as decoration).
export function SecuritySection() {
  return (
    <section id="security" style={{ padding: 'clamp(64px, 10vw, 128px) 24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.953rem, 4vw, 3.052rem)', lineHeight: 1.08, letterSpacing: '-0.025em' }}>Permissions live on the server.</h2>
        <ol style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 820 }}>
          {LAYERS.map((layer) => (
            <li key={layer.name} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px 24px', alignItems: 'baseline', padding: '20px 24px', borderRadius: 16, background: layer.bg, border: `1px solid ${layer.border}` }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', color: layer.fg }}>{layer.name}</p>
              <p style={{ fontSize: 15, color: layer.body }}>{layer.text}</p>
            </li>
          ))}
        </ol>
        <ul style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '24px 32px', maxWidth: 900 }}>
          {FACTS.map((text) => (
            <li key={text} style={{ fontSize: 15, color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
