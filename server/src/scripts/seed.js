// Deadline-mode seed (P-007): creates the 4 real demo accounts in Supabase
// Auth, then seeds departments/employees/leave_types/attendance/leave
// requests/audit log rows so the app's dashboards run on real data.
// Scope cut vs. docs/DATABASE.md's full seed plan (logged in docs/CONTEXT.md):
// no second cross-manager HR account, ~5 days of attendance history instead
// of ~20, 4 leave requests instead of covering every status combination.
import pg from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !DATABASE_URL || !DEMO_PASSWORD) {
  throw new Error('SUPABASE_URL, SUPABASE_SECRET_KEY, DATABASE_URL, DEMO_PASSWORD must all be set');
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function createAuthUser(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password: DEMO_PASSWORD, email_confirm: true }),
  });
  const body = await res.json();
  if (res.ok) return body.id;
  // Already exists — look it up.
  if (body.error_code === 'email_exists' || res.status === 422 || res.status === 400) {
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` },
    });
    const listBody = await listRes.json();
    const found = (listBody.users || []).find((u) => u.email === email);
    if (found) return found.id;
  }
  throw new Error(`Failed to create/find auth user ${email}: ${JSON.stringify(body)}`);
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function workdaysBack(n) {
  const out = [];
  const d = new Date();
  while (out.length < n) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) out.push(isoDate(d));
    d.setDate(d.getDate() - 1);
  }
  return out;
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('begin');

    const deptRows = await client.query(
      `insert into departments (name) values ('People'), ('Engineering'), ('Design'), ('Sales')
       on conflict (name) do update set name = excluded.name returning id, name`,
    );
    const dept = Object.fromEntries(deptRows.rows.map((r) => [r.name, r.id]));

    const leaveTypeRows = await client.query(
      `insert into leave_types (code, name, annual_quota, is_paid) values
        ('SICK', 'Sick Leave', 12, true),
        ('CASUAL', 'Casual Leave', 12, true),
        ('EARNED', 'Earned Leave', 15, true),
        ('UNPAID', 'Unpaid Leave', null, false)
       on conflict (code) do update set name = excluded.name returning id, code`,
    );
    const leaveType = Object.fromEntries(leaveTypeRows.rows.map((r) => [r.code, r.id]));

    const demo = [
      { email: 'hr@stafy.app', name: 'Priya Shah', role: 'admin', dept: 'People', designation: 'HR Lead', manager: null },
      { email: 'manager@stafy.app', name: 'Arjun Mehta', role: 'manager', dept: 'Engineering', designation: 'Engineering Manager', manager: null },
      { email: 'manager.b@stafy.app', name: 'Vikram Nair', role: 'manager', dept: 'Design', designation: 'Design Manager', manager: null },
      { email: 'employee@stafy.app', name: 'Riya Sen', role: 'employee', dept: 'Engineering', designation: 'Software Engineer', manager: 'manager@stafy.app' },
    ];
    const extras = [
      { email: 'karan.joshi@stafy.app', name: 'Karan Joshi', role: 'employee', dept: 'Engineering', designation: 'Software Engineer', manager: 'manager@stafy.app' },
      { email: 'neha.kulkarni@stafy.app', name: 'Neha Kulkarni', role: 'employee', dept: 'Engineering', designation: 'QA Engineer', manager: 'manager@stafy.app' },
      { email: 'aarav.sharma@stafy.app', name: 'Aarav Sharma', role: 'employee', dept: 'Design', designation: 'Product Designer', manager: 'manager.b@stafy.app' },
      { email: 'meera.iyer@stafy.app', name: 'Meera Iyer', role: 'employee', dept: 'Design', designation: 'UX Researcher', manager: 'manager.b@stafy.app', inactive: true },
    ];

    const empIdByEmail = {};
    let empCounter = 1;
    for (const person of [...demo, ...extras]) {
      const authUserId = await createAuthUser(person.email);
      const code = `EMP-${String(empCounter).padStart(4, '0')}`;
      empCounter += 1;
      const managerId = person.manager ? empIdByEmail[person.manager] : null;
      const res = await client.query(
        `insert into employees (auth_user_id, employee_code, full_name, email, department_id, designation, manager_id, role, joining_date, employment_status)
         values ($1,$2,$3,$4,$5,$6,$7,$8, (now() at time zone 'Asia/Kolkata')::date - interval '200 days', $9)
         on conflict (email) do update set auth_user_id = excluded.auth_user_id
         returning id`,
        [authUserId, code, person.name, person.email, dept[person.dept], person.designation, managerId, person.role, person.inactive ? 'inactive' : 'active'],
      );
      empIdByEmail[person.email] = res.rows[0].id;
    }

    // Attendance: last 5 working days for everyone except the inactive employee.
    const days = workdaysBack(5);
    for (const [email, id] of Object.entries(empIdByEmail)) {
      if (extras.find((e) => e.email === email && e.inactive)) continue;
      for (const [i, workDate] of days.entries()) {
        const isToday = i === 0;
        const checkInHour = 9 + (Math.random() < 0.3 ? 1 : 0);
        // Team B's Meera-adjacent teammate skips one day to look like a real absence pattern.
        if (email === 'aarav.sharma@stafy.app' && i === 2) continue;
        await client.query(
          `insert into attendance (employee_id, work_date, check_in_at, check_out_at)
           values ($1, $2, ($2::date + time '${checkInHour}:0${Math.floor(Math.random() * 6)}:00') at time zone 'Asia/Kolkata', $3)
           on conflict (employee_id, work_date) do nothing`,
          [id, workDate, isToday ? null : `${workDate}T18:15:00+05:30`],
        );
      }
    }

    // Leave requests: 2 pending under manager@stafy.app's team, 1 approved, 1 rejected.
    const today = new Date();
    const plus = (n) => isoDate(new Date(today.getTime() + n * 86400000));
    await client.query(
      `insert into leave_requests (employee_id, leave_type_id, start_date, end_date, duration, days, reason, status)
       values ($1, $2, $3, $4, 'full_day', 2, 'Family function out of town, need two days off.', 'pending')
       on conflict do nothing`,
      [empIdByEmail['karan.joshi@stafy.app'], leaveType.SICK, plus(2), plus(3)],
    );
    await client.query(
      `insert into leave_requests (employee_id, leave_type_id, start_date, end_date, duration, half_session, days, reason, status)
       values ($1, $2, $3, $3, 'half_day', 'second_half', 0.5, 'Doctor appointment in the afternoon.', 'pending')
       on conflict do nothing`,
      [empIdByEmail['neha.kulkarni@stafy.app'], leaveType.CASUAL, plus(6)],
    );
    await client.query(
      `insert into leave_requests (employee_id, leave_type_id, start_date, end_date, duration, days, reason, status, approver_id, decided_at)
       values ($1, $2, $3, $4, 'full_day', 3, 'Pre-planned family trip, approved earlier this month.', 'approved', $5, now())
       on conflict do nothing`,
      [empIdByEmail['employee@stafy.app'], leaveType.EARNED, plus(-10), plus(-8), empIdByEmail['manager@stafy.app']],
    );
    await client.query(
      `insert into leave_requests (employee_id, leave_type_id, start_date, end_date, duration, days, reason, status, approver_id, decided_at, rejection_reason)
       values ($1, $2, $3, $3, 'full_day', 1, 'Wanted an extra day off after the sprint.', 'rejected', $4, now(), 'Team is short-staffed that sprint, please pick a later date.')
       on conflict do nothing`,
      [empIdByEmail['aarav.sharma@stafy.app'], leaveType.UNPAID, plus(-3), empIdByEmail['manager.b@stafy.app']],
    );

    await client.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after)
       values
         ($1, 'employee.deactivated', 'employee', $2, '{"employment_status":"inactive"}'),
         ($3, 'leave.approved', 'leave_request', null, '{"status":"approved"}'),
         ($4, 'attendance.check_in', 'attendance', null, '{}')`,
      [empIdByEmail['hr@stafy.app'], empIdByEmail['meera.iyer@stafy.app'], empIdByEmail['manager@stafy.app'], empIdByEmail['employee@stafy.app']],
    );

    await client.query('commit');
    console.log('Seed complete:', Object.keys(empIdByEmail).length, 'employees');
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
