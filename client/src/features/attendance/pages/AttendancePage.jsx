import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { StatusPill } from '../../../components/ui/StatusPill.jsx';
import { useAuth } from '../../../lib/authContext.jsx';
import { getAttendanceForDate, getMyAttendanceHistory } from '../../../lib/api.js';

function shiftDate(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function todayIst() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}
function fmtHeaderDate(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

// Admin/Manager: single-day, scope-filtered table with date navigation.
// Employee: last-30-days list. Reduced fidelity against
// docs/prompts/P-006-core-pages-design.md §4 (no search/department filter
// for Admin, no month-strip visual for Employee — a plain list instead).
function OrgAttendanceView() {
  const [date, setDate] = useState(todayIst());
  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance', 'byDate', date],
    queryFn: () => getAttendanceForDate(date).then((r) => r.data),
  });

  const tints = { present: 'success', 'half-day': 'warning', absent: 'danger', onLeave: 'info' };

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Org-wide, one day at a time." />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <button type="button" className="btn btn-secondary" onClick={() => setDate((d) => shiftDate(d, -1))} aria-label="Previous day" style={{ minHeight: 36, padding: '0 var(--space-3)' }}>
          ‹
        </button>
        <span style={{ fontWeight: 600, minWidth: 220, textAlign: 'center' }}>{fmtHeaderDate(date)}</span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setDate((d) => shiftDate(d, 1))}
          disabled={date >= todayIst()}
          aria-label="Next day"
          style={{ minHeight: 36, padding: '0 var(--space-3)' }}
        >
          ›
        </button>
        {date !== todayIst() && (
          <button type="button" className="btn-ghost" onClick={() => setDate(todayIst())} style={{ fontSize: 'var(--font-size-xs)' }}>
            Back to today
          </button>
        )}
      </div>

      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={72} />
          ))}
        </div>
      )}

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load attendance. Try again.</p>}

      {!isLoading && data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <StatCard label="Present" value={data.summary.present} tint={tints.present} />
            <StatCard label="Half Day" value={data.summary.halfDay} tint={tints['half-day']} />
            <StatCard label="Absent" value={data.summary.absent} tint={tints.absent} />
            <StatCard label="On Leave" value={data.summary.onLeave} tint={tints.onLeave} />
          </div>

          {data.rows.length === 0 ? (
            <div className="card">
              <EmptyState title="No one in scope yet" />
            </div>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', textAlign: 'left' }}>
                    {['Name', 'Check-in', 'Check-out', 'Hours', 'Status'].map((h) => (
                      <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--color-text)' }}>{r.name}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{r.checkIn ?? '—'}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{r.checkOut ?? '—'}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{r.hours ?? '—'}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <StatusPill status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmployeeAttendanceView() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance', 'mine'],
    queryFn: () => getMyAttendanceHistory().then((r) => r.data),
  });

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Your last 30 days." />

      {isLoading && (
        <div className="card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none' }}>
              <Skeleton height={14} width="50%" />
            </div>
          ))}
        </div>
      )}

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load your attendance. Try again.</p>}

      {!isLoading && data && data.length === 0 && (
        <div className="card">
          <EmptyState title="No attendance recorded yet" />
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="card">
          {data.map((r, i) => (
            <div
              key={r.date}
              style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none', fontSize: 'var(--font-size-sm)' }}
            >
              <span style={{ width: 100, color: 'var(--color-text)', fontWeight: 600, flex: 'none' }}>{r.date}</span>
              <StatusPill status={r.status} />
              <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted-2)' }}>
                {r.checkIn ?? '—'} {r.checkOut ? `– ${r.checkOut}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AttendancePage() {
  const { role } = useAuth();
  if (role === 'employee') return <EmployeeAttendanceView />;
  return <OrgAttendanceView />;
}
