import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { getDashboard } from '../../../lib/api.js';
import { TeamList } from '../../dashboard/components/TeamList.jsx';

export function TeamPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: () => getDashboard('manager').then((r) => r.data),
  });

  return (
    <div>
      <PageHeader
        title="My Team"
        subtitle="Direct reports assigned to you."
      />

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load team members. Try again.</p>}

      <TeamList members={data?.team ?? []} loading={isLoading} />
    </div>
  );
}
