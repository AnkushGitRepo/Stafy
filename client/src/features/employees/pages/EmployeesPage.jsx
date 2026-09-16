import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatusPill } from '../../../components/ui/StatusPill.jsx';
import { getEmployees } from '../../../lib/api.js';

function fmtJoined(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

// Read-only list this pass — search + department + status filters only.
// No add/edit/deactivate/pagination/detail-drawer yet: see docs/CONTEXT.md
// cut list (a full docs/prompts/P-006-core-pages-design.md port is out of
// scope for the remaining time).
export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employees', { search, department, status }],
    queryFn: () => getEmployees({ search, department, status }).then((r) => r.data),
  });

  const allForDepartments = useQuery({
    queryKey: ['employees', 'all-for-departments'],
    queryFn: () => getEmployees().then((r) => r.data),
    staleTime: 60000,
  });
  const departments = useMemo(
    () => [...new Set((allForDepartments.data ?? []).map((e) => e.department).filter(Boolean))].sort(),
    [allForDepartments.data],
  );

  const isFiltered = Boolean(search || department || status);

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${data ? `${data.length} ` : ''}Org directory.`} />

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        <input
          className="field-input"
          placeholder="Search name, email, or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 220px', maxWidth: 320 }}
          aria-label="Search employees"
        />
        <select className="field-input" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ maxWidth: 180 }} aria-label="Filter by department">
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 160 }} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading && (
        <div className="card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
              <Skeleton width={160} height={14} />
              <Skeleton width={120} height={14} />
              <Skeleton width={100} height={14} />
            </div>
          ))}
        </div>
      )}

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load employees. Try again.</p>}

      {!isLoading && data && data.length === 0 && (
        <div className="card">
          <EmptyState
            title={isFiltered ? 'No employees match these filters' : 'No employees yet'}
            body={isFiltered ? 'Try a different search or clear a filter.' : undefined}
          />
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', textAlign: 'left' }}>
                {['Name', 'Department', 'Designation', 'Manager', 'Joined', 'Status'].map((h) => (
                  <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
                        {e.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{e.name}</div>
                        <div style={{ color: 'var(--color-text-muted-2)', fontSize: 'var(--font-size-xs)' }}>{e.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{e.department ?? '—'}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{e.designation ?? '—'}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{e.manager ?? '—'}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{fmtJoined(e.joiningDate)}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <StatusPill status={e.status} />
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
