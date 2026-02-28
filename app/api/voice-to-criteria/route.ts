import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transcript = body.transcript;

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // Extract criteria from transcript using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a wedding venue assistant that extracts wedding criteria from natural language.

Extract the following information from the user's description:
- Date / Month / Season
- Location / Region
- Guest count
- Budget
- Venue style (rustic, modern, elegant, etc.)
- Indoor/Outdoor preference
- Catering needs (in-house, external, etc.)
- Accommodation needs
- Accessibility requirements
- Any other special requirements

Return the information in this JSON format:
{
  "criteria": [
    {
      "id": "date",
      "category": "basics",
      "label": "Wedding Date",
      "value": "extracted value",
      "confirmed": false
    },
    {
      "id": "location",
      "category": "basics",
      "label": "Location",
      "value": "extracted value",
      "confirmed": false
    },
    {
      "id": "guests",
      "category": "basics",
      "label": "Guest Count",
      "value": "extracted value",
      "confirmed": false
    },
    {
      "id": "budget",
      "category": "basics",
      "label": "Budget",
      "value": "extracted value",
      "confirmed": false
    },
    {
      "id": "style",
      "category": "style",
      "label": "Venue Style",
      "value": "extracted value",
      "confirmed": false
    },
    {
      "id": "indoor-outdoor",
      "category": "style",
      "label": "Indoor/Outdoor",
      "value": "extracted value",
      "confirmed": false
    },
    {
      "id": "catering",
      "category": "amenities",
      "label": "Catering",
      "value": "extracted value",
      "confirmed": false
    }
  ]
}

Only include criteria that were mentioned. Use "Not specified" for missing information. Return ONLY the JSON, no other text.`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.3,
    });

    const extractedText = completion.choices[0].message.content || '';

    // Parse JSON from response
    const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
    const criteriaData = jsonMatch ? JSON.parse(jsonMatch[0]) : { criteria: [] };

    return NextResponse.json({
      success: true,
      transcript,
      criteria: criteriaData.criteria,
    });
  } catch (error: any) {
    console.error('Error processing voice input:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process voice input' },
      { status: 500 }
    );
  }
}
