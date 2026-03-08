'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';

interface ParsedCriteria {
  mustHaves: string[];
  niceToHaves: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [isParsing, setIsParsing] = useState(false);
  const [isAnalysingImages, setIsAnalysingImages] = useState(false);
  const [parsed, setParsed] = useState<ParsedCriteria | null>(null);
  const [vibeKeywords, setVibeKeywords] = useState<string[]>([]);
  const [vibeSummary, setVibeSummary] = useState('');
  const parseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parseCriteriaRef = useRef<((text: string) => Promise<void>) | undefined>(undefined);

  const hasInput = textInput.trim().length > 0 || uploadedImages.length > 0;
  const hasCriteria = parsed !== null || vibeKeywords.length > 0;

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
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
        if (finalTranscript) accumulatedTranscriptRef.current += finalTranscript;
        setLiveTranscript(accumulatedTranscriptRef.current + interimTranscript);
      };

      recognitionRef.current.onend = () => {
        const final = accumulatedTranscriptRef.current;
        setLiveTranscript('');
        setIsRecording(false);
        accumulatedTranscriptRef.current = '';
        if (final.trim()) {
          setTextInput(prev => {
            const updated = prev ? prev + '\n' + final.trim() : final.trim();
            parseCriteriaRef.current?.(updated);
            return updated;
          });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsRecording(false);
        setLiveTranscript('');
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        }
      };
    }
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, []);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        alert('Error starting microphone: ' + error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setUploadedImages(prev => [...prev, ...newImages]);
      analyseImages([...uploadedImages, ...newImages]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const imageFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length) {
      setUploadedImages(prev => [...prev, ...imageFiles]);
      analyseImages([...uploadedImages, ...imageFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updated);
    if (updated.length > 0) {
      analyseImages(updated);
    } else {
      setVibeKeywords([]);
      setVibeSummary('');
    }
  };

  const analyseImages = async (images: File[]) => {
    if (!images.length) return;
    setIsAnalysingImages(true);
    try {
      const formData = new FormData();
      images.forEach(img => formData.append('images', img));
      const res = await fetch('/api/analyse-images', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setVibeKeywords(data.vibeKeywords || []);
        setVibeSummary(data.summary || '');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
    } finally {
      setIsAnalysingImages(false);
    }
  };

  const parseCriteria = async (text: string) => {
    if (!text.trim()) return;
    setIsParsing(true);
    try {
      const res = await fetch('/api/parse-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, currentCriteria: '' }),
      });
      const data = await res.json();
      if (data.success && data.parsedCriteria) {
        const lines = data.parsedCriteria
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);

        const mustHaves: string[] = [];
        const niceToHaves: string[] = [];

        lines.forEach((line: string) => {
          if (line.startsWith('[NICE]')) {
            niceToHaves.push(line.replace('[NICE]', '').trim());
          } else {
            // [MUST] or anything untagged → must-have
            mustHaves.push(line.replace('[MUST]', '').trim());
          }
        });

        setParsed({ mustHaves, niceToHaves });
      }
    } catch (error) {
      console.error('Parse error:', error);
    } finally {
      setIsParsing(false);
    }
  };

  // Keep ref pointing to latest parseCriteria
  useEffect(() => {
    parseCriteriaRef.current = parseCriteria;
  });

  // Auto-parse with debounce when text changes
  const handleTextChange = (value: string) => {
    setTextInput(value);
    if (parseDebounceRef.current) clearTimeout(parseDebounceRef.current);
    if (value.trim().length > 20) {
      parseDebounceRef.current = setTimeout(() => parseCriteria(value), 1200);
    }
  };

  const handleFindVenues = () => {
    // Build criteria array from parsed + vibe
    const mustHaveLines = parsed?.mustHaves || [];
    const niceToHaveLines = [
      ...(parsed?.niceToHaves || []),
      ...(vibeKeywords.length > 0 ? [`Venue vibe: ${vibeKeywords.join(', ')}`] : []),
    ];

    const criteriaArray = [
      ...mustHaveLines.map((line, idx) => ({
        id: `must-${idx}`,
        label: 'Must Have' as const,
        value: line,
        category: 'basics' as const,
        confirmed: false,
      })),
      ...niceToHaveLines.map((line, idx) => ({
        id: `nice-${idx}`,
        label: 'Nice to Have' as const,
        value: line,
        category: 'amenities' as const,
        confirmed: false,
      })),
    ];

    dispatch({ type: 'UPDATE_CRITERIA', payload: criteriaArray });
    dispatch({ type: 'SET_INPUT_MODE', payload: 'text' });
    dispatch({ type: 'SET_STEP', payload: 'criteria' });
    router.push('/criteria/recap');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />

      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-5xl">

          {/* Header */}
          <div className="mb-8 text-center sm:mb-10">
            <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
              Describe your perfect wedding
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
              Talk, type, or share inspiration images — Aisle will find venues that match your vision.
            </p>
          </div>

          {/* Input Panel */}
          <div className="rounded-2xl bg-[#FAF5F0] p-6">
            <div className="relative">
              <textarea
                value={textInput}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="e.g. I want a wedding in London in June 2026 for 100 guests with a budget of £15,000. Say 'nice to have' for preferences like outdoor space or parking — everything else becomes a must-have."
                className="h-40 w-full resize-none rounded-xl bg-white p-4 pr-14 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 border border-[#E8E0D8]"
              />
              <button
                onClick={handleToggleRecording}
                className={`absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  isRecording ? 'bg-red-100 text-red-500' : 'bg-[#F5F0EB] text-muted-foreground hover:bg-[#E8E0D8]'
                }`}
                aria-label="Toggle voice recording"
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>

            {/* Live transcript */}
            {(isRecording || liveTranscript) && (
              <div className="mt-3 rounded-lg border border-primary/20 bg-white/50 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" style={{ animationDelay: '0.2s' }}></span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  <span className="text-xs font-medium text-red-600">Recording...</span>
                </div>
                <p className="text-sm italic text-foreground/70">{liveTranscript || 'Listening...'}</p>
              </div>
            )}

            {/* Image upload */}
            <div className="mt-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-4 transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-[#E8E0D8] bg-[#FDF8F3] hover:border-muted-foreground/40'
                }`}
              >
                <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drop inspiration images or click to upload</p>
                <p className="text-xs text-muted-foreground/60">Pinterest screenshots welcome</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

              {/* Image thumbnails */}
              {uploadedImages.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {uploadedImages.map((file, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="h-16 w-16 rounded-lg object-cover" />
                      <button
                        onClick={() => handleRemoveImage(i)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {isAnalysingImages && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analysing vibe...
                    </div>
                  )}
                </div>
              )}

              {/* Vibe tags from images */}
              {vibeKeywords.length > 0 && !isAnalysingImages && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Detected vibe</p>
                  <div className="flex flex-wrap gap-2">
                    {vibeKeywords.map((kw, i) => (
                      <span key={i} className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-medium text-secondary">
                        {kw}
                      </span>
                    ))}
                  </div>
                  {vibeSummary && <p className="mt-2 text-xs text-muted-foreground italic">{vibeSummary}</p>}
                </div>
              )}
            </div>

            {/* Parsing indicator */}
            {isParsing && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Organising your criteria...
              </div>
            )}
          </div>

          {/* Parsed Criteria — two columns like the criteria page */}
          {parsed && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Must-haves */}
              <div className="rounded-2xl bg-[#FAF5F0] p-6">
                <h2 className="font-serif text-xl font-medium text-foreground">Must-haves</h2>
                <p className="mt-1 text-sm text-muted-foreground">Deal-breakers</p>
                <div className="relative mt-4">
                  <textarea
                    value={parsed.mustHaves.join('\n')}
                    onChange={(e) => setParsed(prev => prev ? { ...prev, mustHaves: e.target.value.split('\n') } : prev)}
                    className="h-48 w-full resize-none rounded-xl bg-[#FDF8F3] p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Nice-to-haves */}
              <div className="rounded-2xl bg-[#FAF5F0] p-6">
                <h2 className="font-serif text-xl font-medium text-foreground">Nice-to-haves</h2>
                <p className="mt-1 text-sm text-muted-foreground">Preferences, not strict filters</p>
                <div className="relative mt-4">
                  <textarea
                    value={[
                      ...parsed.niceToHaves,
                      ...(vibeKeywords.length > 0 ? [`Venue vibe: ${vibeKeywords.join(', ')}`] : []),
                    ].join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n');
                      // Keep vibe line separate
                      const nonVibe = lines.filter(l => !l.startsWith('Venue vibe:'));
                      setParsed(prev => prev ? { ...prev, niceToHaves: nonVibe } : prev);
                    }}
                    className="h-48 w-full resize-none rounded-xl bg-[#FDF8F3] p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Find Venues button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleFindVenues}
              disabled={!hasCriteria}
              size="lg"
              className="min-w-[200px] rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Find venues
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
