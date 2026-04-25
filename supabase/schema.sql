-- ═══════════════════════════════════════════════════════════════════════════
-- TURNIO — Supabase Schema
-- Ejecutá este archivo en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════════════════

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ───────────────────────────────────────────────────────────────────────────
-- PROFILES — extiende auth.users
-- ───────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'client' check (role in ('client', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles públicos para lectura"
  on public.profiles for select
  using (true);

create policy "Usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: cuando se crea un user en auth, crear el profile automáticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ───────────────────────────────────────────────────────────────────────────
-- BUSINESSES — los locales (barberías, salones)
-- ───────────────────────────────────────────────────────────────────────────
create table public.businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  slug text unique not null,
  name text not null,
  description text,
  category text not null default 'barberia' check (category in ('barberia', 'peluqueria', 'estetica', 'unas', 'spa', 'otros')),
  address text,
  city text,
  latitude double precision,
  longitude double precision,
  cover_url text,
  logo_url text,
  phone text,
  mp_access_token text,         -- access token de Mercado Pago del dueño
  mp_user_id text,              -- user ID de MP para split de pagos
  rating numeric(2,1) default 0,
  reviews_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_businesses_slug on public.businesses(slug);
create index idx_businesses_city on public.businesses(city);
create index idx_businesses_location on public.businesses(latitude, longitude);
create index idx_businesses_name_trgm on public.businesses using gin (name gin_trgm_ops);

alter table public.businesses enable row level security;

create policy "Cualquiera puede ver businesses"
  on public.businesses for select using (true);

create policy "Solo el dueño puede crear su business"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "Solo el dueño puede modificar su business"
  on public.businesses for update
  using (auth.uid() = owner_id);

create policy "Solo el dueño puede eliminar su business"
  on public.businesses for delete
  using (auth.uid() = owner_id);

-- ───────────────────────────────────────────────────────────────────────────
-- EMPLOYEES — equipo de cada local
-- ───────────────────────────────────────────────────────────────────────────
create table public.employees (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  avatar_url text,
  role text default 'staff',
  active boolean default true,
  created_at timestamptz not null default now()
);

create index idx_employees_business on public.employees(business_id);

alter table public.employees enable row level security;

create policy "Cualquiera puede ver empleados"
  on public.employees for select using (true);

create policy "Solo el dueño puede gestionar empleados"
  on public.employees for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- SERVICES — catálogo de servicios
-- ───────────────────────────────────────────────────────────────────────────
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null default 30,
  price_cents integer not null,
  active boolean default true,
  created_at timestamptz not null default now()
);

create index idx_services_business on public.services(business_id);

alter table public.services enable row level security;

create policy "Cualquiera puede ver services"
  on public.services for select using (true);

create policy "Solo el dueño puede gestionar services"
  on public.services for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

-- Tabla N:M entre empleados y servicios que pueden hacer
create table public.employee_services (
  employee_id uuid references public.employees(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  primary key (employee_id, service_id)
);

alter table public.employee_services enable row level security;

create policy "Cualquiera puede ver employee_services"
  on public.employee_services for select using (true);

create policy "Solo el dueño puede gestionar employee_services"
  on public.employee_services for all
  using (
    exists (
      select 1 from public.employees e
      join public.businesses b on b.id = e.business_id
      where e.id = employee_id and b.owner_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- BUSINESS_HOURS — horarios de atención semanales
-- ───────────────────────────────────────────────────────────────────────────
create table public.business_hours (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=domingo
  open_time time,
  close_time time,
  closed boolean default false,
  unique(business_id, day_of_week)
);

alter table public.business_hours enable row level security;

create policy "Cualquiera puede ver business_hours"
  on public.business_hours for select using (true);

create policy "Solo el dueño puede gestionar horarios"
  on public.business_hours for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- APPOINTMENTS — turnos
-- ───────────────────────────────────────────────────────────────────────────
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid not null references public.services(id),
  employee_id uuid references public.employees(id) on delete set null,
  client_id uuid references public.profiles(id) on delete set null,
  client_name text,
  client_phone text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'failed')),
  payment_id text,                       -- ID de pago de Mercado Pago
  price_cents integer not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_appointments_business_starts on public.appointments(business_id, starts_at);
create index idx_appointments_client on public.appointments(client_id, starts_at desc);
create index idx_appointments_employee on public.appointments(employee_id, starts_at);
create index idx_appointments_status on public.appointments(status);

alter table public.appointments enable row level security;

create policy "Clientes ven sus propios turnos"
  on public.appointments for select
  using (auth.uid() = client_id);

create policy "Dueños ven los turnos de su business"
  on public.appointments for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "Cualquiera autenticado puede crear turnos"
  on public.appointments for insert
  with check (auth.uid() = client_id or client_id is null);

create policy "Cliente puede actualizar su turno"
  on public.appointments for update
  using (auth.uid() = client_id);

create policy "Dueño puede actualizar turnos de su business"
  on public.appointments for update
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- REVIEWS — reseñas
-- ───────────────────────────────────────────────────────────────────────────
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(appointment_id)
);

create index idx_reviews_business on public.reviews(business_id, created_at desc);

alter table public.reviews enable row level security;

create policy "Cualquiera puede ver reseñas"
  on public.reviews for select using (true);

create policy "Cliente puede crear su reseña"
  on public.reviews for insert
  with check (auth.uid() = client_id);

create policy "Cliente puede editar su reseña"
  on public.reviews for update
  using (auth.uid() = client_id);

-- Trigger: actualizar rating del business cuando se crea/modifica una reseña
create or replace function public.update_business_rating()
returns trigger
language plpgsql
as $$
begin
  update public.businesses
  set
    rating = (select coalesce(round(avg(rating)::numeric, 1), 0) from public.reviews where business_id = new.business_id),
    reviews_count = (select count(*) from public.reviews where business_id = new.business_id)
  where id = new.business_id;
  return new;
end;
$$;

create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute procedure public.update_business_rating();

-- ───────────────────────────────────────────────────────────────────────────
-- LOYALTY — programa de fidelidad simple
-- ───────────────────────────────────────────────────────────────────────────
create table public.loyalty_progress (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  visits_count integer default 0,
  rewards_earned integer default 0,
  last_visit_at timestamptz,
  unique(client_id, business_id)
);

alter table public.loyalty_progress enable row level security;

create policy "Clientes ven su propio progreso"
  on public.loyalty_progress for select
  using (auth.uid() = client_id);

create policy "Dueño ve el progreso de fidelidad de su business"
  on public.loyalty_progress for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- FUNCIONES ÚTILES
-- ───────────────────────────────────────────────────────────────────────────

-- Buscar slots disponibles para un servicio en una fecha
create or replace function public.get_available_slots(
  p_business_id uuid,
  p_service_id uuid,
  p_date date
)
returns table(slot_start timestamptz, slot_end timestamptz)
language plpgsql
as $$
declare
  v_duration integer;
  v_open time;
  v_close time;
  v_dow integer;
  v_slot timestamptz;
  v_slot_end timestamptz;
begin
  -- Duración del servicio
  select duration_minutes into v_duration from public.services where id = p_service_id;
  if v_duration is null then return; end if;

  -- Día de la semana (0=domingo)
  v_dow := extract(dow from p_date);

  -- Horario del local ese día
  select open_time, close_time into v_open, v_close
  from public.business_hours
  where business_id = p_business_id and day_of_week = v_dow and not closed;
  if v_open is null then return; end if;

  -- Generar slots cada 15 minutos
  v_slot := (p_date + v_open)::timestamptz;
  while v_slot + (v_duration || ' minutes')::interval <= (p_date + v_close)::timestamptz loop
    v_slot_end := v_slot + (v_duration || ' minutes')::interval;
    -- Verificar que no haya conflicto con appointments existentes
    if not exists (
      select 1 from public.appointments
      where business_id = p_business_id
        and status in ('pending', 'confirmed')
        and tstzrange(starts_at, ends_at) && tstzrange(v_slot, v_slot_end)
    ) then
      slot_start := v_slot;
      slot_end := v_slot_end;
      return next;
    end if;
    v_slot := v_slot + interval '15 minutes';
  end loop;
end;
$$;

-- Caja del día / semana / mes
create or replace function public.get_revenue(
  p_business_id uuid,
  p_period text default 'day' -- 'day' | 'week' | 'month' | 'year'
)
returns table(total_cents bigint, appointments_count bigint)
language sql
as $$
  select
    coalesce(sum(price_cents), 0)::bigint,
    count(*)::bigint
  from public.appointments
  where business_id = p_business_id
    and status in ('confirmed', 'completed')
    and payment_status = 'paid'
    and starts_at >= case
      when p_period = 'day' then date_trunc('day', now())
      when p_period = 'week' then date_trunc('week', now())
      when p_period = 'month' then date_trunc('month', now())
      when p_period = 'year' then date_trunc('year', now())
    end;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- updated_at triggers
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger profiles_updated before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger businesses_updated before update on public.businesses for each row execute procedure public.set_updated_at();
create trigger appointments_updated before update on public.appointments for each row execute procedure public.set_updated_at();
