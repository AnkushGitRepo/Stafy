// Single source of truth for app-shell nav — shared by Sidebar, Drawer, and
// MobileNav so the item list never drifts between the three surfaces.
// "coming soon" routing/roles preserved from P-003 §6 (only chrome changed);
// /app/team and /app/profile fill two P-004-spec'd nav items P-003 hadn't
// wired a destination for yet, using the same ComingSoonPage pattern.
export const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', end: true, roles: ['admin', 'manager', 'employee'], icon: 'dashboard' },
  { to: '/app/employees', label: 'Employees', roles: ['admin'], icon: 'people' },
  { to: '/app/team', label: 'My Team', roles: ['manager'], icon: 'people' },
  { to: '/app/attendance', label: 'Attendance', roles: ['admin', 'manager', 'employee'], icon: 'attendance' },
  { to: '/app/leave', label: 'Leave', roles: ['admin', 'manager', 'employee'], icon: 'leave' },
  { to: '/app/approvals', label: 'Approvals', roles: ['admin', 'manager'], icon: 'approvals' },
  { to: '/app/audit', label: 'Audit Log', roles: ['admin'], icon: 'audit' },
  { to: '/app/profile', label: 'My Profile', roles: ['employee'], icon: 'profile' },
];

/** @param {string} role */
export function navItemsForRole(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/** Bottom-tab layout: max 5 slots — overflow (beyond the first 4) collapses under "More". */
export function bottomNavLayout(items) {
  if (items.length <= 5) return { tabs: items, overflow: [] };
  return { tabs: items.slice(0, 4), overflow: items.slice(4) };
}

/** @param {string} pathname */
export function pageTitleForPath(pathname) {
  const sorted = [...NAV_ITEMS].sort((a, b) => b.to.length - a.to.length);
  const match = sorted.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));
  return match?.label ?? 'Dashboard';
}
