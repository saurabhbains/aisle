import { NextRequest, NextResponse } from 'next/server';
import { sendVenueEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { emails, from } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No emails provided' },
        { status: 400 }
      );
    }

    console.log(`Sending batch of ${emails.length} emails...`);

    // Send emails sequentially to avoid rate limiting issues
    const results = [];
    for (const email of emails) {
      if (!email.success || !email.emailBody || !email.venueEmail) {
        results.push({
          venueId: email.venueId,
          venueName: email.venueName,
          success: false,
          error: 'Missing email data or email generation failed'
        });
        continue;
      }

      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.venueEmail)) {
          results.push({
            venueId: email.venueId,
            venueName: email.venueName,
            success: false,
            error: 'Invalid email address'
          });
          continue;
        }

        const result = await sendVenueEmail(
          email.venueEmail,
          `Wedding Venue Inquiry - ${email.venueName}`,
          email.emailBody,
          from || process.env.EMAIL_FROM
        );

        results.push({
          venueId: email.venueId,
          venueName: email.venueName,
          success: true,
          messageId: result.messageId
        });

        console.log(`✓ Sent email to ${email.venueName} (${email.venueEmail})`);
      } catch (error: any) {
        console.error(`✗ Failed to send email to ${email.venueName}:`, error);
        results.push({
          venueId: email.venueId,
          venueName: email.venueName,
          success: false,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`Batch send complete: ${successful.length} sent, ${failed.length} failed`);

    return NextResponse.json({
      success: true,
      total: emails.length,
      sent: successful.length,
      failed: failed.length,
      results
    });
  } catch (error: any) {
    console.error('Batch email sending error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send batch emails' },
      { status: 500 }
    );
  }
}
