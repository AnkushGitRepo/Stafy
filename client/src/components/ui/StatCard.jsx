import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

const TINT_STYLES = {
  success: { background: 'var(--color-success-chip-bg)', color: 'var(--color-success)' },
  warning: { background: 'var(--color-warning-chip-bg)', color: 'var(--color-warning-chip-text)' },
  info: { background: 'var(--color-info-chip-bg)', color: 'var(--color-info)' },
  danger: { background: 'var(--color-danger-chip-bg)', color: 'var(--color-danger)' },
  neutral: { background: 'var(--color-neutral-chip-bg)', color: 'var(--color-neutral-dot)' },
};

/**
 * A metric that tweens from 0 to its real value on mount — part of the
 * "alive, not busy" rule (ADR-017). Non-numeric values (e.g. "Present")
 * render as-is, no count-up.
 * @param {{ label: string, value: number|string, dotColor?: string, tint?: keyof typeof TINT_STYLES }} props
 */
export function StatCard({ label, value, dotColor, tint }) {
  const numberRef = useRef(null);
  const isNumeric = typeof value === 'number';
  const tintStyle = tint && TINT_STYLES[tint];

  useGSAP(() => {
    if (!isNumeric || !numberRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const counter = { n: 0 };
      gsap.to(counter, {
        n: value,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          if (numberRef.current) numberRef.current.textContent = String(Math.round(counter.n));
        },
      });
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      if (numberRef.current) numberRef.current.textContent = String(value);
    });
    return () => mm.revert();
  }, [value, isNumeric]);

  const numberEl = (
    <p
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 'var(--font-size-3xl)',
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
        color: tintStyle ? tintStyle.color : 'var(--color-text)',
      }}
    >
      <span ref={numberRef}>{isNumeric ? 0 : value}</span>
      {dotColor && !tintStyle && <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: dotColor }} />}
    </p>
  );
  const labelEl = (
    <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: tintStyle ? 600 : 400, color: tintStyle ? tintStyle.color : 'var(--color-text-muted-2)' }}>{label}</p>
  );

  if (!tintStyle) {
    return (
      <div>
        {numberEl}
        {labelEl}
      </div>
    );
  }

  // Tinted variant (dashboard stat row): label above a bigger, color-matched number.
  return (
    <div style={{ background: tintStyle.background, borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
      {labelEl}
      <div style={{ marginTop: 4 }}>{numberEl}</div>
    </div>
  );
}
