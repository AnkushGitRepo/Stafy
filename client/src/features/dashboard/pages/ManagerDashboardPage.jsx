import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { getDashboard } from '../../../lib/api.js';
import { ApprovalsQueue } from '../components/ApprovalsQueue.jsx';
import { TeamList } from '../components/TeamList.jsx';

const TINT = {
  present: 'success',
  leave: 'info',
  pending: 'warning',
};

export function ManagerDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: () => getDashboard('manager').then((r) => r.data),
  });

  return (
    <div>
      <PageHeader title="Team overview" subtitle="Your direct reports only." />

      {isLoading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={72} />
            ))}
          </div>
          <div className="stfy-manager-grid">
            <ApprovalsQueue initialApprovals={[]} loading />
            <TeamList members={[]} loading />
          </div>
        </>
      )}

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load the dashboard. Try again.</p>}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {data.metrics.map((m) => (
              <StatCard key={m.key} label={m.label} value={m.value} tint={TINT[m.status] ?? 'neutral'} />
            ))}
          </div>

          <div className="stfy-manager-grid">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
                Pending approvals
              </h2>
              <ApprovalsQueue initialApprovals={data.approvals ?? []} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
                Team
              </h2>
              <TeamList members={data.team} />
            </div>
          </div>
        </>
      )}

      <style>{`
        .stfy-manager-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); }
        @media (max-width: 1023px) {
          .stfy-manager-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
