import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to manually simulate receiving an inbound email
// This lets us test the inbound email processing logic without waiting for domain verification
export async function POST(request: NextRequest) {
  try {
    const { venueEmail, venueName, emailText, pdfUrl } = await request.json();

    console.log('Test inbound email simulation:', { venueEmail, venueName });

    // Import the actual webhook handler logic
    const webhookModule = await import('../webhooks/resend-inbound/route');

    // Create a mock Resend webhook payload
    const mockPayload = {
      type: 'email.received',
      created_at: new Date().toISOString(),
      data: {
        email_id: 'test-' + Date.now(),
        from: venueEmail,
        to: ['test@aisle-wedding.resend.dev'],
        subject: `Re: Wedding Venue Inquiry - ${venueName}`,
        text: emailText,
        html: `<p>${emailText}</p>`,
        attachments: pdfUrl ? [
          {
            filename: 'venue-brochure.pdf',
            content_type: 'application/pdf',
            size: 123456,
            download_url: pdfUrl
          }
        ] : []
      }
    };

    // Create a mock request with the payload
    const mockRequest = {
      json: async () => mockPayload
    } as NextRequest;

    // Call the actual webhook handler
    const response = await webhookModule.POST(mockRequest);
    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Test inbound email processed',
      result
    });

  } catch (error: any) {
    console.error('Test inbound error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
