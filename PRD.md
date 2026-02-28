# Product Requirements Document: Wedding AI Agent

**Document Version:** 1.0
**Last Updated:** February 28, 2026
**Product Name:** Wedding AI Agent (Working Title)
**Document Owner:** Product Team

---

## Executive Summary

Wedding AI Agent is an AI-powered personal assistant that streamlines the wedding venue and catering selection process for couples. The product addresses the time-consuming, repetitive, and fragmented nature of wedding planning by automating information gathering, communication with vendors, and decision-making support - reducing the journey from initial search to venue viewing from weeks/months to days.

---

## 1. Problem Statement

### 1.1 Core Problem
Wedding planning, specifically venue and catering selection, is an extremely time-consuming and frustrating process characterized by:

- **Information Asymmetry:** Critical information (pricing, availability, specific details) is hidden in PDFs that must be manually requested from each venue
- **Repetitive Communication:** Couples send the same questions to dozens of venues and receive stock responses
- **Fragmented Experience:** Communication happens across multiple platforms (Hitched, email, phone calls) with no centralized tracking
- **Lack of Expertise:** Most couples plan a wedding only once and have no prior experience or established criteria
- **High Time Investment:** Users report contacting 100+ venues to eventually view only 3

### 1.2 User Pain Points
1. Have to manually request PDFs/brochures from every venue to get basic pricing information
2. Reading through 10-20 page marketing brochures to extract 3-4 key facts
3. Asking the same questions repeatedly across dozens of vendors
4. Tracking conversations across Hitched, email, and phone calls
5. Evolving criteria during the process but having to start searches over
6. No joint account functionality for couples on existing platforms
7. Difficulty filtering by aesthetic/vibe preferences beyond basic categories
8. Time-consuming back-and-forth just to verify basic compatibility

### 1.3 Current Solutions and Gaps

**Existing Platforms (Hitched, Bridebook):**
- ✅ Good for initial discovery
- ✅ Basic filtering (capacity, price range, location)
- ❌ No pricing without manual outreach
- ❌ No automated communication
- ❌ No consolidated information management
- ❌ No joint account functionality
- ❌ Limited aesthetic/vibe-based search

**Wedding Planners:**
- ✅ Full-service solution
- ❌ Expensive (thousands of pounds)
- ❌ Not accessible to all couples
- ❌ Limited to specific regions

---

## 2. Product Vision & Objectives

### 2.1 Product Vision
To be the AI-powered personal assistant that handles all wedding venue and catering logistics, allowing couples to focus only on what matters: deciding which venues they actually want to visit and get married at.

### 2.2 North Star Metric
**Time from initial search to confirmed venue viewings** - Target: Reduce from weeks/months to 2-3 days

### 2.3 Success Metrics
- **Primary:** Number of couples who book at least one venue viewing through the platform
- **Secondary:**
  - Average time saved per user (target: 20+ hours)
  - Number of venues evaluated per user
  - Conversion rate from sign-up to shortlist creation
  - User satisfaction score (post-viewing survey)

---

## 3. Target Users

### 3.1 Primary User Persona: "The Engaged Couple"

**Demographics:**
- Age: 25-35
- Planning their first wedding
- Budget-conscious but willing to invest in quality
- Tech-savvy, comfortable with AI tools
- Both partners actively involved in planning

**Behaviors:**
- Using platforms like Hitched/Bridebook for discovery
- Spending 5-10 hours/week on wedding planning
- Overwhelmed by choices and information
- Using Pinterest for aesthetic inspiration
- Juggling wedding planning with full-time jobs

**Needs:**
- Save time on repetitive tasks
- Confidence they're making informed decisions
- Transparency on pricing and availability
- Single source of truth for all venue information
- Joint access with partner

**Quote:** "I would pay for a subscription like £50-100/month if it saved me from this PDF hell and endless email chains"

---

## 4. Product Scope

### 4.1 In Scope (MVP)

**Phase 1: Core Wedding AI Agent**

**1. Criteria Capture & Definition**
- Voice/conversation-based input to capture wedding requirements
- AI-generated criteria summary for user approval
- Hard vs. soft criteria classification
- Joint account functionality for couples
- Visual/aesthetic preference capture (Pinterest-style)

**2. Venue & Caterer Discovery**
- Integration with existing platforms (Hitched, Bridebook) for initial discovery
- Long-list generation based on user criteria
- Aesthetic/vibe-based filtering using image similarity
- Geographic filtering

