import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';

const ACTIVITY_TONES = {
  approved: {
    bg: 'var(--color-success-chip-bg)',
    color: 'var(--color-success)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  rejected: {
    bg: 'var(--color-danger-chip-bg)',
    color: 'var(--color-danger)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  inactive: {
    bg: 'var(--color-warning-chip-bg)',
    color: 'var(--color-warning-chip-text)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="18" y1="11" x2="23" y2="11" />
      </svg>
    ),
  },
  active: {
    bg: 'var(--color-success-chip-bg)',
    color: 'var(--color-success)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
  },
  present: {
    bg: 'var(--color-info-chip-bg)',
    color: 'var(--color-info)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  'half-day': {
    bg: 'var(--color-neutral-chip-bg)',
    color: 'var(--color-text-muted)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
  neutral: {
    bg: 'var(--color-surface-2)',
    color: 'var(--color-text-muted)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
};

/**
 * @param {{
 *   items: Array<{
 *     id?: string,
 *     time: string,
 *     summary?: string,
 *     text?: string,
 *     details?: string,
 *     status?: string,
 *     actionLabel?: string,
 *     actorName?: string,
 *     targetName?: string,
 *   }>,
 *   loading?: boolean
 * }} props
 */
export function RecentActivityList({ items, loading }) {
  if (loading) {
    return (
      <div className="card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <Skeleton width={32} height={32} style={{ borderRadius: 'var(--radius-full)' }} />
            <div style={{ flex: 1 }}>
              <Skeleton height={14} width="65%" style={{ marginBottom: 'var(--space-1)' }} />
              <Skeleton height={11} width="35%" />
            </div>
            <Skeleton height={12} width={50} />
          </div>
        ))}
      </div>
    );
  }

  if (!items || !items.length) {
    return (
      <div className="card">
        <EmptyState title="No recent activity yet" subtitle="Recent leaves, employee updates, and approvals will appear here." />
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {items.map((entry, i) => {
        const tone = ACTIVITY_TONES[entry.status] ?? ACTIVITY_TONES.neutral;
        const displayText = entry.summary || entry.text || 'System activity recorded';

        return (
          <div
            key={entry.id ? `${entry.id}-${i}` : `${entry.time}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
              transition: 'background var(--duration-fast) var(--ease-standard)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-full)',
                background: tone.bg,
                color: tone.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {tone.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text)',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={displayText}
              >
                {displayText}
              </div>
              {(entry.details || entry.actionLabel) && (
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted-2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginTop: '2px',
                  }}
                >
                  {entry.actionLabel && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: tone.bg,
                        color: tone.color,
                        fontWeight: 600,
                      }}
                    >
                      {entry.actionLabel}
                    </span>
                  )}
                  {entry.details && <span>{entry.details}</span>}
                </div>
              )}
            </div>

            <div
              style={{
                marginLeft: 'auto',
                color: 'var(--color-text-muted-2)',
                fontSize: 'var(--font-size-xs)',
                flexShrink: 0,
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'right',
              }}
            >
              {entry.time}
            </div>
          </div>
        );
      })}
    </div>
  );
}
