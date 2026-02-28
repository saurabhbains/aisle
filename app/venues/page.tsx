'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/top-bar';
import { VenueCard } from '@/components/venue-card';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const filterOptions = [
  { id: 'all', label: 'All Venues' },
  { id: 'call_scheduled', label: 'Calls Scheduled' },
  { id: 'visit_scheduled', label: 'Visits Scheduled' },
  { id: 'interested', label: 'Interested' },
  { id: 'not_interested', label: 'Not Interested' },
];

export default function VenuesPage() {
  const { state } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredVenues = activeFilter === 'all'
    ? state.venues
    : state.venues.filter(venue => venue.status === activeFilter);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar title="Your Venue Matches" />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">
                  Your Perfect Matches
                </h1>
                <p className="mt-2 text-muted-foreground">
                  We found {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} that match your criteria
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Filter by status</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant={activeFilter === option.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveFilter(option.id)}
                      className={cn(
                        activeFilter === option.id && 'bg-primary text-primary-foreground'
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Venues Grid */}
          {filteredVenues.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
              <div className="mb-4 text-muted-foreground">
                <Filter className="mx-auto h-12 w-12" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-semibold">
                No venues found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  variant="default"
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
