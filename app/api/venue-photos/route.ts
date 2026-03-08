import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const location = searchParams.get('location');
  const photoRefsParam = searchParams.get('photoRefs');
  const proxyRef = searchParams.get('proxyRef'); // single ref to proxy
  const size = searchParams.get('size') || '1600';

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ photos: [] });
  }

  // Proxy mode — fetch the actual image and stream it back
  // This avoids CORS/redirect issues in the browser
  if (proxyRef) {
    const photoUrl = `${PLACES_BASE}/photo?maxwidth=${size}&photoreference=${proxyRef}&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(photoUrl, { redirect: 'follow' });
    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  try {
    let photoRefs: string[] = [];

    if (photoRefsParam) {
      photoRefs = photoRefsParam.split(',').filter(Boolean);
    } else if (name) {
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

    // Return proxy URLs — use relative paths so they work on any domain
    const photos = photoRefs.map((ref) => ({
      url: `/api/venue-photos?proxyRef=${encodeURIComponent(ref)}&size=1600`,
      thumbnail: `/api/venue-photos?proxyRef=${encodeURIComponent(ref)}&size=400`,
    }));

    return NextResponse.json({ photos });
  } catch (error: any) {
    console.error('Venue photos error:', error);
    return NextResponse.json({ photos: [] });
  }
}
