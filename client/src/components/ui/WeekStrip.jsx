const DAY_FILL = {
  present: 'var(--color-success)',
  'half-day': 'var(--color-warning)',
  absent: 'var(--color-danger)',
  leave: 'var(--color-info)',
  none: 'var(--color-surface-2)',
};

/** @param {{ days: Array<{ name: string, status: keyof typeof DAY_FILL }> }} props */
export function WeekStrip({ days }) {
  return (
    <ul style={{ display: 'flex', gap: 8 }}>
      {days.map((day) => (
        <li key={day.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span
            role="img"
            aria-label={`${day.name}: ${day.status === 'none' ? 'not checked in' : day.status}`}
            style={{ display: 'block', width: '100%', height: 36, borderRadius: 999, background: DAY_FILL[day.status] ?? DAY_FILL.none }}
          />
          <span style={{ fontSize: 12, color: 'var(--color-text-muted-2)', fontWeight: 500 }}>{day.name}</span>
        </li>
      ))}
    </ul>
  );
}