**3. Automated Information Gathering**
- AI agent sends personalized emails to request brochures/PDFs
- Automatic PDF parsing and information extraction
- Missing information identification
- Follow-up question generation
- Back-and-forth email handling on user's behalf

**4. Information Consolidation Dashboard**
- Consolidated view of all venues with key information
- Highlighting of missing information
- AI-powered price estimation for missing data points
- Red flags and compatibility notes
- Hard criteria validation (pass/fail indicators)
- Soft criteria scoring/ranking

**5. Decision Support**
- Dynamic ranking based on evolving criteria
- Comparison views
- Memory of rejection reasons
- Criteria update suggestions based on learnings
- Video/real-wedding content aggregation (TikTok, YouTube)

**6. Viewing Scheduling**
- Automated booking request emails
- Availability coordination
- Calendar integration (Google Calendar)
- Joint calendar invites for both partners

**7. Call Integration**
- Granola-style call recording and summarization
- Automatic extraction of key information into dashboard
- Update of venue information based on call notes

### 4.2 Out of Scope (MVP)

**Future Phases:**
- Other wedding services (photography, videography, decorators, florists)
- 3D virtual venue tours
- Venue availability calendar integration
- Wedding planner marketplace features
- Post-viewing contract management
- Payment processing
- Direct venue charging/B2B platform

### 4.3 Technical Constraints
- Relies on email access delegation from users
- Limited to venues that respond via email/existing platforms
- Cannot create 3D models without venue cooperation
- PDF quality dependent on vendor materials

---

## 5. User Journey & Workflows

### 5.1 End-to-End User Flow

```
1. ONBOARDING & CRITERIA DEFINITION
   ├─ User creates joint account with partner
   ├─ AI-guided conversation about wedding vision
   ├─ Voice/text input of basic requirements
   ├─ Visual preference selection (Pinterest-style)
   ├─ AI generates criteria summary
   └─ User approves/refines criteria

2. DISCOVERY & LONG-LIST CREATION
   ├─ AI scrapes Hitched/Bridebook based on criteria
   ├─ Generates long list (50-100+ venues)
   ├─ Presents list with available information
   ├─ Highlights information gaps
   └─ User approves list for outreach

3. AUTOMATED INFORMATION GATHERING
   ├─ User grants email access/creates dedicated inbox
   ├─ AI generates personalized outreach emails
   ├─ User approves email template
   ├─ AI sends emails to all venues
   ├─ AI monitors responses
   ├─ AI parses PDFs/brochures
   ├─ AI identifies missing information
   ├─ AI sends follow-up questions
   ├─ AI handles back-and-forth until complete
   └─ Continuous dashboard updates

4. SHORTLIST REFINEMENT
   ├─ User reviews consolidated dashboard
   ├─ AI provides rankings based on criteria
   ├─ AI suggests criteria updates based on patterns
   ├─ User refines hard/soft criteria
   ├─ AI re-ranks venues
   ├─ User reviews AI price estimates
   ├─ User marks venues for rejection (with reasons)
   ├─ AI learns from rejections
   └─ User finalizes shortlist (3-10 venues)

5. VIEWING COORDINATION
   ├─ AI sends viewing request emails
   ├─ AI coordinates availability
   ├─ User approves viewing times
   ├─ AI confirms bookings
   └─ Calendar invites sent to both partners

6. POST-VIEWING TRACKING
   ├─ User conducts viewing
   ├─ Optional: Call recording integration
   ├─ User provides feedback/notes
   ├─ AI updates dashboard
   ├─ Criteria evolution continues
   └─ Process iterates as needed
```

### 5.2 Key User Interactions

**Human Intervention Points (Approval Gates):**
1. Criteria approval
2. Long-list approval
3. Email template approval
4. Shortlist finalization
5. Viewing time approval
6. Final booking confirmation

**AI Autonomous Actions:**
- Email composition and sending (post-approval)
- PDF parsing and data extraction
- Information gap identification
- Follow-up question generation
- Dashboard updates
- Ranking calculations
- Price estimation

---

## 6. Functional Requirements

### 6.1 Criteria Management

| Requirement ID | Priority | Description |
|----------------|----------|-------------|
| CR-001 | P0 | System shall capture user inputs via voice transcription and text |
| CR-002 | P0 | AI shall generate structured criteria from conversational input |
| CR-003 | P0 | System shall distinguish between hard criteria (must-have) and soft criteria (nice-to-have) |
| CR-004 | P1 | System shall allow criteria updates at any stage |
| CR-005 | P1 | System shall suggest criteria additions based on user rejection patterns |
| CR-006 | P2 | System shall support visual/aesthetic preference capture via image selection |

