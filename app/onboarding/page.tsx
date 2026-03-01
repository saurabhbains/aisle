'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Pencil, ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';

export default function OnboardingPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Text input state
  const [textInput, setTextInput] = useState('');
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);
  
  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Check if any input exists
  const hasInput = textInput.trim().length > 0 || audioRecorded || uploadedImages.length > 0;

  const handleTextContinue = () => {
    if (textInput.trim()) {
      dispatch({ type: 'SET_INPUT_MODE', payload: 'text' });
      proceedToNext();
    }
  };

  const handleRecordAudio = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setAudioRecorded(true);
    } else {
      // Start recording
      setIsRecording(true);
      setAudioRecorded(false);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedImages(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      setUploadedImages(prev => [...prev, ...imageFiles]);
    }
  };

  const proceedToNext = () => {
    dispatch({ type: 'SET_STEP', payload: 'criteria' });
    router.push('/criteria');
  };

  const handleNext = () => {
    if (hasInput) {
      // Determine primary input mode based on what was provided
      if (textInput.trim()) {
        dispatch({ type: 'SET_INPUT_MODE', payload: 'text' });
      } else if (audioRecorded) {
        dispatch({ type: 'SET_INPUT_MODE', payload: 'voice' });
      } else {
        dispatch({ type: 'SET_INPUT_MODE', payload: 'text' });
      }
      proceedToNext();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl font-semibold text-foreground md:text-5xl">
              Tell us what you're looking for
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Use words, voice, or images — whatever feels easiest.
            </p>
          </div>

          {/* Three Input Cards */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            {/* Text Card */}
            <Card className="border border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex flex-col items-center p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Pencil className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-4 font-serif text-lg font-semibold text-foreground">Text</h3>
                
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Describe your wedding, venue, vibe, constraints..."
                  className="mb-4 min-h-[100px] resize-none border-border bg-muted/30 text-sm placeholder:text-muted-foreground/60"
                />
                
                <Button
                  onClick={handleTextContinue}
                  disabled={!textInput.trim()}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Continue with text
                </Button>
              </CardContent>
            </Card>

            {/* Voice Card */}
            <Card className="border border-border bg-card shadow-sm transition-all hover:border-secondary/50 hover:shadow-md">
              <CardContent className="flex flex-col items-center p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                  <Mic className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="mb-4 font-serif text-lg font-semibold text-foreground">Voice</h3>
                
                <button
                  onClick={handleRecordAudio}
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                    isRecording 
                      ? 'animate-pulse bg-red-500' 
                      : audioRecorded 
                        ? 'bg-secondary' 
                        : 'bg-secondary/20 hover:bg-secondary/30'
                  }`}
                >
                  <Mic className={`h-7 w-7 ${isRecording ? 'text-white' : 'text-secondary'}`} />
                </button>
                
                <Button
                  onClick={handleRecordAudio}
                  className="mb-2 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {isRecording ? 'Stop recording' : audioRecorded ? 'Re-record' : 'Record audio'}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground">
                  You can stop and re-record
                </p>
              </CardContent>
            </Card>

            {/* Images Card */}
            <Card className="border border-border bg-card shadow-sm transition-all hover:border-muted-foreground/30 hover:shadow-md">
              <CardContent className="flex flex-col items-center p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mb-4 font-serif text-lg font-semibold text-foreground">Images</h3>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mb-4 flex h-[72px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : uploadedImages.length > 0 
                        ? 'border-secondary bg-secondary/5' 
                        : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onClick={handleImageUpload}
                >
                  {uploadedImages.length > 0 ? (
                    <p className="text-sm text-secondary">{uploadedImages.length} image(s) added</p>
                  ) : (
                    <>
                      <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Drop images here</p>
                    </>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button
                  onClick={handleImageUpload}
                  variant="outline"
                  className="mb-2 w-full border-muted-foreground/30 bg-muted text-foreground hover:bg-muted/80"
                >
                  Upload inspiration images
                </Button>
                
                <p className="text-center text-xs text-muted-foreground">
                  Pinterest screenshots welcome
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Next Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleNext}
              disabled={!hasInput}
              size="lg"
              className="min-w-[180px] bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
