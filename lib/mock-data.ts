import type { Venue, Criteria, MissingInfo } from './types';

export const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Hedsor House',
    location: 'Buckinghamshire',
    imageUrl: '/venues/hedsor-house.jpg',
    type: 'country_estate',
    capacity: { min: 80, max: 200 },
    priceRange: { min: 15000, max: 25000 },
    status: 'call_scheduled',
    matchScore: 95,
    features: ['Exclusive use', 'On-site accommodation', 'Stunning gardens', 'Historic ballroom'],
    contact: {
      name: 'Sarah Mitchell',
      email: 'events@hedsorhouse.com',
      phone: '+44 1234 567890'
    },
    availability: [
      { date: '2026-06-15', slots: ['10:00', '14:00'] },
      { date: '2026-06-16', slots: ['11:00', '15:00'] },
      { date: '2026-06-17', slots: ['10:00', '13:00', '16:00'] }
    ],
    callDetails: {
      scheduledDate: '2026-03-05',
      scheduledTime: '14:00',
      duration: '30 mins',
      notes: 'Discuss catering options and availability for September dates'
    }
  },
  {
    id: '2',
    name: 'Aynhoe Park',
    location: 'Oxfordshire',
    imageUrl: '/venues/aynhoe-park.jpg',
    type: 'country_estate',
    capacity: { min: 100, max: 300 },
    priceRange: { min: 20000, max: 35000 },
    status: 'visit_scheduled',
    matchScore: 92,
    features: ['Unique art collection', 'Giraffe sculptures', 'Multiple ceremony spaces', 'Luxury suites'],
    contact: {
      name: 'James Thompson',
      email: 'weddings@aynhoepark.co.uk',
      phone: '+44 1234 567891'
    },
    availability: [
      { date: '2026-06-20', slots: ['10:00', '14:00'] },
      { date: '2026-06-21', slots: ['11:00'] }
    ],
    visitDetails: {
      scheduledDate: '2026-03-10',
      scheduledTime: '11:00',
      duration: '2 hours',
      notes: 'Tour includes all ceremony spaces and accommodation',
      confirmedGuests: 2
    }
  },
  {
    id: '3',
    name: 'Cliveden House',
    location: 'Berkshire',
    imageUrl: '/venues/cliveden-house.jpg',
    type: 'country_estate',
    capacity: { min: 60, max: 150 },
    priceRange: { min: 18000, max: 30000 },
    status: 'awaiting_response',
    matchScore: 88,
    features: ['River views', 'Historic National Trust property', 'Spa facilities', 'Award-winning dining'],
    contact: {
      name: 'Emma Richardson',
      email: 'events@clivedenhouse.co.uk',
      phone: '+44 1234 567892'
    }
  },
  {
    id: '4',
    name: 'Babington House',
    location: 'Somerset',
    imageUrl: '/venues/babington-house.jpg',
    type: 'country_estate',
    capacity: { min: 50, max: 180 },
    priceRange: { min: 12000, max: 22000 },
    status: 'call_completed',
    matchScore: 85,
    features: ['Private members club', 'Indoor/outdoor pool', 'Cowshed spa', 'Casual elegance'],
    contact: {
      name: 'Oliver Barnes',
      email: 'weddings@babingtonhouse.co.uk',
      phone: '+44 1234 567893'
    },
    callSummary: {
      date: '2026-02-28',
      duration: '25 mins',
      keyPoints: [
        'Available for our preferred September dates',
        'Exclusive use includes all 33 bedrooms',
        'Flexible catering with their in-house team',
        'Ceremony can be held in the Walled Garden'
      ],
      nextSteps: [
        'Schedule site visit',
        'Request detailed pricing breakdown',
        'Discuss accommodation allocation'
      ],
      overallImpression: 'positive'
    }
  },
  {
    id: '5',
    name: 'Elmore Court',
    location: 'Gloucestershire',
    imageUrl: '/venues/elmore-court.jpg',
    type: 'country_estate',
    capacity: { min: 70, max: 200 },
    priceRange: { min: 14000, max: 24000 },
    status: 'visit_completed',
    matchScore: 90,
    features: ['Sustainable venue', 'Festival vibes', 'Gillyflower barn', 'Beautiful grounds'],
    contact: {
      name: 'Lucy Green',
      email: 'hello@elmorecourt.com',
      phone: '+44 1234 567894'
    },
    feedback: {
      rating: 4,
      pros: [
        'Amazing atmosphere and energy',
        'Staff were incredibly welcoming',
        'Flexible layout options',
        'Beautiful natural surroundings'
      ],
      cons: [
        'Slightly remote location',
        'Limited accommodation on-site'
      ],
      notes: 'Really loved the sustainable approach and the Gillyflower space was stunning. Would be perfect for a relaxed, festival-style celebration.',
      wouldRecommend: true
    }
  },
  {
    id: '6',
    name: 'Syon House',
    location: 'London',
    imageUrl: '/venues/syon-house.jpg',
    type: 'country_estate',
    capacity: { min: 100, max: 250 },
    priceRange: { min: 16000, max: 28000 },
    status: 'missing_info',
    matchScore: 82,
    features: ['London location', 'Historic interiors', 'Great conservatory', 'Easy access'],
    contact: {
      name: 'David Wilson',
      email: 'events@syonpark.co.uk',
      phone: '+44 1234 567895'
    }
  }
];

