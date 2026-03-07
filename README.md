# Aisle — AI-Powered Wedding Venue Search

**Aisle** is an AI assistant that takes the pain out of finding a wedding venue. Instead of spending weeks emailing dozens of venues, chasing PDFs, and tracking spreadsheets, Aisle does it all for you — from discovering venues to reading their replies and keeping your dashboard up to date.

Live at **[www.aisle-weddings.com](https://www.aisle-weddings.com)**

---

## The Problem

Finding a wedding venue is one of the most time-consuming parts of wedding planning:

- You have to contact 50–100+ venues just to get basic pricing information
- Every venue sends a 10–20 page PDF brochure that you have to read manually
- You ask the same questions over and over across dozens of email threads
- There's no central place to track what you've asked, what they've said, and what's still missing
- Most couples spend **20+ hours** on venue research alone

Existing platforms like Hitched and Bridebook are great for discovery but do nothing to automate the back-and-forth. Wedding planners solve the problem but cost thousands of pounds. Aisle sits in the middle — the intelligence of a wedding planner at a fraction of the cost.

---

## What Aisle Does

### 1. Capture Your Criteria
Tell Aisle what you're looking for — by typing, talking, or uploading inspiration images. Aisle automatically organises your input into:
- **Must-haves** — deal-breakers like location, guest count, budget, and date
- **Nice-to-haves** — preferences like outdoor space, rustic aesthetic, or on-site catering
- **Vibe** — if you upload Pinterest screenshots, Aisle analyses them and extracts aesthetic keywords to search for venues with a similar feel

### 2. Find Venues
Based on your criteria, Aisle searches for up to 20 matching venues — filtering by must-haves and ranking by how many nice-to-haves each venue satisfies. The best overall matches appear at the top.

### 3. Email Venues Automatically
Aisle generates a personalised email to each venue on your behalf. You review and approve it, then send. Emails are sent from `noreply@aisle-weddings.com` with a reply-to of `reply@aisle-weddings.com` so all venue responses are captured automatically.

### 4. Parse Replies and PDFs
When a venue replies — whether with plain text or a PDF brochure attached — Aisle reads it using GPT-4o and automatically extracts:
- Pricing
- Availability
- Capacity
- Catering options
- Accommodation
- Contact details

The dashboard updates immediately. Missing information tags disappear as answers come in.

### 5. Track Everything on Your Dashboard
Your dashboard shows all venues in one place with:
- Status (Awaiting Response, Missing Info, Shortlisted, etc.)
- Match score based on your criteria
- A green "Replied" tag showing how many replies have been received — click it to read the full reply history and AI summaries
- Missing information still needed
- Editable contact emails per venue

### 6. Share Your List
Send your shortlist of venues to anyone — a partner, family member, or wedding planner — with one click. They receive a nicely formatted email with venue names and website links.

---

## Key Features

| Feature | Description |
|---------|-------------|
| Voice input | Dictate your requirements — transcript auto-parses into criteria |
| Image vibe analysis | Upload Pinterest screenshots → AI extracts aesthetic keywords |
| Smart ranking | Must-haves filter venues; nice-to-haves sort them |
| Auto email parsing | Venue replies update the dashboard automatically |
| PDF parsing | Attached brochures are read and extracted by GPT-4o |
| Email threading | Follow-up emails reply on the same thread as the venue's original response |
| Full reply history | Every reply stored and viewable in a popup |
| Share list | Email your venue list to anyone |
| Editable contact emails | Manually update venue email addresses from the dashboard |
| Per-user data | Everything tied to your account — log in from any device |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, Tailwind CSS, TypeScript |
| Auth & Database | Supabase (PostgreSQL + Auth) |
| AI | OpenAI GPT-4o (venue search, email parsing, image analysis, PDF extraction) |
| Email | Resend (sending + inbound webhooks) |
| Hosting | Vercel |
| Domain | Cloudflare + aisle-weddings.com |

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- A Supabase project
- OpenAI API key
- Resend API key

### Setup

```bash
git clone https://github.com/saurabhbains/aisle.git
cd aisle
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
OPENAI_API_KEY=your_openai_key
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@yourdomain.com
```

Run the Supabase SQL setup:

```sql
create table public.user_criteria (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  criteria jsonb not null default '[]',
  updated_at timestamp with time zone default now()
);

create table public.user_venues (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  venues jsonb not null default '[]',
  updated_at timestamp with time zone default now()
);

alter table public.user_criteria enable row level security;
alter table public.user_venues enable row level security;

alter table public.user_criteria add constraint user_criteria_user_id_key unique (user_id);
alter table public.user_venues add constraint user_venues_user_id_key unique (user_id);

create policy "Users can manage their own criteria" on public.user_criteria for all using (auth.uid() = user_id);
create policy "Users can manage their own venues" on public.user_venues for all using (auth.uid() = user_id);
```

Start the dev server:

```bash
npm run dev
```

---

## Roadmap

- [x] Voice + text + image criteria capture
- [x] AI venue discovery with smart ranking
- [x] Automated email sending
- [x] Inbound email parsing (text + PDF)
- [x] Full reply history per venue
- [x] Email threading (replies stay on same thread)
- [x] Share venue list
- [x] Google + email authentication
- [x] Per-user data persistence
- [ ] Joint account for couples
- [ ] Google Calendar integration
- [ ] Per-venue notes and transcript upload
- [ ] Side-by-side venue comparison
- [ ] Auto call recording via Twilio
- [ ] Payment/subscription

---

## Built By

Saurabh Bains — [@saurabhbains](https://github.com/saurabhbains)
