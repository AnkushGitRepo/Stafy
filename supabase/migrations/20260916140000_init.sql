-- Initial schema — see docs/DATABASE.md for the design this implements.
create extension if not exists citext;
create extension if not exists btree_gist;
create extension if not exists pgcrypto;

create type employee_role as enum ('admin', 'manager', 'employee');
create type employment_status as enum ('active', 'inactive');
create type leave_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type leave_duration as enum ('full_day', 'half_day');
create type half_session as enum ('first_half', 'second_half');

create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  employee_code text not null unique,
  full_name text not null,
  email citext not null unique,
  phone text,
  department_id uuid references departments(id),
  designation text,
  manager_id uuid references employees(id),
  role employee_role not null default 'employee',
  joining_date date not null,
  employment_status employment_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint manager_not_self check (manager_id is null or manager_id <> id),
  constraint joining_date_not_too_future check (joining_date <= (now() at time zone 'Asia/Kolkata')::date + interval '90 days')
);
create index employees_manager_id_idx on employees(manager_id);
create index employees_department_id_idx on employees(department_id);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id),
  work_date date not null,
  check_in_at timestamptz not null,
  check_out_at timestamptz,
  constraint attendance_unique_per_day unique (employee_id, work_date),
  constraint checkout_after_checkin check (check_out_at is null or check_out_at > check_in_at)
);
create index attendance_work_date_idx on attendance(work_date);

create table leave_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  annual_quota numeric(4,1),
  is_paid boolean not null default true
);

create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id),
  leave_type_id uuid not null references leave_types(id),
  start_date date not null,
  end_date date not null,
  duration leave_duration not null default 'full_day',
  half_session half_session,
  days numeric(4,1) not null,
  reason text not null,
  status leave_status not null default 'pending',
  approver_id uuid references employees(id),
  decided_at timestamptz,
  rejection_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_date >= start_date),
  constraint half_day_single_date check (duration <> 'half_day' or start_date = end_date),
  constraint half_day_needs_session check (duration <> 'half_day' or half_session is not null),
  constraint reason_length check (char_length(reason) between 10 and 500),
  constraint rejection_reason_length check (rejection_reason is null or char_length(rejection_reason) between 10 and 500),
  constraint approver_not_self check (approver_id is null or approver_id <> employee_id),
  exclude using gist (
    employee_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('pending', 'approved'))
);
create index leave_requests_status_employee_idx on leave_requests(status, employee_id);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references employees(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs(entity_type, entity_id);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger employees_set_updated_at
  before update on employees
  for each row execute function set_updated_at();

alter table departments enable row level security;
alter table employees enable row level security;
alter table attendance enable row level security;
alter table leave_types enable row level security;
alter table leave_requests enable row level security;
alter table audit_logs enable row level security;
