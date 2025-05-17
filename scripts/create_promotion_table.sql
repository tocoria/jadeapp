-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Drop existing table if it exists
drop table if exists promotion;

-- Create the promotion table
create table promotion (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  description text not null,
  price numeric not null check (price >= 0),
  available_k10 boolean not null default false,
  available_k20 boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an update trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_promotion_updated_at
  before update on promotion
  for each row
  execute function update_updated_at_column();

-- Enable RLS
alter table promotion enable row level security;

-- Allow read access for all users
create policy "Enable read access for all users" on promotion
  for select
  using (true);

-- Create policy for insert/update/delete access (adjust as needed)
create policy "Enable write access for authenticated users" on promotion
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Comments for documentation
comment on table promotion is 'Stores promotional packages and their availability rules';
comment on column promotion.code is 'Unique identifier code for the promotion (e.g., PROMOTH)';
comment on column promotion.name is 'Short display name for the promotion';
comment on column promotion.description is 'Detailed description of what the promotion includes';
comment on column promotion.price is 'Base price of the promotion in KRW';
comment on column promotion.available_k10 is 'Whether this promotion is available for K10 customers';
comment on column promotion.available_k20 is 'Whether this promotion is available for K20 customers';

-- Sample data insertion (comment out if not needed)
insert into promotion (code, name, description, price, available_k10, available_k20) 
values 
  ('PROMOTH', 'Monthly Thermage Special', 'Monthly special package for Thermage treatment', 1800000, true, true),
  ('PROPACK', 'Laser Package Deal', 'Special laser treatment package', 800000, false, true),
  ('PROBOTX', 'Botox Bundle', 'Special Botox treatment package', 350000, true, true); 