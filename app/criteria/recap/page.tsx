'use client';

import { useRouter } from 'next/navigation';
import { Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';

export default function CriteriaRecapPage() {
  const router = useRouter();
  const { state } = useApp();

  // Extract must-haves and nice-to-haves from criteria
  const mustHaves = state.criteria
    .filter(c => c.label === 'Must Have')
    .map(c => c.value)
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  const niceToHaves = state.criteria
    .filter(c => c.label === 'Nice to Have')
    .map(c => c.value)
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  // Function to render criterion with bold labels
  const renderCriterion = (item: string) => {
    // Check if it has a colon pattern like "Location: London"
    const colonIndex = item.indexOf(':');
    if (colonIndex > 0) {
      const label = item.substring(0, colonIndex + 1); // Include the colon
      const value = item.substring(colonIndex + 1).trim();
      return (
        <>
          <span className="font-semibold">{label}</span> {value}
        </>
      );
    }
    return item;
  };

  // Fallback data if no criteria set yet
  const displayMustHaves = mustHaves.length > 0 ? mustHaves : [
    'Outdoor ceremony space',
    'Capacity for 120-150 guests',
    'Within 45 minutes of downtown',
    'Wheelchair accessible',
    'Budget: $8,000 - $12,000',
    'Available June 15, 2024',
  ];

  const displayNiceToHaves = niceToHaves.length > 0 ? niceToHaves : [
    'Mountain or garden views',
    'On-site bridal suite',
    'Historic or vintage architecture',
    'In-house catering options',
    'Nearby accommodation options',
    'Flexible vendor policies',
  ];

  const handleAmend = () => {
    router.push('/criteria');
  };

  const handleConfirm = () => {
    router.push('/venues/initial');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />

      <main className="flex flex-1 flex-col px-6 py-8">
        <div className="mx-auto w-full max-w-5xl flex-1">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="font-serif text-4xl font-semibold text-foreground">
              Review your criteria
            </h1>
            <p className="mt-3 text-muted-foreground">
              Please review your venue requirements before we start our search
            </p>
          </div>

          {/* Two-column cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Must-haves card */}
            <Card className="border border-border bg-card">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    Must-haves
                  </h2>
                </div>
                <ul className="space-y-3">
                  {displayMustHaves.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <span className="text-foreground">{renderCriterion(item)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Nice-to-haves card */}
            <Card className="border border-border bg-card">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/20">
                    <Plus className="h-4 w-4 text-secondary" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    Nice-to-haves
                  </h2>
                </div>
                <ul className="space-y-3">
                  {displayNiceToHaves.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
                      <span className="text-foreground">{renderCriterion(item)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom action buttons - centered */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleAmend}
            className="min-w-40 rounded-full border-primary bg-transparent text-primary hover:bg-primary/10"
          >
            Amend criteria
          </Button>
          <Button
            onClick={handleConfirm}
            className="min-w-40 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Confirm & continue
          </Button>
        </div>
      </main>
    </div>
  );
}
