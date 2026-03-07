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

    const { mustHaves, niceToHaves, searchQuery } = parseCriteria(criteria);
    console.log('Must-haves:', mustHaves);
    console.log('Nice-to-haves:', niceToHaves);

    // Use GPT-4o to search the web and extract venue information
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a wedding venue research assistant. Search the web for wedding venues.

MUST-HAVE criteria are hard filters — only return venues that satisfy ALL of them.
NICE-TO-HAVE criteria are used for scoring — for each venue, count how many nice-to-haves it satisfies and return that as "niceToHaveScore" (0 to ${niceToHaves.length}).

For each venue, extract:
- name: Venue name
- email: Contact email from website
- website: Website URL
- location: Full address
- city: City name
- capacity: Max guest capacity (number)
- pricing: Price range in GBP (min/max if available)
- hasAccommodation: Has guest rooms (boolean)
- hasOutdoorSpace: Has outdoor space (boolean)
- cateringOptions: "in-house", "external", or "both"
- amenities: Array of amenities (parking, bar, etc.)
- aesthetic: Array of styles (rustic, modern, etc.)
- niceToHaveScore: number (how many nice-to-haves this venue satisfies)
- niceToHavesMatched: string[] (which nice-to-haves it satisfies)
- notes: Brief description

Return JSON with "venues" array of 15-20 venues that satisfy ALL must-haves, sorted by niceToHaveScore descending (highest score first).

CRITICAL: Only return venues that match the location specified in the must-haves.`
        },
        {
          role: "user",
          content: `Find wedding venues matching these requirements:

MUST-HAVES (all must be satisfied — use these to filter):
${mustHaves.join('\n')}

NICE-TO-HAVES (use these to score and sort — more matches = higher rank):
${niceToHaves.length > 0 ? niceToHaves.join('\n') : 'None specified'}

Return venues sorted by how many nice-to-haves they match (best match first).`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000
    });

    const result = completion.choices[0].message.content;
    const data = JSON.parse(result || '{}');

    console.log('Found venues:', data);

    const venues = data.venues || [];

    // Sort by niceToHaveScore descending (AI should already do this, but ensure it)
    venues.sort((a: any, b: any) => (b.niceToHaveScore || 0) - (a.niceToHaveScore || 0));

    return NextResponse.json({
      success: true,
      total: venues.length,
      venues: venues.map((v: any, index: number) => ({
        id: `scraped-${Date.now()}-${index}`,
        name: v.name,
        location: v.location,
        website: v.website || null,
        imageUrl: v.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop',
        type: 'country_estate',
        capacity: {
          min: v.capacity ? Math.floor(v.capacity * 0.5) : 50,
          max: v.capacity || 150
        },
        priceRange: {
          min: v.pricing?.min || 5000,
          max: v.pricing?.max || 15000
        },
        status: 'missing_info',
        matchScore: niceToHaves.length > 0
          ? Math.round(50 + ((v.niceToHaveScore || 0) / niceToHaves.length) * 50)
          : 85,
        features: v.amenities || [],
        niceToHavesMatched: v.niceToHavesMatched || [],
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

function parseCriteria(criteria: any): { mustHaves: string[]; niceToHaves: string[]; searchQuery: string } {
  if (typeof criteria === 'string') {
    // Split on Must-haves / Nice-to-haves sections if present
    const mustMatch = criteria.match(/Must-haves?:\s*([\s\S]*?)(?=Nice-to-haves?:|$)/i);
    const niceMatch = criteria.match(/Nice-to-haves?:\s*([\s\S]*?)$/i);

    const mustHaves = mustMatch
      ? mustMatch[1].split('\n').map((l: string) => l.trim()).filter(Boolean)
      : criteria.split('\n').map((l: string) => l.trim()).filter(Boolean);

    const niceToHaves = niceMatch
      ? niceMatch[1].split('\n').map((l: string) => l.trim()).filter(Boolean)
      : [];

    return { mustHaves, niceToHaves, searchQuery: mustHaves.join(', ') };
  }

  // Structured format (legacy)
  const mustHaves = [];
  const niceToHaves = [];

  if (criteria.hardCriteria?.location) mustHaves.push(`Location: ${criteria.hardCriteria.location}`);
  if (criteria.hardCriteria?.guestCount) mustHaves.push(`Guests: ${criteria.hardCriteria.guestCount}`);
  if (criteria.hardCriteria?.budget) mustHaves.push(`Budget: £${criteria.hardCriteria.budget}`);
  if (criteria.hardCriteria?.needsAccommodation) mustHaves.push('Accommodation required');
  if (criteria.hardCriteria?.cateringPreference) mustHaves.push(`Catering: ${criteria.hardCriteria.cateringPreference}`);
  if (criteria.softCriteria?.needsOutdoorSpace) niceToHaves.push('Outdoor space');
  if (criteria.softCriteria?.aestheticPreference) niceToHaves.push(criteria.softCriteria.aestheticPreference);

  return { mustHaves, niceToHaves, searchQuery: mustHaves.join(', ') };
}
