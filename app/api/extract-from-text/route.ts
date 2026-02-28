import { NextRequest, NextResponse } from 'next/server';
import { extractVenueInfoFromText } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    console.log('Extracting venue info from text, length:', text.length);

    const venueInfo = await extractVenueInfoFromText(text);

    console.log('Successfully extracted venue info:', venueInfo);

    return NextResponse.json({
      success: true,
      venueInfo,
      message: 'AI successfully extracted venue information from text'
    });
  } catch (error: any) {
    console.error('Text extraction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to extract venue information' },
      { status: 500 }
    );
  }
}
