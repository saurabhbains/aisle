# Quick Start for V0 Integration - Aisle Project

## 🚀 TL;DR

1. Create component in V0
2. Copy the code
3. Paste into `app/[page-name]/page.tsx` or `components/v0/[ComponentName].tsx`
4. Run `npm install` if V0 mentions packages
5. Test with `npm run dev`
6. Commit and push to GitHub

## 📁 Where to Put V0 Code

| V0 Generated | Put It Here | Example |
|--------------|-------------|---------|
| Full page | `app/[page-name]/page.tsx` | `app/gallery/page.tsx` |
| Component | `components/v0/[Name].tsx` | `components/v0/VenueCard.tsx` |
| API route | `app/api/[name]/route.ts` | `app/api/search/route.ts` |

## 🔗 Connecting to Existing APIs

All these APIs are already built and ready to use:

```tsx
// Search for venues
const response = await fetch('/api/scrape-venues', {
  method: 'POST',
  body: JSON.stringify({ criteria })
});

// Match venues to criteria
fetch('/api/match-venues', { method: 'POST', body: JSON.stringify({ venues, criteria }) });

// Generate emails
fetch('/api/generate-batch-emails', { method: 'POST', body: JSON.stringify({ venues, criteria, coupleName }) });

// Send emails
fetch('/api/send-batch-emails', { method: 'POST', body: JSON.stringify({ emails, demoMode: true }) });

// Parse PDF
fetch('/api/parse-pdf', { method: 'POST', body: JSON.stringify({ pdfData: base64 }) });

// Voice transcription
fetch('/api/transcribe-voice', { method: 'POST', body: formData });
```

## 🎨 Design Guidelines

- **Colors**: Use purple theme (`bg-purple-600`, `text-purple-700`)
- **Styling**: Tailwind CSS (already configured)
- **Mobile**: Design mobile-first
- **Typography**: Keep it clean and readable

## 📦 Common Packages (Already Installed)

- React, Next.js 14
- Tailwind CSS
- TypeScript
- Lucide React (icons)

## 🧪 Testing Your Changes

```bash
# 1. Start dev server
npm run dev

# 2. Visit your page
http://localhost:3000/[your-page-name]

# 3. Check browser console for errors
```

## 🚢 Deploying

```bash
# Commit your changes
git add .
git commit -m "Add [description]"
git push

# Vercel auto-deploys! 🎉
# Live in ~30 seconds at: https://aisle-xi.vercel.app
```

## 💡 Pro Tips

1. **Use `'use client';`** at the top if your component uses state/hooks
2. **Import with `@/`** - e.g., `import { thing } from '@/lib/utils'`
3. **Check existing pages** in `app/` folder for examples
4. **Install shadcn/ui** components if needed: `npx shadcn-ui@latest add button`

## 🆘 Need Help?

- Full guide: See `V0_INTEGRATION_GUIDE.md`
- Example pages: Look at `app/venues/page.tsx` or `app/test-webhook/page.tsx`
- Stuck? Check browser console and terminal for error messages

## 📊 Project Features You Can Build On

- ✅ Voice input (use `/api/transcribe-voice`)
- ✅ AI-powered venue search
- ✅ PDF parsing
- ✅ Email generation & sending
- ✅ Webhook for receiving venue responses
- ✅ In-memory venue database

## 🎯 Suggested V0 Components to Create

1. **Beautiful home page** - Hero section, features showcase
2. **Venue comparison view** - Side-by-side venue details
3. **Email preview modal** - Show email before sending
4. **Criteria form** - Better UX for entering wedding requirements
5. **Response timeline** - Visual timeline of venue responses
6. **Dashboard** - Overview of all contacted venues

---

**Questions?** Ask Saurabh or check the full guide!
