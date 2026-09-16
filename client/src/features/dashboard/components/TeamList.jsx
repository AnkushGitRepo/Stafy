import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatusPill } from '../../../components/ui/StatusPill.jsx';

/** @param {{ members: Array<{ name: string, initials: string, status: string }>, loading?: boolean }} props */
export function TeamList({ members, loading }) {
  if (loading) {
    return (
      <div className="card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none' }}
          >
            <Skeleton width={28} height={28} />
            <Skeleton width={110} height={12} />
          </div>
        ))}
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="card">
        <EmptyState title="No team members yet" body="Once employees are assigned to you, they'll show up here." />
      </div>
    );
  }

  return (
    <div className="card">
      {members.map((m, i) => (
        <div
          key={m.name}
          style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', borderBottom: i < members.length - 1 ? '1px solid var(--color-border)' : 'none' }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: 'var(--color-success-chip-bg)',
              color: 'var(--color-success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              flex: 'none',
            }}
          >
            {m.initials}
          </span>
          <span style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}>{m.name}</span>
          <span style={{ marginLeft: 'auto' }}>
            <StatusPill status={m.status} />
          </span>
        </div>
      ))}
    </div>
  );
}
