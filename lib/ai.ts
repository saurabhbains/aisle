import OpenAI from 'openai';

export function getOpenAIClient() {
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
        content: `You are a wedding planning assistant writing a natural, warm, and authentic email to a wedding venue on behalf of an engaged couple.

Write in a conversational, genuine tone - as if the couple themselves are writing. The email should feel personal and heartfelt, not corporate.

Guidelines:
1. Start with a warm greeting (e.g., "Hi [Venue Name] team," or "Hello,")
2. Open with genuine excitement about their wedding and why this venue caught their eye
3. Mention 1-2 specific features from the venue that align with their vision
4. Naturally weave in their key requirements (date, guest count, style preferences)
5. If there's missing information (pricing, availability, amenities), ask about it in a friendly, conversational way
6. Express enthusiasm about potentially hosting their celebration there
7. Keep it warm and authentic - avoid corporate language like "I hope this email finds you well"
8. Use 2-3 short, natural paragraphs
9. Sign off warmly (e.g., "Looking forward to hearing from you!" or "Can't wait to learn more!")
10. End with "Best," or "Warmly," followed by the couple's name

IMPORTANT:
- DO NOT include a subject line
- Write as if the couple is genuinely excited, not a formal business inquiry
- Be specific about what information is needed (especially from missingInfo field)
- Sound human and warm, not templated`
      },
      {
        role: "user",
        content: `Write an email to ${venueName}.

Couple's criteria:
${JSON.stringify(criteria, null, 2)}

Venue information:
${JSON.stringify(venueInfo, null, 2)}

Couple's name: ${coupleName}

${venueInfo.missingInfo && venueInfo.missingInfo.length > 0
  ? `Missing information we need to ask about: ${venueInfo.missingInfo.join(', ')}`
  : ''}`
      }
    ]
  });

  return completion.choices[0].message.content || '';
}
