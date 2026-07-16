import { NextResponse } from 'next/server';
import { verificationCache } from '@/lib/verification-cache';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email and verification code are required' },
        { status: 400 }
      );
    }
    // console.log(verificationCache);

    // Get the stored code from cache
    const storedData = verificationCache.get(email);

    if (!storedData) {
      return NextResponse.json(
        { message: 'No verification code found' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (storedData.expiresAt < Date.now()) {
      verificationCache.delete(email);
      return NextResponse.json(
        { message: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Compare the codes
    if (storedData.code !== code) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Delete the code after successful verification
    verificationCache.delete(email);

    return NextResponse.json(
      { message: 'Code verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 