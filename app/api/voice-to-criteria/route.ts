import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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

    // Extract criteria from transcript
    const extractionMessage = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: `You are a wedding venue assistant that extracts wedding criteria from natural language.

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

Only include criteria that were mentioned. Use "Not specified" for missing information.`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: transcript,
        },
      ],
    });

    const extractedText = extractionMessage.content[0].type === 'text'
      ? extractionMessage.content[0].text
      : '';

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
