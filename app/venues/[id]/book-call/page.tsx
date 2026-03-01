'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Phone, CheckCircle2, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

interface BookCallPageProps {
  params: Promise<{ id: string }>;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      dates.push(date);
    }
  }
  return dates;
};

export default function BookCallPage({ params }: BookCallPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getVenueById, dispatch } = useApp();
  
  const venue = getVenueById(id);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'email' | 'done'>('select');
  const [emailApproved, setEmailApproved] = useState(false);

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
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const handleConfirm = () => {
    setStep('email');
  };

  const handleApproveEmail = () => {
    setEmailApproved(true);
    
    if (selectedDate && selectedTime) {
      dispatch({
        type: 'UPDATE_VENUE',
        payload: {
          ...venue,
          status: 'call_scheduled',
          callDetails: {
            scheduledDate: selectedDate.toISOString().split('T')[0],
            scheduledTime: selectedTime,
            duration: '30 mins',
            notes: notes || undefined
          }
        }
      });
    }
    
    setStep('done');
  };

  const emailDraft = `Dear ${venue.contact?.name || 'Events Team'},

I hope this email finds you well. I would like to schedule a call to discuss wedding venue options at ${venue.name}.

Proposed time: ${selectedDate ? formatDate(selectedDate) : ''} at ${selectedTime}

${notes ? `Additional notes: ${notes}` : ''}

I look forward to speaking with you.

Best regards`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar 
        showBack 
        backHref={`/venues/${id}`} 
      />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {['Select Time', 'Review Email', 'Confirmed'].map((label, index) => {
              const stepIndex = ['select', 'email', 'done'].indexOf(step);
              const isCompleted = index < stepIndex || step === 'done';
              const isCurrent = index === stepIndex;
              
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                      isCompleted && 'bg-secondary text-secondary-foreground',
                      isCurrent && 'bg-primary text-primary-foreground',
                      !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={cn(
                    'text-sm',
                    isCurrent ? 'font-medium' : 'text-muted-foreground'
                  )}>
                    {label}
                  </span>
                  {index < 2 && <div className="h-px w-8 bg-border" />}
                </div>
              );
            })}
          </div>

          {/* Step 1: Select Date & Time */}
          {step === 'select' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Calendar className="h-5 w-5 text-primary" />
                    Select a Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {availableDates.map((date) => (
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
                      Select a Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            'rounded-lg border py-2 text-center transition-all hover:border-primary',
                            selectedTime === time
                              ? 'border-primary bg-primary/10 font-medium'
                              : 'border-border'
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedDate && selectedTime && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <CardHeader>
                    <CardTitle className="font-serif">Additional Notes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Any specific topics you'd like to discuss..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedDate || !selectedTime}
                  size="lg"
                  className="min-w-32"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Email Approval */}
          {step === 'email' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Mail className="h-5 w-5 text-primary" />
                    Review Email to {venue.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll send this email on your behalf to schedule the call
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="mb-3 space-y-1 border-b pb-3 text-sm">
                      <p><span className="font-medium">To:</span> {venue.contact?.email}</p>
                      <p><span className="font-medium">Subject:</span> Wedding Venue Inquiry - Call Request</p>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm">{emailDraft}</pre>
                  </div>
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
                  onClick={handleApproveEmail}
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve & Send
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
                <h2 className="font-serif text-2xl font-bold">Call Scheduled!</h2>
                <p className="mt-2 text-muted-foreground">
                  Your call with {venue.name} has been scheduled for
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {selectedDate && formatDate(selectedDate)} at {selectedTime}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  We&apos;ve sent a confirmation email to the venue and added this to your calendar.
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
