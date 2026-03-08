'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Users,
  Star,
  Phone,
  Calendar,
  Mail,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopBar } from '@/components/top-bar';
import { StatusPill } from '@/components/status-pill';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

interface VenueDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getVenueById, updateVenue } = useApp();
  
  const venue = getVenueById(id);

  // Modal states
  const [showCallBookingModal, setShowCallBookingModal] = useState(false);
  const [callBookingMethod, setCallBookingMethod] = useState<'sync' | 'manual'>('sync');
  const [showVisitBookingModal, setShowVisitBookingModal] = useState(false);
  const [visitBookingMethod, setVisitBookingMethod] = useState<'sync' | 'manual'>('sync');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [criteriaChanged, setCriteriaChanged] = useState(false);
  const [notes, setNotes] = useState(venue?.notes || '');
  const [notesSaved, setNotesSaved] = useState(false);
  const [photos, setPhotos] = useState<{ url: string; thumbnail: string }[]>([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(true);

  useEffect(() => {
    if (!venue) return;
    setPhotosLoading(true);
    const params = new URLSearchParams({ name: venue.name, location: venue.location });
    if (venue.googlePhotoRefs?.length) {
      params.set('photoRefs', venue.googlePhotoRefs.join(','));
    }
    fetch(`/api/venue-photos?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.photos?.length) setPhotos(d.photos);
        setPhotosLoading(false);
      })
      .catch(() => setPhotosLoading(false));
  }, [venue?.id]);

  // Call booking handlers
  const handleOpenCallBooking = () => {
    setShowCallBookingModal(true);
  };

  const handleConfirmCallBooking = () => {
    if (venue) {
      updateVenue(venue.id, {
        status: 'call_scheduled',
        callDetails: {
          scheduledDate: 'March 5, 2026',
          scheduledTime: '2:00 PM',
          duration: '30 min'
        }
      });
    }
    setShowCallBookingModal(false);
  };

  const handleCancelCallBooking = () => {
    setShowCallBookingModal(false);
  };

  // Visit booking handlers
  const handleOpenVisitBooking = () => {
    setShowVisitBookingModal(true);
  };

  const handleConfirmVisitBooking = () => {
    if (venue) {
      updateVenue(venue.id, {
        status: 'visit_scheduled',
        visitDetails: {
          scheduledDate: 'March 10, 2026',
          scheduledTime: '11:00 AM',
          duration: '60 min',
          confirmedGuests: 2,
          notes: 'Looking forward to seeing the venue!'
        }
      });
    }
    setShowVisitBookingModal(false);
  };

  const handleCancelVisitBooking = () => {
    setShowVisitBookingModal(false);
  };

  // Feedback handlers
  const handleOpenFeedback = () => {
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = () => {
    if (venue) {
      updateVenue(venue.id, { 
        status: 'visit_completed',
        feedback: {
          rating: 4,
          pros: ['Beautiful setting', 'Great staff', 'Excellent food options'],
          cons: ['Parking limited', 'No outdoor backup'],
          notes: feedbackText,
          wouldRecommend: true
        }
      });
    }
    setShowFeedbackModal(false);
    setFeedbackText('');
    setCriteriaChanged(false);
  };

  const handleCancelFeedback = () => {
    setShowFeedbackModal(false);
    setFeedbackText('');
    setCriteriaChanged(false);
  };

  if (!venue) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar showBack backHref="/venues/status" />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Venue not found</p>
        </main>
      </div>
    );
  }

  const formatPrice = (min: number, max: number) => {
    return `£${(min / 1000).toFixed(0)}k - £${(max / 1000).toFixed(0)}k`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar showBack backHref="/venues/status" />

      {/* Book a Call Modal */}
      {showCallBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={handleCancelCallBooking}
          />
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
              Book a call
            </h2>
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setCallBookingMethod('sync')}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-all",
                  callBookingMethod === 'sync' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2",
                    callBookingMethod === 'sync' ? "border-primary" : "border-muted-foreground"
                  )}>
                    {callBookingMethod === 'sync' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sync my calendar</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Connect your calendar to automatically find available times
                    </p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setCallBookingMethod('manual')}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-all",
                  callBookingMethod === 'manual' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2",
                    callBookingMethod === 'manual' ? "border-primary" : "border-muted-foreground"
                  )}>
                    {callBookingMethod === 'manual' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Enter availability manually</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select your preferred times from a calendar grid
                    </p>
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-8 flex gap-4">
              <Button
                variant="outline"
                onClick={handleCancelCallBooking}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCallBooking}
                className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm booking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Book a Visit Modal */}
      {showVisitBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={handleCancelVisitBooking}
          />
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
              Book a visit
            </h2>
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setVisitBookingMethod('sync')}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-all",
                  visitBookingMethod === 'sync' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2",
                    visitBookingMethod === 'sync' ? "border-primary" : "border-muted-foreground"
                  )}>
                    {visitBookingMethod === 'sync' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sync my calendar</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Connect your calendar to automatically find available times
                    </p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setVisitBookingMethod('manual')}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-all",
                  visitBookingMethod === 'manual' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2",
                    visitBookingMethod === 'manual' ? "border-primary" : "border-muted-foreground"
                  )}>
                    {visitBookingMethod === 'manual' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Enter availability manually</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select your preferred times from a calendar grid
                    </p>
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-8 flex gap-4">
              <Button
                variant="outline"
                onClick={handleCancelVisitBooking}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmVisitBooking}
                className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Visit Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={handleCancelFeedback}
          />
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
              Visit feedback
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Post-visit feedback
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts about the venue after your visit..."
                  className="min-h-[140px] w-full resize-none rounded-xl border border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div 
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                    criteriaChanged 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground"
                  )}
                  onClick={() => setCriteriaChanged(!criteriaChanged)}
                >
                  {criteriaChanged && (
                    <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm text-foreground">This visit changed our criteria</span>
              </label>
            </div>
            
            <div className="mt-8 flex gap-4">
              <Button
                variant="outline"
                onClick={handleCancelFeedback}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Photo Gallery */}
          {photosLoading ? (
            <div className="mb-8 flex h-80 items-center justify-center overflow-hidden rounded-xl bg-muted sm:h-96">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-primary" />
            </div>
          ) : photos.length > 0 ? (
            <div className="mb-8">
              {/* Main photo */}
              <div
                className="relative mb-2 h-80 w-full cursor-pointer overflow-hidden rounded-xl bg-muted sm:h-96"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={photos[activePhoto].url}
                  alt={venue.name}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePhoto(p => (p - 1 + photos.length) % photos.length); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePhoto(p => (p + 1) % photos.length); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                      {activePhoto + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activePhoto === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={photo.thumbnail} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-8 flex h-64 items-center justify-center overflow-hidden rounded-xl bg-muted">
              <MapPin className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Lightbox */}
          {lightboxOpen && photos.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightboxOpen(false)}>
              <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => setLightboxOpen(false)}>
                <X className="h-6 w-6" />
              </button>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setActivePhoto(p => (p - 1 + photos.length) % photos.length); }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <img
                src={photos[activePhoto].url}
                alt={venue.name}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setActivePhoto(p => (p + 1) % photos.length); }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 text-sm text-white/70">{activePhoto + 1} / {photos.length}</div>
            </div>
          )}

          {/* Header Info */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="font-serif text-3xl font-bold">{venue.name}</h1>
                <StatusPill status={venue.status} />
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{venue.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-semibold">{venue.matchScore}% Match</span>
              </div>
              {venue.googleRating && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{venue.googleRating} on Google</span>
                </div>
              )}
              {venue.googleMapsUrl && (
                <a href={venue.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" />
                  View on Google Maps
                </a>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-semibold">{venue.capacity.min} - {venue.capacity.max} guests</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-lg font-semibold text-muted-foreground">£</span>
                <div>
                  <p className="text-sm text-muted-foreground">Price Range</p>
                  <p className="font-semibold">{formatPrice(venue.priceRange.min, venue.priceRange.max)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{venue.status.replace('_', ' ')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {venue.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-3 py-1 text-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                    {feature}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call Summary (if available) */}
          {venue.callSummary && (
            <Card className="mb-8 border-emerald-200 bg-emerald-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Phone className="h-5 w-5 text-emerald-600" />
                  Call Summary
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {venue.callSummary.date} • {venue.callSummary.duration}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Key Points</h4>
                  <ul className="space-y-1">
                    {venue.callSummary.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Next Steps</h4>
                  <ul className="space-y-1">
                    {venue.callSummary.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visit Feedback (if available) */}
          {venue.feedback && (
            <Card className="mb-8 border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Visit Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-5 w-5',
                          star <= venue.feedback!.rating
                            ? 'fill-primary text-primary'
                            : 'text-muted'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium text-green-700">Pros</h4>
                    <ul className="space-y-1">
                      {venue.feedback.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium text-red-700">Cons</h4>
                    <ul className="space-y-1">
                      {venue.feedback.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-center">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {venue.feedback.notes && (
                  <div>
                    <h4 className="mb-2 font-medium">Notes</h4>
                    <p className="text-sm text-muted-foreground">{venue.feedback.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          {venue.contact && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{venue.contact.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${venue.contact.email}`} className="text-primary hover:underline">
                    {venue.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${venue.contact.phone}`} className="text-primary hover:underline">
                    {venue.contact.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Notes & Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
                placeholder="Add your own notes, call transcript, or observations about this venue..."
                className="h-40 w-full resize-none rounded-xl bg-muted/30 p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Paste call transcripts, brochure notes, or anything useful.</p>
                <button
                  onClick={() => { updateVenue(id, { notes }); setNotesSaved(true); }}
                  className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {notesSaved ? 'Saved' : 'Save notes'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={handleOpenCallBooking}
              className="flex-1 gap-2 rounded-full sm:flex-none"
            >
              <Phone className="h-4 w-4" />
              Book a Call
            </Button>
            <Button
              onClick={handleOpenVisitBooking}
              className="flex-1 gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-none"
            >
              <Calendar className="h-4 w-4" />
              Book a Visit
            </Button>
            {(venue.status === 'visit_completed' || venue.status === 'visit_scheduled') && !venue.feedback && (
              <Button
                onClick={handleOpenFeedback}
                className="flex-1 gap-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 sm:flex-none"
              >
                <Star className="h-4 w-4" />
                Input Feedback
              </Button>
            )}
            {venue.status === 'visit_completed' && !venue.feedback && (
              <Button asChild variant="outline" className="flex-1 sm:flex-none">
                <Link href={`/venues/${venue.id}/feedback`}>
                  <Star className="mr-2 h-4 w-4" />
                  Leave Feedback
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
