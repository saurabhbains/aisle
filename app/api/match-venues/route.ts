import { NextRequest, NextResponse } from 'next/server';
import { getAllVenues } from '@/lib/venue-database';
import { matchVenuesToCriteria, Criteria } from '@/lib/venue-matcher';

export async function POST(request: NextRequest) {
  try {
    const { criteria, venues } = await request.json();

    if (!criteria) {
      return NextResponse.json(
        { error: 'Criteria required' },
        { status: 400 }
      );
    }

    // Use provided venues (from web scraping) or fall back to mock database for demo
    const allVenues = venues && venues.length > 0 ? venues : getAllVenues();
    console.log(`Matching ${allVenues.length} venues to criteria`);

    // Match venues to criteria
    const matchedVenues = matchVenuesToCriteria(allVenues, criteria as Criteria);

    return NextResponse.json({
      success: true,
      totalVenues: allVenues.length,
      matchedVenues: matchedVenues.length,
      results: matchedVenues
    });
  } catch (error: any) {
    console.error('Venue matching error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to match venues' },
      { status: 500 }
    );
  }
}
