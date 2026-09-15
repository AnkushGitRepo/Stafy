/**
 * @param {{ variant?: 'primary'|'secondary'|'ghost', as?: 'button'|'a', href?: string } & Record<string, any>} props
 */
export function Button({ variant = 'primary', as = 'button', className = '', children, ...props }) {
  const classes = `btn btn-${variant} ${className}`.trim();
  if (as === 'a') {
    return (
      <a className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type={props.type ?? 'button'} className={classes} {...props}>
      {children}
    </button>
  );
}
