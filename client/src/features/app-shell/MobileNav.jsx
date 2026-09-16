import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';

import { NavIcon } from './NavIcon.jsx';
import { bottomNavLayout } from './navConfig.js';

/** Mobile-only bottom tab bar (≤5 slots); items beyond the 4th collapse under "More". */
export function MobileNav({ items }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { tabs, overflow } = bottomNavLayout(items);

  useEffect(() => {
    if (!moreOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setMoreOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [moreOpen]);

  return (
    <>
      <nav aria-label="Primary" className="stfy-mobile-nav">
        {tabs.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `stfy-mobile-nav-item${isActive ? ' is-active' : ''}`}
          >
            <NavIcon kind={item.icon} size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {overflow.length > 0 && (
          <button
            type="button"
            className="stfy-mobile-nav-item"
            aria-haspopup="true"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen(true)}
          >
            <NavIcon kind="more" size={19} />
            <span>More</span>
          </button>
        )}
      </nav>

      {moreOpen && (
        <>
          <div className="stfy-sheet-overlay" onClick={() => setMoreOpen(false)} />
          <div className="stfy-sheet" role="dialog" aria-modal="true" aria-label="More navigation options">
            <div className="stfy-sheet-handle" aria-hidden="true" />
            {overflow.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="stfy-sheet-item" onClick={() => setMoreOpen(false)}>
                <NavIcon kind={item.icon} size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </>
  );
}
