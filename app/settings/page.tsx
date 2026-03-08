'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/top-bar';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  full_name: string;
  email: string;
  wedding_date: string;
  guest_count: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [authEmail, setAuthEmail] = useState('');
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    wedding_date: '',
    guest_count: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.authEmail) setAuthEmail(data.authEmail);
        if (data.profile) {
          setProfile({
            full_name: data.profile.full_name ?? '',
            email: data.profile.email ?? '',
            wedding_date: data.profile.wedding_date ?? '',
            guest_count: data.profile.guest_count?.toString() ?? '',
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: profile.full_name || null,
        email: profile.email || null,
        wedding_date: profile.wedding_date || null,
        guest_count: profile.guest_count ? parseInt(profile.guest_count) : null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const field = (label: string, hint: string, children: React.ReactNode) => (
    <div className="py-5 border-b border-border last:border-0">
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-lg">
          <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">Settings</h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Account */}
              <section className="mb-8">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
                <div className="rounded-xl border border-border bg-card px-5">
                  {field('Signed in as', '', (
                    <p className="text-sm text-muted-foreground">{authEmail}</p>
                  ))}
                  {field('Your name', 'Used in email sign-offs', (
                    <input
                      value={profile.full_name}
                      onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                      placeholder="e.g. Sarah & James"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                  {field('Reply-to email', 'Venues will reply to this address', (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      placeholder={authEmail}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>
              </section>

              {/* Wedding details */}
              <section className="mb-8">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wedding Details</h2>
                <div className="rounded-xl border border-border bg-card px-5">
                  {field('Wedding date', 'Helps filter venue availability', (
                    <input
                      type="date"
                      value={profile.wedding_date}
                      onChange={e => setProfile(p => ({ ...p, wedding_date: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                  {field('Guest count', 'Used to filter venue capacity', (
                    <input
                      type="number"
                      value={profile.guest_count}
                      onChange={e => setProfile(p => ({ ...p, guest_count: e.target.value }))}
                      placeholder="e.g. 120"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>
              </section>

              {/* Save */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : saved ? (
                  <><Check className="mr-2 h-4 w-4" /> Saved</>
                ) : (
                  'Save changes'
                )}
              </Button>

              {/* Sign out */}
              <div className="mt-12 border-t border-border pt-8">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danger Zone</h2>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full rounded-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Sign out
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
