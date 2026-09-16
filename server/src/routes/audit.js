import { Router } from 'express';

import { getPool } from '../db/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { loadEmployee } from '../middleware/loadEmployee.js';

const router = Router();

function fmtTime(d) {
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

router.get('/', authenticate, loadEmployee, authorize('audit.read'), async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `select a.id, a.action, a.entity_type, a.entity_id, a.before, a.after, a.created_at,
              coalesce(e.full_name, 'System') as actor_name, e.email as actor_email
       from audit_logs a
       left join employees e on e.id = a.actor_id
       order by a.created_at desc
       limit 50`,
    );

    res.json({
      data: rows.map((r) => ({
        id: r.id,
        action: r.action,
        entityType: r.entity_type,
        entityId: r.entity_id,
        actorName: r.actor_name,
        actorEmail: r.actor_email,
        details: r.after ? JSON.stringify(r.after) : '—',
        timestamp: fmtTime(r.created_at),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
