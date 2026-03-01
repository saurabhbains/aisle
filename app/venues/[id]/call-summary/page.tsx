'use client';

import { use } from 'react';
import Link from 'next/link';
import { 
  Phone, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ThumbsUp,
  ThumbsDown,
  Minus,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

interface CallSummaryPageProps {
  params: Promise<{ id: string }>;
}

const impressionIcons = {
  positive: ThumbsUp,
  neutral: Minus,
  negative: ThumbsDown,
};

const impressionColors = {
  positive: 'text-green-600 bg-green-100',
  neutral: 'text-amber-600 bg-amber-100',
  negative: 'text-red-600 bg-red-100',
};

export default function CallSummaryPage({ params }: CallSummaryPageProps) {
  const { id } = use(params);
  const { getVenueById } = useApp();
  
  const venue = getVenueById(id);

  if (!venue || !venue.callSummary) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar showBack backHref="/venues/status" />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No call summary available</p>
            <Button asChild className="mt-4">
              <Link href="/venues/status">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { callSummary } = venue;
  const ImpressionIcon = impressionIcons[callSummary.overallImpression];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar 
        showBack 
        backHref={`/venues/${id}`} 
      />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Phone className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Call with {venue.name}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {callSummary.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {callSummary.duration}
              </span>
            </div>
          </div>

          {/* Overall Impression */}
          <Card className="mb-6">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Impression</p>
                <p className="text-lg font-semibold capitalize">{callSummary.overallImpression}</p>
              </div>
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full',
                impressionColors[callSummary.overallImpression]
              )}>
                <ImpressionIcon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Key Points */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Key Points from the Call
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {callSummary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                      {index + 1}
                    </div>
                    <p>{point}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <ArrowRight className="h-5 w-5 text-primary" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {callSummary.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                    />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link href={`/venues/${id}`}>View Venue Details</Link>
            </Button>
            <Button asChild>
              <Link href={`/venues/${id}/book-visit`}>
                <Calendar className="mr-2 h-4 w-4" />
                Book a Visit
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
