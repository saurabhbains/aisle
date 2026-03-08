import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const location = searchParams.get('location');
  const photoRefsParam = searchParams.get('photoRefs');

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ photos: [] });
  }

  try {
    let photoRefs: string[] = [];

    // If we already have photo refs stored, use them directly
    if (photoRefsParam) {
      photoRefs = photoRefsParam.split(',').filter(Boolean);
    } else if (name) {
      // Otherwise look up the place
      const query = encodeURIComponent(`${name} wedding venue ${location || ''}`);
      const findUrl = `${PLACES_BASE}/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${GOOGLE_PLACES_API_KEY}`;
      const findRes = await fetch(findUrl);
      const findData = await findRes.json();
      const placeId = findData.candidates?.[0]?.place_id;

      if (placeId) {
        const detailUrl = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_PLACES_API_KEY}`;
        const detailRes = await fetch(detailUrl);
        const detailData = await detailRes.json();
        photoRefs = (detailData.result?.photos || []).map((p: any) => p.photo_reference).filter(Boolean);
      }
    }

    // Build photo URLs — use maxwidth=1600 for high quality
    const photos = photoRefs.map((ref) => ({
      url: `${PLACES_BASE}/photo?maxwidth=1600&photoreference=${ref}&key=${GOOGLE_PLACES_API_KEY}`,
      thumbnail: `${PLACES_BASE}/photo?maxwidth=400&photoreference=${ref}&key=${GOOGLE_PLACES_API_KEY}`,
    }));

    return NextResponse.json({ photos });
  } catch (error: any) {
    console.error('Venue photos error:', error);
    return NextResponse.json({ photos: [] });
  }
}
