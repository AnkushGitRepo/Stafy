import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatusPill } from '../../../components/ui/StatusPill.jsx';
import { applyForLeave, cancelLeaveRequest, getLeaveBalance, getLeaveTypes, getMyLeaveRequests } from '../../../lib/api.js';

function BalanceMeter({ name, quota, used, remaining }) {
  const pct = quota ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', flex: '1 1 160px' }}>
      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{name}</div>
      {quota === null ? (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted-2)' }}>No limit · {used} used</div>
      ) : (
        <>
          <div style={{ height: 6, borderRadius: 999, background: 'var(--color-surface-2)', overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-accent)', borderRadius: 999 }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted-2)' }}>
            {remaining} of {quota} days remaining
          </div>
        </>
      )}
    </div>
  );
}

function ApplyLeaveModal({ leaveTypes, onClose, onSubmit, submitting, errorText }) {
  const [leaveTypeId, setLeaveTypeId] = useState(leaveTypes[0]?.id ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('full_day');
  const [halfSession, setHalfSession] = useState('first_half');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      leaveTypeId,
      startDate,
      endDate: duration === 'half_day' ? startDate : endDate,
      duration,
      halfSession: duration === 'half_day' ? halfSession : undefined,
      reason,
    });
  };

  return (
    <div className="stfy-modal-overlay" onClick={onClose}>
      <div className="stfy-modal card" style={{ maxWidth: 440 }} role="dialog" aria-modal="true" aria-labelledby="apply-leave-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="apply-leave-title" className="stfy-modal-title">
          Apply for leave
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
          <div className="field">
            <label className="field-label" htmlFor="leave-type">
              Leave type
            </label>
            <select id="leave-type" className="field-input" value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} required>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="leave-duration">
              Duration
            </label>
            <select id="leave-duration" className="field-input" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="full_day">Full day(s)</option>
              <option value="half_day">Half day</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label" htmlFor="leave-start">
                Start date
              </label>
              <input id="leave-start" type="date" className="field-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            {duration === 'full_day' ? (
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label" htmlFor="leave-end">
                  End date
                </label>
                <input id="leave-end" type="date" className="field-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            ) : (
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label" htmlFor="leave-session">
                  Session
                </label>
                <select id="leave-session" className="field-input" value={halfSession} onChange={(e) => setHalfSession(e.target.value)}>
                  <option value="first_half">First half</option>
                  <option value="second_half">Second half</option>
                </select>
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="leave-reason">
              Reason
            </label>
            <textarea
              id="leave-reason"
              className="field-input"
              rows={3}
              minLength={10}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="At least 10 characters"
              required
            />
          </div>

          {errorText && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>{errorText}</p>}

          <div className="stfy-modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeeLeavePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [errorText, setErrorText] = useState('');
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['leave', 'mine'],
    queryFn: () => getMyLeaveRequests().then((r) => r.data),
  });
  const { data: leaveTypes } = useQuery({
    queryKey: ['leave', 'types'],
    queryFn: () => getLeaveTypes().then((r) => r.data),
  });
  const { data: balance } = useQuery({
    queryKey: ['leave', 'balance'],
    queryFn: () => getLeaveBalance().then((r) => r.data),
  });

  const applyMutation = useMutation({
    mutationFn: applyForLeave,
    onSuccess: () => {
      setModalOpen(false);
      setErrorText('');
      queryClient.invalidateQueries({ queryKey: ['leave', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => setErrorText(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Leave"
        subtitle="Your leave requests."
        action={
          <Button onClick={() => setModalOpen(true)} disabled={!leaveTypes?.length}>
            Apply for leave
          </Button>
        }
      />

      {balance && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          {balance.map((b) => (
            <BalanceMeter key={b.id} {...b} />
          ))}
        </div>
      )}

      {isLoading && (
        <div className="card">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ padding: 'var(--space-4)', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
              <Skeleton height={14} width="60%" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !requests?.length && (
        <div className="card">
          <EmptyState title="No leave requests yet" body="Apply for leave using the button above." />
        </div>
      )}

      {!isLoading && requests?.length > 0 && (
        <div className="card">
          {requests.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'center',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: i < requests.length - 1 ? '1px solid var(--color-border)' : 'none',
                flexWrap: 'wrap',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--color-text)', minWidth: 140 }}>{r.dates}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                {r.type} · {r.days}d
              </span>
              <StatusPill status={r.status} />
              {r.status === 'rejected' && r.rejectionReason && (
                <span style={{ color: 'var(--color-text-muted-2)', fontSize: 'var(--font-size-xs)', width: '100%' }}>Reason: {r.rejectionReason}</span>
              )}
              {r.canCancel && (
                <Button
                  variant="secondary"
                  onClick={() => cancelMutation.mutate(r.id)}
                  disabled={cancelMutation.isPending}
                  style={{ marginLeft: 'auto', minHeight: 32, padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                >
                  Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && leaveTypes && (
        <ApplyLeaveModal
          leaveTypes={leaveTypes}
          onClose={() => {
            setModalOpen(false);
            setErrorText('');
          }}
          onSubmit={(payload) => applyMutation.mutate(payload)}
          submitting={applyMutation.isPending}
          errorText={errorText}
        />
      )}
    </div>
  );
}

export function LeavePage() {
  return <EmployeeLeavePage />;
}

