-- RE Investment Copilot Database Schema
-- Run this in your Supabase SQL Editor

-- Users are managed by Supabase Auth (auth.users)

-- Deals table
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Property
  address text not null,
  city text not null,
  state text not null,
  zip text not null,
  market_tag text check (market_tag in ('bay_area_appreciation', 'cash_flow_market')),
  property_type text check (property_type in ('sfh', 'condo', 'townhouse', 'multi_2_4')),
  beds integer,
  baths numeric(3,1),
  sqft integer,
  year_built integer,

  -- Purchase
  purchase_price numeric(12,2) not null,
  closing_costs_pct numeric(5,4) default 0.02 not null,

  -- Financing
  down_payment_pct numeric(5,4) default 0.25 not null,
  interest_rate numeric(6,5) default 0.06 not null,
  loan_term_years integer default 30 not null,
  is_arm boolean default false not null,
  arm_adjust_year integer,
  arm_adjust_rate numeric(6,5),

  -- Income
  monthly_rent numeric(10,2) not null,
  vacancy_pct numeric(5,4) default 0.05 not null,
  rent_growth_pct numeric(5,4) default 0.03 not null,

  -- Expenses
  property_tax_annual numeric(10,2),
  insurance_annual numeric(10,2),
  hoa_monthly numeric(10,2) default 0 not null,
  management_pct numeric(5,4) default 0.08 not null,
  repairs_pct numeric(5,4) default 0.05 not null,
  capex_pct numeric(5,4) default 0.05 not null,
  utilities_monthly numeric(10,2) default 0 not null,

  -- Exit
  appreciation_pct numeric(5,4) default 0.03 not null,
  selling_costs_pct numeric(5,4) default 0.07 not null,

  -- Constraints
  is_rent_controlled boolean default false not null,
  has_hoa_rental_limit boolean default false not null,
  known_capex text,

  -- Overrides (JSON)
  assumption_overrides jsonb default '{}' not null,

  -- Status
  status text default 'draft' not null check (status in ('draft', 'analyzed', 'archived')),
  verdict text check (verdict in ('buy', 'skip', 'watch'))
);

-- Memos table (generated analysis)
create table if not exists memos (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade not null,
  created_at timestamptz default now() not null,

  -- Computed results (JSON)
  model_output jsonb not null,

  -- AI narrative (JSON with sections)
  narrative jsonb,

  -- Metadata
  assumptions_snapshot jsonb not null,
  version integer default 1 not null
);

-- Assumption Profiles table
create table if not exists assumption_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  assumptions jsonb not null,
  is_default boolean default false not null,
  created_at timestamptz default now() not null
);

-- Indexes for performance
create index if not exists deals_user_id_idx on deals(user_id);
create index if not exists deals_status_idx on deals(status);
create index if not exists deals_created_at_idx on deals(created_at desc);
create index if not exists memos_deal_id_idx on memos(deal_id);
create index if not exists memos_created_at_idx on memos(created_at desc);
create index if not exists assumption_profiles_user_id_idx on assumption_profiles(user_id);

-- Enable Row Level Security
alter table deals enable row level security;
alter table memos enable row level security;
alter table assumption_profiles enable row level security;

-- RLS Policies for deals
create policy "Users can view own deals"
  on deals for select
  using (auth.uid() = user_id);

create policy "Users can insert own deals"
  on deals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own deals"
  on deals for update
  using (auth.uid() = user_id);

create policy "Users can delete own deals"
  on deals for delete
  using (auth.uid() = user_id);

-- RLS Policies for memos
create policy "Users can view memos for own deals"
  on memos for select
  using (deal_id in (select id from deals where user_id = auth.uid()));

create policy "Users can insert memos for own deals"
  on memos for insert
  with check (deal_id in (select id from deals where user_id = auth.uid()));

create policy "Users can update memos for own deals"
  on memos for update
  using (deal_id in (select id from deals where user_id = auth.uid()));

create policy "Users can delete memos for own deals"
  on memos for delete
  using (deal_id in (select id from deals where user_id = auth.uid()));

-- RLS Policies for assumption_profiles
create policy "Users can view own profiles"
  on assumption_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profiles"
  on assumption_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profiles"
  on assumption_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profiles"
  on assumption_profiles for delete
  using (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for deals updated_at
drop trigger if exists deals_updated_at on deals;
create trigger deals_updated_at
  before update on deals
  for each row
  execute function update_updated_at_column();
