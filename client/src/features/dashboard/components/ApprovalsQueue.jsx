import gsap from 'gsap';
import { useRef, useState } from 'react';

import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';

const REASON_MIN_LENGTH = 10;

/**
 * Manager's inline approve/reject queue. Approve/reject decisions are
 * mock-only (local state) — real approval lands in P1 against the leave
 * requests API (BR-10…BR-13).
 * @param {{ initialApprovals: Array<{ id: number, name: string, dates: string, type: string }>, loading?: boolean }} props
 */
export function ApprovalsQueue({ initialApprovals, loading }) {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [rejectingId, setRejectingId] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const rowRefs = useRef(new Map());

  const decide = (id) => {
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

  const rejectToggle = (id) => {
    setRejectingId((cur) => (cur === id ? null : id));
    setReasonText('');
  };

  const rejectSubmit = (id) => {
    setRejectingId(null);
    decide(id);
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
      {approvals.map((a, i) => {
        const isRejecting = rejectingId === a.id;
        const reasonInvalid = reasonText.trim().length < REASON_MIN_LENGTH;
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
                <Button variant="primary" onClick={() => decide(a.id)} style={{ minHeight: 32, padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
                  Approve
                </Button>
                <Button
                  variant="secondary"
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
                  disabled={reasonInvalid}
                  onClick={() => rejectSubmit(a.id)}
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
