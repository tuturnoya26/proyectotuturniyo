# Configurar Google Sign-In

Esta guía te muestra cómo hacer que el botón "Continuar con Google" funcione.

## 1. Google Cloud Console

1. Andá a https://console.cloud.google.com
2. Creá un nuevo proyecto (o usá uno existente)
3. En el menú izquierdo: **APIs & Services → Credentials**
4. Click en **+ CREATE CREDENTIALS → OAuth client ID**
5. Si te pide configurar la OAuth consent screen:
   - Tipo: External
   - App name: Turnio
   - User support email: tu email
   - Developer email: tu email
   - Scopes: agregar `email`, `profile`, `openid`

## 2. Crear las credenciales

Vas a necesitar **dos** OAuth client IDs:

### Web (para Supabase)
- Application type: **Web application**
- Name: "Turnio Web"
- Authorized redirect URIs:
  - `https://TU-PROYECTO.supabase.co/auth/v1/callback`

### Android (para la app móvil)
- Application type: **Android**
- Package name: `com.turnio.app`
- SHA-1: lo conseguís corriendo en tu mobile:
  ```bash
  cd mobile
  npx expo credentials:manager
  ```

### iOS (para la app móvil)
- Application type: **iOS**
- Bundle ID: `com.turnio.app`

## 3. Configurar Supabase

1. Andá a https://supabase.com → tu proyecto
2. **Authentication → Providers → Google**
3. Activá Google
4. Pegá el **Client ID** y **Client Secret** del web app
5. Guardá

## 4. Listo

El código en `mobile/lib/auth.tsx` ya hace todo:

```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: 'turnio://auth/callback' },
});
```

## Apple Sign-In (opcional, requerido si publicás en iOS)

Apple obliga a tener Apple Sign-In si tenés otros métodos de login. Para configurarlo:

1. Necesitás Apple Developer Account ($99/año)
2. En https://developer.apple.com → Certificates, IDs & Profiles
3. Creá un Service ID con Sign In with Apple habilitado
4. En Supabase → Authentication → Providers → Apple, configurás los datos

Por ahora el botón está en el código pero no funcional.
