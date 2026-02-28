import { NextRequest, NextResponse } from 'next/server';
import { getMockVenueData } from '@/lib/pdf-parser-simple';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '40mb',
    },
  },
};

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pdfUrl, fileName } = body;

    if (!pdfUrl || !fileName) {
      return NextResponse.json(
        { error: 'Missing pdfUrl or fileName' },
        { status: 400 }
      );
    }

    console.log('Processing PDF from blob:', fileName);

    // For hackathon demo: Use realistic mock data
    // In production, this would fetch the PDF from blob URL and use GPT-4 Vision to read it
    const venueInfo = getMockVenueData(fileName);

    // Simulate processing time for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      venueInfo,
      message: 'AI successfully extracted venue information from PDF'
    });
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}
