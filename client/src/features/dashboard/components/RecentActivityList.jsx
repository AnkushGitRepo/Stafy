import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';

/** @param {{ items: Array<{ time: string, text: string }>, loading?: boolean }} props */
export function RecentActivityList({ items, loading }) {
  if (loading) {
    return (
      <div className="card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none' }}>
            <Skeleton height={12} width="85%" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="card">
        <EmptyState title="No recent activity yet" />
      </div>
    );
  }

  return (
    <div className="card">
      {items.map((entry, i) => (
        <div
          key={`${entry.time}-${i}`}
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <span style={{ color: 'var(--color-text)' }}>{entry.text}</span>
          <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted-2)', flex: 'none', fontVariantNumeric: 'tabular-nums' }}>{entry.time}</span>
        </div>
      ))}
    </div>
  );
}
