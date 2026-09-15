/** @param {{ title: string, subtitle?: string, action?: import('react').ReactNode }} props */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-2xl)', letterSpacing: '-0.015em' }}>{title}</h1>
        {subtitle && <p style={{ marginTop: 6, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
