import { formatIstDate, formatIstDateTime, formatIstTime } from './time.js';

export const AUDIT_QUERY_BASE = `
  select
    a.id,
    a.action,
    a.entity_type,
    a.entity_id,
    a.before,
    a.after,
    a.created_at,
    coalesce(actor.full_name, 'System') as actor_name,
    actor.email as actor_email,
    actor.role as actor_role,
    target_emp.full_name as target_emp_name,
    target_emp.employee_code as target_emp_code,
    target_dept.name as target_emp_dept,
    lr_emp.full_name as lr_emp_name,
    lr_emp.employee_code as lr_emp_code,
    lt.name as leave_type_name,
    lr.days as leave_days,
    lr.start_date as leave_start_date,
    lr.end_date as leave_end_date,
    lr.reason as leave_reason,
    lr.rejection_reason as leave_rejection_reason
  from audit_logs a
  left join employees actor on actor.id = a.actor_id
  left join employees target_emp on (a.entity_type = 'employee' and target_emp.id = a.entity_id)
  left join departments target_dept on target_dept.id = target_emp.department_id
  left join leave_requests lr on (a.entity_type = 'leave_request' and lr.id = a.entity_id)
  left join employees lr_emp on lr_emp.id = lr.employee_id
  left join leave_types lt on lt.id = lr.leave_type_id
`;

