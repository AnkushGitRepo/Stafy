import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatusPill } from '../../../components/ui/StatusPill.jsx';

/** @param {{ items: Array<{ date: string, status: string, times?: string }>, loading?: boolean }} props */
export function RecentAttendanceList({ items, loading }) {
  if (loading) {
    return (
      <div className="card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}
          >
            <Skeleton width={70} height={12} />
            <Skeleton width={64} height={20} />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="card">
        <EmptyState title="No attendance recorded yet" />
      </div>
    );
  }

  return (
    <div className="card">
      {items.map((row, i) => (
        <div
          key={row.date}
          style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none', fontSize: 'var(--font-size-sm)' }}
        >
          <span style={{ width: 84, color: 'var(--color-text)', fontWeight: 600, flex: 'none' }}>{row.date}</span>
          <StatusPill status={row.status} />
          {row.times && <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted-2)', flex: 'none' }}>{row.times}</span>}
        </div>
      ))}
    </div>
  );
}
