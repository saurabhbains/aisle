'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

const priorityColors = {
  high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
};

export default function MissingInfoPage() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const pendingInfo = state.missingInfo.filter((m) => m.status === 'pending');
  const answeredInfo = state.missingInfo.filter((m) => m.status === 'answered');

  const handleAnswer = (id: string) => {
    const item = state.missingInfo.find((m) => m.id === id);
    if (item && answerText.trim()) {
      dispatch({
        type: 'UPDATE_MISSING_INFO',
        payload: { ...item, status: 'answered', answer: answerText },
      });
      setAnswerText('');
      setExpandedId(null);
    }
  };

  const handleContinue = () => {
    router.push('/venues/status');
  };

  const groupedByVenue = pendingInfo.reduce((acc, item) => {
    if (!acc[item.venueName]) {
      acc[item.venueName] = [];
    }
    acc[item.venueName].push(item);
    return acc;
  }, {} as Record<string, typeof pendingInfo>);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar showBack backHref="/venues/initial" />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Help Us Get More Information
            </h1>
            <p className="mt-2 text-muted-foreground">
              We need a few more details to complete your venue inquiries
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingInfo.length}</p>
                  <p className="text-sm text-muted-foreground">Questions pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{answeredInfo.length}</p>
                  <p className="text-sm text-muted-foreground">Questions answered</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Questions */}
          {Object.keys(groupedByVenue).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedByVenue).map(([venueName, items]) => (
                <Card key={venueName}>
                  <CardHeader className="pb-4">
                    <CardTitle className="font-serif text-lg">{venueName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    {items.map((item) => {
                      const colors = priorityColors[item.priority];
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'rounded-lg border p-4 transition-all',
                            colors.border,
                            expandedId === item.id ? 'bg-muted/50' : 'bg-card'
                          )}
                        >
                          <div
                            className="flex cursor-pointer items-start justify-between gap-4"
                            onClick={() =>
                              setExpandedId(expandedId === item.id ? null : item.id)
                            }
                          >
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <span
                                  className={cn(
                                    'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                                    colors.bg,
                                    colors.text
                                  )}
                                >
                                  {item.priority}
                                </span>
                              </div>
                              <p className="text-foreground">{item.question}</p>
                            </div>
                            <ChevronRight
                              className={cn(
                                'h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform',
                                expandedId === item.id && 'rotate-90'
                              )}
                            />
                          </div>
                          {expandedId === item.id && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                              <Textarea
                                placeholder="Enter your response..."
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                className="mb-3"
                                rows={3}
                              />
                              <Button
                                onClick={() => handleAnswer(item.id)}
                                disabled={!answerText.trim()}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Submit Answer
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-serif text-xl font-semibold">All Questions Answered!</h3>
                <p className="mt-2 text-muted-foreground">
                  You&apos;re all set. We have all the information we need.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleContinue}
              size="lg"
              className="min-w-48 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {pendingInfo.length > 0 ? 'Skip for Now' : 'Continue to Dashboard'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
