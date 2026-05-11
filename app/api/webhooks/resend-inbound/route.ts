import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials are not configured');
  }

  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAIClient();
    const supabase = getSupabaseAdmin();
    const payload = await request.json();
    console.log('Inbound email webhook received:', payload.type);

    if (payload.type !== 'email.received') {
      return NextResponse.json({ success: true, message: 'Event ignored' });
    }

    const emailData = payload.data;
    const fromEmail = emailData.from?.replace(/.*<(.+)>/, '$1').trim() || emailData.from;
    const subject = emailData.subject || '';
    const emailText = emailData.text || emailData.html?.replace(/<[^>]*>/g, ' ') || '';
    // Extract Message-ID for threading follow-up replies
    const messageId = emailData.headers?.find((h: any) => h.name?.toLowerCase() === 'message-id')?.value
      || emailData.email_id
      || null;

    console.log(`Processing reply from: ${fromEmail}`);
    console.log(`Subject: ${subject}`);

    // Extract text from any PDF attachments
    let pdfText = '';
    const attachments = emailData.attachments || [];
    for (const attachment of attachments) {
      if (attachment.content_type?.includes('pdf') || attachment.filename?.endsWith('.pdf')) {
        console.log(`Processing PDF attachment: ${attachment.filename}`);
        try {
          // Download PDF from Resend
          let pdfBuffer: ArrayBuffer | null = null;
          if (attachment.content) {
            pdfBuffer = Buffer.from(attachment.content, 'base64').buffer;
          } else if (attachment.download_url) {
            const res = await fetch(attachment.download_url, {
              headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
            });
            pdfBuffer = await res.arrayBuffer();
          }

          if (pdfBuffer) {
            // Send PDF to GPT-4o as base64 for text extraction
            const base64Pdf = Buffer.from(pdfBuffer).toString('base64');
            const pdfCompletion = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'This is a PDF brochure from a wedding venue. Extract all useful information: pricing, capacity, availability, amenities, catering, accommodation, contact details. Return as plain text.'
                    },
                    {
                      type: 'image_url',
                      image_url: { url: `data:application/pdf;base64,${base64Pdf}` }
                    }
                  ]
                }
              ],
              max_tokens: 1000,
            });
            pdfText += '\n\nFrom PDF brochure:\n' + (pdfCompletion.choices[0].message.content || '');
            console.log('Extracted PDF text:', pdfText.substring(0, 200));
          }
        } catch (err) {
          console.error('PDF extraction error:', err);
        }
      }
    }

    const fullContent = emailText + pdfText;

    if (!fullContent.trim()) {
      return NextResponse.json({ success: true, message: 'No content to process' });
    }

    // Find venue in Supabase by matching sender email across all users
    const { data: allVenueRows } = await supabase
      .from('user_venues')
      .select('user_id, venues');

    let matchedUserId: string | null = null;
    let matchedVenueId: string | null = null;
    let matchedVenues: any[] = [];

    for (const row of allVenueRows || []) {
      const venues = row.venues || [];
      const venue = venues.find((v: any) =>
        v.contact?.email?.toLowerCase() === fromEmail.toLowerCase()
      );
      if (venue) {
        matchedUserId = row.user_id;
        matchedVenueId = venue.id;
        matchedVenues = venues;
        break;
      }
    }

    if (!matchedUserId || !matchedVenueId) {
      console.log(`No venue found matching email: ${fromEmail}`);
      return NextResponse.json({ success: true, message: 'No matching venue found' });
    }

    console.log(`Found venue ${matchedVenueId} for user ${matchedUserId}`);

    // Use GPT-4o to extract venue info from the reply
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a wedding venue assistant. Extract any useful information from this venue's email reply.

Return JSON with these fields (use null if not mentioned):
{
  "availability": string | null,
  "pricing": string | null,
  "capacity": number | null,
  "hasAccommodation": boolean | null,
  "hasOutdoorSpace": boolean | null,
  "cateringOptions": string | null,
  "contactName": string | null,
  "contactPhone": string | null,
  "summary": string,
  "missingInfoResolved": string[]
}`
        },
        {
          role: 'user',
          content: `Email from venue:\nSubject: ${subject}\n\n${fullContent}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const extracted = JSON.parse(completion.choices[0].message.content || '{}');
    console.log('Extracted info:', extracted);

    // Update the venue in Supabase
    const updatedVenues = matchedVenues.map((v: any) => {
      if (v.id !== matchedVenueId) return v;
      return {
        ...v,
        lastReply: {
          from: fromEmail,
          subject,
          summary: extracted.summary,
          body: fullContent,
          receivedAt: new Date().toISOString(),
          messageId,
        },
        replies: [
          ...(v.replies || []),
          {
            from: fromEmail,
            subject,
            summary: extracted.summary,
            body: fullContent,
            receivedAt: new Date().toISOString(),
            messageId,
          }
        ],
        ...(extracted.pricing && {
          priceRange: {
            min: parseInt(extracted.pricing.replace(/[^0-9]/g, '')) || v.priceRange?.min || 0,
            max: parseInt(extracted.pricing.replace(/[^0-9]/g, '')) || v.priceRange?.max || 0,
          }
        }),
        ...(extracted.capacity && { capacity: { min: Math.floor(extracted.capacity * 0.5), max: extracted.capacity } }),
        ...(extracted.contactName && {
          contact: { ...v.contact, name: extracted.contactName, phone: extracted.contactPhone || v.contact?.phone || '' }
        }),
        missingInfoItems: (() => {
          const remaining = (v.missingInfoItems || []).filter(
            (item: string) => !extracted.missingInfoResolved?.some(
              (resolved: string) => item.toLowerCase().includes(resolved.toLowerCase())
            )
          );
          return remaining;
        })(),
        status: (() => {
          const remaining = (v.missingInfoItems || []).filter(
            (item: string) => !extracted.missingInfoResolved?.some(
              (resolved: string) => item.toLowerCase().includes(resolved.toLowerCase())
            )
          );
          return remaining.length === 0 ? 'shortlisted' : 'missing_info';
        })(),
      };
    });

    await supabase
      .from('user_venues')
      .update({ venues: updatedVenues, updated_at: new Date().toISOString() })
      .eq('user_id', matchedUserId);

    console.log(`✓ Updated venue ${matchedVenueId} with reply from ${fromEmail}`);

    return NextResponse.json({ success: true, venueId: matchedVenueId });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
