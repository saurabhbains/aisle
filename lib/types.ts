export type VenueStatus =
  | 'awaiting_response'
  | 'call_scheduled'
  | 'call_completed'
  | 'visit_scheduled'
  | 'visit_completed'
  | 'shortlisted'
  | 'rejected'
  | 'missing_info'
  | 'criteria_not_met';

export type VenueType = 'country_estate' | 'barn' | 'hotel' | 'garden' | 'castle' | 'vineyard';

export interface Venue {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  type: VenueType;
  capacity: {
    min: number;
    max: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
  status: VenueStatus;
  matchScore: number;
  features: string[];
  website?: string;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  availability?: {
    date: string;
    slots: string[];
  }[];
  callDetails?: {
    scheduledDate: string;
    scheduledTime: string;
    duration: string;
    notes?: string;
  };
  visitDetails?: {
    scheduledDate: string;
    scheduledTime: string;
    duration: string;
    notes?: string;
    confirmedGuests?: number;
  };
  callSummary?: {
    date: string;
    duration: string;
    keyPoints: string[];
    nextSteps: string[];
    overallImpression: 'positive' | 'neutral' | 'negative';
  };
  feedback?: {
    rating: number;
    pros: string[];
    cons: string[];
    notes: string;
    wouldRecommend: boolean;
  };
  missingInfoItems?: string[];
  contactAllowed?: boolean;
  failedCriteria?: string[];
  notes?: string;
  googleRating?: number;
  googleMapsUrl?: string;
  googlePhotoRefs?: string[];
  lastReply?: {
    from: string;
    subject: string;
    summary: string;
    body?: string;
    receivedAt: string;
    messageId?: string;
  };
  replies?: {
    from: string;
    subject: string;
    summary: string;
    body?: string;
    receivedAt: string;
    messageId?: string;
  }[];
}

export interface Criteria {
  id: string;
  label: string;
  value: string;
  category: 'basics' | 'style' | 'amenities' | 'logistics';
  confirmed: boolean;
}

export interface MissingInfo {
  id: string;
  venueName: string;
  venueId: string;
  question: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'answered';
  answer?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AppState {
  currentStep: 'onboarding' | 'criteria' | 'venues' | 'booking';
  criteria: Criteria[];
  venues: Venue[];
  missingInfo: MissingInfo[];
  selectedVenueId: string | null;
  inputMode: 'voice' | 'text' | null;
  emailDraft: {
    subject: string;
    body: string;
    approved: boolean;
  } | null;
}
