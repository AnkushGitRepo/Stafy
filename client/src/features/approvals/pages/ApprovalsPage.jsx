import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { getApprovals } from '../../../lib/api.js';
import { ApprovalsQueue } from '../../dashboard/components/ApprovalsQueue.jsx';

export function ApprovalsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['approvals'],
    queryFn: () => getApprovals().then((r) => r.data),
  });

  return (
    <div>
      <PageHeader
        title="Approvals"
        subtitle="Pending leave requests requiring your review."
      />

      {isLoading && (
        <div className="card">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ padding: 'var(--space-4)', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
              <Skeleton height={14} width="70%" />
            </div>
          ))}
        </div>
      )}

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load pending approvals. Try again.</p>}

      {data && (
        <ApprovalsQueue initialApprovals={data} />
      )}
    </div>
  );
}
