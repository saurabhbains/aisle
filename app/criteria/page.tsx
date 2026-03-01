'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';

export default function CriteriaPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [mustHaves, setMustHaves] = useState('');
  const [niceToHaves, setNiceToHaves] = useState('');
  const [isRecordingMust, setIsRecordingMust] = useState(false);
  const [isRecordingNice, setIsRecordingNice] = useState(false);
  const [liveTranscriptMust, setLiveTranscriptMust] = useState('');
  const [liveTranscriptNice, setLiveTranscriptNice] = useState('');
  const recognitionMustRef = useRef<any>(null);
  const recognitionNiceRef = useRef<any>(null);
  const accumulatedTranscriptMustRef = useRef<string>('');
  const accumulatedTranscriptNiceRef = useRef<string>('');

  const mustHavesPlaceholder = `Example: Outdoor ceremony space
Example: Capacity for 150+ guests
Example: Within 30 miles of downtown
Example: Available on June 15, 2025`;

  const niceToHavesPlaceholder = `Example: Garden or vineyard setting
Example: On-site catering available
Example: Bridal suite included
Example: Rustic or barn aesthetic`;

  // Initialize speech recognition on mount
  useEffect(() => {
    console.log('Criteria page mounted');
    console.log('Window available:', typeof window !== 'undefined');
    console.log('webkitSpeechRecognition available:', typeof window !== 'undefined' && 'webkitSpeechRecognition' in window);

    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      console.log('Initializing speech recognition...');
      // Must-haves recognition
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionMustRef.current = new SpeechRecognition();
      recognitionMustRef.current.continuous = true;
      recognitionMustRef.current.interimResults = true;

      recognitionMustRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Accumulate final results in ref
        if (finalTranscript) {
          accumulatedTranscriptMustRef.current += finalTranscript;
        }

        // Show live transcript for UI feedback
        setLiveTranscriptMust(accumulatedTranscriptMustRef.current + interimTranscript);
      };

      recognitionMustRef.current.onend = async () => {
        const finalTranscript = accumulatedTranscriptMustRef.current;
        setLiveTranscriptMust('');
        setIsRecordingMust(false);
        accumulatedTranscriptMustRef.current = ''; // Reset for next recording
        console.log('Recording ended for must-haves');
        console.log('Final accumulated transcript:', finalTranscript);

        // Parse the transcript with AI
        if (finalTranscript && finalTranscript.trim()) {
          console.log('Parsing transcript with AI...');
          try {
            const response = await fetch('/api/parse-criteria', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transcript: finalTranscript,
                currentCriteria: mustHaves
              })
            });

            const data = await response.json();
            if (data.success && data.parsedCriteria) {
              console.log('AI parsed criteria:', data.parsedCriteria);
              setMustHaves(prev => prev ? prev + '\n\n' + data.parsedCriteria : data.parsedCriteria);
            }
          } catch (error) {
            console.error('Error parsing criteria:', error);
          }
        }
      };

      recognitionMustRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecordingMust(false);
        setLiveTranscriptMust('');
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else {
          alert('Speech recognition error: ' + event.error);
        }
      };

      recognitionMustRef.current.onstart = () => {
        console.log('Speech recognition started for must-haves');
      };

      // Nice-to-haves recognition
      recognitionNiceRef.current = new SpeechRecognition();
      recognitionNiceRef.current.continuous = true;
      recognitionNiceRef.current.interimResults = true;

      recognitionNiceRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Accumulate final results in ref
        if (finalTranscript) {
          accumulatedTranscriptNiceRef.current += finalTranscript;
        }

        // Show live transcript for UI feedback
        setLiveTranscriptNice(accumulatedTranscriptNiceRef.current + interimTranscript);
      };

      recognitionNiceRef.current.onend = async () => {
        const finalTranscript = accumulatedTranscriptNiceRef.current;
        setLiveTranscriptNice('');
        setIsRecordingNice(false);
        accumulatedTranscriptNiceRef.current = ''; // Reset for next recording
        console.log('Recording ended for nice-to-haves');
        console.log('Final accumulated transcript:', finalTranscript);

        // Parse the transcript with AI
        if (finalTranscript && finalTranscript.trim()) {
          console.log('Parsing transcript with AI...');
          try {
            const response = await fetch('/api/parse-criteria', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transcript: finalTranscript,
                currentCriteria: niceToHaves
              })
            });

            const data = await response.json();
            if (data.success && data.parsedCriteria) {
              console.log('AI parsed criteria:', data.parsedCriteria);
              setNiceToHaves(prev => prev ? prev + '\n\n' + data.parsedCriteria : data.parsedCriteria);
            }
          } catch (error) {
            console.error('Error parsing criteria:', error);
          }
        }
      };

      recognitionNiceRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecordingNice(false);
        setLiveTranscriptNice('');
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else {
          alert('Speech recognition error: ' + event.error);
        }
      };

      recognitionNiceRef.current.onstart = () => {
        console.log('Speech recognition started for nice-to-haves');
      };
    }

    return () => {
      if (recognitionMustRef.current) {
        recognitionMustRef.current.stop();
      }
      if (recognitionNiceRef.current) {
        recognitionNiceRef.current.stop();
      }
    };
  }, []);

  const handleRecordMust = () => {
    if (!recognitionMustRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecordingMust) {
      recognitionMustRef.current.stop();
      setIsRecordingMust(false);
    } else {
      try {
        recognitionMustRef.current.start();
        setIsRecordingMust(true);
        console.log('Started recording for must-haves');
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('Error starting microphone: ' + error);
      }
    }
  };

  const handleRecordNice = () => {
    if (!recognitionNiceRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecordingNice) {
      recognitionNiceRef.current.stop();
      setIsRecordingNice(false);
    } else {
      try {
        recognitionNiceRef.current.start();
        setIsRecordingNice(true);
        console.log('Started recording for nice-to-haves');
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('Error starting microphone: ' + error);
      }
    }
  };

  const handleBack = () => {
    router.push('/onboarding');
  };

  const handleReviewCriteria = () => {
    // Convert text input to Criteria[] format
    const mustHaveLines = mustHaves.split('\n').filter(line => line.trim());
    const niceToHaveLines = niceToHaves.split('\n').filter(line => line.trim());

    const criteriaArray = [
      ...mustHaveLines.map((line, idx) => ({
        id: `must-${idx}`,
        label: 'Must Have',
        value: line.trim(),
        category: 'basics' as const,
        confirmed: false,
      })),
      ...niceToHaveLines.map((line, idx) => ({
        id: `nice-${idx}`,
        label: 'Nice to Have',
        value: line.trim(),
        category: 'amenities' as const,
        confirmed: false,
      })),
    ];

    // Save the criteria to context
    dispatch({
      type: 'UPDATE_CRITERIA',
      payload: criteriaArray,
    });
    router.push('/criteria/recap');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />

      <main className="flex flex-1 flex-col px-6 py-8">
        <div className="mx-auto w-full max-w-5xl flex-1">
          {/* Fill in form option - top right */}
          <div className="mb-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => router.push('/criteria/form')}
              className="gap-2 rounded-full border-border bg-card text-sm text-muted-foreground hover:bg-muted"
            >
              <FileText className="h-4 w-4" />
              Fill in a form instead
            </Button>
          </div>

          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="font-serif text-4xl font-semibold text-foreground">
              Your criteria
            </h1>
            <p className="mt-3 text-muted-foreground">
              What's non-negotiable vs nice-to-have
            </p>
          </div>

          {/* Two Column Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Must-haves Card */}
            <div className="rounded-2xl bg-[#FAF5F0] p-6">
              <h2 className="font-serif text-xl font-medium text-foreground">
                Must-haves
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Deal-breakers
              </p>

              <div className="relative mt-4">
                <textarea
                  value={mustHaves}
                  onChange={(e) => setMustHaves(e.target.value)}
                  placeholder={mustHavesPlaceholder}
                  className="h-64 w-full resize-none rounded-xl bg-[#FDF8F3] p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleRecordMust}
                  className={`absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    isRecordingMust
                      ? 'bg-red-100 text-red-500'
                      : 'bg-[#F5F0EB] text-muted-foreground hover:bg-[#E8E0D8]'
                  }`}
                  aria-label="Record voice input"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>

              {/* Live Transcript */}
              {(isRecordingMust || liveTranscriptMust) && (
                <div className="mt-3 rounded-lg bg-white/50 p-3 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" style={{animationDelay: '0.2s'}}></span>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
                    <span className="text-xs font-medium text-red-600">Recording...</span>
                  </div>
                  <p className="text-sm text-foreground/70 italic">
                    {liveTranscriptMust || 'Listening...'}
                  </p>
                </div>
              )}
            </div>

            {/* Nice-to-haves Card */}
            <div className="rounded-2xl bg-[#FAF5F0] p-6">
              <h2 className="font-serif text-xl font-medium text-foreground">
                Nice-to-haves
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Preferences, not strict filters
              </p>

              <div className="relative mt-4">
                <textarea
                  value={niceToHaves}
                  onChange={(e) => setNiceToHaves(e.target.value)}
                  placeholder={niceToHavesPlaceholder}
                  className="h-64 w-full resize-none rounded-xl bg-[#FDF8F3] p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleRecordNice}
                  className={`absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    isRecordingNice 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-[#F5F0EB] text-muted-foreground hover:bg-[#E8E0D8]'
                  }`}
                  aria-label="Record voice input"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>

              {/* Live Transcript */}
              {(isRecordingNice || liveTranscriptNice) && (
                <div className="mt-3 rounded-lg bg-white/50 p-3 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" style={{animationDelay: '0.2s'}}></span>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
                    <span className="text-xs font-medium text-red-600">Recording...</span>
                  </div>
                  <p className="text-sm text-foreground/70 italic">
                    {liveTranscriptNice || 'Listening...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="border-t border-border bg-background px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="min-w-28 rounded-full border-border bg-card text-foreground hover:bg-muted"
          >
            Back
          </Button>
          <Button
            onClick={handleReviewCriteria}
            className="min-w-40 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Review criteria
          </Button>
        </div>
      </div>
    </div>
  );
}
