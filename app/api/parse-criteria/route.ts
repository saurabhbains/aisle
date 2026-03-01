import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { transcript, currentCriteria } = await req.json();

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const systemPrompt = `You are a wedding venue criteria parser. Extract structured information from natural language input about wedding requirements.

Current criteria already captured:
${currentCriteria || 'None yet'}

Parse the new input and extract:
- Location (city/region)
- Number of guests
- Budget (with currency)
- Date/season preferences
- Venue type preferences (outdoor, indoor, garden, barn, etc.)
- Any other specific requirements

Format the output as a clean bullet list with one requirement per line, like:
Location: London
Number of Guests: 100
Budget: £100,000
Season: Summer 2025
Venue Style: Outdoor garden

Only include information that was mentioned. Be concise and specific.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript }
      ],
      temperature: 0.3,
    });

    const parsedCriteria = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      parsedCriteria: parsedCriteria.trim(),
    });
  } catch (error: any) {
    console.error('Error parsing criteria:', error);
    return NextResponse.json(
      { error: 'Failed to parse criteria: ' + error.message },
      { status: 500 }
    );
  }
}
