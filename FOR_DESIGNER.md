# Guide for Designer - Aisle Project

Hey! Thanks for helping design the UI for Aisle 🎨

This guide shows you how to use V0 to create beautiful UI components, then share them with Saurabh who will integrate them into the app.

## Your Role

**You:** Design beautiful UI in V0
**Saurabh:** Code it into the app and connect to APIs

No coding required from you! Just create designs in V0 and share the links.

---

## Step-by-Step: Using V0

### 1. Go to V0

Visit: **https://v0.dev**

### 2. Describe What You Want

Type in the chat what you want to create. Examples:

```
"Create a modern wedding venue card with image, name, location,
price, and a heart icon to favorite it. Use purple as the accent color."
```

```
"Design a hero section for a wedding planning app called Aisle.
Include a headline, subheading, and a purple CTA button."
```

```
"Create a comparison table for wedding venues showing name, price,
capacity, and amenities side by side."
```

### 3. Iterate on the Design

V0 will generate a preview. You can:
- Click "Refine" to make changes
- Ask for adjustments: "Make the cards bigger" or "Use a darker purple"
- Generate new versions: "Show me a different layout"

### 4. Share with Saurabh

Once you're happy with the design:

**Option 1: Share the V0 Link** (Easiest)
- Copy the URL from your browser (looks like `v0.dev/chat/abc123xyz`)
- Send it to Saurabh via Slack/Discord/Text
- He'll open it and integrate the code

**Option 2: Export the Code**
- Click the `</>` code button in V0
- Copy all the code
- Paste into a message to Saurabh
- Include what it's for: "This is the venue card component"

---

## Design Guidelines

To keep everything consistent, follow these guidelines:

### Colors
- **Primary**: Purple (`#7C3AED`, `#6D28D9`)
- **Accent**: Lighter purple for hovers
- **Background**: White and light gray
- **Text**: Dark gray/black

Tell V0: *"Use purple-600 as the primary color"*

### Style
- **Clean & modern** - Not cluttered
- **Mobile-first** - Design for phones (couples use this on-the-go)
- **Friendly** - Wedding planning should feel exciting!
- **Professional** - But not corporate/boring

### Spacing
- Generous padding and margins
- Cards should breathe
- Good use of whitespace

---

## What Components to Create

Here are suggestions for what would be helpful:

### 1. **Home Page / Landing Page**
A beautiful first impression:
- Hero section with headline
- How it works (3 steps)
- CTA button to get started
- Maybe testimonials or sample venues

Example prompt:
```
"Create a landing page for Aisle, a wedding venue discovery app.
Include a hero section with 'Find Your Perfect Wedding Venue' headline,
a purple CTA button, and a 3-step process showing how it works.
Make it modern and mobile-friendly."
```

### 2. **Venue Card Component**
Shows individual venue info:
- Venue image
- Name, location
- Price range
- Capacity
- Key amenities (icons)
- Status badge (contacted/responded)
- Favorite/bookmark icon

Example prompt:
```
"Design a wedding venue card showing an image, venue name,
location, price (£5000-8000), capacity (150 guests),
amenities with icons, and a purple 'View Details' button."
```

### 3. **Venue Comparison View**
Compare 2-3 venues side by side:
- Table or cards
- Highlight differences
- Easy to scan

Example prompt:
```
"Create a comparison table for 3 wedding venues showing
venue name, price, capacity, accommodation, outdoor space,
and catering options side by side."
```

### 4. **Criteria Input Form**
Better UX for entering requirements:
- Date picker
- Location search
- Guest count slider
- Budget range
- Preferences checkboxes
- Voice input button

Example prompt:
```
"Design a wedding venue search form with fields for:
date, location (with search icon), guest count (slider 50-500),
budget range (£5000-£50000), and amenity checkboxes.
Use purple accent colors."
```

### 5. **Email Preview Modal**
Show email before sending:
- Preview of the email
- Edit button
- Send button
- Recipient venue name

Example prompt:
```
"Create a modal dialog showing an email preview with
subject line, recipient, body text, and buttons to
'Edit' or 'Send Email' in purple."
```

### 6. **Dashboard / Overview**
Statistics and progress:
- Number of venues found
- Number contacted
- Number responded
- Recent activity timeline
- Quick actions

Example prompt:
```
"Design a wedding venue dashboard showing stats cards for
'Venues Found', 'Contacted', 'Responded' with numbers and icons,
plus a timeline of recent venue activity."
```

### 7. **Response Detail Card**
When venue replies:
- Venue details
- Their response text
- Pricing they quoted
- Availability
- Contact info
- Next steps button

Example prompt:
```
"Create a card showing a venue's response including their message,
quoted price, availability dates, contact person details,
and a purple 'Schedule Viewing' button."
```

---

## Pro Tips for V0

### Be Specific
❌ "Make a venue page"
✅ "Create a venue details page with a large hero image, venue name,
location with map icon, description, price starting from £X,
capacity, list of amenities, and a purple 'Contact Venue' button"

### Reference Examples
"Make it look like Airbnb's listing cards"
"Similar to The Knot's venue pages"
"Modern like Apple's product pages"

### Iterate Quickly
Don't try to get it perfect in one go:
1. Get basic structure
2. Ask for refinements: "Make the heading bigger"
3. Adjust colors: "Use a lighter purple"
4. Polish: "Add subtle shadows to the cards"

### Use Components
Start with small pieces:
- First: Create a venue card
- Then: Create a grid of venue cards
- Finally: Create the full page

---

## Communication with Saurabh

### When sharing a design:

**Good message:**
```
Hey! I made the venue card component in V0.
Link: v0.dev/chat/abc123xyz
Shows: venue image, name, price, capacity, and a favorite button.
Let me know if you want any changes!
```

**Include:**
- What the component is for
- The V0 link
- Any special notes (colors used, interactive elements, etc.)

### If he asks for changes:

Just update in V0 and send a new link. It's that easy!

---

## Example Conversation with V0

**You:** Create a modern wedding venue card

**V0:** *generates a card*

**You:** Make it more compact and add a heart icon in the top right

**V0:** *updates the design*

**You:** Perfect! Use purple-600 for the button

**V0:** *updates colors*

**You:** ✓ Done! *Copy link and send to Saurabh*

---

## Design Inspiration

Look at these for ideas:
- **Airbnb** - Great cards and layouts
- **The Knot / WeddingWire** - Wedding venue sites
- **Pinterest** - Wedding planning boards
- **Dribbble** - Search "wedding app" or "venue finder"

---

## Current App Features (For Context)

The app can already:
- ✅ Search for venues using AI
- ✅ Match venues to couple's criteria
- ✅ Generate personalized emails
- ✅ Send emails to venues
- ✅ Receive and parse venue responses (emails + PDFs)
- ✅ Voice input for criteria
- ✅ Parse PDF brochures

You're making these features look beautiful! 🎨

---

## Questions?

Ask Saurabh! He'll be integrating your designs so he can clarify:
- Technical constraints
- What data is available
- How things should interact

---

## Quick Reference

| Want to Create | Tell V0 |
|----------------|---------|
| A page | "Create a [description] page with..." |
| A component | "Design a [component] showing..." |
| Change colors | "Use purple-600 as the primary color" |
| Make it mobile | "Make it mobile-friendly" or "responsive design" |
| Add interaction | "Add a hover effect" or "animated on click" |

**Remember:**
- Be specific
- Iterate quickly
- Share the V0 link with Saurabh
- Have fun! 🎉

---

**Start here:** https://v0.dev

**Questions?** Ask Saurabh or just experiment - V0 is very forgiving!
