import OpenAI from 'openai';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function extractVenueInfoFromText(text: string) {
  const openai = getOpenAIClient();
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
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a wedding planning assistant. Extract wedding criteria from spoken input and categorize them as HARD (must-have) or SOFT (nice-to-have).

Return JSON with this structure:
{
  "hardCriteria": {
    "date": "string (wedding date or month/season)",
    "location": "string (city/area - HARD if specific city mentioned)",
    "guestCount": "number (HARD if specific number)",
    "budget": "number (HARD if it's a strict limit)",
    "needsAccommodation": "boolean (HARD if explicitly required)",
    "cateringPreference": "string (HARD if religious/dietary requirement like halal, kosher)"
  },
  "softCriteria": {
    "needsOutdoorSpace": "boolean (SOFT - preference)",
    "aestheticPreference": "string (modern, rustic, traditional, etc.)",
    "preferredAmenities": "string[] (bar, parking, dance floor, etc.)",
    "otherPreferences": "string[] (any other nice-to-have features)"
  }
}

HARD criteria are deal-breakers (venue must meet these).
SOFT criteria are preferences (venue is better if it has these).

Use null for missing information.`
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
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a wedding planning assistant writing a professional, warm, and personalized email to a wedding venue.

The email should:
1. Start with "Dear [Venue Name] Team,"
2. Introduce the couple briefly
3. Express interest in the venue
4. Reference specific details from the brochure that match their needs
5. Ask about availability for their date
6. Ask any clarifying questions based on their criteria
7. Be warm but professional
8. Be concise (2-3 short paragraphs)
9. Sign off with "Best regards," and the couple's name

IMPORTANT: DO NOT include a subject line in the email body. Start directly with the greeting.`
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
