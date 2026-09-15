// Sample accounts for the mock auth layer. Names/departments match the real
// P-002 landing design so the preview and the demo feel like one product.
// Real records (with real auth) land in P1 — this file is deleted then.

export const DEMO_USERS = [
  {
    email: 'hr@stafy.app',
    name: 'Priya Shah',
    role: 'admin',
    department: 'People',
    initials: 'PS',
  },
  {
    email: 'manager@stafy.app',
    name: 'Arjun Mehta',
    role: 'manager',
    department: 'Design',
    team: 'Team A',
    initials: 'AM',
  },
  {
    email: 'manager.b@stafy.app',
    name: 'Vikram Nair',
    role: 'manager',
    department: 'Engineering',
    team: 'Team B',
    initials: 'VN',
  },
  {
    email: 'employee@stafy.app',
    name: 'Riya Sen',
    role: 'employee',
    department: 'Design',
    team: 'Team A',
    initials: 'RS',
  },
];

export function findUserByEmail(email) {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

// Mock account-activation invite, keyed by any non-empty token in preview mode.
export const MOCK_INVITE = {
  name: 'Karan Joshi',
  email: 'karan.joshi@stafy.app',
  role: 'employee',
  department: 'Engineering',
};
