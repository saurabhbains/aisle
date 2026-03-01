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
  X
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
  onUploadResponse?: (venueId: string) => void;
  onSimulateResponse?: (venueId: string) => void;
}

function VenueRow({ venue, onAllowContact, onUploadResponse, onSimulateResponse }: VenueRowProps) {
  const hasMissingInfo = venue.status === 'missing_info' && venue.missingInfoItems && venue.missingInfoItems.length > 0;

  return (
    <div
      className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/venues/${venue.id}`} className="hover:underline">
              <h3 className="truncate font-serif text-lg font-semibold">{venue.name}</h3>
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
            <div className="flex items-center gap-3">
              <StatusPill status={venue.status} />
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
                {venue.contact.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    <span>{venue.contact.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>

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
            {!venue.contactAllowed && (
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
            {venue.contactAllowed && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-secondary">Email sent - awaiting response</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUploadResponse?.(venue.id);
                    }}
                    className="rounded-full text-xs"
                  >
                    Upload response
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSimulateResponse?.(venue.id);
                    }}
                    className="rounded-full text-xs"
                  >
                    Simulate response
                  </Button>
                </div>
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
  const [emailModalState, setEmailModalState] = useState<EmailModalState>('closed');
  const [selectedVenueForEmail, setSelectedVenueForEmail] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string>('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState<string>('');
  const [showCallBookingModal, setShowCallBookingModal] = useState(false);
  const [callBookingMethod, setCallBookingMethod] = useState<'sync' | 'manual'>('sync');
  const [showVisitBookingModal, setShowVisitBookingModal] = useState(false);
  const [visitBookingMethod, setVisitBookingMethod] = useState<'sync' | 'manual'>('sync');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVenueForUpload, setSelectedVenueForUpload] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [selectedVenueForSimulate, setSelectedVenueForSimulate] = useState<string | null>(null);
  const [simulatedResponseText, setSimulatedResponseText] = useState('');
  const [isProcessingSimulate, setIsProcessingSimulate] = useState(false);

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
      // Send the email to your email (demo mode - not spamming real venues)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'saurabhbains@berkeley.edu',
          subject: `[DEMO] Wedding Inquiry - ${selectedVenue.name}`,
          emailBody: emailDraft
          // from: defaults to onboarding@resend.dev (verified domain)
        })
      });

      const data = await response.json();

      if (data.success) {
        updateVenue(selectedVenueForEmail, {
          contactAllowed: true,
          status: 'awaiting_response' as VenueStatus
        });
        alert('Email sent successfully to saurabhbains@berkeley.edu!');
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
      // Send the email to your email (demo mode - not spamming real venues)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'saurabhbains@berkeley.edu',
          subject: `[DEMO] Wedding Inquiry - ${selectedVenue.name}`,
          emailBody: emailDraft
          // from: defaults to onboarding@resend.dev (verified domain)
        })
      });

      const data = await response.json();

      if (data.success) {
        updateVenue(selectedVenueForEmail, {
          contactAllowed: true,
          status: 'awaiting_response' as VenueStatus
        });
        alert('Email sent successfully to saurabhbains@berkeley.edu!');
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

  const handleUploadResponse = (venueId: string) => {
    setSelectedVenueForUpload(venueId);
    setShowUploadModal(true);
  };

  const handleSimulateResponse = (venueId: string) => {
    setSelectedVenueForSimulate(venueId);
    setShowSimulateModal(true);
  };

  const handleSubmitSimulatedResponse = async () => {
    if (!simulatedResponseText.trim() || !selectedVenueForSimulate) return;

    setIsProcessingSimulate(true);

    try {
      console.log('Processing simulated response for venue:', selectedVenueForSimulate);
      const response = await fetch('/api/simulate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: selectedVenueForSimulate,
          responseText: simulatedResponseText
        })
      });

      const data = await response.json();
      console.log('Simulate response data:', data);

      if (data.success) {
        const extractedInfo = data.response.extractedInfo;

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
        const currentVenue = getVenueById(selectedVenueForSimulate);
        if (currentVenue) {
          venueUpdates.contact = {
            name: extractedInfo.contactPerson || currentVenue.contact?.name || 'Events Team',
            email: extractedInfo.contactEmail || currentVenue.contact?.email || '',
            phone: extractedInfo.contactPhone || currentVenue.contact?.phone || ''
          };
        }

        // Update venue with all extracted data
        updateVenue(selectedVenueForSimulate, venueUpdates);

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
          infoSummary += `📧 Contact: ${extractedInfo.contactPerson}`;
        }

        alert(infoSummary);

        // Close modal and reset
        setShowSimulateModal(false);
        setSimulatedResponseText('');
        setSelectedVenueForSimulate(null);
      } else {
        alert('Failed to process response: ' + data.error);
      }
    } catch (error) {
      console.error('Error processing simulated response:', error);
      alert('Failed to process response');
    } finally {
      setIsProcessingSimulate(false);
    }
  };

  const handleCancelSimulate = () => {
    setShowSimulateModal(false);
    setSimulatedResponseText('');
    setSelectedVenueForSimulate(null);
  };

  const handleFileUpload = async () => {
    if (!uploadedFile || !selectedVenueForUpload) return;

    setIsProcessingUpload(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('venueId', selectedVenueForUpload);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const extractedData = data.extractedData;

        // Prepare venue updates with extracted information
        const venueUpdates: Partial<Venue> = {
          missingInfoItems: [],
          status: 'shortlisted'
        };

        // Update features if extracted
        if (extractedData.amenities && Array.isArray(extractedData.amenities)) {
          venueUpdates.features = extractedData.amenities;
        }

        // Extract capacity if available
        if (extractedData.capacity) {
          const capacityMatch = extractedData.capacity.match(/(\d+)-(\d+)/);
          if (capacityMatch) {
            venueUpdates.capacity = {
              min: parseInt(capacityMatch[1]),
              max: parseInt(capacityMatch[2])
            };
          }
        }

        // Extract pricing if available
        if (extractedData.pricing) {
          const pricingMatch = extractedData.pricing.match(/£([\d,]+)/);
          if (pricingMatch) {
            const price = parseInt(pricingMatch[1].replace(/,/g, ''));
            venueUpdates.priceRange = {
              min: price,
              max: price + 5000
            };
          }
        }

        // Update venue
        updateVenue(selectedVenueForUpload, venueUpdates);

        console.log('File uploaded and venue updated:', venueUpdates);

        alert('✅ Venue information updated successfully from uploaded file!\n\nAll missing information has been extracted and the venue is now ready for review.');
        setShowUploadModal(false);
        setUploadedFile(null);
        setSelectedVenueForUpload(null);
      } else {
        alert('Failed to parse file: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setUploadedFile(null);
    setSelectedVenueForUpload(null);
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
    <div className="flex min-h-screen flex-col bg-background">
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
          <div className="relative z-10 mx-auto w-full max-w-2xl my-8">
            {/* Venue Card Preview */}
            <div className="mb-4 rounded-2xl bg-card p-6 shadow-lg">
              <div className="flex gap-6">
                <div className="h-32 w-48 flex-shrink-0 rounded-lg bg-muted">
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

      {/* Upload Response Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={handleCancelUpload} />
          <div className="relative z-10 mx-auto w-full max-w-lg my-8">
            <div className="rounded-2xl bg-card p-8 shadow-xl">
              <h2 className="mb-6 text-center font-serif text-2xl font-semibold text-foreground">
                Upload Venue Response
              </h2>

              <p className="mb-4 text-center text-sm text-muted-foreground">
                Upload a PDF brochure or email reply from the venue. We'll extract the missing information automatically.
              </p>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Select file (PDF, TXT, or Email)
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
                  onClick={handleCancelUpload}
                  className="flex-1 rounded-full"
                  disabled={isProcessingUpload}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!uploadedFile || isProcessingUpload}
                >
                  {isProcessingUpload ? 'Processing...' : 'Upload & Extract'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Response Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={handleCancelSimulate} />
          <div className="relative z-10 mx-auto w-full max-w-2xl my-8">
            <div className="rounded-2xl bg-card p-8 shadow-xl">
              <h2 className="mb-6 text-center font-serif text-2xl font-semibold text-foreground">
                Paste Venue Response
              </h2>

              <p className="mb-4 text-center text-sm text-muted-foreground">
                Paste the venue's email response below. Our AI will automatically extract all the missing information (availability, pricing, catering options, etc.).
              </p>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Venue Email Response
                </label>
                <textarea
                  value={simulatedResponseText}
                  onChange={(e) => setSimulatedResponseText(e.target.value)}
                  placeholder="Paste the venue's email response here...&#10;&#10;Example:&#10;Hi Sarah & John,&#10;&#10;Thank you for your interest in our venue! We're delighted to confirm that we have availability for June 15, 2025. Our venue hire is £8,500 with catering at £95 per guest..."
                  className="min-h-[300px] w-full resize-none rounded-lg border border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {simulatedResponseText.length} characters
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleCancelSimulate}
                  className="flex-1 rounded-full"
                  disabled={isProcessingSimulate}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitSimulatedResponse}
                  disabled={!simulatedResponseText.trim() || isProcessingSimulate}
                  className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isProcessingSimulate ? 'Extracting...' : 'Extract Information'}
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
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl">
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
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl">
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

      <main className="flex-1 px-6 py-8">
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
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    disabled={!selectedVenueForBooking}
                    onClick={handleOpenCallBooking}
                    className="gap-2 rounded-full"
                  >
                    <Phone className="h-4 w-4" />
                    Book a Call
                  </Button>
                  <Button
                    disabled={!selectedVenueForBooking}
                    onClick={handleOpenVisitBooking}
                    className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
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
              <CardTitle className="font-serif text-xl">All Venues</CardTitle>
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
                      onUploadResponse={handleUploadResponse}
                      onSimulateResponse={handleSimulateResponse}
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
                      onUploadResponse={handleUploadResponse}
                      onSimulateResponse={handleSimulateResponse}
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
