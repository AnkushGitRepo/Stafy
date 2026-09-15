/** @param {{ title: string, body?: string, action?: import('react').ReactNode }} props */
export function EmptyState({ title, body, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{title}</p>
      {body && <p style={{ color: 'var(--color-text-muted)', maxWidth: '48ch', fontSize: 'var(--font-size-sm)' }}>{body}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
