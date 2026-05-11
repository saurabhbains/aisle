import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { transcript, currentCriteria } = await req.json();

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const systemPrompt = `You are a wedding venue criteria parser. Extract structured information from natural language input about wedding requirements.

Current criteria already captured:
${currentCriteria || 'None yet'}

Parse the new input and extract each requirement on its own line. Prefix each line with [MUST] or [NICE]:
- [MUST] for anything stated as a firm requirement, fact, or necessity
- [NICE] only if the person explicitly used soft language like "nice to have", "it would be nice", "ideally", "if possible", "prefer", "optional"

Examples:
[MUST] Location: London
[MUST] Number of Guests: 100
[MUST] Budget: £10,000
[MUST] Date: July 2026
[NICE] Hotel nearby for accommodation
[NICE] Parking space for all cars

Only include information that was mentioned. Be concise and specific. One item per line.`;

    const openai = getOpenAIClient();
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
