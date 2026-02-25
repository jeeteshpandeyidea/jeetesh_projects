import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3000';

export async function POST(request: NextRequest) {
  let email = '';
  let password = '';

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      email = body?.email != null ? String(body.email).trim() : '';
      password = body?.password != null ? String(body.password) : '';
    } else {
      const text = await request.text();
      if (text) {
        const body = JSON.parse(text);
        email = body?.email != null ? String(body.email).trim() : '';
        password = body?.password != null ? String(body.password) : '';
      }
    }
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON body. Send { "email": "...", "password": "..." }.', statusCode: 400 },
      { status: 400 }
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required.', statusCode: 400 },
      { status: 400 }
    );
  }

  const payload = JSON.stringify({ email, password });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': request.headers.get('user-agent') || '',
      'X-Forwarded-For': request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
    },
    body: payload,
  });
  const data = await res.json().catch(() => ({ message: 'Invalid response from API' }));
  return NextResponse.json(data, { status: res.status });
}
