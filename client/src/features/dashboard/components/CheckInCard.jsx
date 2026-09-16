import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import { useRef } from 'react';

import { checkIn, checkOut, getTodayAttendance } from '../../../lib/api.js';
import { useIstClock } from '../../../lib/useIstClock.js';

function formatIstTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

function formatElapsed(sinceIso) {
  const mins = Math.floor((Date.now() - new Date(sinceIso).getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Employee dashboard's hero: live clock, check-in/out toggle wired to the
 * real attendance API (BR-14…BR-18 enforced server-side).
 */
export function CheckInCard() {
  const clock = useIstClock();
  const buttonRef = useRef(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => getTodayAttendance().then((r) => r.data),
    refetchInterval: 60000,
  });

  const mutation = useMutation({
    mutationFn: (action) => (action === 'in' ? checkIn() : checkOut()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const checkedIn = Boolean(data?.check_in_at) && !data?.check_out_at;
  const alreadyDoneToday = Boolean(data?.check_in_at) && Boolean(data?.check_out_at);

  const handleToggle = () => {
    if (buttonRef.current) {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(buttonRef.current, { scale: 0.98 }, { scale: 1, duration: 0.2, ease: 'power2.out' });
      });
    }
    mutation.mutate(checkedIn ? 'out' : 'in');
  };

  const dateStrLong = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  let statusText = "You're not checked in yet";
  if (mutation.isError) statusText = mutation.error.message;
  else if (checkedIn) statusText = `Checked in at ${formatIstTime(data.check_in_at)} · ${formatElapsed(data.check_in_at)}`;
  else if (alreadyDoneToday) statusText = `Checked in ${formatIstTime(data.check_in_at)} · out ${formatIstTime(data.check_out_at)}`;

  const disabled = mutation.isPending || alreadyDoneToday;

  return (
    <div className="stfy-checkin-card">
      <div>
        <div className="stfy-checkin-date">{dateStrLong}</div>
        <div className="stfy-checkin-clock">{clock}</div>
        <div className="stfy-checkin-status" aria-live="polite">
          {statusText}
        </div>
      </div>
      {!alreadyDoneToday && (
        <button
          ref={buttonRef}
          type="button"
          className={`stfy-checkin-button${checkedIn ? ' is-checked-in' : ''}`}
          aria-live="polite"
          disabled={disabled}
          onClick={handleToggle}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="7" x2="12" y2="12" />
            <line x1="12" y1="12" x2="16" y2="14" />
          </svg>
          {checkedIn ? 'Check out' : 'Check in'}
        </button>
      )}

      <style>{`
        .stfy-checkin-card { background: var(--color-dark); border-radius: var(--radius-lg); padding: var(--space-6); display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-6); }
        .stfy-checkin-date { font-size: var(--font-size-xs); font-weight: 600; color: var(--color-on-dark-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .stfy-checkin-clock { font-family: var(--font-display); font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-accent-contrast); font-variant-numeric: tabular-nums; letter-spacing: -0.01em; margin-top: 2px; }
        .stfy-checkin-status { font-size: var(--font-size-sm); color: var(--color-on-dark-muted); margin-top: 2px; }
        .stfy-checkin-button { display: flex; align-items: center; gap: var(--space-2); background: var(--color-accent-contrast); color: var(--color-dark); border: none; padding: var(--space-3) var(--space-6); border-radius: var(--radius-md); font-size: var(--font-size-base); font-weight: 700; cursor: pointer; }
        .stfy-checkin-button.is-checked-in { background: var(--color-success-chip-bg); color: var(--color-success); }
        .stfy-checkin-button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
