import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedEmail } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { venues, criteria, coupleName } = await request.json();

    if (!venues || !Array.isArray(venues) || venues.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No venues provided' },
        { status: 400 }
      );
    }

    console.log(`Generating emails for ${venues.length} venues...`);

    // Generate emails for each venue in parallel
    const emailPromises = venues.map(async (venueData: any) => {
      try {
        const email = await generatePersonalizedEmail(
          venueData.venue.name,
          venueData.venue,
          criteria || {},
          coupleName || 'the couple'
        );

        return {
          venueId: venueData.venue.id,
          venueName: venueData.venue.name,
          venueEmail: venueData.venue.email || '',
          success: true,
          emailBody: email
        };
      } catch (error: any) {
        console.error(`Failed to generate email for ${venueData.venue.name}:`, error);
        return {
          venueId: venueData.venue.id,
          venueName: venueData.venue.name,
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.all(emailPromises);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`Generated ${successful.length} emails successfully, ${failed.length} failed`);

    return NextResponse.json({
      success: true,
      total: venues.length,
      successful: successful.length,
      failed: failed.length,
      emails: results
    });
  } catch (error: any) {
    console.error('Batch email generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate emails' },
      { status: 500 }
    );
  }
}
