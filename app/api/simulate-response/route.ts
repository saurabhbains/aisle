import { NextRequest, NextResponse } from 'next/server';
import { updateVenueStatus } from '@/lib/venue-database';

export async function POST(request: NextRequest) {
  try {
    const { venueId } = await request.json();

    if (!venueId) {
      return NextResponse.json(
        { success: false, error: 'No venue ID provided' },
        { status: 400 }
      );
    }

    // Simulate venue response with realistic data
    const mockResponseData = {
      responseDate: new Date().toISOString(),
      availability: 'Available for your requested date',
      pricing: 'Full pricing breakdown attached in PDF',
      additionalInfo: 'We offer exclusive use of the venue with accommodation for up to 40 guests',
      contactPerson: 'Emma Thompson',
      contactEmail: 'emma@venue.co.uk',
      contactPhone: '+44 1234 567890',
      attachments: [
        {
          type: 'pdf',
          name: 'venue-brochure.pdf',
          size: '3.2 MB'
        }
      ]
    };

    console.log(`Simulating response for venue ${venueId}`);

    // Update venue status to 'responded'
    const updatedVenue = updateVenueStatus(venueId, 'responded', mockResponseData);

    if (!updatedVenue) {
      return NextResponse.json(
        { success: false, error: 'Venue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      venueId,
      response: mockResponseData,
      message: 'Venue response simulated successfully'
    });
  } catch (error: any) {
    console.error('Simulate response error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to simulate response' },
      { status: 500 }
    );
  }
}
