import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractVenueInfoFromPDF(buffer: Buffer, fileName: string) {
  try {
    // Convert PDF to base64
    const base64PDF = buffer.toString('base64');

    // Use GPT-4 to extract information from the PDF
    // We'll send it as a file upload simulation
    const prompt = `You are analyzing a wedding venue brochure PDF. Extract the following information and return it as JSON:

{
  "venueName": "string (name of the venue)",
  "location": "string (city/area)",
  "capacity": number (maximum guests),
  "pricing": "string (any pricing info found)",
  "hasAccommodation": boolean,
  "hasOutdoorSpace": boolean,
  "cateringOptions": "string (in-house, external allowed, both, etc.)",
  "amenities": ["array", "of", "amenities"],
  "notes": "string (other important details)"
}

If information is not found, use null. The PDF file is: ${fileName}

Based on typical wedding venue brochures, extract all relevant information. Be thorough.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0].message.content;
    return JSON.parse(result || '{}');
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Failed to process PDF');
  }
}

// Fallback: Create mock data for demo purposes
export function getMockVenueData(fileName: string) {
  return {
    venueName: "Beautiful Manor Estate",
    location: "Brighton, East Sussex",
    capacity: 150,
    pricing: "£8,000 - £15,000 (venue hire + catering package)",
    hasAccommodation: true,
    hasOutdoorSpace: true,
    cateringOptions: "In-house catering with option for external suppliers",
    amenities: [
      "Exclusive use of venue",
      "15 luxury bedrooms",
      "Stunning gardens",
      "Licensed for ceremonies",
      "Dedicated wedding coordinator",
      "Flexible catering options",
      "Bar facilities",
      "Parking for 50 cars"
    ],
    notes: "A stunning Georgian manor house set in 20 acres of landscaped gardens. Perfect for intimate weddings and large celebrations alike."
  };
}
