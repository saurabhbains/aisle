import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedEmail } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { venueName, venueInfo, criteria, coupleName } = body;

    if (!venueName || !venueInfo || !criteria) {
      return NextResponse.json(
        { error: 'Missing required fields: venueName, venueInfo, criteria' },
        { status: 400 }
      );
    }

    const emailContent = await generatePersonalizedEmail(
      venueName,
      venueInfo,
      criteria,
      coupleName
    );

    return NextResponse.json({
      success: true,
      emailContent,
      subject: `Wedding Inquiry for ${criteria.date || 'upcoming date'} - ${coupleName || 'Couple'}`,
    });
  } catch (error: any) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate email' },
      { status: 500 }
    );
  }
}
