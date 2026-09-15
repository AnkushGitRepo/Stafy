import { forwardRef, useId, useState } from 'react';

/**
 * @param {{ label: string, error?: string, hint?: string, type?: string } & Record<string, any>} props
 */
export const Input = forwardRef(function Input({ label, error, hint, type = 'text', ...props }, ref) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && show ? 'text' : type;

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          ref={ref}
          type={resolvedType}
          className="field-input"
          style={isPassword ? { width: '100%', paddingRight: 44 } : { width: '100%' }}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 0,
              color: 'var(--color-text-muted-2)',
              cursor: 'pointer',
              padding: 8,
            }}
          >
            {show ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M6.6 6.6C4.6 8 3.2 9.9 2.5 12c1.5 4 5 7 9.5 7 1.7 0 3.3-.4 4.6-1.1M17.4 17.4C19.4 16 20.8 14.1 21.5 12c-.6-1.7-1.7-3.2-3-4.4" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="field-error">{error}</span>}
      {!error && hint && <span className="field-hint">{hint}</span>}
    </div>
  );
});
