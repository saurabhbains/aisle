'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Edit2, Users, DollarSign, Calendar, MapPin, Palette, Home, Utensils, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopBar } from '@/components/top-bar';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, React.ElementType> = {
  basics: Users,
  style: Palette,
  amenities: Utensils,
  logistics: Lock,
};

const categoryLabels: Record<string, string> = {
  basics: 'Basic Requirements',
  style: 'Style & Aesthetic',
  amenities: 'Amenities & Services',
  logistics: 'Logistics & Policies',
};

export default function CriteriaPage() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);

  const criteriaByCategory = state.criteria.reduce((acc, criterion) => {
    if (!acc[criterion.category]) {
      acc[criterion.category] = [];
    }
    acc[criterion.category].push(criterion);
    return acc;
  }, {} as Record<string, typeof state.criteria>);

  const allConfirmed = state.criteria.every(c => c.confirmed);

  const handleConfirm = (id: string) => {
    dispatch({ type: 'CONFIRM_CRITERIA', payload: id });
    setEditingId(null);
  };

  const handleContinue = () => {
    router.push('/criteria/recap');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar title="Your Criteria" showBack backHref="/onboarding" />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Review Your Wedding Criteria
            </h1>
            <p className="mt-2 text-muted-foreground">
              Confirm or edit each criterion to help us find your perfect venue
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(criteriaByCategory).map(([category, criteria]) => {
              const CategoryIcon = categoryIcons[category] || Users;
              return (
                <Card key={category} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-4">
                    <CardTitle className="flex items-center gap-3 font-serif text-lg">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      {categoryLabels[category] || category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-border p-0">
                    {criteria.map((criterion) => (
                      <div
                        key={criterion.id}
                        className={cn(
                          'flex items-center justify-between p-4 transition-colors',
                          criterion.confirmed ? 'bg-card' : 'bg-amber-50/50'
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {criterion.label}
                            </span>
                            {criterion.confirmed && (
                              <Check className="h-4 w-4 text-secondary" />
                            )}
                          </div>
                          <p className="mt-1 text-foreground">{criterion.value}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!criterion.confirmed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingId(criterion.id)}
                            >
                              <Edit2 className="mr-1.5 h-4 w-4" />
                              Edit
                            </Button>
                          )}
                          {!criterion.confirmed && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirm(criterion.id)}
                              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            >
                              <Check className="mr-1.5 h-4 w-4" />
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleContinue}
              size="lg"
              disabled={!allConfirmed}
              className="min-w-48 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {allConfirmed ? 'View Summary' : `Confirm All (${state.criteria.filter(c => !c.confirmed).length} remaining)`}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
