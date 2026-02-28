'use client';

import { useRouter } from 'next/navigation';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';

export default function CriteriaRecapPage() {
  const router = useRouter();
  const { state } = useApp();

  const handleFindVenues = () => {
    router.push('/venues/initial');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar title="Criteria Summary" showBack backHref="/criteria" />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
              <Sparkles className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Perfect! Here&apos;s Your Wedding Vision
            </h1>
            <p className="mt-2 text-muted-foreground">
              We&apos;ll use these criteria to find your ideal venues
            </p>
          </div>

          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid gap-px bg-border sm:grid-cols-2">
                {state.criteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex items-start gap-3 bg-card p-4"
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary/20">
                      <Check className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {criterion.label}
                      </p>
                      <p className="mt-0.5 text-foreground">{criterion.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl bg-primary/10 p-6 text-center">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Ready to see your matches?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our AI has analyzed thousands of venues to find the perfect options for you
            </p>
            <Button
              onClick={handleFindVenues}
              size="lg"
              className="mt-6 min-w-48 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Find My Venues
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
