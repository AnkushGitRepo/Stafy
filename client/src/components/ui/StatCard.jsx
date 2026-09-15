import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

/**
 * A metric that tweens from 0 to its real value on mount — part of the
 * "alive, not busy" rule (ADR-017). Non-numeric values (e.g. "Present")
 * render as-is, no count-up.
 * @param {{ label: string, value: number|string, dotColor?: string }} props
 */
export function StatCard({ label, value, dotColor }) {
  const numberRef = useRef(null);
  const isNumeric = typeof value === 'number';

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

  return (
    <div>
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
        }}
      >
        <span ref={numberRef}>{isNumeric ? 0 : value}</span>
        {dotColor && <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: dotColor }} />}
      </p>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted-2)' }}>{label}</p>
    </div>
  );
}