export const mockCriteria: Criteria[] = [
  { id: '1', label: 'Guest Count', value: '120-150 guests', category: 'basics', confirmed: true },
  { id: '2', label: 'Budget', value: '£15,000 - £25,000', category: 'basics', confirmed: true },
  { id: '3', label: 'Date', value: 'September 2026', category: 'basics', confirmed: true },
  { id: '4', label: 'Location', value: 'Within 2 hours of London', category: 'basics', confirmed: true },
  { id: '5', label: 'Style', value: 'Classic with modern touches', category: 'style', confirmed: true },
  { id: '6', label: 'Setting', value: 'Country estate or stately home', category: 'style', confirmed: true },
  { id: '7', label: 'Accommodation', value: 'On-site rooms required', category: 'amenities', confirmed: false },
  { id: '8', label: 'Catering', value: 'In-house or approved caterers', category: 'amenities', confirmed: true },
  { id: '9', label: 'Outdoor Space', value: 'Garden ceremony option', category: 'amenities', confirmed: true },
  { id: '10', label: 'Exclusivity', value: 'Exclusive use preferred', category: 'logistics', confirmed: true },
];

export const mockMissingInfo: MissingInfo[] = [
  {
    id: '1',
    venueName: 'Syon House',
    venueId: '6',
    question: 'What is the minimum spend requirement for Saturday weddings?',
    priority: 'high',
    status: 'pending'
  },
  {
    id: '2',
    venueName: 'Syon House',
    venueId: '6',
    question: 'Are external caterers allowed, or only approved suppliers?',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: '3',
    venueName: 'Cliveden House',
    venueId: '3',
    question: 'What is the latest finish time for music and dancing?',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: '4',
    venueName: 'Hedsor House',
    venueId: '1',
    question: 'Is there a backup indoor option for the garden ceremony?',
    priority: 'low',
    status: 'answered',
    answer: 'Yes, the Great Hall can accommodate up to 150 guests for an indoor ceremony.'
  }
];

export const statusLabels: Record<string, string> = {
  'awaiting_response': 'Awaiting Response',
  'call_scheduled': 'Call Scheduled',
  'call_completed': 'Call Completed',
  'visit_scheduled': 'Visit Scheduled',
  'visit_completed': 'Visit Completed',
  'shortlisted': 'Shortlisted',
  'rejected': 'Not Proceeding',
  'missing_info': 'Missing Info'
};

export const statusColors: Record<string, { bg: string; text: string }> = {
  'awaiting_response': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'call_scheduled': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'call_completed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'visit_scheduled': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'visit_completed': { bg: 'bg-green-100', text: 'text-green-700' },
  'shortlisted': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'rejected': { bg: 'bg-gray-100', text: 'text-gray-500' },
  'missing_info': { bg: 'bg-orange-100', text: 'text-orange-700' }
};
