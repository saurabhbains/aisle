'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MessageSquare, Sparkles, Heart, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressIndicator } from '@/components/progress-indicator';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

const steps = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'input-mode', label: 'Input Mode' },
];

const features = [
  {
    icon: Heart,
    title: 'Personalized Matches',
    description: 'AI-powered venue recommendations based on your unique preferences',
  },
  {
    icon: Calendar,
    title: 'Effortless Scheduling',
    description: 'Book calls and visits with venues seamlessly',
  },
  {
    icon: MapPin,
    title: 'Smart Tracking',
    description: 'Keep track of all your venue interactions in one place',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'voice' | 'text' | null>(null);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleModeSelect = (mode: 'voice' | 'text') => {
    setSelectedMode(mode);
  };

  const handleComplete = () => {
    if (selectedMode) {
      dispatch({ type: 'SET_INPUT_MODE', payload: selectedMode });
      if (selectedMode === 'voice') {
        router.push('/voice-input');
      } else {
        dispatch({ type: 'SET_STEP', payload: 'criteria' });
        router.push('/criteria');
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            className="mb-12"
          />

          {/* Welcome Screen */}
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-500">
              <div className="mb-8">
                <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
                  Welcome to <span className="text-primary">Aisle</span>
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Your AI-powered wedding venue assistant
                </p>
              </div>

              <div className="mb-12 grid gap-6 md:grid-cols-3">
                {features.map((feature, index) => (
                  <Card key={index} className="border-0 bg-card shadow-sm">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 font-serif text-lg font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleNext}
                size="lg"
                className="min-w-48 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* How It Works Screen */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-500">
              <div className="mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                  <Sparkles className="h-8 w-8 text-secondary" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-foreground">
                  How Aisle Works
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Finding your perfect venue in three simple steps
                </p>
              </div>

              <div className="mb-12 space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Tell us your preferences',
                    description: 'Share your wedding vision, guest count, budget, and style preferences',
                  },
                  {
                    step: 2,
                    title: 'We find the perfect matches',
                    description: 'Our AI analyzes thousands of venues to find your ideal options',
                  },
                  {
                    step: 3,
                    title: 'Connect with venues',
                    description: 'Schedule calls, book visits, and manage everything in one place',
                  },
                ].map((item) => (
                  <Card key={item.step} className="border-0 bg-card shadow-sm">
                    <CardContent className="flex items-start gap-4 p-5 text-left">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleNext}
                size="lg"
                className="min-w-48 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Input Mode Selection Screen */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-500">
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-bold text-foreground">
                  How would you like to chat?
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Choose your preferred way to share your wedding preferences
                </p>
              </div>

              <div className="mb-12 grid gap-6 md:grid-cols-2">
                <Card
                  className={cn(
                    'cursor-pointer border-2 transition-all hover:shadow-md',
                    selectedMode === 'voice'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-card'
                  )}
                  onClick={() => handleModeSelect('voice')}
                >
                  <CardContent className="flex flex-col items-center p-8">
                    <div
                      className={cn(
                        'mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors',
                        selectedMode === 'voice' ? 'bg-primary' : 'bg-muted'
                      )}
                    >
                      <Mic
                        className={cn(
                          'h-8 w-8',
                          selectedMode === 'voice' ? 'text-primary-foreground' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-semibold">Voice</h3>
                    <p className="text-sm text-muted-foreground">
                      Speak naturally and let our AI understand your preferences
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    'cursor-pointer border-2 transition-all hover:shadow-md',
                    selectedMode === 'text'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-card'
                  )}
                  onClick={() => handleModeSelect('text')}
                >
                  <CardContent className="flex flex-col items-center p-8">
                    <div
                      className={cn(
                        'mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors',
                        selectedMode === 'text' ? 'bg-primary' : 'bg-muted'
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          'h-8 w-8',
                          selectedMode === 'text' ? 'text-primary-foreground' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-semibold">Text</h3>
                    <p className="text-sm text-muted-foreground">
                      Type your responses and preferences at your own pace
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={handleComplete}
                disabled={!selectedMode}
                size="lg"
                className="min-w-48 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Start Planning
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
