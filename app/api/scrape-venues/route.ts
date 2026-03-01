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

    // Use GPT-4o to search the web and extract venue information
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a wedding venue research assistant. Search the web for wedding venues matching the user's criteria.

For each venue, extract:
- name: Venue name
- email: Contact email from website
- website: Website URL
- location: Full address
- city: City name
- capacity: Max guest capacity (number)
- pricing: Price range in GBP (min/max if available)
- hasAccommodation: Has guest rooms (boolean)
- accommodationRooms: Number of rooms
- hasOutdoorSpace: Has outdoor space (boolean)
- cateringOptions: "in-house", "external", or "both"
- amenities: Array of amenities (parking, bar, etc.)
- aesthetic: Array of styles (rustic, modern, etc.)
- notes: Brief description

Return JSON with "venues" array. Find 8-12 venues that CLOSELY MATCH the criteria (especially location).

CRITICAL: Only return venues that match the location specified in the criteria. If they ask for London, only return London venues.`
        },
        {
          role: "user",
          content: `Find wedding venues for: ${searchQuery}

IMPORTANT: Pay close attention to the LOCATION requirement. Only return venues in the specified area.

Return JSON with all venue details.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000  // Limit tokens for faster response
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
        id: `scraped-${Date.now()}-${index}`,
        name: v.name,
        location: v.location,
        imageUrl: v.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop',
        type: 'country_estate', // Default type
        capacity: {
          min: v.capacity ? Math.floor(v.capacity * 0.5) : 50,
          max: v.capacity || 150
        },
        priceRange: {
          min: v.pricing?.min || 5000,
          max: v.pricing?.max || 15000
        },
        status: 'missing_info',
        matchScore: 85,
        features: v.amenities || [],
        contact: v.email || v.website ? {
          name: 'Events Team',
          email: v.email || 'info@venue.com',
          phone: v.phone || ''
        } : undefined,
        missingInfoItems: [
          'Availability for your specific date',
          'Detailed pricing and packages',
          'Venue availability for site visit',
          'Dietary/catering options',
          'Setup and vendor policies'
        ]
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
  // If criteria is a string (raw text from recap page), parse it
  if (typeof criteria === 'string') {
    return `UK wedding venues matching: ${criteria}`;
  }

  // Otherwise use the structured format
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
