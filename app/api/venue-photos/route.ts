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

    // Resolve each photo ref to a final googleusercontent.com URL server-side
    const photos = await Promise.all(
      photoRefs.map(async (ref) => {
        try {
          const placesUrl = `${PLACES_BASE}/photo?maxwidth=1600&photoreference=${ref}&key=${GOOGLE_PLACES_API_KEY}`;
          const res = await fetch(placesUrl, { redirect: 'follow' });
          const finalUrl = res.url; // resolved lh3.googleusercontent.com URL
          // Build thumbnail by replacing the size param
          const thumbnailUrl = finalUrl.replace(/s1600-w\d+/, 's400-w400');
          return { url: finalUrl, thumbnail: thumbnailUrl };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({ photos: photos.filter(Boolean) });
  } catch (error: any) {
    console.error('Venue photos error:', error);
    return NextResponse.json({ photos: [] });
  }
}
