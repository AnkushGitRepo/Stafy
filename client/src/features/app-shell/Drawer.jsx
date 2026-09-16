import { NavLink } from 'react-router';

import logoDark from '../../assets/brand/stafy-logo-dark.svg';
import { NavIcon } from './NavIcon.jsx';

/** Tablet-only slide-out drawer with full nav labels (rail stays visible underneath). */
export function Drawer({ open, onClose, items }) {
  if (!open) return null;
  return (
    <>
      <div className="stfy-drawer-overlay" onClick={onClose} />
      <div className="stfy-drawer-panel" role="dialog" aria-modal="true" aria-label="Navigation">
        <div className="stfy-drawer-header">
          <img src={logoDark} alt="Stafy" width="100" height="24" />
          <button type="button" className="stfy-drawer-close" aria-label="Close menu" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => `stfy-drawer-item${isActive ? ' is-active' : ''}`}
          >
            <NavIcon kind={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}
