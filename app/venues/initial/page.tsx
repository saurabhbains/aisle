'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/top-bar';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';

export default function InitialVenueListPage() {
  const router = useRouter();
  const { state } = useApp();
  const [qualifiedOutIds, setQualifiedOutIds] = useState<Set<string>>(new Set());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Convert context venues to the format expected by this page
  const initialVenues = useMemo(() => {
    return state.venues.map(venue => ({
      id: venue.id,
      name: venue.name,
      location: venue.location,
      imageUrl: venue.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&h=200&fit=crop',
      criteriaMatches: [
        ...(venue.capacity ? [`Capacity: ${venue.capacity.max} guests`] : []),
        ...(venue.priceRange ? [`Budget: £${venue.priceRange.min}-${venue.priceRange.max}`] : []),
        ...(venue.features ? venue.features.slice(0, 2) : [])
      ].filter(Boolean).slice(0, 3) // Max 3 criteria matches
    }));
  }, [state.venues]);

  const handleQualifyOut = (venueId: string) => {
    setQualifiedOutIds((prev) => {
      const next = new Set(prev);
      if (next.has(venueId)) {
        next.delete(venueId);
      } else {
        next.add(venueId);
      }
      return next;
    });
  };

  // Sort venues: active first, qualified out at bottom
  const sortedVenues = [...initialVenues].sort((a, b) => {
    const aOut = qualifiedOutIds.has(a.id) ? 1 : 0;
    const bOut = qualifiedOutIds.has(b.id) ? 1 : 0;
    return aOut - bOut;
  });

  const handleNoFeedback = () => {
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = () => {
    // In a real app, this would send the feedback to the AI
    console.log('Feedback submitted:', feedbackText);
    setFeedbackText('');
    setShowFeedbackModal(false);
    // Stay on the same page - venue list will be refreshed based on feedback
  };

  const handleCancelFeedback = () => {
    setFeedbackText('');
    setShowFeedbackModal(false);
  };

  const handleYesContinue = () => {
    router.push('/venues/status');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={handleCancelFeedback}
          />
          
          {/* Modal */}
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl">
            <h2 className="mb-6 text-center font-serif text-2xl font-semibold text-foreground">
              What would you like to change?
            </h2>
            
            {/* Text area with mic icon */}
            <div className="relative mb-4">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you'd like to adjust about this venue list..."
                className="min-h-[140px] w-full resize-none rounded-xl border-2 border-primary/50 bg-background p-4 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button 
                type="button"
                className="absolute bottom-4 right-4 text-primary hover:text-primary/80"
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-6 text-center text-sm text-muted-foreground">
              AI will use your feedback to refine the venue list.
            </p>
            
            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleCancelFeedback}
                className="flex-1 rounded-full border-border bg-card py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
                className="flex-1 rounded-full bg-primary py-3 text-primary-foreground hover:bg-primary/90"
              >
                Submit feedback
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-6 pb-36 sm:px-6 sm:py-8 sm:pb-28">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              Initial venue list
            </h1>
            <p className="mt-1 text-muted-foreground">Based on your criteria</p>
          </div>

          {/* Venue List */}
          {sortedVenues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 font-serif text-2xl font-semibold text-foreground">
                No venues found
              </h2>
              <p className="mb-6 max-w-md text-muted-foreground">
                We couldn't find any wedding venues matching your current criteria. Try adjusting your requirements to see more options.
              </p>
              <Button
                onClick={() => router.push('/criteria')}
                className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
              >
                Update criteria
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sortedVenues.map((venue) => {
                const isQualifiedOut = qualifiedOutIds.has(venue.id);
                return (
                  <div
                    key={venue.id}
                    className={cn(
                      'flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:gap-6',
                      isQualifiedOut && 'opacity-50'
                    )}
                  >
                    {/* Venue Image */}
                    <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24">
                      <Image
                        src={venue.imageUrl}
                        alt={venue.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 96px"
                        className={cn(
                          'object-cover',
                          isQualifiedOut && 'grayscale'
                        )}
                      />
                    </div>

                    {/* Venue Info */}
                    <div className="flex flex-1 flex-col gap-2">
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        {venue.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{venue.location}</p>
                      <div className="flex flex-wrap gap-2">
                        {venue.criteriaMatches.map((match) => (
                          <span
                            key={match}
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                          >
                            {match}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Qualify Out Button */}
                    <Button
                      variant="outline"
                      onClick={() => handleQualifyOut(venue.id)}
                      className="w-full rounded-full border-border text-muted-foreground hover:bg-muted sm:w-auto sm:flex-shrink-0"
                    >
                      {isQualifiedOut ? 'Re-qualify' : 'Qualify out'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-[#FDF5F0] px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-sm text-muted-foreground sm:hidden">Are you happy with this list?</p>
          <div className="flex items-center justify-between gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">Are you happy with this list?</span>
            <div className="flex w-full gap-2 sm:w-auto sm:gap-3">
              <Button
                variant="outline"
                onClick={handleNoFeedback}
                className="flex-1 rounded-full border-border bg-card px-4 sm:flex-none sm:px-6"
              >
                No, leave feedback
              </Button>
              <Button
                onClick={handleYesContinue}
                className="flex-1 rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90 sm:flex-none sm:px-6"
              >
                Yes, continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
