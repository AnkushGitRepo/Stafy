import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

import { useIstClock } from '../../../lib/useIstClock.js';

function istNow() {
  const d = new Date();
  return new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000);
}

function formatIstTime(date) {
  const ist = new Date(date.getTime() + (date.getTimezoneOffset() + 330) * 60000);
  let h = ist.getHours();
  const m = String(ist.getMinutes()).padStart(2, '0');
  const ap = h < 12 ? 'AM' : 'PM';
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function formatElapsed(ms) {
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Employee dashboard's hero: live clock, check-in/out toggle, elapsed timer.
 * Check-in state is mock-only (local) — real check-in lands in P1 against
 * POST /api/attendance/check-in|out. Weekend disable is computed from the
 * real IST calendar date, not fabricated.
 */
export function CheckInCard() {
  const clock = useIstClock();
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInAt, setCheckInAt] = useState(null);
  const [, forceTick] = useState(0);
  const buttonRef = useRef(null);

  const isWeekend = [0, 6].includes(istNow().getDay());

  useEffect(() => {
    if (!checkedIn) return undefined;
    const id = setInterval(() => forceTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, [checkedIn]);

  const handleToggle = () => {
    if (buttonRef.current) {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(buttonRef.current, { scale: 0.98 }, { scale: 1, duration: 0.2, ease: 'power2.out' });
      });
    }
    if (checkedIn) {
      setCheckedIn(false);
      setCheckInAt(null);
    } else {
      setCheckedIn(true);
      setCheckInAt(Date.now());
    }
  };

  const dateStrLong = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  let statusText = "You're not checked in yet";
  if (checkedIn) statusText = `Checked in at ${formatIstTime(new Date(checkInAt))} · ${formatElapsed(Date.now() - checkInAt)}`;
  else if (isWeekend) statusText = "It's the weekend — check-in isn't required today";

  return (
    <div className="stfy-checkin-card">
      <div>
        <div className="stfy-checkin-date">{dateStrLong}</div>
        <div className="stfy-checkin-clock">{clock}</div>
        <div className="stfy-checkin-status" aria-live="polite">
          {statusText}
        </div>
      </div>
      <button
        ref={buttonRef}
        type="button"
        className={`stfy-checkin-button${checkedIn ? ' is-checked-in' : ''}`}
        aria-live="polite"
        disabled={isWeekend && !checkedIn}
        onClick={handleToggle}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="7" x2="12" y2="12" />
          <line x1="12" y1="12" x2="16" y2="14" />
        </svg>
        {checkedIn ? 'Check out' : 'Check in'}
      </button>

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
