'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';

export default function VoiceInputPage() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPiece + ' ';
            } else {
              interimTranscript += transcriptPiece;
            }
          }

          setTranscript(finalTranscript + interimTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError('Speech recognition error. Please try again.');
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          if (isRecording) {
            // Recognition stopped but we're still in recording mode
            setIsRecording(false);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');

      if (!recognitionRef.current) {
        setError('Speech recognition not supported in this browser. Please use Chrome or Safari.');
        return;
      }

      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Could not start recording. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);

      // Process the transcript
      await processTranscript(transcript);
    }
  };

  const processTranscript = async (text: string) => {
    try {
      if (!text.trim()) {
        setError('No speech detected. Please try again.');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/voice-to-criteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to process transcript');
      }

      const data = await response.json();

      // Update criteria in context
      if (data.criteria) {
        dispatch({ type: 'UPDATE_CRITERIA', payload: data.criteria });
      }

      // Navigate to criteria review page
      setTimeout(() => {
        dispatch({ type: 'SET_STEP', payload: 'criteria' });
        router.push('/criteria');
      }, 1500);
    } catch (err) {
      console.error('Error processing transcript:', err);
      setError('Failed to process your recording. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar title="Voice Input" showBack backHref="/onboarding" />

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Tell Us About Your Dream Wedding
            </h1>
            <p className="mt-2 text-muted-foreground">
              Speak naturally about your preferences, budget, guest count, and style
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-12">
              <div className="flex flex-col items-center">
                {/* Microphone Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`relative mb-8 flex h-40 w-40 items-center justify-center rounded-full transition-all ${
                    isRecording
                      ? 'animate-pulse bg-red-500 hover:bg-red-600'
                      : isProcessing
                      ? 'bg-gray-400'
                      : 'bg-primary hover:bg-primary/90 hover:scale-105'
                  } shadow-lg disabled:opacity-50`}
                >
                  {isProcessing ? (
                    <Loader2 className="h-16 w-16 animate-spin text-white" />
                  ) : isRecording ? (
                    <Square className="h-16 w-16 text-white" />
                  ) : (
                    <Mic className="h-16 w-16 text-white" />
                  )}

                  {/* Recording indicator */}
                  {isRecording && (
                    <span className="absolute -top-2 -right-2 flex h-6 w-6">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-6 w-6 rounded-full bg-red-500"></span>
                    </span>
                  )}
                </button>

                {/* Status Text */}
                <div className="text-center">
                  {isProcessing && (
                    <p className="text-lg font-medium text-foreground">
                      Processing your recording...
                    </p>
                  )}
                  {isRecording && (
                    <p className="text-lg font-medium text-foreground">
                      Recording... Tap to stop
                    </p>
                  )}
                  {!isRecording && !isProcessing && !transcript && (
                    <p className="text-lg font-medium text-muted-foreground">
                      Tap the microphone to start
                    </p>
                  )}
                  {transcript && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium text-primary">
                        Transcript:
                      </p>
                      <p className="rounded-lg bg-muted p-4 text-foreground">
                        {transcript}
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-6 w-full rounded-lg bg-red-50 p-4 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Example prompts */}
                {!isRecording && !isProcessing && !transcript && (
                  <div className="mt-8 w-full rounded-lg bg-muted p-6">
                    <p className="mb-3 text-sm font-medium text-foreground">
                      Try saying something like:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        "We're planning a wedding in July 2025 in Brighton for 100 guests with a budget of £15,000"
                      </li>
                      <li>
                        "Looking for an outdoor venue with a rustic vibe that can accommodate 80 people"
                      </li>
                      <li>
                        "Need a modern venue in London with in-house catering for 150 guests"
                      </li>
                    </ul>
                  </div>
                )}

                {/* Skip to text input */}
                {!isRecording && !isProcessing && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/criteria')}
                    className="mt-6"
                  >
                    Skip to Text Input
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
