-- ═══════════════════════════════════════════════════════════════════════════
-- TURNIO — Datos de prueba
-- Ejecutá DESPUÉS de schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- NOTA: estos UUIDs son fijos para que sea fácil testear
-- Vas a tener que crear primero usuarios reales en auth (haciendo login con Google)
-- y reemplazar los owner_id correspondientes, o desactivar temporalmente las FKs.

-- Para hacer un seeding más simple, este script solo crea los businesses y servicios
-- Los users se crearán cuando se loguee la primera vez con Google.

-- ───────────────────────────────────────────────────────────────────────────
-- Ejemplo: cómo poblar después de tener un usuario con rol 'owner'
-- ───────────────────────────────────────────────────────────────────────────

-- 1. Después de tu primer login, andá a la tabla profiles y cambiá tu role a 'owner':
--    update public.profiles set role = 'owner' where id = 'TU-USER-ID';

-- 2. Después corré algo así para crear un business de prueba:
/*

insert into public.businesses (id, owner_id, slug, name, description, category, address, city, latitude, longitude)
values (
  '00000000-0000-0000-0000-000000000001',
  'TU-USER-ID-AQUI',  -- reemplazá
  'el-bigote-rojo',
  'El Bigote Rojo',
  'Barbería clásica con servicio premium',
  'barberia',
  'Av. Rivadavia 2340',
  'Buenos Aires',
  -34.6037,
  -58.3816
);

insert into public.services (business_id, name, description, duration_minutes, price_cents) values
  ('00000000-0000-0000-0000-000000000001', 'Corte clásico', 'Corte tradicional con tijera y máquina', 25, 450000),
  ('00000000-0000-0000-0000-000000000001', 'Corte + barba', 'Corte completo con arreglo de barba', 45, 700000),
  ('00000000-0000-0000-0000-000000000001', 'Solo barba', 'Arreglo y diseño de barba', 20, 350000),
  ('00000000-0000-0000-0000-000000000001', 'Coloración', 'Tinte completo', 90, 1500000);

insert into public.employees (business_id, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'Martín Gómez', 'Dueño'),
  ('00000000-0000-0000-0000-000000000001', 'Juli Pérez', 'Estilista'),
  ('00000000-0000-0000-0000-000000000001', 'Nico Ruiz', 'Barbero');

insert into public.business_hours (business_id, day_of_week, open_time, close_time, closed) values
  ('00000000-0000-0000-0000-000000000001', 0, null, null, true),                         -- Dom cerrado
  ('00000000-0000-0000-0000-000000000001', 1, '09:00', '20:00', false),                  -- Lun
  ('00000000-0000-0000-0000-000000000001', 2, '09:00', '20:00', false),                  -- Mar
  ('00000000-0000-0000-0000-000000000001', 3, '09:00', '20:00', false),                  -- Mié
  ('00000000-0000-0000-0000-000000000001', 4, '09:00', '20:00', false),                  -- Jue
  ('00000000-0000-0000-0000-000000000001', 5, '09:00', '22:00', false),                  -- Vie
  ('00000000-0000-0000-0000-000000000001', 6, '10:00', '18:00', false);                  -- Sáb

*/
