// Mock dashboard payloads, shaped exactly like docs/PRD.md's dashboard metric
// definitions per role, so the real GET /api/dashboard response (P1) can drop
// in without changing any dashboard component prop.

export const ADMIN_DASHBOARD = {
  metrics: [
    { key: 'total', label: 'Total employees', value: 42 },
    { key: 'active', label: 'Active employees', value: 40 },
    { key: 'present', label: 'Present today', value: 31, status: 'present' },
    { key: 'onLeave', label: 'On leave', value: 2, status: 'leave' },
    { key: 'pending', label: 'Pending leave requests', value: 5, status: 'pending' },
  ],
  recentActivity: [
    { time: '10:14 AM', text: 'Priya Shah (HR) deactivated Karan Joshi' },
    { time: '9:48 AM', text: "Arjun Mehta (Manager) approved Riya Sen's casual leave" },
    { time: '9:02 AM', text: 'Riya Sen checked in' },
  ],
};

export const MANAGER_DASHBOARD = {
  metrics: [
    { key: 'total', label: 'Team members', value: 8 },
    { key: 'present', label: 'Present today', value: 6, status: 'present' },
    { key: 'onLeave', label: 'On leave', value: 1, status: 'leave' },
    { key: 'pending', label: 'Pending approvals', value: 2, status: 'pending' },
  ],
  team: [
    { name: 'Riya Sen', initials: 'RS', status: 'present' },
    { name: 'Karan Joshi', initials: 'KJ', status: 'absent' },
    { name: 'Neha Kulkarni', initials: 'NK', status: 'leave' },
    { name: 'Aarav Sharma', initials: 'AS', status: 'pending' },
  ],
  // Rows behind the `pending` metric above — real approval records land in P1
  // against GET/POST /api/leave-requests (BR-10…BR-13).
  approvals: [
    { id: 1, name: 'Aarav Sharma', dates: 'Sep 18–19', type: 'Sick Leave' },
    { id: 2, name: 'Neha Kulkarni', dates: 'Sep 22', type: 'Half Day' },
  ],
};

export const EMPLOYEE_DASHBOARD = {
  metrics: [
    { key: 'total', label: 'Total requests', value: 7 },
    { key: 'pending', label: 'Pending', value: 1, status: 'pending' },
    { key: 'approved', label: 'Approved', value: 5, status: 'approved' },
    { key: 'rejected', label: 'Rejected', value: 1, status: 'rejected' },
  ],
  recentAttendance: [
    { date: 'Fri 12 Sep', status: 'present' },
    { date: 'Thu 11 Sep', status: 'present' },
    { date: 'Wed 10 Sep', status: 'half-day' },
    { date: 'Tue 9 Sep', status: 'present' },
    { date: 'Mon 8 Sep', status: 'present' },
  ],
};

export function getDashboardForRole(role) {
  if (role === 'admin') return ADMIN_DASHBOARD;
  if (role === 'manager') return MANAGER_DASHBOARD;
  return EMPLOYEE_DASHBOARD;
}
