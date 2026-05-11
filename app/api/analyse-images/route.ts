import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files.length) {
      return NextResponse.json({ success: false, error: 'No images provided' }, { status: 400 });
    }

    const openai = getOpenAIClient();
    const imageMessages = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return {
          type: 'image_url' as const,
          image_url: { url: `data:${file.type};base64,${base64}` },
        };
      })
    );

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            ...imageMessages,
            {
              type: 'text',
              text: `You are a wedding venue style expert. Analyse these inspiration images and extract aesthetic attributes that describe the venue vibe.

Return JSON with:
{
  "vibeKeywords": string[],
  "summary": string
}

vibeKeywords: 4-8 short descriptive words/phrases e.g. "rustic barn", "outdoor garden", "candlelit", "stone walls", "bohemian", "modern minimalist", "coastal", "woodland".
summary: one short sentence describing the overall aesthetic e.g. "Romantic outdoor garden with rustic, candlelit atmosphere".

Focus on: setting (indoor/outdoor), architectural style, lighting, natural elements, overall mood.`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Image analysis error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
