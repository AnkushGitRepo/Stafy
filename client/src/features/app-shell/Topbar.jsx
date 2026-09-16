import { useLocation } from 'react-router';

import { useIstClock } from '../../lib/useIstClock.js';
import { pageTitleForPath } from './navConfig.js';

/** @param {{ onOpenDrawer: () => void }} props */
export function Topbar({ onOpenDrawer }) {
  const location = useLocation();
  const clock = useIstClock();
  const title = pageTitleForPath(location.pathname);
  const dateStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' }).format(new Date());

  return (
    <header className="stfy-topbar">
      <div className="stfy-topbar-left">
        <button type="button" className="stfy-drawer-toggle" aria-label="Open navigation menu" onClick={onOpenDrawer}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        <h1 className="stfy-topbar-title">{title}</h1>
      </div>
      <div className="stfy-topbar-clock" aria-label="Current time, India Standard Time">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="7" x2="12" y2="12" />
          <line x1="12" y1="12" x2="16" y2="14" />
        </svg>
        <span className="stfy-topbar-clock-time">{clock}</span>
        <span className="stfy-topbar-clock-date">{dateStr} IST</span>
      </div>
    </header>
  );
}
