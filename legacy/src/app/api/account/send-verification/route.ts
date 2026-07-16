import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verificationCache } from '@/lib/verification-cache';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { message: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Generate verification code
    const code = generateVerificationCode();
    
    // Store the code in memory with 10-minute expiration
    const expiresAt = Date.now() + 600000; // 10 minutes
    verificationCache.set(email, { code, expiresAt });
    
    // Send verification email
    const { data, error } = await resend.emails.send({
      from: 'Smart Ledger <noreply@e.terrytools.online>',
      to: email,
      subject: 'Your Smart Ledger Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Smart Ledger!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with Smart Ledger. Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1e40af; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { message: 'Failed to send verification code' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-verification:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 