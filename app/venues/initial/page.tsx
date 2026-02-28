'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VenuesInitialPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/venues');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Loading venues...</p>
      </div>
    </div>
  );
}
