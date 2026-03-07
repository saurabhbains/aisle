'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CriteriaPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/onboarding'); }, [router]);
  return null;
}
