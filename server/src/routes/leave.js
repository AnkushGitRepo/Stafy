import { Router } from 'express';
import { z } from 'zod';

import { getPool } from '../db/pool.js';
import { AppError } from '../lib/errors.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { loadEmployee } from '../middleware/loadEmployee.js';
import { validate } from '../middleware/validate.js';

const router = Router();

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}

router.get('/approvals', authenticate, loadEmployee, authorize('leave.approvals.read'), async (req, res, next) => {
  try {
    const actor = req.actor;
    const scopeSql = actor.role === 'admin' ? 'true' : 'e.manager_id = $1';
    const params = actor.role === 'admin' ? [] : [actor.id];
    const { rows } = await getPool().query(
      `select lr.id, e.full_name as name, lr.start_date, lr.end_date, lt.name as type_name
       from leave_requests lr
       join employees e on e.id = lr.employee_id
       join leave_types lt on lt.id = lr.leave_type_id
       where lr.status='pending' and ${scopeSql}
       order by lr.created_at`,
      params,
    );
    res.json({
      data: rows.map((a) => ({
        id: a.id,
        name: a.name,
        dates: a.start_date === a.end_date ? fmtDate(a.start_date) : `${fmtDate(a.start_date)} – ${fmtDate(a.end_date)}`,
        type: a.type_name,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// A manager acting on a non-direct-report's leave gets 404, never 403 — no
// enumeration of requests outside their scope (BR-11, ADR-008). Admin scope
// is unrestricted. Self-approval is rejected even for admins (BR-10).
async function scopedPendingRequest(pool, actor, id) {
  const scopeSql = actor.role === 'admin' ? 'true' : 'e.manager_id = $2';
  const params = actor.role === 'admin' ? [id] : [id, actor.id];
  const { rows } = await pool.query(
    `select lr.id, lr.employee_id from leave_requests lr join employees e on e.id = lr.employee_id
     where lr.id = $1 and lr.status='pending' and ${scopeSql}`,
    params,
  );
  return rows[0] ?? null;
}

router.post('/:id/approve', authenticate, loadEmployee, authorize('leave.decide'), async (req, res, next) => {
  try {
    const pool = getPool();
    const request = await scopedPendingRequest(pool, req.actor, req.params.id);
    if (!request) throw new AppError('NOT_FOUND', 404, 'Leave request not found.');
    if (request.employee_id === req.actor.id) throw new AppError('SELF_APPROVAL_FORBIDDEN', 403, 'You cannot approve your own leave request.');

    const { rows } = await pool.query(
      `update leave_requests set status='approved', approver_id=$1, decided_at=now()
       where id=$2 and status='pending' returning id`,
      [req.actor.id, request.id],
    );
    if (!rows.length) throw new AppError('INVALID_STATUS_TRANSITION', 409, 'This request was already decided.');

    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after) values ($1,'leave.approved','leave_request',$2,'{"status":"approved"}')`,
      [req.actor.id, request.id],
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

const rejectSchema = z.object({ reason: z.string().min(10).max(500) }).strict();

router.post('/:id/reject', authenticate, loadEmployee, authorize('leave.decide'), validate(rejectSchema), async (req, res, next) => {
  try {
    const pool = getPool();
    const request = await scopedPendingRequest(pool, req.actor, req.params.id);
    if (!request) throw new AppError('NOT_FOUND', 404, 'Leave request not found.');
    if (request.employee_id === req.actor.id) throw new AppError('SELF_APPROVAL_FORBIDDEN', 403, 'You cannot act on your own leave request.');

    const { rows } = await pool.query(
      `update leave_requests set status='rejected', approver_id=$1, decided_at=now(), rejection_reason=$2
       where id=$3 and status='pending' returning id`,
      [req.actor.id, req.body.reason, request.id],
    );
    if (!rows.length) throw new AppError('INVALID_STATUS_TRANSITION', 409, 'This request was already decided.');

    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after) values ($1,'leave.rejected','leave_request',$2,'{"status":"rejected"}')`,
      [req.actor.id, request.id],
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
