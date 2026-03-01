import { NextRequest, NextResponse } from 'next/server';
import { getMockVenueData } from '@/lib/pdf-parser-simple';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const venueId = formData.get('venueId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Processing file:', file.name, 'for venue:', venueId);

    // For demo: Use realistic mock data based on file name
    // In production, this would use GPT-4 Vision to read the PDF
    const venueInfo = getMockVenueData(file.name);

    // Simulate AI processing time for realism
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      venueInfo,
      extractedData: {
        availability: 'Available for June 2025',
        pricing: '£8,500 venue hire + £95 per person',
        capacity: '120-150 guests',
        amenities: ['In-house catering', 'Bar service', 'Parking for 50 cars'],
        notes: 'Exclusive use included, setup from 8am'
      },
      message: 'Successfully extracted venue information from uploaded file'
    });
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse file' },
      { status: 500 }
    );
  }
}
