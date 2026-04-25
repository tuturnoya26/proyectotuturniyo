# Integrar Mercado Pago

Esta guía te muestra cómo conectar Mercado Pago para cobrar reservas.

## Modo simple (un solo vendedor)

Si vos sos el dueño y querés cobrar todos los pagos en tu cuenta:

1. Andá a https://www.mercadopago.com.ar/developers/panel/app
2. Creá una aplicación
3. Copiá el **Access Token** de producción
4. Pegalo en `web/.env.local`:
   ```
   MP_ACCESS_TOKEN=APP_USR-xxxx
   ```
5. Instalá el SDK:
   ```bash
   cd web
   npm install mercadopago
   ```
6. Configurá también `NEXT_PUBLIC_BASE_URL` en `web/.env.local`:
  ```
  NEXT_PUBLIC_BASE_URL=http://localhost:3000
  ```

## Modo Marketplace (split de pagos)

Esto es lo que necesitás si **cada dueño cobra en su propia cuenta** y Turnio se queda
con una comisión por cada turno.

### 1. Registrarte como Marketplace
- Andá a https://www.mercadopago.com.ar/developers
- Solicitá habilitar el modo Marketplace
- MP te asigna un `client_id` y `client_secret`

### 2. Conexión vía OAuth
Cuando un dueño quiere conectar su MP:

```typescript
// web/app/api/auth/mp/route.ts
const url = `https://auth.mercadopago.com.ar/authorization
  ?client_id=${process.env.MP_CLIENT_ID}
  &response_type=code
  &platform_id=mp
  &redirect_uri=${encodeURIComponent('https://turnio.app/api/auth/mp/callback')}
  &state=BUSINESS_ID`;
```

El dueño autoriza y MP redirige a `/api/auth/mp/callback` con un `code`.
Lo intercambiás por un access token y lo guardás en `businesses.mp_access_token`.

### 3. Crear preferencias con split

```typescript
const result = await preference.create({
  body: {
    items: [{ ...itemDetails }],
    marketplace: 'TURNIO',
    marketplace_fee: priceCents * 0.05 / 100, // 5% para Turnio
  },
  // Importante: usar el access token del dueño
  requestOptions: {
    headers: { Authorization: `Bearer ${ownerMpAccessToken}` },
  },
});
```

### 4. Webhook para confirmar pago

Cuando MP envía el webhook, actualizás `payment_status = 'paid'` en la
appointment correspondiente.

## Comisiones de referencia

- **Mercado Pago**: 3.49% + IVA (varía según método)
- **Turnio (sugerido)**: 5% del turno
- **Total para el dueño**: ~91% del valor del turno

## Recursos

- Docs MP: https://www.mercadopago.com.ar/developers/es/docs
- Marketplace: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/integration-configuration/integrate-marketplace
- Sample apps: https://github.com/mercadopago