### 6.2 Discovery & Search

| Requirement ID | Priority | Description |
|----------------|----------|-------------|
| DS-001 | P0 | System shall scrape publicly available venue data from Hitched and Bridebook |
| DS-002 | P0 | System shall filter venues based on hard criteria |
| DS-003 | P0 | System shall generate a long-list of 50-100+ potential venues |
| DS-004 | P1 | System shall rank venues based on soft criteria matching |
| DS-005 | P2 | System shall support aesthetic similarity search using image analysis |

### 6.3 Email Communication

| Requirement ID | Priority | Description |
|----------------|----------|-------------|
| EM-001 | P0 | System shall generate personalized email templates for venue outreach |
| EM-002 | P0 | System shall send emails on user's behalf after approval |
| EM-003 | P0 | System shall monitor and parse incoming email responses |
| EM-004 | P0 | System shall handle multi-turn email conversations |
| EM-005 | P0 | System shall identify when information is complete vs. incomplete |
| EM-006 | P1 | System shall support dedicated inbox setup for wedding planning |
| EM-007 | P1 | System shall detect and escalate when email communication fails |

### 6.4 Information Processing

| Requirement ID | Priority | Description |
|----------------|----------|-------------|
| IP-001 | P0 | System shall parse PDF brochures and extract structured data |
| IP-002 | P0 | System shall identify missing information fields |
| IP-003 | P0 | System shall extract: pricing, capacity, availability, amenities, policies |
| IP-004 | P1 | System shall estimate missing data points using similar venue data |
| IP-005 | P1 | System shall flag estimate vs. confirmed data |
| IP-006 | P2 | System shall aggregate user-generated content (TikTok, YouTube) for venues |

### 6.5 Dashboard & Data Presentation

| Requirement ID | Priority | Description |
|----------------|----------|-------------|
| DB-001 | P0 | System shall display all venues in table/grid format |
| DB-002 | P0 | System shall highlight missing information with visual indicators |
| DB-003 | P0 | System shall show hard criteria pass/fail status |
| DB-004 | P0 | System shall provide soft criteria match scores |
| DB-005 | P1 | System shall support filtering and sorting by any field |
| DB-006 | P1 | System shall display rejection reasons and learnings |
| DB-007 | P1 | System shall show real-time update status (pending email, processing, complete) |
| DB-008 | P1 | System shall support side-by-side venue comparison |
| DB-009 | P2 | System shall embed venue photos and videos |

### 6.6 Collaboration & Account Management

| Requirement ID | Priority | Description |
|----------------|----------|-------------|
| AC-001 | P0 | System shall support joint accounts for two partners |
| AC-002 | P0 | Both partners shall have full read/write access |
| AC-003 | P1 | System shall track which partner made which updates |
| AC-004 | P2 | System shall support notifications when partner makes changes |

### 6.7 Scheduling & Calendar Integration

| Requirement ID | Priority | Description |
|----------------|----------|-------------|
| SC-001 | P0 | System shall send viewing request emails |
| SC-002 | P0 | System shall create calendar invites for both partners |
| SC-003 | P1 | System shall integrate with Google Calendar |
| SC-004 | P2 | System shall suggest optimal viewing schedules based on geography |

### 6.8 Call Recording & Notes

| Requirement ID | Priority | Description |
|----------------|----------|-------------|
| CN-001 | P2 | System shall record and transcribe phone calls (with permission) |
| CN-002 | P2 | System shall extract key information from call transcripts |
| CN-003 | P2 | System shall update venue records based on call content |

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Email response time: Within 4 hours during business hours
- PDF processing: < 30 seconds per document
- Dashboard load time: < 2 seconds
- AI response generation: < 5 seconds

### 7.2 Scalability
- Support 1,000 concurrent couples in MVP
- Handle 50,000+ venue records
- Process 10,000 emails/day

### 7.3 Security & Privacy
- End-to-end encryption for email access tokens
- GDPR compliance for user data
- Secure storage of personal wedding information
- User data deletion within 30 days of request
- No sharing of user data with venues without explicit consent

### 7.4 Reliability
- 99.5% uptime for core services
- Email sending success rate > 95%
- Automated backup of all user data

### 7.5 Usability
- Onboarding completion rate > 80%
- No training required to use core features
- Mobile-responsive design
- Accessibility compliance (WCAG 2.1 AA)

---

## 8. User Interface Requirements

### 8.1 Key Screens

