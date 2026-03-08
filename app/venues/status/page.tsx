'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Users,
  ChevronRight,
  Star,
  Mail,
  X,
  Share2,
  Loader2,
  Pencil,
  GitCompareArrows,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopBar } from '@/components/top-bar';
import { StatusPill } from '@/components/status-pill';
import { useApp } from '@/lib/context';
import type { Venue, VenueStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { validateVenueCriteria, detectMissingInfo } from '@/lib/criteria-validator';

const statusGroups: { status: VenueStatus; label: string; icon: React.ElementType }[] = [
  { status: 'awaiting_response', label: 'Awaiting Response', icon: Clock },
  { status: 'call_scheduled', label: 'Calls Scheduled', icon: Phone },
  { status: 'call_completed', label: 'Calls Completed', icon: CheckCircle2 },
  { status: 'visit_scheduled', label: 'Visits Scheduled', icon: Calendar },
  { status: 'visit_completed', label: 'Visits Completed', icon: CheckCircle2 },
  { status: 'missing_info', label: 'Missing Info', icon: AlertCircle },
];

interface VenueRowProps {
  venue: Venue;
  onAllowContact?: (venueId: string) => void;
  onAddResponse?: (venueId: string) => void;
  onRemoveVenue?: (venueId: string) => void;
  onSendFollowUp?: (venueId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (venueId: string) => void;
}

function VenueRow({ venue, onAllowContact, onAddResponse, onRemoveVenue, onSendFollowUp, isSelected, onToggleSelect }: VenueRowProps) {
  const hasMissingInfo = (venue.status === 'missing_info' || venue.contactAllowed) && venue.missingInfoItems && venue.missingInfoItems.length > 0;
  const hasFailedCriteria = venue.status === 'criteria_not_met' && venue.failedCriteria && venue.failedCriteria.length > 0;
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(venue.contact?.email || '');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const { updateVenue } = useApp();

  const handleSaveEmail = () => {
    updateVenue(venue.id, { contact: { ...venue.contact!, email: emailValue } });
    setEditingEmail(false);
  };

  // Use venue image or fallback to placeholder
  const venueImage = venue.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&h=200&fit=crop';

  return (
    <div
      className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        {onToggleSelect && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(venue.id); }}
            className="mt-1 flex-shrink-0"
          >
            {isSelected ? (
              <CheckSquare className="h-5 w-5 text-primary" />
            ) : (
              <Square className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        )}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={venueImage}
            alt={venue.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <Link href={`/venues/${venue.id}`} className="min-w-0 hover:underline">
              <h3 className="truncate font-serif text-lg font-semibold">{venue.name}</h3>
            </Link>
            <div className="flex flex-shrink-0 items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {venue.matchScore}%
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{venue.location}</p>

          {/* Venue details: capacity and pricing */}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {venue.capacity && (
              <span>👥 {venue.capacity.min}-{venue.capacity.max} guests</span>
            )}
            {venue.priceRange && (
              <span>💰 £{venue.priceRange.min.toLocaleString()}-£{venue.priceRange.max.toLocaleString()}</span>
            )}
          </div>

          {/* Features/Amenities */}
          {venue.features && venue.features.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {venue.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {feature}
                </span>
              ))}
              {venue.features.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{venue.features.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="mt-2 flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={venue.status} />
              {venue.lastReply && (
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  {venue.replies?.length || 1} {(venue.replies?.length || 1) === 1 ? 'Reply' : 'Replies'} · Last {new Date(venue.lastReply.receivedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </button>
              )}

              {/* Replies modal */}
              {showReplyModal && venue.lastReply && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowReplyModal(false)}>
                  <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" />
                  <div className="relative z-10 w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-serif text-lg font-semibold text-foreground">
                        Replies from {venue.name} ({venue.replies?.length || 1})
                      </h2>
                      <button onClick={() => setShowReplyModal(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(venue.replies || [venue.lastReply]).map((reply, i) => (
                        <div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">
                              {new Date(reply.receivedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <span className="text-xs text-muted-foreground">#{i + 1}</span>
                          </div>
                          {reply.summary && (
                            <div className="mb-3 rounded-lg bg-green-50 p-2.5">
                              <p className="text-xs font-medium text-green-700 mb-1">AI Summary</p>
                              <p className="text-sm text-green-900">{reply.summary}</p>
                            </div>
                          )}
                          <p className="text-xs font-medium text-muted-foreground mb-1">Subject: {reply.subject}</p>
                          <p className="whitespace-pre-wrap text-sm text-foreground">{reply.body || reply.summary || 'No content available'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {venue.callDetails && (
                <span className="text-xs text-muted-foreground">
                  Call: {venue.callDetails.scheduledDate} at {venue.callDetails.scheduledTime}
                </span>
              )}
              {venue.visitDetails && (
                <span className="text-xs text-muted-foreground">
                  Visit: {venue.visitDetails.scheduledDate} at {venue.visitDetails.scheduledTime}
                </span>
              )}
            </div>
            {venue.contact && (
              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                {venue.contact.name && venue.contact.name !== 'Events Team' && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Contact: {venue.contact.name}</span>
                  </div>
                )}
                {(venue.contact.email || editingEmail) && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    {editingEmail ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="email"
                          value={emailValue}
                          onChange={(e) => setEmailValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEmail(); if (e.key === 'Escape') setEditingEmail(false); }}
                          className="rounded border border-primary/30 bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                          autoFocus
                        />
                        <button onClick={handleSaveEmail} className="text-xs text-primary hover:underline">Save</button>
                        <button onClick={() => setEditingEmail(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span>{venue.contact.email}</span>
                        <button onClick={() => { setEmailValue(venue.contact?.email || ''); setEditingEmail(true); }} className="text-muted-foreground/50 hover:text-primary">
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Failed criteria section */}
          {hasFailedCriteria && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-red-700">Criteria not met</p>
              <div className="flex flex-wrap gap-2">
                {venue.failedCriteria?.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing info section and Send Email button */}
          <div className="mt-3">
            {hasMissingInfo && (
              <>
                <p className="mb-2 text-xs font-medium text-foreground">Missing information</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {venue.missingInfoItems?.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Criteria not met - show email option and reject option */}
            {venue.status === 'criteria_not_met' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddResponse?.(venue.id);
                  }}
                  className="rounded-full text-xs"
                >
                  Send email anyway
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove ${venue.name} from your list? This will mark it as "Not Proceeding".`)) {
                      onRemoveVenue?.(venue.id);
                    }
                  }}
                  className="rounded-full text-xs border-red-200 text-red-700 hover:bg-red-50"
                >
                  Remove venue
                </Button>
              </div>
            )}

            {/* Normal flow - criteria met or not yet evaluated */}
            {!venue.contactAllowed && venue.status !== 'criteria_not_met' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAllowContact?.(venue.id);
                }}
                className="rounded-full bg-foreground text-card hover:bg-foreground/90"
              >
                Send Email
              </Button>
            )}
            {venue.contactAllowed && venue.status !== 'criteria_not_met' && (
              <div className="flex flex-col gap-2">
                {/* Show "Send follow-up email" only if venue has missing info AND status is 'missing_info' */}
                {hasMissingInfo && venue.status === 'missing_info' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendFollowUp?.(venue.id);
                    }}
                    className="rounded-full text-xs"
                  >
                    Send follow-up email
                  </Button>
                ) : (
                  <>
                    {!hasMissingInfo && venue.status === 'awaiting_response' && (
                      <p className="text-xs text-secondary">Email sent - awaiting response</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddResponse?.(venue.id);
                      }}
                      className="rounded-full text-xs"
                    >
                      Add venue response
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <Link href={`/venues/${venue.id}`}>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

type EmailModalState = 'closed' | 'intent' | 'draft' | 'send';

export default function StatusDashboardPage() {
  const router = useRouter();
  const { state, getVenuesByStatus, updateVenue, getVenueById } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

  const toggleCompareSelection = (venueId: string) => {
    const next = new Set(selectedForCompare);
    if (next.has(venueId)) {
      next.delete(venueId);
    } else if (next.size < 3) {
      next.add(venueId);
    }
    setSelectedForCompare(next);
  };

  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [saveListName, setSaveListName] = useState('');
  const [savingList, setSavingList] = useState(false);
  const [saveListSuccess, setSaveListSuccess] = useState(false);

  const handleSaveList = async () => {
    if (!saveListName.trim() || selectedForCompare.size === 0) return;
    setSavingList(true);
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: saveListName.trim(), venue_ids: Array.from(selectedForCompare) }),
    });
    const data = await res.json();
    if (data.list) {
      setSaveListSuccess(true);
      setTimeout(() => {
        setShowSaveListModal(false);
        setSaveListName('');
        setSaveListSuccess(false);
        setSelectedForCompare(new Set());
      }, 1500);
    }
    setSavingList(false);
  };

  const [emailModalState, setEmailModalState] = useState<EmailModalState>('closed');
  const [selectedVenueForEmail, setSelectedVenueForEmail] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string>('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState<string>('');
  const [showCallBookingModal, setShowCallBookingModal] = useState(false);
  const [callBookingMethod, setCallBookingMethod] = useState<'sync' | 'manual'>('sync');
  const [showVisitBookingModal, setShowVisitBookingModal] = useState(false);
  const [visitBookingMethod, setVisitBookingMethod] = useState<'sync' | 'manual'>('sync');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedVenueForResponse, setSelectedVenueForResponse] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharingVenues, setIsSharingVenues] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const selectedVenue = selectedVenueForEmail ? getVenueById(selectedVenueForEmail) : null;

  const generateEmailDraft = async (venue: Venue) => {
    try {
      // Get user's criteria from context
      const criteriaText = state.criteria.map(c => `${c.value}`).join('\n');

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueName: venue.name,
          venueInfo: {
            location: venue.location,
            features: venue.features,
            missingInfo: venue.missingInfoItems
          },
          criteria: {
            text: criteriaText
          },
          coupleName: 'Sarah & John'
        })
      });

      const data = await response.json();

      if (data.success && data.emailContent) {
        return data.emailContent;
      }
    } catch (error) {
      console.error('Error generating AI email:', error);
    }

    // Fallback to simple template if AI fails
    const criteriaText = state.criteria.map(c => `${c.value}`).join('\n');
    return `Dear ${venue.name} Team,

I hope this email finds you well. I am reaching out regarding wedding venue availability and would like to inquire about the following information:

${venue.missingInfoItems && venue.missingInfoItems.length > 0 ? `Missing Information Needed:\n${venue.missingInfoItems.map(item => `- ${item}`).join('\n')}\n\n` : ''}Our Wedding Criteria:
${criteriaText}

We would greatly appreciate if you could provide the above details at your earliest convenience. We are very interested in your venue and look forward to hearing from you.

Best regards,
Sarah & John`;
  };

  const handleAllowContact = async (venueId: string) => {
    setSelectedVenueForEmail(venueId);
    setIsGeneratingEmail(true);
    setEmailModalState('intent'); // Open modal immediately

    const venue = getVenueById(venueId);
    if (venue) {
      const draft = await generateEmailDraft(venue);
      setEmailDraft(draft);
    }
    setIsGeneratingEmail(false);
  };

  const handleReviewDraft = () => {
    setEmailModalState('draft');
  };

  const handleSendDirectly = async () => {
    if (!selectedVenueForEmail || !selectedVenue) return;

    try {
      const venueEmail = selectedVenue.contact?.email;
      if (!venueEmail) {
        alert('No email address found for this venue. Please add one by clicking the edit icon next to the email on the dashboard.');
        return;
      }
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: venueEmail,
          subject: `Wedding Inquiry - ${selectedVenue.name}`,
          emailBody: emailDraft
        })
      });

      const data = await response.json();

      if (data.success) {
        updateVenue(selectedVenueForEmail, {
          contactAllowed: true,
          status: 'awaiting_response' as VenueStatus
        });
        alert(`Email sent successfully to ${venueEmail}`);
      } else {
        alert('Failed to send email: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    }

    setEmailModalState('closed');
    setSelectedVenueForEmail(null);
  };

  const handleProceedToSend = () => {
    setEmailModalState('send');
  };

  const handleSendEmail = async () => {
    if (!selectedVenueForEmail || !selectedVenue) return;

    try {
      const venueEmail = selectedVenue.contact?.email;
      if (!venueEmail) {
        alert('No email address found for this venue. Please add one by clicking the edit icon next to the email on the dashboard.');
        return;
      }
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: venueEmail,
          subject: `Wedding Inquiry - ${selectedVenue.name}`,
          emailBody: emailDraft
        })
      });

      const data = await response.json();

      if (data.success) {
        updateVenue(selectedVenueForEmail, {
          contactAllowed: true,
          status: 'awaiting_response' as VenueStatus
        });
        alert(`Email sent successfully to ${venueEmail}`);
      } else {
        alert('Failed to send email: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    }

    setEmailModalState('closed');
    setSelectedVenueForEmail(null);
  };

  const handleCancelEmail = () => {
    setEmailModalState('closed');
    setSelectedVenueForEmail(null);
    setEmailDraft('');
  };

  const handleOpenCallBooking = () => {
    if (selectedVenueForBooking) {
      setShowCallBookingModal(true);
    }
  };

  const handleConfirmCallBooking = () => {
    if (selectedVenueForBooking) {
      // In a real app, would integrate with calendar or show availability grid
      updateVenue(selectedVenueForBooking, {
        status: 'call_scheduled',
        callDetails: {
          scheduledDate: 'March 5, 2026',
          scheduledTime: '2:00 PM',
          duration: '30 min'
        }
      });
    }
    setShowCallBookingModal(false);
    setSelectedVenueForBooking('');
  };

  const handleCancelCallBooking = () => {
    setShowCallBookingModal(false);
  };

  const handleOpenVisitBooking = () => {
    if (selectedVenueForBooking) {
      setShowVisitBookingModal(true);
    }
  };

  const handleConfirmVisitBooking = () => {
    if (selectedVenueForBooking) {
      updateVenue(selectedVenueForBooking, {
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
    setSelectedVenueForBooking('');
  };

  const handleCancelVisitBooking = () => {
    setShowVisitBookingModal(false);
  };

  const handleAddResponse = (venueId: string) => {
    setSelectedVenueForResponse(venueId);
    setShowResponseModal(true);
  };

  const handleRemoveVenue = (venueId: string) => {
    updateVenue(venueId, {
      status: 'rejected'
    });
  };

  const handleSendFollowUp = async (venueId: string) => {
    // Validate venue exists
    const venue = getVenueById(venueId);
    if (!venue) {
      alert('Venue not found. Please refresh the page and try again.');
      return;
    }

    // Validate missing info exists
    if (!venue.missingInfoItems || venue.missingInfoItems.length === 0) {
      alert('No missing information to follow up on for this venue.');
      return;
    }

    // Confirm with user
    const confirmed = confirm(
      `Send a follow-up email to ${venue.name} asking for the following missing information?\n\n${venue.missingInfoItems.map(item => `• ${item}`).join('\n')}`
    );
    if (!confirmed) return;

    try {
      // Generate follow-up email using AI
      const response = await fetch('/api/generate-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueName: venue.name,
          missingInfo: venue.missingInfoItems,
          contactName: venue.contact?.name || 'Events Team'
        })
      });

      // Check for network errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

        if (response.status === 429) {
          alert('Too many requests. Please wait a moment and try again.');
          return;
        }

        if (response.status === 503) {
          alert('AI service is temporarily unavailable. Please try again later.');
          return;
        }

        if (response.status >= 500) {
          alert(`Server error: ${errorData.error || 'Failed to generate follow-up email'}`);
          return;
        }

        alert(`Error: ${errorData.error || 'Failed to generate follow-up email'}`);
        return;
      }

      const data = await response.json();

      if (!data.success || !data.emailContent) {
        alert(data.error || 'Failed to generate follow-up email. Please try again.');
        return;
      }

      // Send the email — reply on same thread if we have a messageId
      const sendResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: venue.contact?.email || '',
          subject: `Additional Information Request - ${venue.name}`,
          emailBody: data.emailContent,
          inReplyTo: venue.lastReply?.messageId || undefined,
        })
      });

      // Check send email response
      if (!sendResponse.ok) {
        const sendErrorData = await sendResponse.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to send email: ${sendErrorData.error || 'Unknown error'}`);
        return;
      }

      const sendData = await sendResponse.json();

      if (sendData.success) {
        alert(
          `✓ Follow-up email sent successfully!\n\nVenue: ${venue.name}\nRecipient: ${venue.contact?.email}`
        );
      } else {
        alert(`Failed to send follow-up email: ${sendData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error sending follow-up:', error);

      // Handle specific error types
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error: Unable to connect to the server. Please check your internet connection.');
      } else if (error.name === 'AbortError') {
        alert('Request timed out. Please try again.');
      } else {
        alert(`Unexpected error: ${error.message || 'Failed to send follow-up email'}`);
      }
    }
  };

  const handleSubmitResponse = async () => {
    if ((!responseText.trim() && !uploadedFile) || !selectedVenueForResponse) {
      alert('Please provide either a text response or upload a file');
      return;
    }

    setIsProcessingResponse(true);

    try {
      console.log('Processing venue response for venue:', selectedVenueForResponse);

      // If there's a file, process it first
      let pdfExtractedInfo = null;
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('venueId', selectedVenueForResponse);

        const pdfResponse = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData
        });

        const pdfData = await pdfResponse.json();
        console.log('PDF parsing response:', pdfData);
        if (pdfData.success) {
          pdfExtractedInfo = pdfData.extractedData;
          console.log('PDF extracted info:', pdfExtractedInfo);
        }
      }

      // Process the text response
      let textExtractedInfo = null;
      if (responseText.trim()) {
        const response = await fetch('/api/simulate-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            venueId: selectedVenueForResponse,
            responseText: responseText
          })
        });

        const data = await response.json();
        console.log('Text response data:', data);

        if (data.success) {
          textExtractedInfo = data.response.extractedInfo;
        }
      }

      // Merge information from both sources (PDF and text)
      // Text response should override PDF where both exist, but we need to be smart about it
      const extractedInfo = {
        ...pdfExtractedInfo,
        ...textExtractedInfo
      };

      // If PDF had data but text response set fields to undefined/null, restore PDF data
      if (pdfExtractedInfo) {
        Object.keys(pdfExtractedInfo).forEach(key => {
          if (extractedInfo[key] === undefined || extractedInfo[key] === null) {
            extractedInfo[key] = pdfExtractedInfo[key];
          }
        });
      }

      console.log('Merged extracted info:', extractedInfo);
      console.log('PDF info:', pdfExtractedInfo);
      console.log('Text info:', textExtractedInfo);

      if (extractedInfo && Object.keys(extractedInfo).length > 0) {
        // Prepare venue updates with extracted information
        const venueUpdates: Partial<Venue> = {
          missingInfoItems: [],
          status: 'shortlisted'
        };

        // Update capacity if extracted
        if (extractedInfo.capacity) {
          if (typeof extractedInfo.capacity === 'object') {
            venueUpdates.capacity = {
              min: extractedInfo.capacity.min || extractedInfo.capacity.recommended || 50,
              max: extractedInfo.capacity.max || extractedInfo.capacity.recommended || 150
            };
          }
        }

        // Update price range if extracted
        if (extractedInfo.pricing) {
          if (typeof extractedInfo.pricing === 'object' && extractedInfo.pricing.venueHire) {
            const venueHire = parseInt(extractedInfo.pricing.venueHire.replace(/[£,]/g, ''));
            if (!isNaN(venueHire)) {
              venueUpdates.priceRange = {
                min: venueHire,
                max: venueHire + 5000
              };
            }
          }
        }

        // Update amenities/features if extracted
        if (extractedInfo.amenities && Array.isArray(extractedInfo.amenities)) {
          venueUpdates.features = extractedInfo.amenities;
        }

        // Update contact information
        const currentVenue = getVenueById(selectedVenueForResponse);
        if (currentVenue) {
          venueUpdates.contact = {
            name: extractedInfo.contactPerson || currentVenue.contact?.name || 'Events Team',
            email: extractedInfo.contactEmail || currentVenue.contact?.email || '',
            phone: extractedInfo.contactPhone || currentVenue.contact?.phone || ''
          };
        }

        // Apply updates to get the updated venue object for validation
        const updatedVenue = { ...currentVenue, ...venueUpdates } as Venue;

        // Validate against criteria (pass extractedInfo to check AI-determined availability)
        const validation = validateVenueCriteria(updatedVenue, state.criteria, extractedInfo);

        // Detect any remaining missing information (pass extractedInfo to check text responses too)
        const stillMissingInfo = detectMissingInfo(updatedVenue, state.criteria, extractedInfo);

        // Determine final status based on validation and missing info
        if (!validation.meetsAllCriteria) {
          venueUpdates.status = 'criteria_not_met';
          venueUpdates.failedCriteria = validation.failedCriteria;
          venueUpdates.missingInfoItems = []; // Clear missing info if criteria not met
        } else if (stillMissingInfo.length > 0) {
          venueUpdates.status = 'missing_info';
          venueUpdates.missingInfoItems = stillMissingInfo;
          venueUpdates.failedCriteria = []; // Clear failed criteria
        } else {
          venueUpdates.status = 'shortlisted';
          venueUpdates.missingInfoItems = [];
          venueUpdates.failedCriteria = [];
        }

        // Update venue with all extracted data
        updateVenue(selectedVenueForResponse, venueUpdates);

        console.log('Venue updated with extracted data:', venueUpdates);
        console.log('Extracted information:', extractedInfo);

        // Build summary of extracted information
        let infoSummary = `✅ AI successfully extracted information from the venue response:\n\n`;

        if (extractedInfo.availability) {
          infoSummary += `📅 Availability: ${extractedInfo.availability}\n`;
        }

        if (extractedInfo.pricing) {
          if (typeof extractedInfo.pricing === 'string') {
            infoSummary += `💰 Pricing: ${extractedInfo.pricing}\n`;
          } else if (extractedInfo.pricing.totalEstimate || extractedInfo.pricing.venueHire) {
            infoSummary += `💰 Pricing: ${extractedInfo.pricing.totalEstimate || extractedInfo.pricing.venueHire}\n`;
          }
        }

        if (extractedInfo.capacity) {
          if (typeof extractedInfo.capacity === 'string') {
            infoSummary += `👥 Capacity: ${extractedInfo.capacity}\n`;
          } else if (extractedInfo.capacity.recommended || extractedInfo.capacity.max) {
            infoSummary += `👥 Capacity: ${extractedInfo.capacity.recommended || extractedInfo.capacity.max} guests\n`;
          }
        }

        if (extractedInfo.catering) {
          if (typeof extractedInfo.catering === 'string') {
            infoSummary += `🍽️ Catering: ${extractedInfo.catering}\n`;
          } else if (extractedInfo.catering.options) {
            infoSummary += `🍽️ Catering: ${extractedInfo.catering.options}\n`;
          }
        }

        if (extractedInfo.amenities && Array.isArray(extractedInfo.amenities) && extractedInfo.amenities.length > 0) {
          infoSummary += `✨ ${extractedInfo.amenities.length} amenities confirmed\n`;
        }

        if (extractedInfo.siteVisit) {
          infoSummary += `📍 Site Visit: ${extractedInfo.siteVisit}\n`;
        }

        if (extractedInfo.contactPerson) {
          infoSummary += `📧 Contact: ${extractedInfo.contactPerson}\n`;
        }

        if (extractedInfo.notes) {
          infoSummary += `📝 Notes: ${extractedInfo.notes}\n`;
        }

        // Add validation result
        infoSummary += `\n`;
        if (!validation.meetsAllCriteria) {
          infoSummary += `❌ CRITERIA NOT MET:\n`;
          validation.failedCriteria.forEach(reason => {
            infoSummary += `   • ${reason}\n`;
          });
          infoSummary += `\nThis venue will be marked as "Criteria Not Met".`;
        } else if (stillMissingInfo.length > 0) {
          infoSummary += `⚠️ Still missing information:\n`;
          stillMissingInfo.forEach(item => {
            infoSummary += `   • ${item}\n`;
          });
          infoSummary += `\nYou can send a follow-up email to request this information.`;
        } else {
          infoSummary += `✅ All criteria met! Venue marked as "Shortlisted".`;
        }

        alert(infoSummary);

        // Close modal and reset
        setShowResponseModal(false);
        setResponseText('');
        setUploadedFile(null);
        setSelectedVenueForResponse(null);
      } else {
        alert('No information could be extracted from the response');
      }
    } catch (error) {
      console.error('Error processing venue response:', error);
      alert('Failed to process response');
    } finally {
      setIsProcessingResponse(false);
    }
  };

  const handleCancelResponse = () => {
    setShowResponseModal(false);
    setResponseText('');
    setUploadedFile(null);
    setSelectedVenueForResponse(null);
  };

  const handleShareVenues = async () => {
    if (!shareEmail.trim()) return;
    setIsSharingVenues(true);
    try {
      const res = await fetch('/api/share-venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: shareEmail, venues: state.venues }),
      });
      const data = await res.json();
      if (data.success) {
        setShareSuccess(true);
        setTimeout(() => {
          setShowShareModal(false);
          setShareEmail('');
          setShareSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharingVenues(false);
    }
  };

  const stats = {
    total: state.venues.length,
    inProgress: state.venues.filter(v => 
      ['awaiting_response', 'call_scheduled', 'visit_scheduled'].includes(v.status)
    ).length,
    completed: state.venues.filter(v => 
      ['call_completed', 'visit_completed', 'shortlisted'].includes(v.status)
    ).length,
    needsAttention: state.venues.filter(v => v.status === 'missing_info').length,
  };

  const upcomingCalls = state.venues.filter(v => v.status === 'call_scheduled');
  const upcomingVisits = state.venues.filter(v => v.status === 'visit_scheduled');

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <TopBar showSettings />

      {/* Email Approval Modal */}
      {emailModalState !== 'closed' && selectedVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={handleCancelEmail}
          />

          {/* Modal Content - Scrollable Container */}
          <div className="relative z-10 mx-auto w-full max-w-2xl my-8 px-4 sm:px-0">
            {/* Venue Card Preview */}
            <div className="mb-4 rounded-2xl bg-card p-4 shadow-lg sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <div className="h-32 w-full flex-shrink-0 rounded-lg bg-muted sm:w-48">
                  <div className="flex h-full w-full items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    {selectedVenue.name}
                  </h2>
                  <p className="mt-1 text-muted-foreground">{selectedVenue.location}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    A beautiful venue perfect for your special day. Features include elegant spaces and professional service.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedVenue.features?.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal States */}
            {emailModalState === 'intent' && (
              <div className="rounded-2xl bg-card p-8 text-center shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-foreground">
                  Do you want to review the draft email?
                </h3>
                <p className="mt-3 text-muted-foreground">
                  We've prepared an email to {selectedVenue.name} with your criteria and questions
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Button
                    onClick={handleSendDirectly}
                    disabled={isGeneratingEmail}
                    className="cursor-pointer rounded-full bg-primary px-8 py-3 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGeneratingEmail ? 'Generating...' : 'No, send directly'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReviewDraft}
                    disabled={isGeneratingEmail}
                    className="cursor-pointer rounded-full border-primary/30 px-8 py-3 text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Yes, review draft
                  </Button>
                </div>
              </div>
            )}

            {emailModalState === 'draft' && (
              <div className="rounded-2xl bg-card p-8 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    Review & Edit Email Draft
                  </h3>
                  <button onClick={handleCancelEmail} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <Textarea
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    className="min-h-[300px] w-full resize-none border-0 bg-transparent text-sm leading-relaxed focus-visible:ring-0"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelEmail}
                    className="rounded-full px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProceedToSend}
                    className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {emailModalState === 'send' && (
              <div className="rounded-2xl bg-card p-8 text-center shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/30">
                  <CheckCircle2 className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-foreground">
                  Ready to send?
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Your email to {selectedVenue.name} is ready to be sent
                </p>
                <div className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm">
                  {selectedVenue.contact?.email ? (
                    <span>Sending to <strong>{selectedVenue.contact.email}</strong></span>
                  ) : (
                    <span className="text-destructive">⚠️ No email address on file for this venue. Add one before sending.</span>
                  )}
                </div>
                <div className="mt-8 flex justify-center gap-4">
                  <Button
                    onClick={handleSendEmail}
                    className="rounded-full bg-primary px-8 py-3 text-primary-foreground hover:bg-primary/90"
                  >
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEmail}
                    className="rounded-full px-8 py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Venue Response Modal - Combined Upload and Text */}
      {/* Share Venues Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-foreground">Share venue list</h2>
              <button onClick={() => setShowShareModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {shareSuccess ? (
              <div className="py-6 text-center">
                <p className="text-lg font-medium text-green-600">Email sent!</p>
                <p className="mt-1 text-sm text-muted-foreground">Your venue list has been shared.</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Enter an email address and we'll send them your list of {state.venues.length} venues.
                </p>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="mb-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onKeyDown={(e) => e.key === 'Enter' && handleShareVenues()}
                />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowShareModal(false)} className="flex-1 rounded-full">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleShareVenues}
                    disabled={!shareEmail.trim() || isSharingVenues}
                    className="flex-1 gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSharingVenues ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : 'Send email'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save as List Modal */}
      {showSaveListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowSaveListModal(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            {saveListSuccess ? (
              <div className="text-center py-4">
                <p className="font-serif text-xl font-semibold text-foreground">List saved!</p>
                <p className="mt-1 text-sm text-muted-foreground">You can view it in My Lists.</p>
              </div>
            ) : (
              <>
                <h2 className="mb-1 font-serif text-xl font-semibold text-foreground">Save as List</h2>
                <p className="mb-4 text-sm text-muted-foreground">{selectedForCompare.size} venue{selectedForCompare.size !== 1 ? 's' : ''} selected</p>
                <input
                  autoFocus
                  value={saveListName}
                  onChange={(e) => setSaveListName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveList(); if (e.key === 'Escape') setShowSaveListModal(false); }}
                  placeholder="e.g. Top picks, Barn venues..."
                  className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowSaveListModal(false)} className="flex-1 rounded-full">Cancel</Button>
                  <Button
                    onClick={handleSaveList}
                    disabled={!saveListName.trim() || savingList}
                    className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {savingList ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showResponseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={handleCancelResponse} />
          <div className="relative z-10 mx-auto w-full max-w-2xl my-8 px-4 sm:px-0">
            <div className="rounded-2xl bg-card p-5 shadow-xl sm:p-8">
              <h2 className="mb-6 text-center font-serif text-xl font-semibold text-foreground sm:text-2xl">
                Add Venue Response
              </h2>

              <p className="mb-4 text-center text-sm text-muted-foreground">
                Paste the venue's email response and/or upload attachments (PDF brochures, etc.). Our AI will extract all missing information.
              </p>

              {/* Text Response */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Email Response (Optional)
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Paste the venue's email response here...&#10;&#10;Example:&#10;Hi Sarah & John,&#10;&#10;Thank you for your interest! We're delighted to confirm availability for June 15, 2025. Our venue hire is £8,500 with catering at £95 per guest..."
                  className="min-h-[200px] w-full resize-none rounded-lg border border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {responseText.length} characters
                </p>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,.eml"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
                {uploadedFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {uploadedFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleCancelResponse}
                  className="flex-1 rounded-full"
                  disabled={isProcessingResponse}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitResponse}
                  disabled={(!responseText.trim() && !uploadedFile) || isProcessingResponse}
                  className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isProcessingResponse ? 'Processing...' : 'Extract Information'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book a Call Modal */}
      {showCallBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={handleCancelCallBooking}
          />
          
          {/* Modal */}
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-card p-5 shadow-xl sm:p-8">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
              Book a call
            </h2>
            
            {/* Radio Options */}
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
                    callBookingMethod === 'sync' 
                      ? "border-primary" 
                      : "border-muted-foreground"
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
                    callBookingMethod === 'manual' 
                      ? "border-primary" 
                      : "border-muted-foreground"
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
            
            {/* Buttons */}
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
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={handleCancelVisitBooking}
          />
          
          {/* Modal */}
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-card p-5 shadow-xl sm:p-8">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
              Book a visit
            </h2>
            
            {/* Radio Options */}
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
                    visitBookingMethod === 'sync' 
                      ? "border-primary" 
                      : "border-muted-foreground"
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
                    visitBookingMethod === 'manual' 
                      ? "border-primary" 
                      : "border-muted-foreground"
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
            
            {/* Buttons */}
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

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Your Venue Journey
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track the status of all your venue inquiries in one place
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total Venues</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-600">{stats.needsAttention}</div>
                <p className="text-sm text-muted-foreground">Missing Info</p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Section */}
          {(upcomingCalls.length > 0 || upcomingVisits.length > 0) && (
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {upcomingCalls.length > 0 && (
                <Card className="border-blue-100 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 font-serif text-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                      Upcoming Calls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingCalls.map((venue) => (
                      <div
                        key={venue.id}
                        className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm"
                      >
                        <div>
                          <p className="font-medium">{venue.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {venue.callDetails?.scheduledDate} at {venue.callDetails?.scheduledTime}
                          </p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/venues/${venue.id}/call`}>Join Call</Link>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {upcomingVisits.length > 0 && (
                <Card className="border-purple-100 bg-purple-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 font-serif text-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Upcoming Visits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingVisits.map((venue) => (
                      <div
                        key={venue.id}
                        className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm"
                      >
                        <div>
                          <p className="font-medium">{venue.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {venue.visitDetails?.scheduledDate} at {venue.visitDetails?.scheduledTime}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/venues/${venue.id}`}>View Details</Link>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Venue Selector with Booking Actions */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Select a venue to book
                  </label>
                  <Select value={selectedVenueForBooking} onValueChange={setSelectedVenueForBooking}>
                    <SelectTrigger className="w-full sm:max-w-md">
                      <SelectValue placeholder="Choose a venue..." />
                    </SelectTrigger>
                    <SelectContent>
                      {state.venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name} - {venue.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-full gap-3 sm:w-auto">
                  <Button
                    variant="outline"
                    disabled={!selectedVenueForBooking}
                    onClick={handleOpenCallBooking}
                    className="flex-1 gap-2 rounded-full sm:flex-none"
                  >
                    <Phone className="h-4 w-4" />
                    Book a Call
                  </Button>
                  <Button
                    disabled={!selectedVenueForBooking}
                    onClick={handleOpenVisitBooking}
                    className="flex-1 gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-none"
                  >
                    <Calendar className="h-4 w-4" />
                    Book a Visit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Venue List with Tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-xl">All Venues</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/lists')}
                    className="gap-2 rounded-full border-border text-muted-foreground hover:bg-muted"
                  >
                    My Lists
                  </Button>
                  {selectedForCompare.size > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSaveListModal(true)}
                      className="gap-2 rounded-full"
                    >
                      Save as List ({selectedForCompare.size})
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={selectedForCompare.size >= 2 ? 'default' : 'outline'}
                    disabled={selectedForCompare.size < 2}
                    onClick={() => router.push(`/compare?ids=${Array.from(selectedForCompare).join(',')}`)}
                    className="gap-2 rounded-full"
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    {selectedForCompare.size >= 2
                      ? `Compare (${selectedForCompare.size})`
                      : 'Compare venues'}
                  </Button>
                  {state.venues.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowShareModal(true)}
                      className="gap-2 rounded-full border-border text-muted-foreground hover:bg-muted"
                    >
                      <Share2 className="h-4 w-4" />
                      Share list
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 w-full justify-start overflow-x-auto">
                  <TabsTrigger value="all">All ({state.venues.length})</TabsTrigger>
                  {statusGroups.map(({ status, label }) => {
                    const count = getVenuesByStatus(status).length;
                    if (count === 0) return null;
                    return (
                      <TabsTrigger key={status} value={status}>
                        {label} ({count})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="all" className="space-y-3">
                  {state.venues.map((venue) => (
                    <VenueRow
                      key={venue.id}
                      venue={venue}
                      onAllowContact={handleAllowContact}
                      onAddResponse={handleAddResponse}
                      onRemoveVenue={handleRemoveVenue}
                      onSendFollowUp={handleSendFollowUp}
                      isSelected={selectedForCompare.has(venue.id)}
                      onToggleSelect={toggleCompareSelection}
                    />
                  ))}
                </TabsContent>

                {statusGroups.map(({ status }) => (
                  <TabsContent key={status} value={status} className="space-y-3">
                    {getVenuesByStatus(status).map((venue) => (
                      <VenueRow
                        key={venue.id}
                        venue={venue}
                        onAllowContact={handleAllowContact}
                        onAddResponse={handleAddResponse}
                        onRemoveVenue={handleRemoveVenue}
                        onSendFollowUp={handleSendFollowUp}
                        isSelected={selectedForCompare.has(venue.id)}
                        onToggleSelect={toggleCompareSelection}
                      />
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
