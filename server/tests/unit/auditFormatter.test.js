import { describe, expect, it } from 'vitest';

import { formatAuditEvent } from '../../src/lib/auditFormatter.js';

describe('formatAuditEvent', () => {
  it('formats leave.approved event with rich details and natural language summary', () => {
    const row = {
      id: 'log-1',
      action: 'leave.approved',
      entity_type: 'leave_request',
      created_at: '2026-09-16T08:30:00Z',
      actor_name: 'Arjun Mehta',
      actor_role: 'manager',
      lr_emp_name: 'Riya Sen',
      lr_emp_code: 'EMP-0003',
      leave_type_name: 'Sick Leave',
      leave_days: 1,
      leave_start_date: '2026-09-16',
      leave_end_date: '2026-09-16',
      after: { status: 'approved' },
    };

    const evt = formatAuditEvent(row);
    expect(evt.actionLabel).toBe('Leave Approved');
    expect(evt.category).toBe('leave');
    expect(evt.status).toBe('approved');
    expect(evt.actorName).toBe('Arjun Mehta');
    expect(evt.targetName).toBe('Riya Sen (EMP-0003)');
    expect(evt.summary).toBe('Arjun Mehta approved Sick Leave for Riya Sen (1 day)');
    expect(evt.metadata['Leave Type']).toBe('Sick Leave');
  });

  it('formats leave.rejected event with rejection reason', () => {
    const row = {
      id: 'log-2',
      action: 'leave.rejected',
      entity_type: 'leave_request',
      created_at: '2026-09-16T08:35:00Z',
      actor_name: 'Arjun Mehta',
      actor_role: 'manager',
      lr_emp_name: 'Vikram Rao',
      lr_emp_code: 'EMP-0004',
      leave_type_name: 'Casual Leave',
      leave_rejection_reason: 'Team is short-staffed that week',
      after: { status: 'rejected' },
    };

    const evt = formatAuditEvent(row);
    expect(evt.actionLabel).toBe('Leave Rejected');
    expect(evt.category).toBe('leave');
    expect(evt.status).toBe('rejected');
    expect(evt.summary).toBe('Arjun Mehta rejected Casual Leave for Vikram Rao');
    expect(evt.details).toContain('Team is short-staffed');
  });

  it('formats employee.deactivated with target employee details', () => {
    const row = {
      id: 'log-3',
      action: 'employee.deactivated',
      entity_type: 'employee',
      created_at: '2026-09-16T08:40:00Z',
      actor_name: 'Priya Shah',
      actor_role: 'admin',
      target_emp_name: 'Meera Iyer',
      target_emp_code: 'EMP-0005',
      after: { status: 'inactive' },
    };

    const evt = formatAuditEvent(row);
    expect(evt.actionLabel).toBe('Employee Deactivated');
    expect(evt.category).toBe('employee');
    expect(evt.status).toBe('inactive');
    expect(evt.summary).toBe('Priya Shah deactivated employee Meera Iyer (EMP-0005)');
    expect(evt.targetName).toBe('Meera Iyer (EMP-0005)');
  });

  it('formats attendance.check_in event', () => {
    const row = {
      id: 'log-4',
      action: 'attendance.check_in',
      entity_type: 'attendance',
      created_at: '2026-09-16T04:00:00Z',
      actor_name: 'Riya Sen',
      actor_role: 'employee',
      after: {},
    };

    const evt = formatAuditEvent(row);
    expect(evt.actionLabel).toBe('Checked In');
    expect(evt.category).toBe('attendance');
    expect(evt.status).toBe('present');
    expect(evt.summary).toBe('Riya Sen checked in for work');
  });

  it('gracefully falls back on legacy un-joined rows using JSON payload', () => {
    const row = {
      id: 'log-5',
      action: 'leave.approved',
      entity_type: 'leave_request',
      created_at: '2026-09-16T08:00:00Z',
      actor_name: null,
      after: {
        employee_name: 'Kavita Roy',
        leave_type: 'Earned Leave',
        days: 2,
      },
    };

    const evt = formatAuditEvent(row);
    expect(evt.actorName).toBe('System');
    expect(evt.summary).toBe('System approved Earned Leave for Kavita Roy (2 days)');
  });
});
