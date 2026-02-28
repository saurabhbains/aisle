'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/status-pill';
import type { Venue } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VenueCardProps {
  venue: Venue;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onSelect?: (venue: Venue) => void;
  className?: string;
}

export function VenueCard({
  venue,
  variant = 'default',
  showActions = true,
  onSelect,
  className,
}: VenueCardProps) {
  const formatPrice = (min: number, max: number) => {
    return `£${(min / 1000).toFixed(0)}k - £${(max / 1000).toFixed(0)}k`;
  };

  if (variant === 'compact') {
    return (
      <Card className={cn('overflow-hidden transition-shadow hover:shadow-md', className)}>
        <div className="flex gap-4 p-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <MapPin className="h-8 w-8" />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground">{venue.name}</h3>
              <p className="text-sm text-muted-foreground">{venue.location}</p>
            </div>
            <StatusPill status={venue.status} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden transition-shadow hover:shadow-lg', className)}>
      <div className="relative h-48 w-full bg-muted">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <MapPin className="h-12 w-12" />
        </div>
        <div className="absolute right-3 top-3">
          <StatusPill status={venue.status} />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-card/90 px-3 py-1 backdrop-blur-sm">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm font-medium">{venue.matchScore}% match</span>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="font-serif text-xl font-semibold text-foreground">{venue.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{venue.location}</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
            <Users className="h-4 w-4" />
            <span>{venue.capacity.min}-{venue.capacity.max} guests</span>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-sm">
            {formatPrice(venue.priceRange.min, venue.priceRange.max)}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {venue.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
            >
              {feature}
            </span>
          ))}
          {venue.features.length > 3 && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              +{venue.features.length - 3} more
            </span>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
            >
              <Link href={`/venues/${venue.id}`}>View Details</Link>
            </Button>
            {onSelect && (
              <Button
                size="sm"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => onSelect(venue)}
              >
                Select
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
