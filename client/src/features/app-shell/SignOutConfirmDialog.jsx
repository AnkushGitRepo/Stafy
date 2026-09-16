import { useEffect, useRef } from 'react';

import { Button } from '../../components/ui/Button.jsx';

/** @param {{ open: boolean, onCancel: () => void, onConfirm: () => void }} props */
export function SignOutConfirmDialog({ open, onCancel, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="stfy-modal-overlay" onClick={onCancel}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stfy-signout-title"
        tabIndex={-1}
        className="stfy-modal card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="stfy-signout-title" className="stfy-modal-title">
          Sign out?
        </h2>
        <p className="stfy-modal-body">You&rsquo;ll be signed out of Stafy on this device. You can sign back in anytime.</p>
        <div className="stfy-modal-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
