/** @param {{ width?: string|number, height?: string|number, className?: string }} props */
export function Skeleton({ width = '100%', height = 16, className = '' }) {
  return <div className={`skeleton ${className}`.trim()} style={{ width, height }} aria-hidden="true" />;
}
