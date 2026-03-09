# Meeting Cost Calculator - 1-Day MVP Build

## Context
User and partner (both developers) are building a Meeting Cost Calculator in one day. The pain point: unnecessary meetings waste money and time, but teams rarely quantify it. The app lets you start a timer, input attendees + salary ranges, and watch the cost tick up in real-time. After the meeting ends, participants vote "was it worth it?" and get a shareable receipt.

User handles backend, partner handles frontend. Both using Claude Code with `--dangerously-skip-permissions`.

**New project** — separate from rabbit-reviews. Reuse patterns (lazy Supabase init, rate limiting, Vercel deploy).

## Tech Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Supabase (existing account: `dsezrapcieuhyxtawxoe`)
- Vercel for deploy
- nanoid for shareable slugs (8 chars)
- Client-side timer via `requestAnimationFrame` (no WebSocket needed)

## Supabase Schema

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  attendees JSONB NOT NULL, -- [{role: string, hourlyRate: number}]
  total_cost NUMERIC(10,2),
  created_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('worth_it', 'could_be_async', 'too_many_people', 'too_long')),
  voter_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_votes_unique_voter ON votes (meeting_id, voter_ip);

CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_rate_limits_lookup ON rate_limits (ip_address, action, created_at);
```

## File Structure

```
meeting-cost-calculator/
├── src/app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── meeting/[slug]/page.tsx          # Live timer page
│   ├── meeting/[slug]/receipt/page.tsx   # Receipt + vote page
│   ├── api/meetings/route.ts            # POST: create meeting
│   ├── api/meetings/[slug]/route.ts     # GET: fetch, PATCH: end meeting
│   └── api/meetings/[slug]/vote/route.ts # POST: cast vote, GET: results
├── src/components/
│   ├── meeting-creator.tsx   # Form: title, add attendees, start
│   ├── live-timer.tsx        # requestAnimationFrame cost ticker
│   ├── cost-display.tsx      # Formatted dollar amount (animated)
│   ├── attendee-input.tsx    # Role + salary range selector
│   ├── meeting-receipt.tsx   # Final summary card
│   ├── vote-buttons.tsx      # 4 vote options
│   ├── vote-results.tsx      # Aggregated vote display
│   ├── share-buttons.tsx     # Copy link, Twitter, LinkedIn
│   └── header.tsx, footer.tsx
├── src/lib/
│   ├── supabase.ts           # Lazy-initialized client (reuse pattern from rabbit-reviews)
│   ├── cost-calculator.ts    # Per-second cost math
│   ├── salary-presets.ts     # Quick-select salary ranges by role
│   ├── rate-limit.ts         # Postgres-based: 5/min, 15/hr, 30/day
│   ├── utils.ts              # nanoid slug generation
│   └── types.ts
```

## API Contracts

### `POST /api/meetings`
```json
// Request
{ "title": "Sprint Planning", "attendees": [{"role": "Engineer", "hourlyRate": 75}, ...] }
// Response 201
{ "slug": "a1b2c3d4", "startedAt": "..." }
```

### `GET /api/meetings/[slug]`
```json
// Response
{ "slug": "a1b2c3d4", "title": "Sprint Planning", "status": "active",
  "startedAt": "...", "endedAt": null, "attendees": [...],
  "costPerSecond": 0.125, "totalCost": null }
