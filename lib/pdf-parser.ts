// Using dynamic import for pdf-parse to work with Next.js
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for CommonJS module compatibility
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
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
