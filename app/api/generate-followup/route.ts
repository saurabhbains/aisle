import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { venueName, missingInfo, contactName } = body;

    // Validate required fields
    if (!venueName || typeof venueName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid venue name is required' },
        { status: 400 }
      );
    }

    if (!missingInfo || !Array.isArray(missingInfo) || missingInfo.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one missing information item is required' },
        { status: 400 }
      );
    }

    // Validate missingInfo array items
    if (!missingInfo.every(item => typeof item === 'string' && item.trim().length > 0)) {
      return NextResponse.json(
        { success: false, error: 'All missing information items must be non-empty strings' },
        { status: 400 }
      );
    }

    // Get OpenAI client
    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        { success: false, error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional email writer helping couples plan their wedding. Generate a polite, warm follow-up email to a wedding venue.

The couple has already received an initial response from the venue, but some important information is still missing. Your job is to craft a brief, friendly follow-up email that:

1. Thanks them for their previous response
2. Mentions you're very interested in their venue
3. Politely asks for the specific missing information
4. Keeps a warm, professional tone
5. Is concise (no more than 3-4 short paragraphs)

Sign the email as "Sarah & John".

Return ONLY the email body text, no subject line.`
        },
        {
          role: "user",
          content: `Generate a follow-up email to ${venueName}.

Contact person: ${contactName || 'Events Team'}

Missing information we need:
${missingInfo.map((item: string) => `- ${item}`).join('\n')}

Keep it warm, brief, and professional.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const emailContent = completion.choices[0]?.message?.content;

    // Validate AI response
    if (!emailContent || emailContent.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'AI failed to generate email content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailContent: emailContent.trim()
    });
  } catch (error: any) {
    console.error('Generate follow-up error:', error);

    // Handle specific error types
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { success: false, error: 'Unable to connect to AI service' },
        { status: 503 }
      );
    }

    if (error.status === 401) {
      return NextResponse.json(
        { success: false, error: 'AI service authentication failed' },
        { status: 503 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { success: false, error: 'AI service rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate follow-up email' },
      { status: 500 }
    );
  }
}
