import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractVenueInfoFromText(text: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert at extracting wedding venue information from brochures and documents.
Extract the following information and return it as JSON:
- venueName: string
- location: string
- capacity: number (maximum guests)
- pricing: string (any pricing information found)
- hasAccommodation: boolean
- hasOutdoorSpace: boolean
- cateringOptions: string (in-house, external allowed, both, etc.)
- amenities: string[] (list of amenities/features)
- notes: string (any other important details)

If information is not found, use null for that field. Be thorough and extract all relevant details.`
      },
      {
        role: "user",
        content: `Extract venue information from this text:\n\n${text}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = completion.choices[0].message.content;
  return JSON.parse(result || '{}');
}

export async function extractCriteriaFromVoice(transcription: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a wedding planning assistant. Extract wedding criteria from spoken input and structure it as JSON:
- date: string (wedding date or month/season)
- location: string (city/area)
- guestCount: number
- budget: number (in pounds)
- needsAccommodation: boolean
- needsOutdoorSpace: boolean
- cateringPreference: string (halal, vegetarian, external, etc.)
- otherRequirements: string[] (any other specific needs)

Extract what's mentioned and use null for missing information.`
      },
      {
        role: "user",
        content: `Extract wedding criteria from: "${transcription}"`
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = completion.choices[0].message.content;
  return JSON.parse(result || '{}');
}

export async function generatePersonalizedEmail(
  venueName: string,
  venueInfo: any,
  criteria: any,
  coupleName: string = "the couple"
) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a wedding planning assistant writing a professional, warm, and personalized email to a wedding venue.

The email should:
1. Introduce the couple briefly
2. Express interest in the venue
3. Reference specific details from the brochure that match their needs
4. Ask about availability for their date
5. Ask any clarifying questions based on their criteria
6. Be warm but professional
7. Be concise (2-3 short paragraphs)

Sign off with "Best regards" and leave space for the couple's name.`
      },
      {
        role: "user",
        content: `Write an email to ${venueName}.

Couple's criteria:
${JSON.stringify(criteria, null, 2)}

Venue information we found:
${JSON.stringify(venueInfo, null, 2)}

The couple's name is: ${coupleName}`
      }
    ]
  });

  return completion.choices[0].message.content || '';
}
