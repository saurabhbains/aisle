'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/top-bar';
import { VenueComparison } from '@/components/VenueComparison';
import { useApp } from '@/lib/context';

export const dynamic = 'force-dynamic';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state } = useApp();

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? [];
  const venues = ids
    .map((id) => state.venues.find((v) => v.id === id))
    .filter(Boolean) as typeof state.venues;

  if (venues.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-4 text-muted-foreground">
          Select at least 2 venues to compare.
        </p>
        <Button variant="outline" onClick={() => router.push('/venues')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Venues
        </Button>
      </div>
    );
  }

  return (
    <main className="flex-1 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/venues')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Venues
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Compare Venues
            </h1>
            <p className="mt-1 text-muted-foreground">
              Comparing {venues.length} venues side by side
            </p>
          </div>
        </div>

        <VenueComparison venues={venues} />
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar title="Compare Venues" />
      <Suspense fallback={<div className="flex-1 px-6 py-8 text-muted-foreground">Loading...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
