'use client';

import { useRouter } from 'next/navigation';
import { Calendar, Heart, Mail, MapPin, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TopBar } from '@/components/top-bar';
import { VenueCard } from '@/components/venue-card';
import { useApp } from '@/lib/context';

export default function DashboardPage() {
  const router = useRouter();
  const { state } = useApp();

  // Get recent venues (limit to 3)
  const recentVenues = state.venues.slice(0, 3);

  // Calculate stats
  const callsScheduled = state.venues.filter(v => v.status === 'call_scheduled').length;
  const visitsScheduled = state.venues.filter(v => v.status === 'visit_scheduled').length;
  const totalMatches = state.venues.length;

  const stats = [
    {
      label: 'Total Matches',
      value: totalMatches,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      label: 'Calls Scheduled',
      value: callsScheduled,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Visits Scheduled',
      value: visitsScheduled,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Welcome to Aisle
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your AI-powered wedding venue assistant
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 font-serif text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              Quick Actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-auto flex-col gap-3 p-6"
                onClick={() => router.push('/criteria')}
              >
                <TrendingUp className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">Update Criteria</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-3 p-6"
                onClick={() => router.push('/venues')}
              >
                <MapPin className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">Browse Venues</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-3 p-6"
                onClick={() => router.push('/venues?filter=call_scheduled')}
              >
                <Calendar className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">View Calls</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-3 p-6"
                onClick={() => router.push('/venues')}
              >
                <Mail className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">Send Emails</span>
              </Button>
            </div>
          </div>

          {/* Recent Matches */}
          {recentVenues.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Your Top Matches
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/venues')}
                >
                  View All
                </Button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    variant="default"
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {state.venues.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 text-muted-foreground">
                  <Heart className="mx-auto h-12 w-12" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-semibold">
                  Ready to find your perfect venue?
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Get started by sharing your wedding preferences
                </p>
                <Button
                  onClick={() => router.push('/criteria')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Set Your Criteria
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
