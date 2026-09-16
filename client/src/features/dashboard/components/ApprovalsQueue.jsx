import { useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { approveLeaveRequest, rejectLeaveRequest } from '../../../lib/api.js';

const REASON_MIN_LENGTH = 10;

/**
 * Manager's inline approve/reject queue, wired to the real leave-requests
 * API (BR-10…BR-13 enforced server-side, including 404-not-403 out-of-scope
 * requests per ADR-008).
 * @param {{ initialApprovals: Array<{ id: string, name: string, dates: string, type: string }>, loading?: boolean }} props
 */
export function ApprovalsQueue({ initialApprovals, loading }) {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [rejectingId, setRejectingId] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const [errorText, setErrorText] = useState('');
  const rowRefs = useRef(new Map());
  const queryClient = useQueryClient();

  const removeRow = (id) => {
    const node = rowRefs.current.get(id);
    const remove = () => setApprovals((prev) => prev.filter((a) => a.id !== id));
    if (!node) {
      remove();
      return;
    }
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(node, { height: 0, opacity: 0, marginBottom: 0, duration: 0.25, ease: 'power2.inOut', onComplete: remove });
    });
    mm.add('(prefers-reduced-motion: reduce)', remove);
  };

  const decide = async (id, action, reason) => {
    setPendingId(id);
    setErrorText('');
    try {
      if (action === 'approve') await approveLeaveRequest(id);
      else await rejectLeaveRequest(id, reason);
      setRejectingId(null);
      removeRow(id);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      setErrorText(err.message ?? 'Something went wrong.');
    } finally {
      setPendingId(null);
    }
  };

  const rejectToggle = (id) => {
    setRejectingId((cur) => (cur === id ? null : id));
    setReasonText('');
    setErrorText('');
  };

  if (loading) {
    return (
      <div className="card">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ padding: 'var(--space-4)', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
            <Skeleton height={12} width="80%" />
          </div>
        ))}
      </div>
    );
  }

  if (!approvals.length) {
    return (
      <div className="card">
        <EmptyState title="No pending approvals right now" />
      </div>
    );
  }

  return (
    <div className="card">
      {errorText && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-danger-chip-bg)', color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>
          {errorText}
        </div>
      )}
      {approvals.map((a, i) => {
        const isRejecting = rejectingId === a.id;
        const reasonInvalid = reasonText.trim().length < REASON_MIN_LENGTH;
        const isBusy = pendingId === a.id;
        return (
          <div
            key={a.id}
            ref={(el) => {
              if (el) rowRefs.current.set(a.id, el);
              else rowRefs.current.delete(a.id);
            }}
            style={{ borderBottom: i < approvals.length - 1 ? '1px solid var(--color-border)' : 'none', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text)', minWidth: 110, fontSize: 'var(--font-size-sm)' }}>{a.name}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                {a.dates} · {a.type}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
                <Button variant="primary" disabled={isBusy} onClick={() => decide(a.id, 'approve')} style={{ minHeight: 32, padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  disabled={isBusy}
                  onClick={() => rejectToggle(a.id)}
                  aria-expanded={isRejecting}
                  style={{ minHeight: 32, padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}
                >
                  Reject
                </Button>
              </div>
            </div>
            {isRejecting && (
              <div style={{ padding: '0 var(--space-4) var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  className="field-input"
                  placeholder="Reason for rejection (required)"
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  aria-label={`Reason for rejecting ${a.name}'s request`}
                  style={{ flex: 1, minHeight: 36, fontSize: 'var(--font-size-xs)' }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={reasonInvalid || pendingId === a.id}
                  onClick={() => decide(a.id, 'reject', reasonText.trim())}
                  style={{ background: 'var(--color-danger)', minHeight: 36, padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
