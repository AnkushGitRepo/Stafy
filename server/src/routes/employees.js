import { Router } from 'express';

import { getPool } from '../db/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { loadEmployee } from '../middleware/loadEmployee.js';

const router = Router();

// Read-only list this pass — no add/edit/deactivate yet (see docs/CONTEXT.md
// cut list). FR-EMP-01 (list/search/filter) only.
router.get('/', authenticate, loadEmployee, authorize('employees.read'), async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(e.full_name ilike $${params.length} or e.email ilike $${params.length} or e.employee_code ilike $${params.length})`);
    }
    if (department) {
      params.push(department);
      conditions.push(`d.name = $${params.length}`);
    }
    if (status === 'active' || status === 'inactive') {
      params.push(status);
      conditions.push(`e.employment_status = $${params.length}`);
    }

    const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
    const { rows } = await getPool().query(
      `select e.id, e.employee_code, e.full_name, e.email, e.designation, e.joining_date, e.employment_status,
              d.name as department_name, m.full_name as manager_name
       from employees e
       left join departments d on d.id = e.department_id
       left join employees m on m.id = e.manager_id
       ${where}
       order by e.full_name`,
      params,
    );
    res.json({
      data: rows.map((r) => ({
        id: r.id,
        code: r.employee_code,
        name: r.full_name,
        email: r.email,
        designation: r.designation,
        department: r.department_name,
        manager: r.manager_name,
        joiningDate: r.joining_date,
        status: r.employment_status,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
