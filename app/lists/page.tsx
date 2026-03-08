'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil, Share2, Download, Check, X, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/top-bar';
import { StatusPill } from '@/components/status-pill';
import { useApp } from '@/lib/context';
import { downloadVenuesAsExcel } from '@/lib/excel';
import type { Venue } from '@/lib/types';

interface VenueList {
  id: string;
  name: string;
  venue_ids: string[];
  created_at: string;
}

export default function ListsPage() {
  const router = useRouter();
  const { state } = useApp();

  const [lists, setLists] = useState<VenueList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState<VenueList | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const fetchLists = useCallback(async () => {
    const res = await fetch('/api/lists');
    const data = await res.json();
    if (data.lists) {
      setLists(data.lists);
      // keep activeList in sync if it was open
      setActiveList(prev => prev ? data.lists.find((l: VenueList) => l.id === prev.id) ?? null : null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const renameList = async (id: string) => {
    if (!renameValue.trim()) return;
    const res = await fetch(`/api/lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    const data = await res.json();
    if (data.list) {
      setLists(prev => prev.map(l => l.id === id ? data.list : l));
      if (activeList?.id === id) setActiveList(data.list);
      setRenamingId(null);
    }
  };

  const deleteList = async (id: string) => {
    if (!confirm('Delete this list?')) return;
    await fetch(`/api/lists/${id}`, { method: 'DELETE' });
    setLists(prev => prev.filter(l => l.id !== id));
    if (activeList?.id === id) setActiveList(null);
  };

  const shareList = async () => {
    if (!shareEmail.trim() || !activeList) return;
    const venues = activeList.venue_ids
      .map(id => state.venues.find(v => v.id === id))
      .filter(Boolean) as Venue[];
    await fetch('/api/share-venues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail: shareEmail, venues, listName: activeList.name }),
    });
    setShareSuccess(true);
    setTimeout(() => { setShareSuccess(false); setShowShare(false); setShareEmail(''); }, 2000);
  };

  const activeVenues = activeList
    ? activeList.venue_ids.map(id => state.venues.find(v => v.id === id)).filter(Boolean) as Venue[]
    : [];

  // List of lists view
  if (!activeList) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar title="My Lists" />
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/venues/status')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="font-serif text-2xl font-bold text-foreground">My Lists</h1>
            </div>

            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : lists.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <p className="font-serif text-lg font-semibold text-foreground">No lists yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Go to your venues, select some, and click <strong>"Save as List"</strong>.
                </p>
                <Button className="mt-6 rounded-full" onClick={() => router.push('/venues/status')}>
                  Go to Venues
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {lists.map(list => (
                  <div
                    key={list.id}
                    onClick={() => setActiveList(list)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                  >
                    <div>
                      {renamingId === list.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === 'Enter') renameList(list.id);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          className="rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="font-serif text-lg font-semibold text-foreground">{list.name}</p>
                      )}
                      <p className="mt-0.5 text-sm text-muted-foreground">{list.venue_ids.length} venue{list.venue_ids.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setRenamingId(list.id); setRenameValue(list.name); }}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteList(list.id)}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Single list detail view
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar title={activeList.name} />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setActiveList(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              All Lists
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
                onClick={() => downloadVenuesAsExcel(activeVenues, activeList.name)}
                disabled={activeVenues.length === 0}
              >
                <Download className="h-4 w-4" />
                Download Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
                onClick={() => setShowShare(!showShare)}
                disabled={activeVenues.length === 0}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <h2 className="mb-1 font-serif text-2xl font-bold text-foreground">{activeList.name}</h2>
          <p className="mb-6 text-sm text-muted-foreground">{activeVenues.length} venue{activeVenues.length !== 1 ? 's' : ''}</p>

          {showShare && (
            <div className="mb-6 flex gap-2">
              <input
                autoFocus
                type="email"
                value={shareEmail}
                onChange={e => setShareEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && shareList()}
                placeholder="Enter email address..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              {shareSuccess ? (
                <Button size="sm" className="gap-1 rounded-full bg-green-600 text-white">
                  <Check className="h-4 w-4" /> Sent!
                </Button>
              ) : (
                <Button size="sm" className="rounded-full" onClick={shareList}>Send</Button>
              )}
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { setShowShare(false); setShareEmail(''); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {activeVenues.length === 0 ? (
            <p className="text-muted-foreground">No venues in this list.</p>
          ) : (
            <div className="space-y-3">
              {activeVenues.map(venue => (
                <div key={venue.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                  <div>
                    <p className="font-serif text-lg font-semibold">{venue.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {venue.location} · {venue.capacity.min}–{venue.capacity.max} guests · £{(venue.priceRange.min/1000).toFixed(0)}k–£{(venue.priceRange.max/1000).toFixed(0)}k
                    </p>
                  </div>
                  <StatusPill status={venue.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
