import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { venueId, responseText } = await request.json();

    if (!venueId) {
      return NextResponse.json(
        { success: false, error: 'No venue ID provided' },
        { status: 400 }
      );
    }

    if (!responseText || !responseText.trim()) {
      return NextResponse.json(
        { success: false, error: 'No response text provided' },
        { status: 400 }
      );
    }

    console.log(`Processing response for venue ${venueId}`);

    const openai = getOpenAIClient();

    // Use GPT-4o to extract information from the venue's response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a wedding venue information extraction assistant. Extract all relevant information from a venue's email response.

Extract and structure the following information:
- availability: Any mentions of dates, seasons, or availability status
- pricing: Venue hire cost, per-person costs, total estimates, what's included
- capacity: Minimum, maximum, and recommended guest counts
- catering: Catering options (in-house, external, both), dietary options, notes
- amenities: List all amenities, facilities, services mentioned
- siteVisit: Site visit availability, dates, times
- contactPerson: Name of the contact person
- contactEmail: Email address
- contactPhone: Phone number

Return JSON with an "extractedInfo" object containing all extracted information. Be thorough and extract every detail mentioned.`
        },
        {
          role: "user",
          content: `Extract information from this venue response:\n\n${responseText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = completion.choices[0].message.content;
    const extractedData = JSON.parse(result || '{}');

    const mockResponseData = {
      responseDate: new Date().toISOString(),
      extractedInfo: extractedData.extractedInfo || extractedData
    };

    return NextResponse.json({
      success: true,
      venueId,
      response: mockResponseData,
      message: 'AI successfully processed venue response and extracted all missing information'
    });
  } catch (error: any) {
    console.error('Simulate response error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to simulate response' },
      { status: 500 }
    );
  }
}
