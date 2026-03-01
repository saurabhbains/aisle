'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Plus, X, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

export default function FeedbackPage({ params }: FeedbackPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getVenueById, dispatch } = useApp();
  
  const venue = getVenueById(id);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [pros, setPros] = useState<string[]>(['']);
  const [cons, setCons] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

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

  const handleAddPro = () => setPros([...pros, '']);
  const handleRemovePro = (index: number) => setPros(pros.filter((_, i) => i !== index));
  const handleProChange = (index: number, value: string) => {
    const newPros = [...pros];
    newPros[index] = value;
    setPros(newPros);
  };

  const handleAddCon = () => setCons([...cons, '']);
  const handleRemoveCon = (index: number) => setCons(cons.filter((_, i) => i !== index));
  const handleConChange = (index: number, value: string) => {
    const newCons = [...cons];
    newCons[index] = value;
    setCons(newCons);
  };

  const handleSubmit = () => {
    const filteredPros = pros.filter(p => p.trim() !== '');
    const filteredCons = cons.filter(c => c.trim() !== '');

    dispatch({
      type: 'UPDATE_VENUE',
      payload: {
        ...venue,
        feedback: {
          rating,
          pros: filteredPros,
          cons: filteredCons,
          notes,
          wouldRecommend: wouldRecommend ?? false
        }
      }
    });

    setSubmitted(true);
  };

  const isValid = rating > 0 && wouldRecommend !== null;

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar showBack backHref="/venues/status" />
        <main className="flex flex-1 items-center justify-center px-6 py-8">
          <Card className="w-full max-w-md border-green-200 bg-green-50">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="font-serif text-2xl font-bold">Thank You!</h2>
              <p className="mt-2 text-muted-foreground">
                Your feedback for {venue.name} has been saved.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                This will help you compare venues later when making your final decision.
              </p>
              <Button
                onClick={() => router.push('/venues/status')}
                className="mt-6"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar 
        showBack 
        backHref={`/venues/${id}`} 
      />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              How was your visit to {venue.name}?
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your feedback will help you compare venues later
            </p>
          </div>

          <div className="space-y-6">
            {/* Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          'h-10 w-10 transition-colors',
                          (hoverRating || rating) >= star
                            ? 'fill-primary text-primary'
                            : 'text-muted'
                        )}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-green-700">
                  <ThumbsUp className="h-5 w-5" />
                  What did you like?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pros.map((pro, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., Beautiful gardens, friendly staff..."
                      value={pro}
                      onChange={(e) => handleProChange(index, e.target.value)}
                    />
                    {pros.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePro(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPro}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add another
                </Button>
              </CardContent>
            </Card>

            {/* Cons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-red-700">
                  <ThumbsDown className="h-5 w-5" />
                  What could be improved?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cons.map((con, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., Limited parking, noise from nearby road..."
                      value={con}
                      onChange={(e) => handleConChange(index, e.target.value)}
                    />
                    {cons.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCon(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCon}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add another
                </Button>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any other thoughts or observations about your visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Would Recommend */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Would you recommend this venue?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={wouldRecommend === true ? 'default' : 'outline'}
                    onClick={() => setWouldRecommend(true)}
                    className={cn(
                      'flex-1',
                      wouldRecommend === true && 'bg-green-600 hover:bg-green-700'
                    )}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Yes
                  </Button>
                  <Button
                    variant={wouldRecommend === false ? 'default' : 'outline'}
                    onClick={() => setWouldRecommend(false)}
                    className={cn(
                      'flex-1',
                      wouldRecommend === false && 'bg-red-600 hover:bg-red-700'
                    )}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    No
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!isValid}
                size="lg"
                className="min-w-48 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
