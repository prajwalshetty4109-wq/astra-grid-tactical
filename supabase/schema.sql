-- Supabase Schema for ASTRA-Grid Tactical Command Center
create extension if not exists "pgcrypto";

create table if not exists civic_reports (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  sub_area text not null,
  address text not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  image_url text,
  status text not null default 'AI_TRIAGED' check (status in ('SUBMITTED', 'AI_TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED')),
  assigned_department text,
  dispatch_notes text,
  priority_score integer not null default 50,
  priority_level text not null default 'MEDIUM' check (priority_level in ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  ai_summary text not null,
  ai_explanation text not null,
  priority_factors jsonb not null default '{}'::jsonb,
  duplicate_of_id text,
  duplicate_count integer not null default 1,
  duplicate_similarity numeric(4,2) default 0,
  cluster_id text,
  reporter_phone_masked text default '***-***-4821',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table civic_reports enable row level security;
create policy "Public read access civic_reports" on civic_reports for select using (true);
create policy "Public write access civic_reports" on civic_reports for all using (true) with check (true);
alter publication supabase_realtime add table civic_reports;
