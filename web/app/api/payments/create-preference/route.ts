import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para crear una preferencia de pago en Mercado Pago.
 */

interface CreatePreferenceBody {
  appointment_id: string;
  service_name: string;
  price_cents: number;
  client_email?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreatePreferenceBody;
    const accessToken = process.env.MP_ACCESS_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Falta configurar MP_ACCESS_TOKEN. Ver docs/MERCADO_PAGO.md' },
        { status: 500 }
      );
    }

    if (!body.appointment_id || !body.service_name || body.price_cents <= 0) {
      return NextResponse.json(
        {
          error:
            'Body inválido. Se requieren appointment_id, service_name y price_cents mayor a 0.',
        },
        { status: 400 }
      );
    }

    const { MercadoPagoConfig, Preference } = await import('mercadopago');
    const mp = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(mp);

    const result = await preference.create({
      body: {
        items: [
          {
            id: body.appointment_id,
            title: body.service_name,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: body.price_cents / 100,
          },
        ],
        payer: body.client_email ? { email: body.client_email } : undefined,
        // Comisión de Turnio (5%) — solo aplica con marketplace mode
        // marketplace_fee: (body.price_cents / 100) * 0.05,
        back_urls: {
          success: `${baseUrl}/payment/success`,
          failure: `${baseUrl}/payment/failure`,
        },
        auto_return: 'approved',
        external_reference: body.appointment_id,
        notification_url: `${baseUrl}/api/payments/webhook`,
      },
    });

    return NextResponse.json({
      preference_id: result.id,
      init_point: result.init_point,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
