import { Router } from 'express';

import { getPool } from '../db/pool.js';
import { AUDIT_QUERY_BASE, formatAuditEvent } from '../lib/auditFormatter.js';
import { formatIstDate, formatIstTime, workDateInIst } from '../lib/time.js';
import { authenticate } from '../middleware/authenticate.js';
import { loadEmployee } from '../middleware/loadEmployee.js';

const router = Router();

function initialsOf(name) {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

router.get('/', authenticate, loadEmployee, async (req, res, next) => {
  try {
    const actor = req.actor;
    const pool = getPool();
    const today = workDateInIst();

    if (actor.role === 'admin') {
      const { rows: counts } = await pool.query(
        `select count(*) as total, count(*) filter (where employment_status='active') as active from employees`,
      );
      const { rows: present } = await pool.query(
        `select count(distinct employee_id)::int as c from attendance where work_date=$1`,
        [today],
      );
      const { rows: onLeave } = await pool.query(
        `select count(*)::int as c from leave_requests where status='approved' and $1 between start_date and end_date`,
        [today],
      );
      const { rows: pending } = await pool.query(`select count(*)::int as c from leave_requests where status='pending'`);
      const { rows: activityRows } = await pool.query(
        `${AUDIT_QUERY_BASE} order by a.created_at desc limit 5`,
      );
      res.json({
        data: {
          metrics: [
            { key: 'total', label: 'Total employees', value: Number(counts[0].total) },
            { key: 'active', label: 'Active employees', value: Number(counts[0].active) },
            { key: 'present', label: 'Present today', value: present[0].c, status: 'present' },
            { key: 'onLeave', label: 'On leave', value: onLeave[0].c, status: 'leave' },
            { key: 'pending', label: 'Pending leave requests', value: pending[0].c, status: 'pending' },
          ],
          recentActivity: activityRows.map(formatAuditEvent).map((evt) => ({
            id: evt.id,
            time: evt.time,
            summary: evt.summary,
            details: evt.details,
            status: evt.status,
            actionLabel: evt.actionLabel,
            actorName: evt.actorName,
            targetName: evt.targetName,
            text: evt.summary,
          })),
        },
      });
      return;
    }

    if (actor.role === 'manager') {
      const { rows: team } = await pool.query(
        `select id, full_name from employees where manager_id = $1 and employment_status='active' order by full_name`,
        [actor.id],
      );
      const teamIds = team.map((t) => t.id);
      const { rows: presentRows } = teamIds.length
        ? await pool.query(`select employee_id from attendance where work_date=$1 and employee_id = any($2::uuid[])`, [today, teamIds])
        : { rows: [] };
      const presentSet = new Set(presentRows.map((r) => r.employee_id));
      const { rows: leaveRows } = teamIds.length
        ? await pool.query(
            `select employee_id from leave_requests where status='approved' and $1 between start_date and end_date and employee_id = any($2::uuid[])`,
            [today, teamIds],
          )
        : { rows: [] };
      const leaveSet = new Set(leaveRows.map((r) => r.employee_id));

      const { rows: approvalsRaw } = teamIds.length
        ? await pool.query(
            `select lr.id, e.full_name as name, lr.start_date, lr.end_date, lt.name as type_name
             from leave_requests lr
             join employees e on e.id = lr.employee_id
             join leave_types lt on lt.id = lr.leave_type_id
             where lr.status='pending' and lr.employee_id = any($1::uuid[])
             order by lr.created_at`,
            [teamIds],
          )
        : { rows: [] };

      res.json({
        data: {
          metrics: [
            { key: 'total', label: 'Team members', value: team.length },
            { key: 'present', label: 'Present today', value: presentSet.size, status: 'present' },
            { key: 'onLeave', label: 'On leave', value: leaveSet.size, status: 'leave' },
            { key: 'pending', label: 'Pending approvals', value: approvalsRaw.length, status: 'pending' },
          ],
          team: team.map((t) => ({
            id: t.id,
            name: t.full_name,
            initials: initialsOf(t.full_name),
            status: leaveSet.has(t.id) ? 'leave' : presentSet.has(t.id) ? 'present' : 'absent',
          })),
          approvals: approvalsRaw.map((a) => ({
            id: a.id,
            name: a.name,
            dates: a.start_date === a.end_date ? formatIstDate(a.start_date) : `${formatIstDate(a.start_date)} – ${formatIstDate(a.end_date)}`,
            type: a.type_name,
          })),
        },
      });
      return;
    }

    // employee
    const { rows: metricRows } = await pool.query(
      `select
         count(*)::int as total,
         count(*) filter (where status='pending')::int as pending,
         count(*) filter (where status='approved')::int as approved,
         count(*) filter (where status='rejected')::int as rejected
       from leave_requests where employee_id = $1`,
      [actor.id],
    );
    const m = metricRows[0];
    const { rows: recent } = await pool.query(
      `select work_date, check_in_at, check_out_at from attendance where employee_id=$1 order by work_date desc limit 5`,
      [actor.id],
    );
    res.json({
      data: {
        metrics: [
          { key: 'total', label: 'Total requests', value: m.total },
          { key: 'pending', label: 'Pending', value: m.pending, status: 'pending' },
          { key: 'approved', label: 'Approved', value: m.approved, status: 'approved' },
          { key: 'rejected', label: 'Rejected', value: m.rejected, status: 'rejected' },
        ],
        recentAttendance: recent.map((r) => ({
          date: formatIstDate(r.work_date),
          status: r.check_out_at ? 'present' : 'half-day',
          times: r.check_out_at ? `${formatIstTime(r.check_in_at)} – ${formatIstTime(r.check_out_at)}` : `${formatIstTime(r.check_in_at)} –`,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
