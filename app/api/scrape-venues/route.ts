import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { criteria } = await request.json();

    if (!criteria) {
      return NextResponse.json(
        { success: false, error: 'No criteria provided' },
        { status: 400 }
      );
    }

    console.log('Scraping venues with criteria:', criteria);

    const openai = getOpenAIClient();

    // Build search query from criteria
    const searchQuery = buildSearchQuery(criteria);
    console.log('Search query:', searchQuery);

    // Use GPT-4 to search the web and extract venue information
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a wedding venue research assistant. Search the web for wedding venues matching the user's criteria and extract detailed information.

For each venue, extract:
- name: Venue name
- email: Contact email (look for "weddings@", "events@", "enquiries@", "info@" or similar)
- website: Website URL
- location: Full address
- city: City name
- capacity: Maximum guest capacity (number)
- pricing: Pricing range if available (min and max in GBP)
- hasAccommodation: Whether they have guest rooms (boolean)
- accommodationRooms: Number of rooms if available
- hasOutdoorSpace: Whether they have outdoor ceremony/reception space
- cateringOptions: "in-house", "external", or "both"
- cateringTypes: Array of dietary options (halal, kosher, vegetarian, vegan, etc.)
- amenities: Array of amenities (parking, bar, dance floor, etc.)
- aesthetic: Array of style keywords (rustic, modern, barn, manor, etc.)
- notes: Brief description

Return as JSON array of venues. Find at least 10-20 venues.

IMPORTANT: You must find REAL email addresses from the venue websites. Look in contact pages, wedding inquiry forms, etc.`
        },
        {
          role: "user",
          content: `Find wedding venues matching these criteria:

${searchQuery}

Search the web for real UK wedding venues. Extract their email addresses from their websites (contact pages, wedding inquiry forms, etc.).

Return JSON array of venues with all the information I requested.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0].message.content;
    const data = JSON.parse(result || '{}');

    console.log('Found venues:', data);

    // The response should have a "venues" array
    const venues = data.venues || [];

    return NextResponse.json({
      success: true,
      total: venues.length,
      venues: venues.map((v: any, index: number) => ({
        ...v,
        id: `scraped-${Date.now()}-${index}`,
        status: 'not_contacted'
      })),
      searchQuery
    });
  } catch (error: any) {
    console.error('Venue scraping error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to scrape venues' },
      { status: 500 }
    );
  }
}

function buildSearchQuery(criteria: any): string {
  const parts = [];

  if (criteria.hardCriteria?.location) {
    parts.push(`in ${criteria.hardCriteria.location}`);
  }

  if (criteria.hardCriteria?.guestCount) {
    parts.push(`capacity ${criteria.hardCriteria.guestCount}+ guests`);
  }

  if (criteria.hardCriteria?.budget) {
    parts.push(`under £${criteria.hardCriteria.budget}`);
  }

  if (criteria.hardCriteria?.needsAccommodation) {
    parts.push('with accommodation');
  }

  if (criteria.hardCriteria?.cateringPreference) {
    parts.push(`${criteria.hardCriteria.cateringPreference} catering`);
  }

  if (criteria.softCriteria?.needsOutdoorSpace) {
    parts.push('outdoor space');
  }

  if (criteria.softCriteria?.aestheticPreference) {
    parts.push(criteria.softCriteria.aestheticPreference);
  }

  return `UK wedding venues ${parts.join(', ')}`;
}
