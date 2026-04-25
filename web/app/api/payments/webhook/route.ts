import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);

  return NextResponse.json({ received: true, payload });
}