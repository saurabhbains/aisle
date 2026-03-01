import type { Venue, Criteria } from './types';

export interface CriteriaValidationResult {
  meetsAllCriteria: boolean;
  failedCriteria: string[];
}

export interface HardCriteria {
  budget?: number;
  guestCount?: number;
  needsAccommodation?: boolean;
}

/**
 * Parse criteria array to extract hard criteria values
 */
export function parseHardCriteria(criteria: Criteria[]): HardCriteria {
  const hardCriteria: HardCriteria = {};

  criteria.forEach(c => {
    const value = c.value.toLowerCase();

    // Extract budget
    const budgetMatch = value.match(/budget.*?£?([\d,]+)/i) || value.match(/£([\d,]+)/);
    if (budgetMatch) {
      hardCriteria.budget = parseInt(budgetMatch[1].replace(/,/g, ''));
    }

    // Extract guest count
    const guestMatch = value.match(/(\d+)\s*guests?/i);
    if (guestMatch) {
      hardCriteria.guestCount = parseInt(guestMatch[1]);
    }

    // Check for accommodation requirement
    if (value.includes('accommodation') || value.includes('overnight') || value.includes('rooms')) {
      hardCriteria.needsAccommodation = true;
    }
  });

  return hardCriteria;
}

/**
 * Validate venue against hard criteria
 * Pass extractedInfo to check AI-determined availability match
 */
export function validateVenueCriteria(
  venue: Venue,
  criteria: Criteria[],
  extractedInfo?: any
): CriteriaValidationResult {
  const hardCriteria = parseHardCriteria(criteria);
  const failedCriteria: string[] = [];

  // Check availability match (from AI extraction)
  if (extractedInfo?.availabilityMatchesRequirement === false) {
    failedCriteria.push('Not available on your preferred dates');
  }

  // Check budget
  if (hardCriteria.budget && venue.priceRange) {
    // Venue's minimum price must be <= budget
    if (venue.priceRange.min > hardCriteria.budget) {
      const difference = venue.priceRange.min - hardCriteria.budget;
      failedCriteria.push(`Over budget by £${difference.toLocaleString()}`);
    }
  }

  // Check capacity
  if (hardCriteria.guestCount && venue.capacity) {
    // Venue's maximum capacity must be >= guest count
    if (venue.capacity.max < hardCriteria.guestCount) {
      const shortage = hardCriteria.guestCount - venue.capacity.max;
      failedCriteria.push(`Capacity too small by ${shortage} guests`);
    }
  }

  // Check accommodation
  if (hardCriteria.needsAccommodation) {
    // Check if venue features include accommodation-related keywords
    const hasAccommodation = venue.features?.some(f =>
      f.toLowerCase().includes('accommodation') ||
      f.toLowerCase().includes('rooms') ||
      f.toLowerCase().includes('overnight')
    );

    if (!hasAccommodation) {
      failedCriteria.push('No on-site accommodation');
    }
  }

  return {
    meetsAllCriteria: failedCriteria.length === 0,
    failedCriteria
  };
}

/**
 * Detect which critical information is still missing from a venue
 * This function is called AFTER extractedInfo has been merged, so we need to check
 * if the essential information exists in some form (structured data OR extracted text)
 */
export function detectMissingInfo(
  venue: Venue,
  criteria: Criteria[],
  extractedInfo?: any
): string[] {
  const missing: string[] = [];
  const hardCriteria = parseHardCriteria(criteria);

  // Check pricing - either in priceRange OR in extractedInfo
  const hasPricing =
    (venue.priceRange && (venue.priceRange.min || venue.priceRange.max)) ||
    (extractedInfo?.pricing);

  if (!hasPricing) {
    missing.push('Detailed pricing and packages');
  }

  // Check capacity - either in capacity OR in extractedInfo
  const hasCapacity =
    (venue.capacity && (venue.capacity.min || venue.capacity.max)) ||
    (extractedInfo?.capacity);

  if (!hasCapacity) {
    missing.push('Guest capacity information');
  }

  // Check availability - either in venue.availability array OR in extractedInfo.availability
  const hasAvailability =
    (venue.availability && venue.availability.length > 0) ||
    (extractedInfo?.availability);

  if (!hasAvailability) {
    missing.push('Availability for your specific date');
  }

  // Check catering - in features OR in extractedInfo
  const hasCateringInfo =
    venue.features?.some(f =>
      f.toLowerCase().includes('catering') ||
      f.toLowerCase().includes('food') ||
      f.toLowerCase().includes('menu')
    ) ||
    (extractedInfo?.catering);

  if (!hasCateringInfo) {
    missing.push('Catering options and dietary accommodations');
  }

  // Check accommodation if needed - in features OR in extractedInfo
  if (hardCriteria.needsAccommodation) {
    const hasAccommodationDetails =
      venue.features?.some(f =>
        f.toLowerCase().includes('accommodation') ||
        f.toLowerCase().includes('rooms')
      ) ||
      (extractedInfo?.amenities?.some((a: string) =>
        a.toLowerCase().includes('accommodation') ||
        a.toLowerCase().includes('rooms')
      ));

    if (!hasAccommodationDetails) {
      missing.push('Accommodation details and room allocation');
    }
  }

  return missing;
}
