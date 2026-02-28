# Aisle - 24 Hour Hackathon Build

## What We're Building

A working MVP that demonstrates:
1. **Voice Input** - Speak your wedding criteria, AI transcribes and structures it
2. **PDF Parsing** - Upload venue brochure, AI extracts key information
3. **AI Email Generation** - Creates personalized outreach emails
4. **Real Email Sending** - Actually sends emails to venues
5. **Dashboard** - Shows all venues, extracted info, and sent emails

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up API Keys

Copy `.env.example` to `.env.local` and add your keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

**Option A: Use OpenAI**
```
OPENAI_API_KEY=sk-...  # Get from https://platform.openai.com/api-keys
RESEND_API_KEY=re_...  # Get from https://resend.com/api-keys
```

**Option B: Use Anthropic Claude**
```
ANTHROPIC_API_KEY=sk-ant-...  # Get from https://console.anthropic.com/
RESEND_API_KEY=re_...         # Get from https://resend.com/api-keys
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Keys Setup Guide

### OpenAI (Recommended for hackathon)
1. Go to https://platform.openai.com/api-keys
2. Sign up / Log in
3. Create new API key
4. Copy to `.env.local`

### Anthropic Claude (Alternative)
1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Get API key from settings
4. Copy to `.env.local`

### Resend (Email Sending)
1. Go to https://resend.com
2. Sign up (free - 100 emails/day)
3. Create API key
4. Copy to `.env.local`
5. Verify your domain OR use test email: `onboarding@resend.dev`

## Project Structure

```
aisle/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard
│   └── api/
│       ├── parse-pdf/        # PDF parsing endpoint
│       ├── generate-email/   # Email generation endpoint
│       └── send-email/       # Email sending endpoint
├── components/
│   ├── VoiceInput.tsx        # Voice recording component
│   ├── PDFUpload.tsx         # PDF upload component
│   ├── EmailPreview.tsx      # Email preview component
│   └── VenueCard.tsx         # Venue display card
├── lib/
│   ├── ai.ts                 # AI utilities
│   ├── pdf-parser.ts         # PDF parsing logic
│   └── email.ts              # Email sending logic
└── public/
    └── samples/              # Sample PDFs for testing
```

## Features Checklist

- [ ] Voice input with Web Speech API
- [ ] PDF upload and parsing
- [ ] AI extraction of venue details
- [ ] AI email generation
- [ ] Real email sending via Resend
- [ ] Dashboard with venue cards
- [ ] Email preview and editing
- [ ] Landing page
- [ ] Deployment to Vercel

## Testing the App

### Test Data Needed:
1. Sample venue PDF (from Hitched/Bridebook)
2. Test email address (can be your own)

### Demo Flow:
1. Click "Record" and speak: "We want to get married in July in Brighton, around 100 guests, budget £15k"
2. Upload a venue PDF
3. AI extracts: capacity, pricing, amenities
4. Review generated email
5. Send email (for real!)
6. Show dashboard with sent email

## Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **AI:** OpenAI GPT-4 or Anthropic Claude
- **PDF:** pdf-parse
- **Email:** Resend
- **Hosting:** Vercel

## Time Allocation (24 hours)

- [x] Setup (1-2 hours)
- [ ] Voice Input (2-3 hours)
- [ ] PDF Parsing (2-3 hours)
- [ ] Email Generation (2 hours)
- [ ] Email Sending (1-2 hours)
- [ ] Dashboard UI (3-4 hours)
- [ ] Landing Page (2 hours)
- [ ] Testing (2-3 hours)
- [ ] Polish & Deploy (2-3 hours)
- [ ] Demo Prep (1-2 hours)

## Troubleshooting

### Voice Input not working
- Requires HTTPS (works on localhost or deployed Vercel)
- Only works in Chrome/Edge/Safari
- Check browser permissions

### PDF Parsing fails
- Some PDFs are images (need OCR)
- Try with text-based PDFs first
- Use sample PDFs we provide

### Email not sending
- Check Resend API key
- Verify sender email domain
- Check Resend dashboard for logs

## Demo Script

**1. Introduction (30 sec)**
"Wedding planning is painful. Couples send 100+ emails to venues just to get basic info. We're fixing that with AI."

**2. Live Demo (2 min)**
- Voice input: Show natural language → structured data
- PDF upload: Show brochure → extracted info
- Email: Show AI-generated personalized email
- Send: Actually send it live
- Dashboard: Show tracking

**3. Vision (30 sec)**
"This is just the start. Imagine AI handling all vendor communication, comparing options, and booking viewings automatically."

## Contact

- GitHub: https://github.com/saurabhbains/aisle
- Built for [Hackathon Name]
