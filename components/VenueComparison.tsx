'use client';

import { MapPin, Users, Star, Check, X } from 'lucide-react';
import { StatusPill } from '@/components/status-pill';
import type { Venue } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VenueComparisonProps {
  venues: Venue[];
}

const formatPrice = (min: number, max: number) =>
  `£${(min / 1000).toFixed(0)}k – £${(max / 1000).toFixed(0)}k`;

type Row = {
  label: string;
  render: (venue: Venue) => React.ReactNode;
  best?: (venues: Venue[]) => string | null; // returns id of best venue
};

const rows: Row[] = [
  {
    label: 'Match Score',
    render: (v) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-primary text-primary" />
        <span className="font-semibold">{v.matchScore}%</span>
      </div>
    ),
    best: (venues) =>
      venues.reduce((best, v) => (v.matchScore > best.matchScore ? v : best)).id,
  },
  {
    label: 'Location',
    render: (v) => (
      <div className="flex items-center gap-1 text-sm">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        {v.location}
      </div>
    ),
  },
  {
    label: 'Type',
    render: (v) => (
      <span className="capitalize">{v.type.replace(/_/g, ' ')}</span>
    ),
  },
  {
    label: 'Capacity',
    render: (v) => (
      <div className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        {v.capacity.min}–{v.capacity.max} guests
      </div>
    ),
    best: (venues) =>
      venues.reduce((best, v) => (v.capacity.max > best.capacity.max ? v : best)).id,
  },
  {
    label: 'Price Range',
    render: (v) => formatPrice(v.priceRange.min, v.priceRange.max),
    best: (venues) =>
      venues.reduce((best, v) => (v.priceRange.min < best.priceRange.min ? v : best)).id,
  },
  {
    label: 'Status',
    render: (v) => <StatusPill status={v.status} />,
  },
  {
    label: 'Features',
    render: (v) => (
      <div className="flex flex-wrap gap-1">
        {v.features.slice(0, 4).map((f, i) => (
          <span
            key={i}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
          >
            {f}
          </span>
        ))}
        {v.features.length > 4 && (
          <span className="text-xs text-muted-foreground">+{v.features.length - 4} more</span>
        )}
      </div>
    ),
    best: (venues) =>
      venues.reduce((best, v) => (v.features.length > best.features.length ? v : best)).id,
  },
  {
    label: 'Website',
    render: (v) =>
      v.website ? (
        <a
          href={v.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline text-sm"
        >
          Visit site
        </a>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    label: 'Contact',
    render: (v) =>
      v.contact?.email ? (
        <span className="text-sm">{v.contact.email}</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    label: 'Notes',
    render: (v) =>
      v.notes ? (
        <span className="text-sm">{v.notes}</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
];

export function VenueComparison({ venues }: VenueComparisonProps) {
  if (venues.length < 2) return null;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {/* Label column */}
            <th className="w-36 min-w-[9rem] bg-muted/50 p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground" />
            {venues.map((venue) => (
              <th
                key={venue.id}
                className="border-l border-border p-4 text-left font-serif text-base font-semibold text-foreground"
              >
                <div>{venue.name}</div>
                <div className="mt-0.5 text-xs font-normal text-muted-foreground">{venue.location}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const bestId = row.best ? row.best(venues) : null;
            return (
              <tr
                key={row.label}
                className={cn(
                  'border-b border-border last:border-b-0',
                  rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                )}
              >
                <td className="bg-muted/50 p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {row.label}
                </td>
                {venues.map((venue) => (
                  <td
                    key={venue.id}
                    className={cn(
                      'border-l border-border p-4',
                      bestId === venue.id && 'bg-green-50 dark:bg-green-950/20'
                    )}
                  >
                    {row.render(venue)}
                    {bestId === venue.id && (
                      <span className="mt-1 block text-xs font-medium text-green-600">
                        ✓ Best
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
