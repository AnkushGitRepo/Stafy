const STATUS_STYLES = {
  present: { bg: 'var(--color-success-chip-bg)', fg: 'var(--color-success)', dot: 'var(--color-success)', label: 'Present' },
  'half-day': { bg: 'var(--color-warning-chip-bg)', fg: 'var(--color-warning-chip-text)', dot: 'var(--color-warning)', label: 'Half Day' },
  absent: { bg: 'var(--color-danger-chip-bg)', fg: 'var(--color-danger)', dot: 'var(--color-danger)', label: 'Absent' },
  leave: { bg: 'var(--color-info-chip-bg)', fg: 'var(--color-info)', dot: 'var(--color-info)', label: 'Leave' },
  pending: { bg: 'var(--color-warning-chip-bg)', fg: 'var(--color-warning-chip-text)', dot: 'var(--color-warning)', label: 'Pending' },
  approved: { bg: 'var(--color-success-chip-bg)', fg: 'var(--color-success)', dot: 'var(--color-success)', label: 'Approved' },
  rejected: { bg: 'var(--color-danger-chip-bg)', fg: 'var(--color-danger)', dot: 'var(--color-danger)', label: 'Rejected' },
  cancelled: { bg: 'var(--color-neutral-chip-bg)', fg: 'var(--color-neutral-dot)', dot: 'var(--color-neutral-dot)', label: 'Cancelled' },
  active: { bg: 'var(--color-success-chip-bg)', fg: 'var(--color-success)', dot: 'var(--color-success)', label: 'Active' },
  inactive: { bg: 'var(--color-neutral-chip-bg)', fg: 'var(--color-neutral-dot)', dot: 'var(--color-neutral-dot)', label: 'Inactive' },
};

/** @param {{ status: keyof typeof STATUS_STYLES, label?: string }} props */
export function StatusPill({ status, label }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.cancelled;
  return (
    <span className="pill" style={{ background: s.bg, color: s.fg }}>
      <span className="pill-dot" style={{ background: s.dot }} aria-hidden="true" />
      {label ?? s.label}
    </span>
  );
}