function initialsOf(name) {
  if (!name) return 'SY';
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

/**
 * Normalizes an audit log database row into a structured, logical presentation object.
 * @param {object} row
 */
export function formatAuditEvent(row) {
  let after = {};
  if (row.after) {
    if (typeof row.after === 'object') {
      after = row.after;
    } else if (typeof row.after === 'string') {
      try {
        after = JSON.parse(row.after);
      } catch {
        after = {};
      }
    }
  }

  const actorName = row.actor_name || 'System';
  const actorRole = row.actor_role ? row.actor_role.charAt(0).toUpperCase() + row.actor_role.slice(1) : 'System';
  const actorInitials = initialsOf(actorName);
  const timestamp = formatIstDateTime(row.created_at);
  const time = formatIstTime(row.created_at);

  let summary = '';
  let details = '';
  let actionLabel = '';
  let category = 'system';
  let status = 'neutral';
  let targetName = 'System';
  let metadata = {};

  const action = row.action || '';

  if (action === 'leave.approved') {
    const empName = row.lr_emp_name || after.employee_name || 'Employee';
    const empCode = row.lr_emp_code || after.employee_code || '';
    const leaveType = row.leave_type_name || after.leave_type || 'Leave';
    const days = row.leave_days || after.days || 1;
    const daysText = `${days} ${Number(days) === 1 ? 'day' : 'days'}`;
    const dateRange = row.leave_start_date
      ? (row.leave_start_date === row.leave_end_date ? formatIstDate(row.leave_start_date) : `${formatIstDate(row.leave_start_date)} – ${formatIstDate(row.leave_end_date)}`)
      : (after.start_date ? after.start_date : '');

    actionLabel = 'Leave Approved';
    category = 'leave';
    status = 'approved';
    targetName = empCode ? `${empName} (${empCode})` : empName;
    summary = `${actorName} approved ${leaveType} for ${empName} (${daysText})`;
    details = dateRange ? `${daysText} · ${dateRange}` : daysText;
    metadata = {
      'Approver': actorName,
      'Employee': targetName,
      'Leave Type': leaveType,
      'Duration': daysText,
      'Date': dateRange || 'Recorded',
      'Status': 'Approved',
    };
  } else if (action === 'leave.rejected') {
    const empName = row.lr_emp_name || after.employee_name || 'Employee';
    const empCode = row.lr_emp_code || after.employee_code || '';
    const leaveType = row.leave_type_name || after.leave_type || 'Leave';
    const rejectionReason = row.leave_rejection_reason || after.rejection_reason || after.reason || 'Team scheduling constraints';

    actionLabel = 'Leave Rejected';
    category = 'leave';
    status = 'rejected';
    targetName = empCode ? `${empName} (${empCode})` : empName;
    summary = `${actorName} rejected ${leaveType} for ${empName}`;
    details = `Reason: ${rejectionReason}`;
    metadata = {
      'Reviewer': actorName,
      'Employee': targetName,
      'Leave Type': leaveType,
      'Rejection Reason': rejectionReason,
      'Status': 'Rejected',
    };
  } else if (action === 'leave.applied') {
    const leaveType = after.leave_type || row.leave_type_name || 'Leave';
    const days = after.days || row.leave_days || 1;
    const daysText = `${days} ${Number(days) === 1 ? 'day' : 'days'}`;

    actionLabel = 'Leave Requested';
    category = 'leave';
    status = 'pending';
    targetName = `Self (${actorName})`;
    summary = `${actorName} applied for ${leaveType} (${daysText})`;
    details = `Awaiting approval for ${daysText}`;
    metadata = {
      'Applicant': actorName,
      'Leave Type': leaveType,
      'Duration': daysText,
      'Status': 'Pending Approval',
    };
  } else if (action === 'employee.created') {
    const targetEmp = row.target_emp_name || after.name || 'New Employee';
    const code = row.target_emp_code || after.code || '';
    const role = after.role || 'employee';
    const dept = row.target_emp_dept || after.department || '';

    actionLabel = 'Employee Created';
    category = 'employee';
    status = 'active';
    targetName = code ? `${targetEmp} (${code})` : targetEmp;
    summary = `${actorName} onboarded employee ${targetEmp}${code ? ` (${code})` : ''}`;
    details = `Role: ${role.toUpperCase()}${dept ? ` · Dept: ${dept}` : ''}`;
    metadata = {
      'Created By': actorName,
      'Employee': targetEmp,
      'Employee Code': code || 'Generated',
      'Role': role,
      'Department': dept || 'Unassigned',
      'Status': 'Active',
    };
  } else if (action === 'employee.deactivated') {
    const targetEmp = row.target_emp_name || after.employee_name || 'Employee';
    const code = row.target_emp_code || after.employee_code || '';

    actionLabel = 'Employee Deactivated';
    category = 'employee';
    status = 'inactive';
    targetName = code ? `${targetEmp} (${code})` : targetEmp;
    summary = `${actorName} deactivated employee ${targetEmp}${code ? ` (${code})` : ''}`;
    details = 'Account set to inactive · Direct reports preserved';
    metadata = {
      'Deactivated By': actorName,
      'Target Employee': targetEmp,
      'Employee Code': code || 'N/A',
      'Status': 'Inactive',
    };
  } else if (action === 'attendance.check_in') {
    actionLabel = 'Checked In';
    category = 'attendance';
    status = 'present';
    targetName = `Self (${actorName})`;
    summary = `${actorName} checked in for work`;
    details = 'Daily attendance clock-in registered';
    metadata = {
      'Employee': actorName,
      'Timestamp': timestamp,
      'Status': 'Present',
    };
  } else if (action === 'attendance.check_out') {
    actionLabel = 'Checked Out';
    category = 'attendance';
    status = 'half-day';
    targetName = `Self (${actorName})`;
    summary = `${actorName} checked out for the day`;
    details = 'Daily attendance clock-out registered';
    metadata = {
      'Employee': actorName,
      'Timestamp': timestamp,
      'Status': 'Completed',
    };
  } else if (action === 'profile.updated') {
    actionLabel = 'Profile Updated';
    category = 'employee';
    status = 'active';
    targetName = `Self (${actorName})`;
    summary = `${actorName} updated contact details`;
    details = 'Phone contact number modified';
    metadata = {
      'Employee': actorName,
      'Action': 'Self-service contact update',
    };
  } else {
    actionLabel = action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    category = 'system';
    status = 'neutral';
    targetName = row.entity_type ? row.entity_type.replace(/_/g, ' ') : 'System';
    summary = `${actorName} performed ${actionLabel.toLowerCase()}`;
    details = 'System event captured';
    metadata = Object.keys(after).length > 0 ? after : { 'Action': actionLabel };
  }

  return {
    id: row.id,
    action,
    actionLabel,
    category,
    status,
    actorName,
    actorRole,
    actorInitials,
    targetName,
    summary,
    details,
    metadata,
    rawAfter: after,
    timestamp,
    time,
  };
}
