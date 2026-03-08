import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

// Step 1: GPT figures out venue names + match reasoning
async function getVenueNamesFromGPT(mustHaves: string[], niceToHaves: string[]) {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a wedding venue expert for the UK. Given search criteria, return a list of real, well-known wedding venues that match.

For each venue return:
- name: exact venue name (as it appears on Google)
- location: city/area (e.g. "London", "Cotswolds")
- reason: one sentence why it matches the criteria
- niceToHavesMatched: which nice-to-haves it satisfies
- niceToHaveScore: number of nice-to-haves matched
- estimatedCapacityMax: estimated max guest capacity
- estimatedPriceMin: estimated min price in GBP
- estimatedPriceMax: estimated max price in GBP
- type: one of country_estate, barn, hotel, garden, castle, vineyard

Return JSON: { "venues": [...] } with AT LEAST 25-30 venues sorted by niceToHaveScore descending. More is better — return as many real matching venues as you know.
Only return venues that satisfy ALL must-haves.`
      },
      {
        role: 'user',
        content: `Find wedding venues matching:

MUST-HAVES (all required):
${mustHaves.join('\n')}

NICE-TO-HAVES (for scoring):
${niceToHaves.length > 0 ? niceToHaves.join('\n') : 'None'}`
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  });
  const data = JSON.parse(completion.choices[0].message.content || '{}');
  return data.venues || [];
}

// Step 2: Google Places Find Place — get place_id from venue name + location
async function findPlaceId(name: string, location: string): Promise<string | null> {
  const query = encodeURIComponent(`${name} wedding venue ${location}`);
  const url = `${PLACES_BASE}/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_PLACES_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.candidates?.[0]?.place_id ?? null;
}

// Step 3: Google Places Details — get full data from place_id
async function getPlaceDetails(placeId: string) {
  const fields = 'name,formatted_address,formatted_phone_number,website,photos,rating,user_ratings_total,url';
  const url = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result ?? null;
}

// Get a usable photo URL from Google Places photo reference
function getPhotoUrl(photoReference: string, maxWidth = 800): string {
  return `${PLACES_BASE}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
}

export async function POST(request: NextRequest) {
  try {
    const { criteria } = await request.json();
    if (!criteria) return NextResponse.json({ success: false, error: 'No criteria provided' }, { status: 400 });

    const { mustHaves, niceToHaves, searchQuery } = parseCriteria(criteria);

    // Step 1: GPT finds venue names
    const gptVenues = await getVenueNamesFromGPT(mustHaves, niceToHaves);

    // Step 2 & 3: Enrich each venue with Google Places data
    const enriched = await Promise.all(
      gptVenues.map(async (v: any, index: number) => {
        try {
          let placeDetails = null;

          if (GOOGLE_PLACES_API_KEY) {
            const placeId = await findPlaceId(v.name, v.location);
            if (placeId) {
              placeDetails = await getPlaceDetails(placeId);
            }
          }

          // Merge GPT reasoning with Google Places data
          const allPhotoRefs = (placeDetails?.photos || [])
            .map((p: any) => p.photo_reference)
            .filter(Boolean);

          const photoUrl = allPhotoRefs.length > 0
            ? getPhotoUrl(allPhotoRefs[0], 1200)
            : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop';

          const website = placeDetails?.website || null;
          const phone = placeDetails?.formatted_phone_number || '';
          const address = placeDetails?.formatted_address || v.location;
          const rating = placeDetails?.rating || null;

          // Try to extract email from website domain as best guess
          // (Places API doesn't return emails — GPT fills this gap)
          const emailGuess = website
            ? `info@${new URL(website).hostname.replace('www.', '')}`
            : null;

          return {
            id: `venue-${Date.now()}-${index}`,
            name: placeDetails?.name || v.name,
            location: address,
            website,
            imageUrl: photoUrl,
            type: v.type || 'country_estate',
            capacity: {
              min: Math.floor((v.estimatedCapacityMax || 150) * 0.5),
              max: v.estimatedCapacityMax || 150,
            },
            priceRange: {
              min: v.estimatedPriceMin || 5000,
              max: v.estimatedPriceMax || 15000,
            },
            status: 'missing_info',
            matchScore: niceToHaves.length > 0
              ? Math.round(50 + ((v.niceToHaveScore || 0) / niceToHaves.length) * 50)
              : 85,
            features: v.niceToHavesMatched || [],
            niceToHavesMatched: v.niceToHavesMatched || [],
            googleRating: rating,
            googleMapsUrl: placeDetails?.url || null,
            googlePhotoRefs: allPhotoRefs,
            contact: {
              name: 'Events Team',
              email: emailGuess || '',
              phone,
            },
            notes: v.reason || '',
            missingInfoItems: [
              'Availability for your specific date',
              'Detailed pricing and packages',
              'Venue availability for site visit',
              'Dietary/catering options',
              'Setup and vendor policies',
            ],
          };
        } catch (err) {
          console.error(`Failed to enrich ${v.name}:`, err);
          // Fall back to GPT-only data if Places fails
          return {
            id: `venue-${Date.now()}-${index}`,
            name: v.name,
            location: v.location,
            website: null,
            imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop',
            type: v.type || 'country_estate',
            capacity: { min: Math.floor((v.estimatedCapacityMax || 150) * 0.5), max: v.estimatedCapacityMax || 150 },
            priceRange: { min: v.estimatedPriceMin || 5000, max: v.estimatedPriceMax || 15000 },
            status: 'missing_info',
            matchScore: niceToHaves.length > 0
              ? Math.round(50 + ((v.niceToHaveScore || 0) / niceToHaves.length) * 50)
              : 85,
            features: v.niceToHavesMatched || [],
            niceToHavesMatched: v.niceToHavesMatched || [],
            contact: { name: 'Events Team', email: '', phone: '' },
            notes: v.reason || '',
            missingInfoItems: [
              'Availability for your specific date',
              'Detailed pricing and packages',
              'Venue availability for site visit',
              'Dietary/catering options',
              'Setup and vendor policies',
            ],
          };
        }
      })
    );

    // Sort by matchScore descending
    enriched.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      total: enriched.length,
      venues: enriched,
      searchQuery,
      enrichedWithPlaces: !!GOOGLE_PLACES_API_KEY,
    });
  } catch (error: any) {
    console.error('Venue scraping error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to find venues' }, { status: 500 });
  }
}

function parseCriteria(criteria: any): { mustHaves: string[]; niceToHaves: string[]; searchQuery: string } {
  if (typeof criteria === 'string') {
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
