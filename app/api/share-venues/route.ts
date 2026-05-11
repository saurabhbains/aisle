import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { toEmail, venues, senderName } = await request.json();

    if (!toEmail || !venues?.length) {
      return NextResponse.json({ success: false, error: 'Missing email or venues' }, { status: 400 });
    }

    const venueListHtml = venues
      .map((v: { name: string; website?: string }) => {
        const nameHtml = v.website
          ? `<a href="${v.website}" style="color:#8B7355;text-decoration:underline;font-weight:600;">${v.name}</a>`
          : `<strong>${v.name}</strong>`;
        return `<li style="margin-bottom:10px;">${nameHtml}</li>`;
      })
      .join('');

    const html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2C2C2C;padding:32px 24px;">
        <h1 style="font-size:28px;font-weight:600;margin-bottom:8px;">A few wedding venues for you</h1>
        <p style="color:#666;font-size:15px;margin-bottom:24px;">Shared by ${senderName || 'a friend'} via Aisle</p>

        <p style="font-size:16px;line-height:1.6;margin-bottom:24px;">
          Hey! I've been searching for wedding venues and found a few that caught my eye.
          Thought you might find them interesting too — would love to hear your thoughts!
        </p>

        <div style="background:#FAF5F0;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="font-size:18px;margin-bottom:16px;font-weight:600;">Venues</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.8;">
            ${venueListHtml}
          </ul>
        </div>

        <p style="font-size:14px;color:#999;border-top:1px solid #eee;padding-top:16px;margin-top:24px;">
          Sent via <a href="https://aisle.app" style="color:#8B7355;">Aisle</a> — AI-powered wedding venue search
        </p>
      </div>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: toEmail,
      subject: `${senderName ? `${senderName} shared` : 'Check out these'} wedding venues with you`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Share venues error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
