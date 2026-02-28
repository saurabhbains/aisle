import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractCriteriaFromVoice } from '@/lib/ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as File;

    if (!audio) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
    });

    const transcribedText = transcription.text;

    // Extract structured criteria from transcription
    const criteria = await extractCriteriaFromVoice(transcribedText);

    return NextResponse.json({
      success: true,
      transcription: transcribedText,
      criteria,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
