import { NextRequest, NextResponse } from 'next/server';
import { sendVenueEmail } from '@/lib/email';
import { updateVenueStatus } from '@/lib/venue-database';

export async function POST(request: NextRequest) {
  try {
    const { emails, from, demoMode } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No emails provided' },
        { status: 400 }
      );
    }

    // Demo mode: Override all emails to go to demo address
    // NOTE: Using saurabhbains@berkeley.edu because it's the verified email in Resend
    const DEMO_EMAIL = 'saurabhbains@berkeley.edu';
    const isDemoMode = demoMode === true;

    if (isDemoMode) {
      console.log(`🎬 DEMO MODE: Sending batch of ${emails.length} emails to ${DEMO_EMAIL}...`);
    } else {
      console.log(`Sending batch of ${emails.length} emails...`);
    }

    // Send emails sequentially to avoid rate limiting issues
    const results = [];
    for (const email of emails) {
      console.log(`Processing email for ${email.venueName}:`, {
        success: email.success,
        hasBody: !!email.emailBody,
        hasVenueEmail: !!email.venueEmail,
        venueEmail: email.venueEmail
      });

      if (!email.success || !email.emailBody || !email.venueEmail) {
        const error = `Missing email data: success=${email.success}, body=${!!email.emailBody}, venueEmail=${!!email.venueEmail}`;
        console.error(`❌ ${email.venueName}: ${error}`);
        results.push({
          venueId: email.venueId,
          venueName: email.venueName,
          success: false,
          error
        });
        continue;
      }

      try {
        // In demo mode, skip validation of original email since we're not using it
        // In production mode, validate the venue email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!isDemoMode && !emailRegex.test(email.venueEmail)) {
          const error = `Invalid email address: ${email.venueEmail}`;
          console.error(`❌ ${email.venueName}: ${error}`);
          results.push({
            venueId: email.venueId,
            venueName: email.venueName,
            success: false,
            error
          });
          continue;
        }

        // In demo mode, send to demo email instead of real venue email
        const targetEmail = isDemoMode ? DEMO_EMAIL : email.venueEmail;
        console.log(`Attempting to send email for ${email.venueName} to ${targetEmail}...`);

        const result = await sendVenueEmail(
          targetEmail,
          `Wedding Venue Inquiry - ${email.venueName}`,
          email.emailBody,
          from || process.env.EMAIL_FROM
        );

        // Update venue status to 'contacted'
        updateVenueStatus(email.venueId, 'contacted');

        results.push({
          venueId: email.venueId,
          venueName: email.venueName,
          success: true,
          messageId: result.messageId,
          sentTo: targetEmail
        });

        if (isDemoMode) {
          console.log(`✓ [DEMO] Sent email for ${email.venueName} to ${targetEmail} (original: ${email.venueEmail})`);
        } else {
          console.log(`✓ Sent email to ${email.venueName} (${email.venueEmail})`);
        }
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
