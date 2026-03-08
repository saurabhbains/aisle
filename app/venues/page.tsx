'use client';

import { useState } from 'react';
import { Filter, X, Mail, CheckSquare, Square, GitCompareArrows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/top-bar';
import { VenueCard } from '@/components/venue-card';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

const filterOptions = [
  { id: 'all', label: 'All Venues' },
  { id: 'call_scheduled', label: 'Calls Scheduled' },
  { id: 'visit_scheduled', label: 'Visits Scheduled' },
  { id: 'interested', label: 'Interested' },
  { id: 'not_interested', label: 'Not Interested' },
];

export default function VenuesPage() {
  const router = useRouter();
  const { state } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVenues, setSelectedVenues] = useState<Set<string>>(new Set());

  const filteredVenues = activeFilter === 'all'
    ? state.venues
    : state.venues.filter(venue => venue.status === activeFilter);

  const toggleVenueSelection = (venueId: string) => {
    const newSelection = new Set(selectedVenues);
    if (newSelection.has(venueId)) {
      newSelection.delete(venueId);
    } else {
      newSelection.add(venueId);
    }
    setSelectedVenues(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedVenues.size === filteredVenues.length) {
      setSelectedVenues(new Set());
    } else {
      setSelectedVenues(new Set(filteredVenues.map(v => v.id)));
    }
  };

  const [isSending, setIsSending] = useState(false);
  const [sendComplete, setSendComplete] = useState(false);
  const [sendResults, setSendResults] = useState<any>(null);

  const handleSendEmails = async () => {
    const selectedVenuesList = state.venues.filter(v => selectedVenues.has(v.id));

    const confirmed = window.confirm(
      `Ready to send inquiry emails to ${selectedVenues.size} venue(s)?\n\n${selectedVenuesList.map(v => v.name).join('\n')}\n\nNote: In demo mode, all emails will be sent to saurabhbains@berkeley.edu`
    );

    if (!confirmed) return;

    setIsSending(true);
    setSendComplete(false);

    try {
      // Step 1: Generate emails
      console.log('Generating emails for selected venues...');
      console.log('Selected venues:', selectedVenuesList);

      const venuesPayload = selectedVenuesList.map(v => ({
        venue: {
          id: v.id,
          name: v.name,
          email: v.contact?.email || '',
          location: v.location,
          capacity: v.capacity,
          priceRange: v.priceRange,
          features: v.features,
          type: v.type
        }
      }));

      console.log('Venues payload:', venuesPayload);

      const generateResponse = await fetch('/api/generate-batch-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venues: venuesPayload,
          criteria: state.criteria,
          coupleName: 'Wedding Couple'
        })
      });

      const generateData = await generateResponse.json();
      console.log('Email generation result:', generateData);
      console.log('Generated emails:', generateData.emails);

      // Debug: Check each email object
      if (generateData.emails) {
        generateData.emails.forEach((email: any, idx: number) => {
          console.log(`Email ${idx}:`, {
            venueName: email.venueName,
            hasSuccess: email.success !== undefined,
            success: email.success,
            hasEmailBody: !!email.emailBody,
            hasVenueEmail: !!email.venueEmail,
            venueEmail: email.venueEmail
          });
        });
      }

      if (!generateData.success) {
        throw new Error(generateData.error || 'Failed to generate emails');
      }

      if (!generateData.emails || generateData.emails.length === 0) {
        throw new Error('No emails were generated. Check that venues have email addresses.');
      }

      // Step 2: Send emails (in demo mode, sends to saurabhbains@berkeley.edu)
      console.log('Sending generated emails...');
      const sendResponse = await fetch('/api/send-batch-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: generateData.emails,
          demoMode: true, // Always demo mode for safety
          from: 'saurabhbains@berkeley.edu'
        })
      });

      const sendData = await sendResponse.json();
      console.log('Email send result:', sendData);

      if (!sendData.success) {
        throw new Error(sendData.error || 'Failed to send emails');
      }

      setSendResults(sendData);
      setSendComplete(true);
      setSelectedVenues(new Set()); // Clear selection

      // Show success message
      alert(`✓ Successfully sent ${sendData.sent} email(s) to saurabhbains@berkeley.edu!\n\nCheck your Berkeley email inbox.`);
    } catch (error: any) {
      console.error('Error sending emails:', error);
      alert(`✗ Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

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
              <div className="flex gap-2">
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
            </div>

            {/* Selection Bar */}
            {filteredVenues.length > 0 && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2"
                  >
                    {selectedVenues.size === filteredVenues.length ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                    {selectedVenues.size === filteredVenues.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedVenues.size} venue{selectedVenues.size !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedVenues.size >= 2 && selectedVenues.size <= 3 && (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/compare?ids=${Array.from(selectedVenues).join(',')}`)}
                      className="flex items-center gap-2"
                    >
                      <GitCompareArrows className="h-4 w-4" />
                      Compare ({selectedVenues.size})
                    </Button>
                  )}
                  <Button
                    onClick={handleSendEmails}
                    disabled={selectedVenues.size === 0 || isSending}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Send Emails ({selectedVenues.size})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

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
                <div key={venue.id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute left-3 top-3 z-10">
                    <button
                      onClick={() => toggleVenueSelection(venue.id)}
                      className="flex h-6 w-6 items-center justify-center rounded bg-white shadow-md transition-colors hover:bg-gray-50"
                    >
                      {selectedVenues.has(venue.id) ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <VenueCard
                    venue={venue}
                    variant="default"
                    showActions={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
