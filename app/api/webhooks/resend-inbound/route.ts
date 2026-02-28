import { NextRequest, NextResponse } from 'next/server';
import { extractVenueInfoFromText } from '@/lib/ai';
import { updateVenueStatus } from '@/lib/venue-database';

// Resend webhook for receiving inbound emails
// Docs: https://resend.com/docs/dashboard/receiving/introduction
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('Received inbound email webhook:', JSON.stringify(payload, null, 2));

    // Resend inbound webhook structure:
    // {
    //   type: 'email.received',
    //   created_at: '2026-02-28T...',
    //   data: {
    //     email_id: '...',
    //     from: 'venue@example.com',
    //     to: ['your-email@resend.app'],
    //     subject: 'Re: Wedding Venue Inquiry',
    //     ...
    //   }
    // }

    if (payload.type !== 'email.received') {
      console.log('Ignoring non-email.received event:', payload.type);
      return NextResponse.json({ success: true, message: 'Event ignored' });
    }

    const emailData = payload.data;
    const emailId = emailData.email_id;
    const fromEmail = emailData.from;
    const subject = emailData.subject;

    console.log(`Processing email from ${fromEmail} with subject: ${subject}`);

    // Check if this is a test/simulated email (test emails have text/html already in payload)
    let emailDetails;
    if (emailData.text || emailData.html) {
      // Simulated/test email - use data directly from payload
      console.log('Using email data from payload (test mode)');
      emailDetails = emailData;
    } else {
      // Real Resend webhook - fetch full details using API
      console.log('Fetching email details from Resend API');
      emailDetails = await fetchEmailDetails(emailId);

      if (!emailDetails) {
        console.error('Failed to fetch email details');
        return NextResponse.json({ success: false, error: 'Failed to fetch email details' });
      }
    }

    // Find which venue this email is from by matching the sender email
    const venueId = await findVenueByEmail(fromEmail);

    if (!venueId) {
      console.log(`No venue found for email: ${fromEmail}`);
      return NextResponse.json({
        success: true,
        message: 'Email received but no matching venue found'
      });
    }

    // Extract venue info from email body (text content)
    const emailText = emailDetails.text || emailDetails.html || '';
    let venueInfo: any = {};

    if (emailText) {
      venueInfo = await extractVenueInfoFromText(emailText);
    }

    // Download and parse PDF attachments if present
    if (emailDetails.attachments && emailDetails.attachments.length > 0) {
      console.log(`Found ${emailDetails.attachments.length} attachments`);

      for (const attachment of emailDetails.attachments) {
        if (attachment.content_type?.includes('pdf')) {
          console.log(`Processing PDF attachment: ${attachment.filename}`);

          // Download the PDF using the attachment URL
          const pdfData = await downloadAttachment(attachment.download_url);

          if (pdfData) {
            // Parse the PDF and extract venue information
            const pdfInfo = await parsePDFContent(pdfData);

            // Merge PDF info with email text info
            venueInfo = { ...venueInfo, ...pdfInfo };
          }
        }
      }
    }

    // Update venue status to 'responded' with the extracted information
    const responseData = {
      responseDate: new Date().toISOString(),
      availability: venueInfo.availability || 'Replied - check details',
      pricing: venueInfo.pricing || 'See attached brochure',
      additionalInfo: venueInfo.notes || '',
      contactPerson: venueInfo.contactPerson || extractNameFromEmail(fromEmail),
      contactEmail: fromEmail,
      contactPhone: venueInfo.phone || '',
      emailSubject: subject,
      emailBody: emailText.substring(0, 500), // First 500 chars
      attachments: emailDetails.attachments?.map((att: any) => ({
        type: att.content_type,
        name: att.filename,
        size: att.size,
        url: att.download_url
      })) || [],
      extractedData: venueInfo
    };

    updateVenueStatus(venueId, 'responded', responseData);

    console.log(`✓ Updated venue ${venueId} with response data`);

    return NextResponse.json({
      success: true,
      venueId,
      message: 'Email processed successfully'
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Fetch full email details from Resend API
async function fetchEmailDetails(emailId: string) {
  try {
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch email: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching email details:', error);
    return null;
  }
}

// Download attachment from Resend
async function downloadAttachment(downloadUrl: string) {
  try {
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error downloading attachment:', error);
    return null;
  }
}

// Parse PDF content (reuse existing PDF parsing logic)
async function parsePDFContent(pdfData: ArrayBuffer) {
  try {
    // Convert ArrayBuffer to base64
    const base64 = Buffer.from(pdfData).toString('base64');

    // Call the existing PDF parsing API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/parse-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfData: base64,
        fileName: 'venue-response.pdf'
      }),
    });

    if (!response.ok) {
      throw new Error('PDF parsing failed');
    }

    const result = await response.json();
    return result.venueInfo || {};
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return {};
  }
}

// Find venue by email address
async function findVenueByEmail(email: string): Promise<string | null> {
  // This is a simple implementation - you might want to enhance this
  // to check against your venue database
  // For now, we'll extract it from the in-memory venue database
  try {
    const { getAllVenues } = await import('@/lib/venue-database');
    const venues = getAllVenues();

    const venue = venues.find((v: any) =>
      v.email?.toLowerCase() === email.toLowerCase()
    );

    return venue?.id || null;
  } catch (error) {
    console.error('Error finding venue by email:', error);
    return null;
  }
}

// Extract person name from email address
function extractNameFromEmail(email: string): string {
  const username = email.split('@')[0];
  return username
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
