# V0 Component Integration Guide for Aisle

This guide explains how to integrate V0-generated components into the Aisle project.

## Project Structure

```
aisle/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── venues/            # Venues listing page
│   ├── dashboard/         # Dashboard page
│   └── [your-new-page]/   # New V0 pages go here
├── components/            # Reusable components
│   ├── v0/               # V0-generated components go here
│   └── ui/               # shadcn/ui components (if needed)
└── lib/                   # Utilities, API functions, etc.
```

## Current Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel
- **APIs**:
  - OpenAI (for AI features)
  - Resend (for email)
  - PDF parsing

## Step-by-Step Integration

### Option 1: Adding a V0 Page Component

If V0 generates a full page:

1. **Copy the V0 code**
2. **Create a new page** in the `app/` directory:
   ```bash
   # Example: Creating a new "gallery" page
   mkdir -p app/gallery
   # Paste V0 code into:
   app/gallery/page.tsx
   ```

3. **Check dependencies** - V0 will tell you if you need to install packages:
   ```bash
   npm install <package-name>
   ```

4. **Test locally**:
   ```bash
   npm run dev
   # Visit http://localhost:3000/gallery
   ```

5. **Commit and deploy**:
   ```bash
   git add .
   git commit -m "Add V0 gallery page"
   git push
   ```

### Option 2: Adding a V0 Reusable Component

If V0 generates a component (like a card, button, form, etc.):

1. **Copy the V0 code**
2. **Save to components folder**:
   ```bash
   # Example: Creating a VenueCard component
   # Paste V0 code into:
   components/v0/VenueCard.tsx
   ```

3. **Import and use** in any page:
   ```tsx
   import VenueCard from '@/components/v0/VenueCard';

   export default function MyPage() {
     return (
       <div>
         <VenueCard venue={venueData} />
       </div>
     );
   }
   ```

### Option 3: Replacing an Existing Page

If V0 creates a better version of an existing page:

1. **Backup the old page**:
   ```bash
   # Example: Backing up venues page
   cp app/venues/page.tsx app/venues/page.old.tsx
   ```

2. **Replace with V0 code**:
   - Paste V0 code into `app/venues/page.tsx`
   - Make sure to keep any existing API calls or data fetching logic

3. **Test thoroughly** to ensure all functionality still works

## Important Notes

### Connecting to Existing APIs

Your V0 components will need to connect to the existing Aisle APIs:

**Available API endpoints:**
- `POST /api/scrape-venues` - Search for venues
- `POST /api/match-venues` - Match venues to criteria
- `POST /api/generate-batch-emails` - Generate personalized emails
- `POST /api/send-batch-emails` - Send emails to venues
- `POST /api/parse-pdf` - Parse PDF attachments
- `POST /api/webhooks/resend-inbound` - Receive venue responses
- `POST /api/transcribe-voice` - Voice-to-text for criteria

**Example usage in V0 component:**
```tsx
'use client';

export default function VenueSearch() {
  const handleSearch = async (criteria) => {
    const response = await fetch('/api/scrape-venues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criteria })
    });
    const data = await response.json();
    // Handle response...
  };

  return (/* your V0 UI */);
}
```

### Using Existing Utilities

Import existing utilities from the `lib/` folder:

```tsx
import { getAllVenues, updateVenueStatus } from '@/lib/venue-database';
import { generatePersonalizedEmail } from '@/lib/ai';
```

### Styling Consistency

- V0 uses Tailwind CSS (same as this project ✓)
- Colors: Stick to the purple theme (`bg-purple-600`, `text-purple-700`, etc.)
- Make sure V0 components match the existing design

## Common V0 Packages

V0 often uses these packages (already installed or easy to add):

- `lucide-react` - Icons
- `@radix-ui/*` - UI primitives (for shadcn/ui)
- `class-variance-authority` - Styling variants
- `clsx` / `tailwind-merge` - Utility classes

To install shadcn/ui components if V0 uses them:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# etc.
```

## Example: Full Integration Workflow

Let's say V0 generates a "Venue Comparison" page:

```bash
# 1. Create the page directory
mkdir -p app/compare

# 2. Teammate sends you the V0 code
# Save it to: app/compare/page.tsx

# 3. Install any dependencies V0 mentions
npm install recharts  # Example: if V0 uses charts

# 4. Test locally
npm run dev
# Visit http://localhost:3000/compare

# 5. If it works, commit and push
git add app/compare/page.tsx package.json package-lock.json
git commit -m "Add V0 venue comparison page"
git push

# 6. Vercel auto-deploys to production
# Visit https://aisle-xi.vercel.app/compare
```

## Troubleshooting

**Issue: Import errors**
- Check if you need to install packages: `npm install <package>`
- Verify import paths use `@/` prefix (e.g., `@/lib/utils`)

**Issue: "use client" directive**
- V0 components that use state/effects need `'use client';` at the top
- Server components (no state) don't need this

**Issue: Type errors**
- Make sure V0 code is `.tsx` not `.jsx`
- Add type definitions if needed

**Issue: Styling doesn't match**
- Check Tailwind config is the same
- Adjust colors to match purple theme

## Getting Help

If you run into issues integrating V0 components:
1. Check the V0 component's dependencies
2. Look at existing pages in `app/` for examples
3. Test incrementally - add one component at a time
4. Check the browser console for errors

## Project-Specific Tips for Your Teammate

When creating components in V0, keep in mind:

1. **Voice Input Feature** - Consider adding voice input for forms (we have `/api/transcribe-voice`)
2. **Purple Theme** - Use purple as the primary color (`purple-600`, `purple-700`)
3. **Mobile-First** - Design for mobile (this is for couples planning weddings on-the-go)
4. **PDF Upload** - Some forms need PDF upload capability
5. **Email Preview** - Show email previews before sending
6. **Status Tags** - Venues have statuses: `pending`, `contacted`, `responded`, `declined`

## Quick Reference

**Add a new page:**
```bash
mkdir -p app/[page-name]
# Add code to: app/[page-name]/page.tsx
```

**Add a component:**
```bash
# Add code to: components/v0/[ComponentName].tsx
```

**Install shadcn/ui component:**
```bash
npx shadcn-ui@latest add [component-name]
```

**Test changes:**
```bash
npm run dev
```

**Deploy:**
```bash
git add .
git commit -m "Description of changes"
git push
```

---

**Happy coding! 🎉**
