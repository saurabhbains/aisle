import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  return NextResponse.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasResend: !!process.env.RESEND_API_KEY,
    hasEmailFrom: !!process.env.EMAIL_FROM,
  });
}
