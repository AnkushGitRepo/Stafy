import { Router } from 'express';

import { getPool } from '../db/pool.js';
import { isWorkingDay, workDateInIst } from '../lib/time.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { loadEmployee } from '../middleware/loadEmployee.js';

const router = Router();

function fmtTime(d) {
  return d ? new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : null;
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}
function hoursBetween(inAt, outAt) {
  if (!inAt || !outAt) return null;
  const h = (new Date(outAt) - new Date(inAt)) / 3600000;
  return Math.round(h * 10) / 10;
}

// Single-day, org/team-scoped view (Admin: everyone, Manager: direct
// reports). Status per employee for the date is derived, not stored:
// approved full-day leave -> leave; approved half-day leave -> half-day;
// an attendance row -> present; otherwise (a past/today working day) ->
// absent. Read-only this pass — matches docs/prompts/P-006 §4.1, reduced
// fidelity (no department filter, no search).
router.get('/', authenticate, loadEmployee, authorize('attendance.org.read'), async (req, res, next) => {
  try {
    const actor = req.actor;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date ?? '') ? req.query.date : workDateInIst();
    const pool = getPool();

    const scopeSql = actor.role === 'admin' ? `e.employment_status = 'active'` : `e.manager_id = $2 and e.employment_status = 'active'`;
    const params = actor.role === 'admin' ? [date] : [date, actor.id];

    const { rows } = await pool.query(
      `select e.id, e.full_name,
              a.check_in_at, a.check_out_at,
              exists (
                select 1 from leave_requests lr
                where lr.employee_id = e.id and lr.status = 'approved' and lr.duration = 'full_day' and $1::date between lr.start_date and lr.end_date
              ) as on_full_leave,
              exists (
                select 1 from leave_requests lr
                where lr.employee_id = e.id and lr.status = 'approved' and lr.duration = 'half_day' and lr.start_date = $1::date
              ) as on_half_leave
       from employees e
       left join attendance a on a.employee_id = e.id and a.work_date = $1::date
       where ${scopeSql}
       order by e.full_name`,
      params,
    );

    const workingDay = isWorkingDay(date);
    const data = rows.map((r) => {
      let status = workingDay ? 'absent' : 'weekend';
      if (r.on_full_leave) status = 'leave';
      else if (r.on_half_leave) status = 'half-day';
      else if (r.check_in_at) status = 'present';
      return {
        id: r.id,
        name: r.full_name,
        checkIn: fmtTime(r.check_in_at),
        checkOut: fmtTime(r.check_out_at),
        hours: hoursBetween(r.check_in_at, r.check_out_at),
        status,
      };
    });

    const summary = {
      present: data.filter((d) => d.status === 'present').length,
      halfDay: data.filter((d) => d.status === 'half-day').length,
      absent: data.filter((d) => d.status === 'absent').length,
      onLeave: data.filter((d) => d.status === 'leave').length,
    };

    res.json({ data: { date, summary, rows: data } });
  } catch (err) {
    next(err);
  }
});

router.get('/mine', authenticate, loadEmployee, authorize('attendance.self'), async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `select work_date, check_in_at, check_out_at from attendance where employee_id=$1 order by work_date desc limit 30`,
      [req.actor.id],
    );
    res.json({
      data: rows.map((r) => ({
        date: fmtDate(r.work_date),
        checkIn: fmtTime(r.check_in_at),
        checkOut: fmtTime(r.check_out_at),
        hours: hoursBetween(r.check_in_at, r.check_out_at),
        status: r.check_out_at ? 'present' : 'half-day',
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
