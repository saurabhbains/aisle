'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, CheckCircle2, MapPin, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

interface BookVisitPageProps {
  params: Promise<{ id: string }>;
}

const visitSlots = [
  { time: '10:00', label: '10:00 AM', available: true },
  { time: '11:00', label: '11:00 AM', available: true },
  { time: '12:00', label: '12:00 PM', available: false },
  { time: '14:00', label: '2:00 PM', available: true },
  { time: '15:00', label: '3:00 PM', available: true },
  { time: '16:00', label: '4:00 PM', available: false },
];

const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 3; i <= 21; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0) {
      dates.push(date);
    }
  }
  return dates;
};

export default function BookVisitPage({ params }: BookVisitPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getVenueById, dispatch } = useApp();
  
  const venue = getVenueById(id);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState('2');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'select' | 'details' | 'done'>('select');

  const availableDates = generateDates();

  if (!venue) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar showBack backHref="/venues/status" />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Venue not found</p>
        </main>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleContinue = () => {
    setStep('details');
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      dispatch({
        type: 'UPDATE_VENUE',
        payload: {
          ...venue,
          status: 'visit_scheduled',
          visitDetails: {
            scheduledDate: selectedDate.toISOString().split('T')[0],
            scheduledTime: selectedTime,
            duration: '2 hours',
            notes: notes || undefined,
            confirmedGuests: parseInt(guestCount, 10)
          }
        }
      });
    }
    setStep('done');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar 
        showBack 
        backHref={`/venues/${id}`} 
      />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Venue Summary */}
          <Card className="mb-6">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold">{venue.name}</h2>
                <p className="text-sm text-muted-foreground">{venue.location}</p>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Select Date & Time */}
          {step === 'select' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Calendar className="h-5 w-5 text-primary" />
                    Select a Visit Date
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Site visits typically last 1.5 - 2 hours
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {availableDates.slice(0, 10).map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          'rounded-lg border p-3 text-center transition-all hover:border-primary',
                          selectedDate?.toDateString() === date.toDateString()
                            ? 'border-primary bg-primary/10'
                            : 'border-border'
                        )}
                      >
                        <div className="text-xs text-muted-foreground">
                          {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-semibold">{date.getDate()}</div>
                        <div className="text-xs text-muted-foreground">
                          {date.toLocaleDateString('en-GB', { month: 'short' })}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedDate && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Clock className="h-5 w-5 text-primary" />
                      Available Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {visitSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={cn(
                            'rounded-lg border py-3 text-center transition-all',
                            slot.available && 'hover:border-primary',
                            !slot.available && 'cursor-not-allowed opacity-50',
                            selectedTime === slot.time
                              ? 'border-primary bg-primary/10 font-medium'
                              : 'border-border'
                          )}
                        >
                          {slot.label}
                          {!slot.available && (
                            <span className="block text-xs text-muted-foreground">Unavailable</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleContinue}
                  disabled={!selectedDate || !selectedTime}
                  size="lg"
                  className="min-w-32"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Visit Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Visit Details</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate && formatDate(selectedDate)} at {selectedTime}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="guests" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Number of Guests Attending
                    </Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max="10"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="mt-2 w-24"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Including yourself (max 10)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notes">Special Requests or Questions</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific areas you'd like to see, dietary requirements for refreshments, accessibility needs..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">What to expect:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- Full tour of ceremony and reception spaces</li>
                    <li>- Meet with the events coordinator</li>
                    <li>- Discussion of available dates and pricing</li>
                    <li>- Opportunity to ask questions</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Visit
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'done' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="font-serif text-2xl font-bold">Visit Booked!</h2>
                <p className="mt-2 text-muted-foreground">
                  Your visit to {venue.name} is confirmed
                </p>
                <div className="mt-4 rounded-lg bg-card p-4 shadow-sm">
                  <p className="font-semibold">{selectedDate && formatDate(selectedDate)}</p>
                  <p className="text-muted-foreground">at {selectedTime}</p>
                  <p className="mt-2 text-sm">{guestCount} guest{parseInt(guestCount) !== 1 ? 's' : ''} attending</p>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  A confirmation email has been sent with all the details and directions.
                </p>
                <Button
                  onClick={() => router.push('/venues/status')}
                  className="mt-6"
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
