// One icon set, one stroke width, per docs/DESIGN.md anti-slop rules.
const PATHS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  people: (
    <>
      <circle cx="8.5" cy="8" r="3.2" />
      <circle cx="16.5" cy="9.2" r="2.5" />
      <path d="M3 20c0-3.4 2.5-5.6 5.5-5.6s5.5 2.2 5.5 5.6" />
      <path d="M14.8 15c2.4.4 4.2 2.3 4.2 5" />
    </>
  ),
  attendance: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2.5" x2="8" y2="6.5" />
      <line x1="16" y1="2.5" x2="16" y2="6.5" />
      <polyline points="8,15 10.3,17.3 15,12.5" />
    </>
  ),
  leave: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2.5" x2="8" y2="6.5" />
      <line x1="16" y1="2.5" x2="16" y2="6.5" />
      <circle cx="12" cy="15.6" r="1.3" />
    </>
  ),
  approvals: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <polyline points="7,12 10.3,15.3 17,8.5" />
    </>
  ),
  audit: (
    <>
      <line x1="5" y1="6" x2="20" y2="6" />
      <line x1="5" y1="12" x2="20" y2="12" />
      <line x1="5" y1="18" x2="20" y2="18" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </>
  ),
};

/** @param {{ kind: keyof typeof PATHS, size?: number }} props */
export function NavIcon({ kind, size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[kind]}
    </svg>
  );
}
