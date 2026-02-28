import { Venue } from './venue-database';

export interface MatchResult {
  venue: Venue;
  hardCriteriaPass: boolean;
  hardCriteriaDetails: {
    [key: string]: { pass: boolean; reason?: string };
  };
  softCriteriaScore: number;
  softCriteriaDetails: {
    [key: string]: { score: number; reason: string };
  };
  overallScore: number;
}

export interface Criteria {
  hardCriteria: {
    date?: string;
    location?: string;
    guestCount?: number;
    budget?: number;
    needsAccommodation?: boolean;
    cateringPreference?: string;
  };
  softCriteria: {
    needsOutdoorSpace?: boolean;
    aestheticPreference?: string;
    preferredAmenities?: string[];
    otherPreferences?: string[];
  };
}

export function matchVenuesToCriteria(
  venues: Venue[],
  criteria: Criteria
): MatchResult[] {
  const results = venues.map(venue => evaluateVenue(venue, criteria));

  // Filter out venues that don't meet hard criteria
  const passedVenues = results.filter(r => r.hardCriteriaPass);

  // Sort by overall score (descending)
  return passedVenues.sort((a, b) => b.overallScore - a.overallScore);
}

function evaluateVenue(venue: Venue, criteria: Criteria): MatchResult {
  const hardCriteriaDetails: any = {};
  let hardCriteriaPass = true;

  // Check hard criteria
  const { hardCriteria } = criteria;

  // Location (city match)
  if (hardCriteria.location) {
    const locationMatch = venue.city.toLowerCase().includes(hardCriteria.location.toLowerCase()) ||
                          venue.location.toLowerCase().includes(hardCriteria.location.toLowerCase());
    hardCriteriaDetails.location = {
      pass: locationMatch,
      reason: locationMatch ? `Located in ${venue.city}` : `Not in ${hardCriteria.location}`
    };
    if (!locationMatch) hardCriteriaPass = false;
  }

  // Guest count (capacity must be >= guest count)
  if (hardCriteria.guestCount) {
    const capacityMatch = venue.capacity >= hardCriteria.guestCount;
    hardCriteriaDetails.guestCount = {
      pass: capacityMatch,
      reason: capacityMatch
        ? `Capacity ${venue.capacity} meets requirement of ${hardCriteria.guestCount}`
        : `Capacity ${venue.capacity} below requirement of ${hardCriteria.guestCount}`
    };
    if (!capacityMatch) hardCriteriaPass = false;
  }

  // Budget (venue max price must be <= budget)
  if (hardCriteria.budget) {
    const budgetMatch = venue.pricing.min <= hardCriteria.budget;
    hardCriteriaDetails.budget = {
      pass: budgetMatch,
      reason: budgetMatch
        ? `Starting from £${venue.pricing.min.toLocaleString()} within budget of £${hardCriteria.budget.toLocaleString()}`
        : `Starting from £${venue.pricing.min.toLocaleString()} exceeds budget of £${hardCriteria.budget.toLocaleString()}`
    };
    if (!budgetMatch) hardCriteriaPass = false;
  }

  // Accommodation (must have if required)
  if (hardCriteria.needsAccommodation === true) {
    const accommodationMatch = venue.hasAccommodation;
    hardCriteriaDetails.accommodation = {
      pass: accommodationMatch,
      reason: accommodationMatch
        ? `Has ${venue.accommodationRooms} rooms`
        : `No on-site accommodation`
    };
    if (!accommodationMatch) hardCriteriaPass = false;
  }

  // Catering preference (e.g., halal, kosher)
  if (hardCriteria.cateringPreference) {
    const cateringMatch = venue.cateringTypes.some(type =>
      type.toLowerCase().includes(hardCriteria.cateringPreference!.toLowerCase())
    );
    hardCriteriaDetails.catering = {
      pass: cateringMatch,
      reason: cateringMatch
        ? `Offers ${hardCriteria.cateringPreference} catering`
        : `Does not offer ${hardCriteria.cateringPreference} catering`
    };
    if (!cateringMatch) hardCriteriaPass = false;
  }

  // Evaluate soft criteria (scoring 0-100)
  const softCriteriaDetails: any = {};
  let softScore = 0;
  let softCriteriaCount = 0;

  const { softCriteria } = criteria;

  // Outdoor space preference
  if (softCriteria.needsOutdoorSpace !== undefined) {
    softCriteriaCount++;
    if (venue.hasOutdoorSpace === softCriteria.needsOutdoorSpace) {
      softScore += 100;
      softCriteriaDetails.outdoorSpace = {
        score: 100,
        reason: venue.hasOutdoorSpace ? 'Has outdoor space' : 'No outdoor space (as preferred)'
      };
    } else {
      softCriteriaDetails.outdoorSpace = {
        score: 0,
        reason: venue.hasOutdoorSpace ? 'Has outdoor space (not preferred)' : 'No outdoor space (but preferred)'
      };
    }
  }

  // Aesthetic preference
  if (softCriteria.aestheticPreference) {
    softCriteriaCount++;
    const aestheticMatch = venue.aesthetic.some(a =>
      a.toLowerCase().includes(softCriteria.aestheticPreference!.toLowerCase())
    );
    const score = aestheticMatch ? 100 : 0;
    softScore += score;
    softCriteriaDetails.aesthetic = {
      score,
      reason: aestheticMatch
        ? `Matches ${softCriteria.aestheticPreference} aesthetic`
        : `${venue.aesthetic.join(', ')} aesthetic (${softCriteria.aestheticPreference} preferred)`
    };
  }

  // Preferred amenities
  if (softCriteria.preferredAmenities && softCriteria.preferredAmenities.length > 0) {
    softCriteriaCount++;
    const matchedAmenities = softCriteria.preferredAmenities.filter(preferred =>
      venue.amenities.some(amenity =>
        amenity.toLowerCase().includes(preferred.toLowerCase())
      )
    );
    const score = (matchedAmenities.length / softCriteria.preferredAmenities.length) * 100;
    softScore += score;
    softCriteriaDetails.amenities = {
      score: Math.round(score),
      reason: `Has ${matchedAmenities.length}/${softCriteria.preferredAmenities.length} preferred amenities`
    };
  }

  const softCriteriaScore = softCriteriaCount > 0 ? Math.round(softScore / softCriteriaCount) : 0;

  // Overall score: if passes hard criteria, use soft criteria score
  // If fails hard criteria, score is 0
  const overallScore = hardCriteriaPass ? softCriteriaScore : 0;

  return {
    venue,
    hardCriteriaPass,
    hardCriteriaDetails,
    softCriteriaScore,
    softCriteriaDetails,
    overallScore
  };
}

export function filterByHardCriteria(
  venues: Venue[],
  criteria: Criteria
): Venue[] {
  const results = matchVenuesToCriteria(venues, criteria);
  return results.map(r => r.venue);
}

export function rankVenuesBySoftCriteria(
  matches: MatchResult[]
): MatchResult[] {
  return [...matches].sort((a, b) => b.softCriteriaScore - a.softCriteriaScore);
}
