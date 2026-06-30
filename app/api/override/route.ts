import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { prId, action, reason } = await req.json();
  const secret = new TextEncoder().encode(process.env.OVERRIDE_JWT_SECRET || 'dev-override-secret-change-me-32char');
  const jwt = await new jose.SignJWT({ prId, action, reason, admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);

  return NextResponse.json({
    override: action,
    jwt,
    expires_in: 900,
    message: action === 'validate' ? 'Manual Override: Force Validate – PR gate bypassed' : 'Manual Override: Invalidate – PR blocked',
  });
}