**1. Onboarding Flow**
- Welcome & account creation
- Criteria conversation interface
- Visual preference selection
- Criteria summary & approval

**2. Dashboard (Primary Screen)**
- Venue table/grid view
- Filter & sort controls
- Search functionality
- Status indicators
- Quick actions (approve, reject, shortlist)

**3. Venue Detail View**
- All extracted information
- Photos & videos
- Communication history
- Notes section
- Actions (schedule viewing, reject, add to shortlist)

**4. Email Review Interface**
- Draft email preview
- Batch approval
- Edit capability
- Send controls

**5. Shortlist & Comparison View**
- Side-by-side comparison
- Viewing schedule
- Next steps

**6. Settings**
- Criteria management
- Email integration setup
- Calendar integration
- Account preferences

### 8.2 Design Principles
- **Transparency:** Always show what the AI is doing and why
- **Control:** User approval gates at key decision points
- **Simplicity:** Minimize cognitive load with clear information hierarchy
- **Collaboration:** Equal visibility and control for both partners
- **Trust:** Clear labeling of estimated vs. confirmed data

---

## 9. Technical Architecture (High-Level)

### 9.1 System Components

**Frontend:**
- Web application (React/Next.js)
- Mobile-responsive design
- Real-time updates

**Backend:**
- API server (Node.js/Python)
- Job queue for async tasks
- Email processing service

**AI/ML Services:**
- LLM for conversation understanding (GPT-4/Claude)
- PDF extraction service
- Email generation & response handling
- Image similarity matching
- Price estimation model

**Data Storage:**
- User database (PostgreSQL)
- Venue database
- Document storage (S3)
- Vector database for semantic search

**Integrations:**
- Email (Gmail, Outlook APIs)
- Calendar (Google Calendar, Outlook)
- Web scraping (Hitched, Bridebook)
- Video platforms (YouTube, TikTok APIs)

### 9.2 Data Model (Key Entities)

**User/Couple:**
- Account information
- Both partners' details
- Criteria (hard/soft)
- Preferences

**Venue:**
- Basic info (name, location, type)
- Extracted details (capacity, pricing, amenities)
- Photos/videos
- Status (pending, processing, complete)
- Source PDFs
- Communication history

**Criteria:**
- Hard requirements
- Soft preferences
- Visual preferences
- Version history

**Communication:**
- Email threads
- Call transcripts
- Status updates

---

## 10. Business Model & Go-to-Market

### 10.1 Revenue Model (MVP Focus)

**Primary: Consumer Subscription**
- One-time fee: £50-150 per couple
- Rationale:
  - Significantly cheaper than wedding planners (£1,000s)
  - High perceived value given time saved (20+ hours)
  - Single transaction aligned with one-time use case
  - Avoids subscription fatigue for one-time event

**Pricing Tiers (Potential):**
- **Basic:** £50 - Venue search only, up to 50 venues
- **Premium:** £100 - Venue + catering, up to 100 vendors, call recording
- **Deluxe:** £150 - Unlimited vendors, priority support, white-glove onboarding

### 10.2 Future Revenue Opportunities (Post-MVP)

**Vendor Marketplace:**
- Targeted advertising to high-intent couples
- Premium placement for vendors
- Lead generation fees
- Value prop: Higher intent leads than Hitched due to rich couple data

**Platform Expansion:**
- Charge vendors for inclusion (alternative to Hitched)
- Prerequisite: Critical mass of couples using platform
- Differentiation: Higher quality leads, better matching

**Adjacent Services:**
- Other vendor categories (photographers, florists, decorators)
- Regional expansion
- White-label for wedding planners

### 10.3 Market Opportunity

**Market Size:**
- UK: ~240,000 weddings/year
- Average venue search cost: 20 hours @ £25/hour opportunity cost = £500
- TAM (UK): £120M/year
- Global expansion potential significant

**Competitive Positioning:**
- **vs. Hitched/Bridebook:** AI-powered process automation, not just discovery
- **vs. Wedding Planners:** 10-20x cheaper, available to all couples
- **vs. DIY:** Massive time savings, expert guidance

### 10.4 Go-to-Market Strategy

**Phase 1: Beta Launch**
- Target: 50-100 couples
- Acquisition: Personal networks, wedding planning communities, Reddit
- Pricing: Free or heavily discounted for feedback
- Goal: Validate product-market fit, gather testimonials

**Phase 2: Limited Launch**
- Target: UK couples in major cities (London, Manchester, Birmingham)
- Acquisition: Instagram/TikTok ads, wedding blogs, influencer partnerships
- Pricing: £50-100 one-time fee
- Goal: 1,000 paying couples, refine product

