import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { StatusPill } from '../../../components/ui/StatusPill.jsx';
import { getAuditLogs } from '../../../lib/api.js';

const CATEGORIES = [
  { id: 'all', label: 'All Events' },
  { id: 'leave', label: 'Leave Decisions' },
  { id: 'employee', label: 'Employee Changes' },
  { id: 'attendance', label: 'Attendance' },
];

export function AuditLogPage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs', category],
    queryFn: () => getAuditLogs({ category }).then((r) => r),
  });

  const events = data?.data ?? [];
  const summary = data?.summary ?? {
    total: events.length,
    leave: events.filter((e) => e.category === 'leave').length,
    employee: events.filter((e) => e.category === 'employee').length,
    attendance: events.filter((e) => e.category === 'attendance').length,
  };

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter(
      (e) =>
        e.actorName.toLowerCase().includes(q) ||
        (e.targetName && e.targetName.toLowerCase().includes(q)) ||
        e.actionLabel.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        (e.details && e.details.toLowerCase().includes(q)),
    );
  }, [events, search]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <PageHeader title="Audit Log" subtitle="System-wide immutable security, leave decisions, and lifecycle mutations." />
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="button"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            cursor: isFetching ? 'not-allowed' : 'pointer',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Metric summary bento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <StatCard label="Total Events Logged" value={summary.total} tint="neutral" />
        <StatCard label="Leave Decisions" value={summary.leave} tint="info" />
        <StatCard label="Employee Lifecycle" value={summary.employee} tint="warning" />
        <StatCard label="Attendance Logs" value={summary.attendance} tint="success" />
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: active ? 600 : 500,
                  border: '1px solid',
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-standard)',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', minWidth: '220px', flex: '1', maxWidth: '320px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, target, action..."
            style={{
              width: '100%',
              padding: '6px 12px 6px 32px',
              fontSize: 'var(--font-size-xs)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              outline: 'none',
            }}
          />
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted-2)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {isLoading && (
        <div className="card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'center',
              }}
            >
              <Skeleton width={130} height={14} />
              <Skeleton width={120} height={14} />
              <Skeleton width={90} height={20} style={{ borderRadius: 'var(--radius-full)' }} />
              <Skeleton width={140} height={14} />
              <Skeleton width="30%" height={14} />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="card" style={{ color: 'var(--color-danger)', padding: 'var(--space-4)' }}>
          Could not load audit logs. Please check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && filteredEvents.length === 0 && (
        <div className="card">
          <EmptyState
            title="No audit logs matched"
            subtitle={search ? `No log entries matching "${search}". Try clearing the search query.` : 'No audit records recorded under this category.'}
          />
        </div>
      )}

      {!isLoading && !isError && filteredEvents.length > 0 && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                {['Timestamp', 'Actor', 'Action', 'Target', 'Event Summary', 'Details'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--font-size-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((r, i) => (
                <tr
                  key={r.id}
                  style={{
                    borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                    transition: 'background var(--duration-fast) var(--ease-standard)',
                  }}
                >
                  {/* Timestamp */}
                  <td
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      color: 'var(--color-text-muted-2)',
                      fontSize: 'var(--font-size-xs)',
                      whiteSpace: 'nowrap',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {r.timestamp}
                  </td>

                  {/* Actor with avatar */}
                  <td style={{ padding: 'var(--space-3) var(--space-4)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-surface-2)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {r.actorInitials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}>{r.actorName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted-2)' }}>{r.actorRole}</div>
                      </div>
                    </div>
                  </td>

                  {/* Action Pill */}
                  <td style={{ padding: 'var(--space-3) var(--space-4)', whiteSpace: 'nowrap' }}>
                    <StatusPill status={r.status} label={r.actionLabel} />
                  </td>

                  {/* Target entity */}
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {r.targetName}
                    </span>
                  </td>

                  {/* Structured description */}
                  <td style={{ padding: 'var(--space-3) var(--space-4)', minWidth: '220px' }}>
                    <div style={{ color: 'var(--color-text)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{r.summary}</div>
                    {r.details && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted-2)', marginTop: '2px' }}>{r.details}</div>
                    )}
                  </td>

                  {/* Metadata inspection button */}
                  <td style={{ padding: 'var(--space-3) var(--space-4)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(r)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-accent)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Event Details Drawer/Modal */}
      {selectedEvent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(12, 42, 32, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 'var(--z-modal)',
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--color-surface)',
              height: '100%',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-6)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  Audit Event Details
                </h3>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted-2)' }}>
                  ID: {selectedEvent.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'var(--font-size-xl)',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              <StatusPill status={selectedEvent.status} label={selectedEvent.actionLabel} />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted-2)' }}>
                {selectedEvent.timestamp}
              </span>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Summary
              </div>
              <div style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-2)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                {selectedEvent.summary}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Structured Attributes
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ color: 'var(--color-text-muted-2)' }}>Actor</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedEvent.actorName} ({selectedEvent.actorRole})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ color: 'var(--color-text-muted-2)' }}>Target Entity</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedEvent.targetName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ color: 'var(--color-text-muted-2)' }}>Category</span>
                  <span style={{ textTransform: 'capitalize', color: 'var(--color-text)' }}>{selectedEvent.category}</span>
                </div>
                {selectedEvent.metadata &&
                  Object.entries(selectedEvent.metadata).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
                      <span style={{ color: 'var(--color-text-muted-2)' }}>{k}</span>
                      <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{String(v)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Payload Inspector (JSON)
              </div>
              <pre
                style={{
                  background: 'var(--color-dark)',
                  color: 'var(--color-on-dark-muted)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  maxHeight: '220px',
                }}
              >
                {JSON.stringify(selectedEvent.rawAfter, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
