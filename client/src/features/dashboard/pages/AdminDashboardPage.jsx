import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { getDashboard } from '../../../lib/api.js';
import { RecentActivityList } from '../components/RecentActivityList.jsx';

const TINT = {
  present: 'success',
  leave: 'info',
  pending: 'warning',
};

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => getDashboard('admin').then((r) => r.data),
  });

  return (
    <div>
      <PageHeader title="HR overview" subtitle="Org-wide attendance and leave, right now." />

      {isLoading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={72} />
            ))}
          </div>
          <RecentActivityList items={[]} loading />
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

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
              Recent activity
            </h2>
            <RecentActivityList items={data.recentActivity} />
          </div>
        </>
      )}
    </div>
  );
}
