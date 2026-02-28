import pdf from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF. Please ensure it\'s a text-based PDF.');
  }
}

export function estimateMissingInfo(venueInfo: any, criteria: any) {
  const estimates: any = {};

  // Estimate pricing if missing
  if (!venueInfo.pricing && criteria.guestCount) {
    const avgPricePerGuest = 100; // £100 average
    estimates.estimatedPrice = `Estimated £${criteria.guestCount * avgPricePerGuest} (based on ${criteria.guestCount} guests)`;
  }

  return estimates;
}
