import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

/** @param {{ user: { name?: string, role?: string, initials?: string } | null, onRequestSignOut: () => void }} props */
export function UserMenu({ user, onRequestSignOut }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="stfy-usermenu" ref={rootRef}>
      <button
        type="button"
        className="stfy-usermenu-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="stfy-usermenu-avatar" aria-hidden="true">
          {user?.initials}
        </span>
        <span className="stfy-usermenu-text">
          <span className="stfy-usermenu-name">{user?.name}</span>
          <span className="stfy-usermenu-role">{user?.role}</span>
        </span>
        <svg className="stfy-usermenu-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="5,8 12,15 19,8" />
        </svg>
      </button>

      {open && (
        <div className="stfy-usermenu-panel" role="menu">
          <Link to="/app/profile" role="menuitem" className="stfy-usermenu-item" onClick={() => setOpen(false)}>
            My profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="stfy-usermenu-item"
            onClick={() => {
              setOpen(false);
              onRequestSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
