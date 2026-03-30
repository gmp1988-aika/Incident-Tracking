create table if not exists roles (
  id text primary key,
  name text not null,
  description text
);

create table if not exists people (
  id text primary key,
  first_name text not null,
  last_name text not null,
  role_id text references roles(id)
);

create table if not exists projects (
  id text primary key,
  name text not null,
  status text not null,
  start_date date,
  end_date date,
  budget_total numeric(14,2) default 0
);

create table if not exists assignments (
  id text primary key,
  person_id text not null references people(id) on delete cascade,
  project_id text not null references projects(id) on delete cascade,
  month text not null,
  allocation_percentage numeric(5,2) not null default 0
);

create table if not exists project_costs (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  month text not null,
  amount numeric(14,2) not null default 0,
  cost_status text not null default 'pendiente'
);

create table if not exists milestones (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  name text not null,
  datetime timestamptz not null
);

create table if not exists notes (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  description_long text,
  status text not null default 'To Do',
  start_date date,
  due_date date,
  responsible_id text references people(id)
);

create table if not exists note_tasks (
  id text primary key,
  note_id text not null references notes(id) on delete cascade,
  description text not null,
  status text not null default 'To Do'
);

create index if not exists assignments_person_month_idx on assignments (person_id, month);
create index if not exists assignments_project_month_idx on assignments (project_id, month);
create index if not exists project_costs_project_month_idx on project_costs (project_id, month);
create index if not exists notes_project_status_idx on notes (project_id, status);
