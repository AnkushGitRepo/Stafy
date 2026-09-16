import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { getDashboard } from '../../../lib/api.js';
import { CheckInCard } from '../components/CheckInCard.jsx';
import { RecentAttendanceList } from '../components/RecentAttendanceList.jsx';

export function EmployeeDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'employee'],
    queryFn: () => getDashboard('employee').then((r) => r.data),
  });

  const metric = (key) => data?.metrics.find((m) => m.key === key);
  const total = metric('total');
  const pending = metric('pending');
  const approved = metric('approved');
  const rejected = metric('rejected');

  return (
    <div>
      <PageHeader title="My dashboard" subtitle="Today's status and your recent history." />

      <CheckInCard />

      {isLoading && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="stfy-leave-tile">
              <Skeleton height={22} width={40} />
            </div>
          ))}
        </div>
      )}

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load the dashboard. Try again.</p>}

      {data && (
        <>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
            <div className="stfy-leave-tile">
              <StatCard label={total.label} value={total.value} />
            </div>
            <div className="stfy-leave-tile">
              <StatCard label={pending.label} value={pending.value} />
            </div>
            <div className="stfy-leave-tile">
              <StatCard label="Approved / Rejected" value={`${approved.value} / ${rejected.value}`} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>Recent attendance</h2>
              <Link to="/app/attendance" className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                View all
              </Link>
            </div>
            <RecentAttendanceList items={data.recentAttendance} />
          </div>
        </>
      )}

      <style>{`
        .stfy-leave-tile { flex: 1; min-width: 120px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); }
      `}</style>
    </div>
  );
}
