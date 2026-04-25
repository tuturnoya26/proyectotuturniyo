# Turnio — App de reservas para barberías y salones

Marketplace de reservas y pagos para barberías, peluquerías y centros de estética.
Stack: **React Native (Expo) + Supabase + Next.js (Vercel)**.

## Estructura del proyecto

```
turnio/
├── mobile/        # App React Native (Expo) — Android + iOS
├── web/           # Landing + páginas de reserva públicas (Next.js, deploy a Vercel)
├── supabase/      # Schema SQL + seed data
└── docs/          # Documentación adicional
```

## Quick start (5 minutos)

### 1. Crear proyecto en Supabase
1. Andá a https://supabase.com y creá un nuevo proyecto.
2. En el SQL Editor, copiá y ejecutá `supabase/schema.sql`.
3. Después ejecutá `supabase/seed.sql` (datos de prueba).
4. En Project Settings → API copiá:
   - `Project URL`
   - `anon public key`

### 2. Configurar la app móvil

```bash
cd mobile
npm install
cp .env.example .env
# Editá .env con tus credenciales de Supabase
npx expo start
```

Escaneá el QR con la app **Expo Go** (Android/iOS) o presioná `a` para abrir en emulador Android.

### 3. Configurar la web (landing + reservas públicas)

```bash
cd web
npm install
cp .env.local.example .env.local
# Editá .env.local con tus credenciales de Supabase
npm run dev
```

Abre http://localhost:3000

### 4. Subir a GitHub

```bash
cd turnio
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/turnio.git
git push -u origin main
```

### 5. Deploy de la web a Vercel

1. Andá a https://vercel.com → "Add New Project"
2. Importá tu repo de GitHub
3. **Root Directory**: `web`
4. **Framework Preset**: Next.js
5. Agregá las env vars (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
6. Deploy.

### 6. Build de la app móvil (cuando estés listo para publicar)

```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android   # genera APK / AAB
eas build --platform ios       # genera IPA (requiere cuenta Apple Developer)
```

## Funcionalidades implementadas (MVP)

- ✅ Login con Google (vía Supabase Auth)
- ✅ Roles cliente / dueño con permisos diferenciados
- ✅ Dashboard del dueño con caja del día/semana/mes
- ✅ Gestión de servicios y empleados
- ✅ Configuración de horarios disponibles
- ✅ Calendario y reserva de turnos por parte del cliente
- ✅ Buscador de barberías cercanas
- ✅ Link compartible público (`/r/[slug]`)
- ✅ Sistema de reseñas
- ✅ Programa de fidelidad básico
- ⚙️ Pago con Mercado Pago — esqueleto preparado, hay que conectar credenciales

## Configurar Mercado Pago (opcional, para pagos reales)

1. Registrate como **Mercado Pago Marketplace** en https://www.mercadopago.com.ar/developers
2. Conseguí tu `APP_ID` y `CLIENT_SECRET`
3. Configurá las env vars `MP_ACCESS_TOKEN` y `MP_PUBLIC_KEY` en `web/.env.local`
4. Implementá el endpoint `/api/payments/create-preference` (esqueleto en `web/app/api/payments/`)

Ver `docs/MERCADO_PAGO.md` para el flujo completo.

## Configurar Google Sign-In

1. En Google Cloud Console creá credenciales OAuth 2.0
2. En Supabase → Authentication → Providers → Google, pegá el Client ID y Secret
3. Listo — el código ya usa `supabase.auth.signInWithOAuth({ provider: 'google' })`

## Próximos pasos (no incluidos en el MVP)

- Chat en tiempo real (usar Supabase Realtime)
- Push notifications (Expo Notifications)
- Pago real con Mercado Pago split
- Mapa real con Google Maps SDK
- Multi-empleado con calendarios separados
- Dashboard analítico avanzado
- Versión web del panel del dueño

## Comandos útiles

```bash
# Mobile
cd mobile && npx expo start          # dev server
cd mobile && npx expo start --tunnel  # si Expo Go no encuentra el server

# Web
cd web && npm run dev                # dev server (localhost:3000)
cd web && npm run build              # build de producción

# Supabase local (opcional)
npx supabase start                   # corre Supabase localmente
```

## Soporte

- Docs Expo: https://docs.expo.dev
- Docs Supabase: https://supabase.com/docs
- Docs Next.js: https://nextjs.org/docs
