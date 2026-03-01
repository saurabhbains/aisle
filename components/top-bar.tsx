'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  showProfile?: boolean;
  showSettings?: boolean;
  className?: string;
}

export function TopBar({
  title,
  showBack = false,
  backHref,
  showProfile = true,
  showSettings = false,
  className,
}: TopBarProps) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-6',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && backHref && (
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href={backHref}>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Link>
          </Button>
        )}
        <Link href="/venues/status" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold text-foreground">Aisle</span>
        </Link>
      </div>

      <nav className="hidden items-center gap-6 md:flex">
        <Link
          href="/venues/status"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === '/venues/status' ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/criteria"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname.startsWith('/criteria') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          Criteria
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        {showSettings && (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        )}
        {showProfile && (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        )}
      </div>
    </header>
  );
}
