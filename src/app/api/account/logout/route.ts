import { NextResponse } from 'next/server';

export async function POST() {
  return new NextResponse(JSON.stringify({ message: 'Logout successful' }), {
    status: 200,
    headers: {
      'Set-Cookie': 'access_token=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT;',
      'Content-Type': 'application/json',
    },
  });
}