```

### `PATCH /api/meetings/[slug]`
```json
// Request: { "action": "end" }
// Response: { "totalCost": 450.00, "duration": 3600 }
// Server calculates totalCost = costPerSecond × elapsed seconds
```

### `POST /api/meetings/[slug]/vote`
```json
// Request: { "vote": "could_be_async" }
// Response 201: { "success": true }
// 409 if already voted from same IP
```

### `GET /api/meetings/[slug]/vote`
```json
// Response: { "total": 8, "results": {"worth_it": 3, "could_be_async": 3, "too_many_people": 1, "too_long": 1} }
```

## Salary Presets (Quick Select)
| Role | Hourly Rate |
|------|-------------|
| Junior Engineer | $45 |
| Engineer | $75 |
| Senior Engineer | $95 |
| Staff Engineer | $120 |
| Engineering Manager | $100 |
| Product Manager | $85 |
| Designer | $70 |
| Executive | $150 |
| Custom | User inputs |

## Developer Work Split

### Backend Dev (User) — API + Data
1. `npx create-next-app` + Supabase tables via psql
2. `src/lib/supabase.ts`, `types.ts`, `utils.ts` (nanoid), `rate-limit.ts`
3. `POST /api/meetings` — create meeting, generate slug
4. `GET /api/meetings/[slug]` — fetch meeting, compute costPerSecond
5. `PATCH /api/meetings/[slug]` — end meeting, calculate totalCost server-side
6. `POST /api/meetings/[slug]/vote` — cast vote with IP dedup
7. `GET /api/meetings/[slug]/vote` — aggregated results
8. `salary-presets.ts`, `cost-calculator.ts`
9. Deploy to Vercel, env vars, test end-to-end

### Frontend Dev (Partner) — UI + Interactions
1. `globals.css` theme, `layout.tsx` with fonts, `header.tsx`/`footer.tsx`
2. `page.tsx` — landing page with meeting creator form
3. `attendee-input.tsx` — role dropdown + salary preset selector + custom input
4. `meeting-creator.tsx` — title + attendee list + "Start Meeting" button
5. `meeting/[slug]/page.tsx` — live timer with `requestAnimationFrame`
6. `cost-display.tsx` — animated dollar counter
7. `live-timer.tsx` — elapsed time, per-person breakdown, "End Meeting" button
8. `meeting/[slug]/receipt/page.tsx` — receipt card + vote + share
9. `vote-buttons.tsx`, `vote-results.tsx`, `share-buttons.tsx`

**Frontend can use mock data** for first 3-4 hours while backend is being built. Timer is 100% client-side so no API dependency for core UX.

## Key Design Decisions
- **Client-side timer**: `requestAnimationFrame` calculates cost from `startedAt` timestamp. No polling needed.
- **Server-side totalCost**: When meeting ends, server calculates final cost from `started_at` to `NOW()` to prevent tampering.
- **No auth**: Anonymous. Share link = access. IP-based vote dedup.
- **nanoid slugs**: 8-char alphanumeric, URL-friendly (e.g. `/meeting/a1b2c3d4`).
- **Postgres rate limiting**: No Redis needed. Clean up old entries with periodic DELETE.

## Hour-by-Hour Schedule (8am → 6pm)

| Time | Backend | Frontend |
|------|---------|----------|
| 8-9 | Project setup, Supabase tables, lib files | Theme, layout, landing page shell |
| 9-10 | POST + GET meetings API | Meeting creator form + attendee input |
| 10-11 | PATCH (end) + vote APIs | Live timer page (mock data) |
| 11-12 | Rate limiting, edge cases, testing | Cost display animation, receipt page |
| 12-1 | **Integration** — connect frontend to real APIs |
| 1-2 | Bug fixes from integration | Vote UI + share buttons |
| 2-3 | Vercel deploy + env vars | Polish, responsive, loading states |
| 3-4 | End-to-end testing, OG image | Final polish, mobile testing |
| 4-6 | **Launch**: Product Hunt, HN, Twitter, LinkedIn |

## Triage: Cut If Behind
1. ~~OG image generation~~ → static fallback
2. ~~Per-person cost breakdown~~ → just show total
3. ~~Salary presets~~ → just a number input
4. ~~Share buttons~~ → just "Copy Link"
5. ~~Vote results chart~~ → simple text counts

## Verification
- [ ] Create a meeting → get shareable link
- [ ] Timer ticks up in real-time showing dollar cost
- [ ] End meeting → receipt shows total cost + duration
- [ ] Vote → results update, can't double-vote
- [ ] Share link works in incognito
- [ ] Rate limiting blocks excessive creation
- [ ] Mobile responsive
- [ ] Vercel deploy works
- [ ] `next build` passes
