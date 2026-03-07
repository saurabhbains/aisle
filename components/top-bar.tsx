'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

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
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

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

      <nav className="flex items-center gap-1">
        <Link
          href="/venues/status"
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:text-sm',
            pathname === '/venues/status'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/onboarding"
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:text-sm',
            pathname.startsWith('/onboarding') || pathname.startsWith('/criteria')
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign out</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut}>Yes, sign out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </header>
  );
}
