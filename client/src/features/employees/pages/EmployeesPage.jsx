import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatusPill } from '../../../components/ui/StatusPill.jsx';
import {
  createEmployee,
  deactivateEmployee,
  getDepartments,
  getEmployee,
  getEmployees,
  getManagers,
} from '../../../lib/api.js';

function fmtJoined(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

function AddEmployeeModal({ onClose, onSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [managerId, setManagerId] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()));
  const [role, setRole] = useState('employee');
  const [errorText, setErrorText] = useState('');

  const { data: deptData } = useQuery({ queryKey: ['departments'], queryFn: () => getDepartments().then((r) => r.data) });
  const { data: mgrData } = useQuery({ queryKey: ['managers'], queryFn: () => getManagers().then((r) => r.data) });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err) => setErrorText(err.message ?? 'Could not create employee.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      fullName,
      email,
      phone: phone || null,
      departmentId: departmentId || null,
      designation: designation || null,
      managerId: managerId || null,
      joiningDate,
      role,
    });
  };

  return (
    <div className="stfy-modal-overlay" onClick={onClose}>
      <div className="stfy-modal card" style={{ maxWidth: 480 }} role="dialog" aria-modal="true" aria-labelledby="add-emp-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="add-emp-title" className="stfy-modal-title">
          Add new employee
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <div className="field">
            <label className="field-label" htmlFor="emp-name">
              Full Name
            </label>
            <input id="emp-name" className="field-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="emp-email">
              Email Address
            </label>
            <input id="emp-email" type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label" htmlFor="emp-phone">
                Phone
              </label>
              <input id="emp-phone" className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label" htmlFor="emp-role">
                Role
              </label>
              <select id="emp-role" className="field-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label" htmlFor="emp-dept">
                Department
              </label>
              <select id="emp-dept" className="field-input" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">Select department</option>
                {deptData?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label" htmlFor="emp-desig">
                Designation
              </label>
              <input id="emp-desig" className="field-input" value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label" htmlFor="emp-mgr">
                Manager
              </label>
              <select id="emp-mgr" className="field-input" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                <option value="">No manager</option>
                {mgrData?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label" htmlFor="emp-joined">
                Joining Date
              </label>
              <input id="emp-joined" type="date" className="field-input" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
            </div>
          </div>

          {errorText && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>{errorText}</p>}

          <div className="stfy-modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Create employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeeDrawer({ employeeId, onClose, onDeactivated }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => getEmployee(employeeId).then((r) => r.data),
  });

  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [errorText, setErrorText] = useState('');

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateEmployee(employeeId),
    onSuccess: () => {
      onDeactivated();
      onClose();
    },
    onError: (err) => setErrorText(err.message ?? 'Could not deactivate employee.'),
  });

  return (
    <div className="stfy-modal-overlay" onClick={onClose}>
      <div
        className="card"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 440,
          borderRadius: 0,
          borderLeft: '1px solid var(--color-border)',
          overflowY: 'auto',
          padding: 'var(--space-6)',
          zIndex: 110,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-text)' }}>Employee Details</h2>
          <button type="button" className="btn-ghost" onClick={onClose} style={{ fontSize: 'var(--font-size-lg)', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {isLoading && <Skeleton height={140} />}
        {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load employee details.</p>}

        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  background: 'var(--color-success-chip-bg)',
                  color: 'var(--color-success)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 700,
                  flex: 'none',
                }}
              >
                {data.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 'var(--font-size-md)' }}>{data.name}</div>
                <div style={{ color: 'var(--color-text-muted-2)', fontSize: 'var(--font-size-xs)' }}>{data.code}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <StatusPill status={data.status} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>
              <div>
                <strong style={{ color: 'var(--color-text-muted-2)' }}>Email: </strong>
                <span style={{ color: 'var(--color-text)' }}>{data.email}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted-2)' }}>Phone: </strong>
                <span style={{ color: 'var(--color-text)' }}>{data.phone || '—'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted-2)' }}>Department: </strong>
                <span style={{ color: 'var(--color-text)' }}>{data.department || '—'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted-2)' }}>Designation: </strong>
                <span style={{ color: 'var(--color-text)' }}>{data.designation || '—'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted-2)' }}>Manager: </strong>
                <span style={{ color: 'var(--color-text)' }}>{data.manager || '—'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted-2)' }}>Role: </strong>
                <span style={{ color: 'var(--color-text)', textTransform: 'capitalize' }}>{data.role}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted-2)' }}>Joined: </strong>
                <span style={{ color: 'var(--color-text)' }}>{fmtJoined(data.joiningDate)}</span>
              </div>
              {data.directReportsCount > 0 && (
                <div>
                  <strong style={{ color: 'var(--color-text-muted-2)' }}>Direct Reports: </strong>
                  <span style={{ color: 'var(--color-text)' }}>{data.directReportsCount} active employee(s)</span>
                </div>
              )}
            </div>

            {errorText && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginTop: 8 }}>{errorText}</p>}

            {data.status === 'active' && (
              <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                {!confirmingDeactivate ? (
                  <Button variant="secondary" onClick={() => setConfirmingDeactivate(true)} style={{ color: 'var(--color-danger)' }}>
                    Deactivate employee
                  </Button>
                ) : (
                  <div style={{ background: 'var(--color-danger-chip-bg)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-xs)', marginBottom: 10 }}>
                      Are you sure you want to deactivate {data.name}? They will not be able to log in, and pending leave requests will be cancelled.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        variant="primary"
                        onClick={() => deactivateMutation.mutate()}
                        disabled={deactivateMutation.isPending}
                        style={{ background: 'var(--color-danger)', minHeight: 32, fontSize: 'var(--font-size-xs)' }}
                      >
                        {deactivateMutation.isPending ? 'Deactivating…' : 'Confirm deactivation'}
                      </Button>
                      <Button variant="secondary" onClick={() => setConfirmingDeactivate(false)} style={{ minHeight: 32, fontSize: 'var(--font-size-xs)' }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employees', { search, department, status }],
    queryFn: () => getEmployees({ search, department, status }).then((r) => r.data),
  });

  const allForDepartments = useQuery({
    queryKey: ['employees', 'all-for-departments'],
    queryFn: () => getEmployees().then((r) => r.data),
    staleTime: 60000,
  });
  const departments = useMemo(
    () => [...new Set((allForDepartments.data ?? []).map((e) => e.department).filter(Boolean))].sort(),
    [allForDepartments.data],
  );

  const isFiltered = Boolean(search || department || status);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${data ? `${data.length} ` : ''}Org directory.`}
        action={<Button onClick={() => setAddModalOpen(true)}>Add employee</Button>}
      />

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        <input
          className="field-input"
          placeholder="Search name, email, or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 220px', maxWidth: 320 }}
          aria-label="Search employees"
        />
        <select className="field-input" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ maxWidth: 180 }} aria-label="Filter by department">
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 160 }} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading && (
        <div className="card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
              <Skeleton width={160} height={14} />
              <Skeleton width={120} height={14} />
              <Skeleton width={100} height={14} />
            </div>
          ))}
        </div>
      )}

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load employees. Try again.</p>}

      {!isLoading && data && data.length === 0 && (
        <div className="card">
          <EmptyState
            title={isFiltered ? 'No employees match these filters' : 'No employees yet'}
            body={isFiltered ? 'Try a different search or clear a filter.' : undefined}
          />
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', textAlign: 'left' }}>
                {['Name', 'Department', 'Designation', 'Manager', 'Joined', 'Status'].map((h) => (
                  <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelectedEmpId(e.id)}
                  style={{ borderTop: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background var(--transition-fast)' }}
                  className="table-row-clickable"
                >
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          background: 'var(--color-success-chip-bg)',
                          color: 'var(--color-success)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 700,
                          flex: 'none',
                        }}
                      >
                        {e.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{e.name}</div>
                        <div style={{ color: 'var(--color-text-muted-2)', fontSize: 'var(--font-size-xs)' }}>{e.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{e.department ?? '—'}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{e.designation ?? '—'}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{e.manager ?? '—'}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)' }}>{fmtJoined(e.joiningDate)}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <StatusPill status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addModalOpen && <AddEmployeeModal onClose={() => setAddModalOpen(false)} onSuccess={handleRefresh} />}
      {selectedEmpId && <EmployeeDrawer employeeId={selectedEmpId} onClose={() => setSelectedEmpId(null)} onDeactivated={handleRefresh} />}
    </div>
  );
}
