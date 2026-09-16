import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { getAuditLogs } from '../../../lib/api.js';

export function AuditLogPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => getAuditLogs().then((r) => r.data),
  });

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="System-wide security and mutation log." />

      {isLoading && (
        <div className="card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
              <Skeleton width={140} height={14} />
              <Skeleton width={100} height={14} />
              <Skeleton width={120} height={14} />
            </div>
          ))}
        </div>
      )}

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load audit logs. Try again.</p>}

      {!isLoading && data && data.length === 0 && (
        <div className="card">
          <EmptyState title="No audit entries recorded yet" />
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', textAlign: 'left' }}>
                {['Timestamp', 'Actor', 'Action', 'Entity', 'Details'].map((h) => (
                  <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{r.timestamp}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--color-text)' }}>{r.actorName}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {r.action}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{r.entityType}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted-2)', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>
                    {r.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
