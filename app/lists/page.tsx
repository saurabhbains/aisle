'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, Share2, Download, Check, X, ArrowLeft } from 'lucide-react';
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
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharingListId, setSharingListId] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  const fetchLists = useCallback(async () => {
    const res = await fetch('/api/lists');
    const data = await res.json();
    if (data.lists) setLists(data.lists);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const createList = async () => {
    if (!newListName.trim()) return;
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newListName.trim() }),
    });
    const data = await res.json();
    if (data.list) {
      setLists((prev) => [data.list, ...prev]);
      setNewListName('');
      setCreatingList(false);
      setActiveListId(data.list.id);
    }
  };

  const renameList = async (id: string) => {
    if (!renameValue.trim()) return;
    const res = await fetch(`/api/lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    const data = await res.json();
    if (data.list) {
      setLists((prev) => prev.map((l) => (l.id === id ? data.list : l)));
      setRenamingId(null);
    }
  };

  const deleteList = async (id: string) => {
    if (!confirm('Delete this list?')) return;
    await fetch(`/api/lists/${id}`, { method: 'DELETE' });
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeListId === id) setActiveListId(null);
  };

  const toggleVenueInList = async (listId: string, venueId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    const alreadyIn = list.venue_ids.includes(venueId);
    const newIds = alreadyIn
      ? list.venue_ids.filter((id) => id !== venueId)
      : [...list.venue_ids, venueId];

    const res = await fetch(`/api/lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venue_ids: newIds }),
    });
    const data = await res.json();
    if (data.list) setLists((prev) => prev.map((l) => (l.id === listId ? data.list : l)));
  };

  const shareList = async (list: VenueList) => {
    if (!shareEmail.trim()) return;
    const venues = list.venue_ids
      .map((id) => state.venues.find((v) => v.id === id))
      .filter(Boolean) as Venue[];

    await fetch('/api/share-venues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail: shareEmail, venues, listName: list.name }),
    });
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setSharingListId(null);
      setShareEmail('');
    }, 2000);
  };

  const downloadList = (list: VenueList) => {
    const venues = list.venue_ids
      .map((id) => state.venues.find((v) => v.id === id))
      .filter(Boolean) as Venue[];
    downloadVenuesAsExcel(venues, list.name);
  };

  const activeList = lists.find((l) => l.id === activeListId) ?? null;
  const activeVenues = activeList
    ? (activeList.venue_ids.map((id) => state.venues.find((v) => v.id === id)).filter(Boolean) as Venue[])
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar title="My Lists" />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/venues/status')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">My Lists</h1>
              <p className="mt-1 text-sm text-muted-foreground">Save, organise and share venues</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar — list of lists */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your lists</span>
                <Button size="sm" variant="ghost" onClick={() => setCreatingList(true)} className="gap-1">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </div>

              {creatingList && (
                <div className="mb-3 flex gap-2">
                  <input
                    autoFocus
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') createList(); if (e.key === 'Escape') setCreatingList(false); }}
                    placeholder="List name..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="sm" onClick={createList}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setCreatingList(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : lists.length === 0 ? (
                <p className="text-sm text-muted-foreground">No lists yet. Create one above.</p>
              ) : (
                <div className="space-y-1">
                  {lists.map((list) => (
                    <div
                      key={list.id}
                      onClick={() => setActiveListId(list.id)}
                      className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                        activeListId === list.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {renamingId === list.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') renameList(list.id);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          className="flex-1 rounded bg-background px-2 py-0.5 text-sm text-foreground outline-none"
                        />
                      ) : (
                        <span className="flex-1 truncate text-sm font-medium">{list.name}</span>
                      )}
                      <span className={`ml-2 text-xs ${activeListId === list.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {list.venue_ids.length}
                      </span>
                      <div className="ml-2 hidden gap-1 group-hover:flex" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setRenamingId(list.id); setRenameValue(list.name); }} className="rounded p-0.5 hover:bg-black/10">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteList(list.id)} className="rounded p-0.5 hover:bg-black/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main area */}
            {activeList ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold">{activeList.name}</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full"
                      onClick={() => downloadList(activeList)}
                      disabled={activeList.venue_ids.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      Download Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full"
                      onClick={() => setSharingListId(activeList.id)}
                      disabled={activeList.venue_ids.length === 0}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Share input */}
                {sharingListId === activeList.id && (
                  <div className="mb-4 flex gap-2 rounded-lg border border-border bg-card p-3">
                    <input
                      autoFocus
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && shareList(activeList)}
                      placeholder="Enter email address..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    {shareSuccess ? (
                      <Button size="sm" className="gap-1 bg-green-600 text-white">
                        <Check className="h-4 w-4" /> Sent!
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => shareList(activeList)}>Send</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => { setSharingListId(null); setShareEmail(''); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Venues in this list */}
                {activeVenues.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                    No venues in this list yet. Add some from below.
                  </div>
                ) : (
                  <div className="mb-6 space-y-2">
                    {activeVenues.map((venue) => (
                      <div key={venue.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                        <div>
                          <p className="font-medium">{venue.name}</p>
                          <p className="text-sm text-muted-foreground">{venue.location} · {venue.capacity.min}–{venue.capacity.max} guests · £{(venue.priceRange.min/1000).toFixed(0)}k–£{(venue.priceRange.max/1000).toFixed(0)}k</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusPill status={venue.status} />
                          <button
                            onClick={() => toggleVenueInList(activeList.id, venue.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* All venues to add from */}
                <div>
                  <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Add venues</p>
                  <div className="space-y-2">
                    {state.venues
                      .filter((v) => !activeList.venue_ids.includes(v.id))
                      .map((venue) => (
                        <div key={venue.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 opacity-70 hover:opacity-100">
                          <div>
                            <p className="font-medium">{venue.name}</p>
                            <p className="text-sm text-muted-foreground">{venue.location} · {venue.matchScore}% match</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 rounded-full"
                            onClick={() => toggleVenueInList(activeList.id, venue.id)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-16 text-center text-muted-foreground">
                {lists.length === 0 ? 'Create a list to get started' : 'Select a list to view and manage it'}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