**Phase 3: Scale**
- Geographic expansion
- Vendor marketplace testing
- Category expansion (catering, etc.)

---

## 11. Success Criteria & Metrics

### 11.1 MVP Success Criteria

**Product Metrics:**
- 70%+ of users complete onboarding
- 80%+ of users successfully generate a shortlist
- 60%+ of users book at least one viewing
- Average time to shortlist: < 5 days
- User satisfaction score: 4.5/5+

**Business Metrics:**
- 100 paying couples in first 3 months
- Customer acquisition cost < £30
- Net Promoter Score > 50
- 20%+ of users refer another couple

**Technical Metrics:**
- Email sending success rate > 95%
- PDF parsing accuracy > 90%
- System uptime > 99%

### 11.2 Key Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Venues block automated emails | High | Medium | Use personal email addresses, rate limiting, human-like communication |
| Low email response rate | High | Medium | A/B test email templates, add phone call fallback, set expectations |
| Inaccurate PDF parsing | Medium | Medium | Human review queue for low-confidence extractions, user feedback loop |
| Existing platforms block scraping | Medium | Low | Use official APIs where available, manual fallback, partnerships |
| Users uncomfortable with AI email access | Medium | Medium | Clear privacy messaging, dedicated inbox option, transparency |
| Limited differentiation from upcoming AI features on Hitched | High | Medium | Speed to market, superior UX, focus on end-to-end experience |

---

## 12. Development Roadmap

### 12.1 MVP Phases

**Phase 0: Validation (2 weeks)**
- Technical proof of concept
  - PDF parsing pipeline
  - Email agent testing
  - Basic criteria capture
- User research with 10-20 couples

**Phase 1: Core Experience (6-8 weeks)**
- Onboarding & criteria capture
- Discovery integration (scraping)
- Email agent (template generation, sending)
- Basic dashboard
- Manual testing with beta users

**Phase 2: Automation & Polish (4-6 weeks)**
- Automated PDF processing
- Multi-turn email conversations
- Dashboard refinement
- Visual preference capture
- Joint account functionality
- Calendar integration

**Phase 3: Beta Launch (2-4 weeks)**
- User onboarding flow polish
- Analytics & monitoring
- Customer support infrastructure
- Payment integration
- Beta user recruitment & support

**Total MVP Timeline: 14-20 weeks (3.5-5 months)**

### 12.2 Post-MVP Roadmap

**Q2 Features:**
- Call recording integration
- Video content aggregation
- Advanced ranking algorithms
- Mobile app

**Q3 Features:**
- Catering search expansion
- Vendor marketplace alpha
- Geographic expansion

**Q4 Features:**
- Additional vendor categories
- White-label offering
- API partnerships with existing platforms

---

## 13. Open Questions & Decisions Needed

### 13.1 Product Questions
1. Should we support phone-based vendors or email-only for MVP?
2. How much manual review of AI-generated emails is acceptable?
3. Should we build a dedicated mobile app or focus on mobile-web?
4. What's the minimum viable dashboard for beta testing?

### 13.2 Technical Questions
1. Which email provider APIs should we integrate first?
2. What's the best approach for web scraping (legal, technical)?
3. Should we build our own PDF parser or use third-party services?
4. How do we handle rate limiting for outbound emails?

### 13.3 Business Questions
1. Exact pricing for MVP (£50, £75, or £100)?
2. Should we offer refunds if users don't book a viewing?
3. How do we handle couples who abandon mid-process?
4. When should we approach venues for B2B partnerships?

---

## 14. Appendix

### 14.1 Research Sources
- User interview: Primary user (Feb 28, 2026)
- Competitive analysis: Hitched, Bridebook
- Industry research: Wedding planning market UK
- Technical research: OpenAI x Hitched partnership announcement (March 2025)

### 14.2 Terminology
- **Hard Criteria:** Must-have requirements (dealbreakers)
- **Soft Criteria:** Nice-to-have preferences (weighted scoring)
- **Long-list:** Initial list of 50-100+ venues to evaluate
- **Shortlist:** Final list of 3-10 venues to visit
- **Viewing:** In-person visit to a potential venue

### 14.3 References
- Hitched platform: Wedding venue discovery
- Bridebook platform: Wedding planning tools
- Pinterest: Visual inspiration platform
- Granola: Call recording and summarization tool

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 28, 2026 | Product Team | Initial PRD based on team meeting |

---

**Approval:**
- [ ] Product Lead
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] Business Lead
