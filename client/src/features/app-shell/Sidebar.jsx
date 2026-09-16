import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { NavLink, useLocation } from 'react-router';

import logoDark from '../../assets/brand/stafy-logo-dark.svg';
import mark from '../../assets/brand/stafy-mark.svg';
import { NavIcon } from './NavIcon.jsx';
import { UserMenu } from './UserMenu.jsx';

/**
 * Desktop expanded/rail sidebar. Also renders (visually forced to rail width
 * via CSS, see AppShell's stylesheet) as the tablet permanent icon rail.
 * @param {{ items: Array, user: object|null, collapsed: boolean, onToggleCollapsed: () => void, onRequestSignOut: () => void }} props
 */
export function Sidebar({ items, user, collapsed, onToggleCollapsed, onRequestSignOut }) {
  const location = useLocation();
  const wrapRef = useRef(null);
  const pillRef = useRef(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const pill = pillRef.current;
      if (!wrap || !pill) return;
      const active = wrap.querySelector('[aria-current="page"]');
      if (!active) {
        pill.style.opacity = '0';
        return;
      }
      const top = active.offsetTop;
      const height = active.offsetHeight;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(pill, { top, height, opacity: 1, duration: 0.25, ease: 'power2.inOut' });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(pill, { top, height, opacity: 1 });
      });
      return () => mm.revert();
    },
    { dependencies: [location.pathname, collapsed, items.length], scope: wrapRef },
  );

  return (
    <nav aria-label="Primary" className={`stfy-sidebar${collapsed ? ' is-collapsed' : ''}`}>
      <div className="stfy-sidebar-header">
        <a href="/" className="stfy-sidebar-brand" aria-label="Stafy home">
          <img className="stfy-sidebar-logo-full" src={logoDark} alt="" width="100" height="24" />
          <img className="stfy-sidebar-logo-mark" src={mark} alt="" width="26" height="24" />
        </a>
        <button
          type="button"
          className="stfy-sidebar-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleCollapsed}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={collapsed ? { transform: 'rotate(180deg)' } : undefined}
            aria-hidden="true"
          >
            <polyline points="14,5 8,12 14,19" />
          </svg>
        </button>
      </div>

      <div className="stfy-sidebar-nav-wrap" ref={wrapRef}>
        <div className="stfy-sidebar-pill" ref={pillRef} aria-hidden="true" />
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) => `stfy-sidebar-item${isActive ? ' is-active' : ''}`}
          >
            <span className="stfy-sidebar-item-icon">
              <NavIcon kind={item.icon} />
            </span>
            <span className="stfy-sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="stfy-sidebar-footer">
        <UserMenu user={user} onRequestSignOut={onRequestSignOut} />
      </div>
    </nav>
  );
}
