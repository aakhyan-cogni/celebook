# EMS Sprint 2 — Task Plan

> **Stack recap:** React 19 + Vite + TypeScript + Zustand (frontend) · Express 5 + MongoDB (Mongoose ORM) (backend)  
> **Team size:** 5 developers  
> **Goal:** Complete a production-usable Event Management System with approval workflows, tiers, form builders, and team participation.

---

## Checkpoint Status

**Legend:** ✅ Done · 🟡 In Progress · ⏳ Pending · 🚫 Blocked

The reference LLD (`Event Management System.pdf`) defines five bare-minimum modules: Event Management, User Registration, Ticket Booking, Notifications & Reminders, and Feedback & Ratings. Checkpoint 1 must ship to satisfy the LLD; Checkpoint 3 contains plus-features that are descopable under time pressure.

### Checkpoint 0 — Foundations (auth + consent)  ✅ 2 / 2 done
- ✅ S2-001 · Consent System — Backend
- ✅ S2-002 · Consent System — Frontend

### Checkpoint 1 — PDF Bare Minimum  ✅ 8 / 15 done · 🟡 5 in progress · ⏳ 2 pending
Priority order top-to-bottom. Must ship to satisfy the PDF LLD.
- ✅ S2-003 · Admin Role & Endpoints — Backend  *(required by the event-publish state machine)*
- ✅ S2-004 · Admin Dashboard — Frontend
- ✅ S2-005 · Event Model & Core CRUD — Backend
- ✅ S2-006 · Event Search & Public Listing — Backend
- ✅ S2-007 · Event Creation & Management — Frontend Integration
- ✅ S2-008 · My Events Dashboard & Event Editing — Frontend
- 🟡 S2-009 · Event Registration (Tickets) — Backend  *(formData persistence missing; notification stub still console.log)*
- 🟡 S2-010 · Event Registration (Tickets) — Frontend  *("My Registrations" Dashboard section + Event Full button state missing)*
- ✅ S2-015 · File Upload — Backend  *(avatar portion)*
- 🟡 S2-016 · File Upload — Frontend  *(event banner upload done; profile avatar is preset-picker, not real file upload)*
- 🟡 S2-017 · Notification System — Backend  *(model/service/endpoints done; not wired into admin approve/reject, registration, or publish-submit)*
- 🟡 S2-018 · Notification System — Frontend  *(NotificationPage uses mock data; Navbar bell has no unread badge)*
- ⏳ S2-022 · Feedback & Ratings — Backend  *(NEW — added to satisfy PDF Module 4.5)*
- ⏳ S2-023 · Feedback & Ratings — Frontend  *(NEW — added to satisfy PDF Module 4.5)*
- ✅ S2-021 · User Profile — Backend Integration & Subscription Tier

### Checkpoint 2 — Hardening (cross-cutting, run alongside CP1)
- 🟡 S2-019 · Backend Security Hardening  *(ownership checks done; Zod, rate-limit, env validation, magic-byte checks all missing)*
- 🟡 S2-020 · Frontend Auth Guards & Route Protection  *(inline checks on /admin and /dashboard; no ProtectedRoute/AdminRoute/TierGate component; /notifications and /support unguarded; no intended-path redirect)*

### Checkpoint 3 — Plus Features (descope first if time runs out)
- ⏳ S2-011 · Custom Form Builder — Backend
- ⏳ S2-012 · Custom Form Builder — Frontend
- ⏳ S2-013 · Team Participation — Backend
- ⏳ S2-014 · Team Participation — Frontend
- ✅ S2-015 (gallery) · Event Image Gallery — Backend continuation of S2-015  *(tier-based limits FREE=1 / PRO=5 / ULTIMATE=10)*
- ✅ S2-016 (gallery) · Event Image Gallery — Frontend continuation of S2-016  *(EventCreationForm wires uploads with client-side type/size validation)*
- ✅ S2-024 · Event Stats Collection (Full-stack) — *(2026-05-15; tracks attendees + powers organizer panel)*

> **Note on S2-015 / S2-016:** The same task body covers both avatar upload (CP1) and event-image gallery (CP3). The avatar portion is bare-minimum; the gallery portion is descopable. Devs should ship avatar first and treat gallery as optional follow-up.

### How to update status
Devs flip the emoji on their task as they progress: ⏳ → 🟡 (when work starts) → ✅ (when merged). Also bump the per-task `**Status:**` line below. Anyone reading this file should be able to see the project state from the top of the file alone.

---

## Session Log — 2026-05-15

Work landed today across event stats, registration lifecycle, and several refresh/auth bugs.

**New feature — EventStat collection (see S2-024 below)**
- New `EventStatModel` (`server/src/models/eventStat.model.js`): `{ eventId (unique), attendees: [userId], avgFeedback? }`.
- `registerForEvent` upserts the doc and `$addToSet`s the userId; `cancelRegistration` `$pull`s the userId — cancelled attendees do not count toward stats or capacity.
- New endpoint `GET /api/events/:id/stats` (organizer/admin only).
- `getEventById` now attaches `userRegistration` (the viewer's CONFIRMED reg, if any) so the frontend can render registered-state without a second round-trip.
- `SingleEvent.tsx`: shows **✓ Already Registered** disabled CTA + a **Cancel Registration** button for registered users; organizer Cancel Event button is gated on `!eventStat` (no attendees yet); organizer panel surfaces an Attendees Tracked count.

**Registration schema cleanup**
- Reduced `Registration.status` enum to `["CONFIRMED", "CANCELLED"]`, default `CONFIRMED` (PENDING removed — never used in flow).
- `registerForEvent` now reactivates an existing CANCELLED row (instead of tripping the unique `(eventId, userId)` index) so a user can re-register after cancelling.

**Seed fixes** (`server/src/seed.js`)
- Seeded users now get the real `consentVersion` (from `TermsConfig`) instead of `null` — fixes spurious re-consent prompts.
- Three events now seed: `PENDING` at +5d, `APPROVED` at +3d, `APPROVED` past at -3d (for feedback-flow testing).

**Auth / hydration bugs**
- Fixed page-refresh logout race: `Hydrate.tsx` now awaits `/auth/refresh` *before* firing `/user/profile`. The old parallel pattern caused two refresh requests against the rotating refresh token in DB — the loser triggered `logout()`.
- `Event.tsx` and `Dashboard.tsx` now wait for the access token to be set before fetching when `isAuthenticated` is true (avoids 401 → empty state on refresh).

**Admin event flow**
- Fixed broken navigation in `admin/Overview.tsx` and `admin/Events.tsx`: `/events?q=ID` → `/events/${id}` (the old URL pointed at the public events search route, which silently rejects non-APPROVED events).
- `EventCard` now renders a top-left status badge (`Pending Review` / `Rejected` / `Draft`) when status ≠ `APPROVED`, so admins immediately spot what needs action. Removed the now-duplicate badge from `Dashboard.tsx`.

**TS tooling**
- Added `web/src/vite-env.d.ts` (`/// <reference types="vite/client" />`) to fix `Cannot find module './index.css'` errors across `.tsx` files.

**Status audit (rolled up into Checkpoint Status above)**
After a full codebase pass:
- Flipped to ✅: S2-005, S2-006, S2-007, S2-008, S2-015 (avatar **+** gallery), S2-021.
- Flipped to 🟡 with per-task gap notes: S2-009 (formData not persisted, notification stub still console.log), S2-010 (no My Registrations section, no Event Full state), S2-016 (avatar is preset picker not file upload), S2-017 (model+endpoints done but `createNotification` not called from admin / registration / publish), S2-018 (page on mock data, no bell badge), S2-019 (only ownership checks done), S2-020 (inline checks instead of guard components, no intended-path redirect, /notifications + /support unguarded).
- New: S2-024 (EventStat) — done.
- Still ⏳: S2-011 / S2-012 (form builder), S2-013 / S2-014 (teams), S2-022 / S2-023 (feedback).

---

## System Design Decisions

These are architectural decisions that every developer must be aware of before picking up tasks.

### Event Status State Machine

```
PUBLIC / UNLISTED events:
  DRAFT ──(organizer publishes)──▶ PENDING ──admin reviews──▶ APPROVED
                                                           └─▶ REJECTED ──▶ organizer edits ──▶ PENDING
```

Every PUBLIC and UNLISTED event requires admin approval on every publish — there is no "first event only" carve-out.

- `DRAFT` — only visible to organizer.
- `PENDING` — visible to organizer + admin, not listed publicly.
- `APPROVED` — publicly listed (if visibility = PUBLIC), discoverable.
- `REJECTED` — visible to organizer only, with rejection reason.

### Tier Permissions Matrix

| Feature                         | FREE | PRO | ULTIMATE |
|---------------------------------|------|-----|----------|
| Active events (published)       | 2    | 10  | Unlimited|
| Max attendees per event         | 100  | 500 | Unlimited|
| Custom form builder             | ✗    | ✓   | ✓        |
| Team participation              | ✗    | ✓   | ✓        |
| Event image gallery             | ✗    | ✓   | ✓        |
| Analytics dashboard             | ✗    | ✗   | ✓        |

> **Rule:** Tier limits are **always enforced server-side**. Client-side gates are UX only (show upgrade prompts). Never trust the client for feature access.

### Privacy & Visibility Rules

- `PUBLIC` — discoverable in global search, accessible by anyone.
- `UNLISTED` — not discoverable in search but accessible by direct link to anyone.

### Consent Versioning

- Store `consentVersion` (a string like `"v1.0"`) in the User document.
- Maintain a `TermsConfig` singleton in DB with the current active version.
- On every authenticated request, middleware compares `user.consentVersion` with `TermsConfig.currentVersion`. If mismatched, the frontend intercepts with a re-consent modal before allowing action.

### Team Events

- Organizer toggles "Team Participation" during event creation and sets `minTeamSize` / `maxTeamSize`.
- When enabled, individual registration is disabled; only team leaders can register their team.
- Team counts as one slot against event capacity (configurable: per-team or per-member).
- A user can only be in one team per event.

### Enum / Status Reference

All "enums" are plain JavaScript string constant arrays declared once in the relevant model file under `server/src/models/` and reused across services. The stored value in the collection is the string variant (e.g., `"APPROVED"`). Mongoose schemas enforce allowed values via the `enum:` option; additional input validation is handled by Zod (see S2-019). Here is the full set for quick reference:

```js
export const ROLES               = ["USER", "ADMIN"];
export const TIERS               = ["FREE", "PRO", "ULTIMATE"];
export const EVENT_STATUSES      = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
export const EVENT_VISIBILITIES  = ["PUBLIC", "UNLISTED"];
export const TEAM_CAPACITY_MODES = ["PER_TEAM", "PER_MEMBER"];
export const REGISTRATION_STATUSES = ["CONFIRMED", "CANCELLED"];
export const TEAM_MEMBER_STATUSES  = ["INVITED", "ACCEPTED", "DECLINED"];
export const NOTIFICATION_TYPES  = [
    "EVENT_APPROVED",
    "EVENT_REJECTED",
    "TEAM_INVITE",
    "REGISTRATION_CONFIRMED",
    "EVENT_REMINDER",
];
```

> **Note:** Mongoose `enum:` validation rejects values not in the list at the schema level. **Always validate incoming values** (via Zod schemas in S2-019 or explicit guards) before writing. Export these arrays from the model file so they can be used in both the Mongoose schema and the Zod validation schema.

---

### Admin Role

- Platform has a seeded `ADMIN` user.
- Admins bypass all tier restrictions and can view/edit all events regardless of status or visibility.
- Admin dashboard is a separate `/admin` route, unreachable by non-admins both on frontend and backend.

---

## Tasks

Tasks are labelled `S2-XXX`. Each is designed to be completable by one developer independently. Backend and frontend tasks for the same feature are split so two devs can work in parallel (backend first for contract, then frontend wires up).

---

### Module 1 — Consent & Terms of Service

---

#### S2-001 · Consent System — Backend
**Type:** Backend  
**Depends on:** Nothing  
**Checkpoint:** 0 (Foundations)  
**Status:** ✅ Done  

**What to build:**
- Add fields to the `UserModel` Mongoose schema (`server/src/models/user.model.js`): `consentAccepted: Boolean` (default `false`), `consentAcceptedAt: Date`, `consentVersion: String`. Mongoose schema defaults handle these automatically on insert. *(Already implemented in the current codebase.)*
- Create a `TermsConfig` singleton collection with the `TermsConfigModel` Mongoose schema: `{ currentVersion: String, timestamps: true }`. Seed it with version `"v1.0"` (the `consent.service.js::getOrCreateTermsConfig` helper already lazily creates this on first read). *(Already implemented.)*
- New endpoint: `POST /api/consent/accept` (authenticated) — sets `consentAccepted = true`, `consentAcceptedAt = now()`, `consentVersion = currentTermsVersion`. Returns `{ ok: true }`. *(Already implemented.)*
- New endpoint: `GET /api/consent/status` (authenticated) — returns `{ accepted: bool, userVersion: string, currentVersion: string, needsRenewal: bool }`. *(Already implemented.)*
- Add `consentCheck` middleware that runs after `authenticate` on protected routes: if `user.consentVersion !== TermsConfig.currentVersion`, respond `403 CONSENT_REQUIRED`. The frontend handles this response code to show the re-consent modal. *(Already implemented in `consent.middleware.js`.)*
- Apply `consentCheck` to: event creation, registration, form submission, team creation routes.

**Acceptance criteria:**
- New user cannot create events without accepting T&C.
- Existing user who accepted v1.0 is not re-prompted until admin bumps the version.
- Bumping `TermsConfig.currentVersion` via DB causes all users to be re-prompted on next action.

---

#### S2-002 · Consent System — Frontend
**Type:** Frontend  
**Depends on:** S2-001 (API contract)  
**Checkpoint:** 0 (Foundations)  
**Status:** ✅ Done  

**What to build:**
- Dedicated `ConsentModal` component: full-screen modal (not closable via backdrop click or Escape) that shows the T&C text scrollable area. The "Accept" button is **disabled** until the user scrolls to the bottom of the text.
- Intercept `403 CONSENT_REQUIRED` in `lib/api.ts` alongside the existing 401 refresh logic. Instead of logging out, set a global Zustand flag `consentRequired: true`.
- In `App.tsx` or a layout wrapper, if `consentRequired` is true, render `ConsentModal` over all content.
- On accept, call `POST /api/consent/accept`, clear the flag, and re-execute the original failed request.
- On register page, show a checkbox "I agree to the Terms and Conditions" (links to a `/terms` page). This is a pre-flight gate before the form submits; the real server-side consent is saved after account creation during onboarding redirect.
- Create a static `/terms` page with placeholder T&C text.

**Acceptance criteria:**
- User who has not accepted T&C cannot proceed to create events; ConsentModal blocks them.
- Modal cannot be dismissed without accepting.
- After accepting, the original action they were trying to take resumes automatically.

---

### Module 2 — Admin System

---

#### S2-003 · Admin Role & Endpoints — Backend
**Type:** Backend  
**Depends on:** Nothing (uses existing auth middleware)  
**Checkpoint:** 1 (Bare Minimum) — required by event publish state machine  
**Status:** ✅ Done

**What to build:**
- The `UserModel` Mongoose schema already has `role` and `tier` fields with `enum` validation. Allowed values are declared in `server/src/models/user.model.js`:

```js
export const ROLES = ["USER", "ADMIN"];
export const TIERS = ["FREE", "PRO", "ULTIMATE"];

// In the schema:
role: { type: String, enum: ROLES, default: "USER" },
tier: { type: String, enum: TIERS, default: "FREE" },
```

- `auth.service.js::createUser` uses `UserModel.create(...)` — the schema `default:` values for `role` and `tier` are applied automatically by Mongoose.
- Backfill: write a one-off script or a lazy read-migration in `user.service.js::getUserById` that sets `tier: "FREE"` on any user doc missing it, so old records stay compatible.
- Create a DB seed script (`server/src/seed.js`, wired to `npm run db:seed`) that connects via `connectDB()` and uses `UserModel.create(...)` to insert an admin user into the `User` collection if none with `role === "ADMIN"` exists. Admin credentials should come from env vars `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Create `admin.middleware.js`: runs after `authenticate`, checks `req.user.role === "ADMIN"`, returns `403` otherwise.
- Admin routes under `/api/admin` (all guarded by `authenticate` + `adminOnly`):
  - `GET /admin/users?page=&limit=&role=` — paginated user list (`id, name, email, role, tier, consentAccepted, createdAt`).
  - `PATCH /admin/users/:id/role` — change user role (body: `{ role: Role }`).
  - `GET /admin/events?status=&page=&limit=` — all events with organizer details.
  - `PATCH /admin/events/:id/approve` — set event status to `APPROVED`, trigger notification.
  - `PATCH /admin/events/:id/reject` — set event status to `REJECTED`, body: `{ reason: string }`, trigger notification.
  - `GET /admin/stats` — `{ totalUsers, totalEvents, pendingApprovals, totalRegistrations }`.

**Acceptance criteria:**
- Non-admin calling any `/admin/*` route gets `403`.
- Seeded admin user exists after running `npm run db:seed`.
- Approve/reject endpoints update event status and create a Notification record (see S2-022).

---

#### S2-004 · Admin Dashboard — Frontend
**Type:** Frontend  
**Depends on:** S2-003  
**Checkpoint:** 1 (Bare Minimum)  
**Status:** ✅ Done  

**What to build:**
- New route `/admin` — redirect to `/login` if not authenticated; redirect to `/dashboard` if authenticated but role is not `ADMIN`.
- Admin layout with sidebar: **Overview**, **Pending Events**, **All Events**, **Users**.
- **Overview tab:** Stats cards using `GET /admin/stats` (total users, events, pending approvals).
- **Pending Events tab:** List of events with `PENDING` status. Each row shows event title, organizer name, category, created date. Two action buttons: `Approve` and `Reject`. Reject opens a small modal asking for a rejection reason (free text, required). Optimistic UI update on action.
- **All Events tab:** Filterable table (by status, category). Shows all events.
- **Users tab:** Paginated user list. Columns: name, email, role badge, tier badge, consent status, join date. Ability to toggle role between USER and ADMIN (with a confirmation dialog).
- No analytics or charts needed — simple tables are sufficient.

**Acceptance criteria:**
- Admin can approve or reject a pending event from the Pending Events tab.
- Rejection requires a non-empty reason.
- Non-admin users who navigate directly to `/admin` are redirected.
- Role change on user requires confirmation click.

---

### Module 3 — Event CRUD (Backend → Real DB)

---

#### S2-005 · Event Model & Core CRUD — Backend
**Type:** Backend  
**Depends on:** Nothing  
**Checkpoint:** 1 (Bare Minimum) — PDF Module 4.1 Event Management  
**Status:** ✅ Done  

**What to build:**

Declare the following constant arrays in `server/src/models/event.model.js` (add alongside those from S2-003):

```js
export const EVENT_STATUSES      = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
export const EVENT_VISIBILITIES  = ["PUBLIC", "UNLISTED"];
export const TEAM_CAPACITY_MODES = ["PER_TEAM", "PER_MEMBER"];
```

Extend the `EventModel` Mongoose schema (in `server/src/models/event.model.js`) to the full sprint spec:
```js
const eventSchema = new mongoose.Schema({
    title:            { type: String, required: true },
    description:      { type: String, default: "" },
    category:         { type: String, required: true },
    tags:             { type: [String], default: [] },
    date:             { type: Date, required: true },
    endDate:          { type: Date, default: null },
    location:         { type: String, required: true },
    price:            { type: Number, default: 0 },
    capacity:         { type: Number, required: true },
    imgUrls:          { type: [String], default: [] },
    organizerId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organizerEmail:   { type: String, required: true },
    status:           { type: String, enum: EVENT_STATUSES, default: "DRAFT" },
    rejectionReason:  { type: String, default: null },
    visibility:       { type: String, enum: EVENT_VISIBILITIES, default: "PUBLIC" },
    isTeamEvent:      { type: Boolean, default: false },
    minTeamSize:      { type: Number, default: null },
    maxTeamSize:      { type: Number, default: null },
    teamCapacityMode: { type: String, enum: TEAM_CAPACITY_MODES, default: null },
    formSchemaId:     { type: mongoose.Schema.Types.ObjectId, ref: "FormSchema", default: null },
}, { timestamps: true });
```

Mongoose applies all `default:` values on insert automatically. Pair with a Zod schema in S2-019 for input validation.

Indexes (add to the schema definition before `mongoose.model()`):
```js
eventSchema.index({ organizerId: 1 });
eventSchema.index({ status: 1, visibility: 1 });
eventSchema.index({ date: 1 });
```

Endpoints:
- `POST /api/events` (auth + consentCheck + tierCheck) — Create event via `EventModel.create(...)`. Initial status always `"DRAFT"`. Returns created event (use the `fromDoc` mapper so `id` is a string).
- `PATCH /api/events/:id` (auth) — Update event via `EventModel.findByIdAndUpdate(id, update, { new: true })`. Only organizer or admin can update. Only `"DRAFT"` or `"REJECTED"` events can be edited by the organizer. Admin can edit any.
- `DELETE /api/events/:id` (auth) — Hard-delete via `EventModel.findByIdAndDelete(id)`. Only allowed if no registrations exist: pre-check with `RegistrationModel.countDocuments({ eventId: id })` (return `409` if > 0). Only organizer or admin.
- `POST /api/events/:id/publish` (auth + consentCheck + tierCheck) — Transition from `"DRAFT"` (or `"REJECTED"`). Status goes to `"PENDING"` and waits for admin approval on every publish. **Tier check:** `EventModel.countDocuments({ organizerId, status: { $in: ["PENDING", "APPROVED"] } })` must be below tier limit. DRAFTs are not counted (they're not yet active; tier gates only active/published events).
- `GET /api/events/mine` (auth) — Current user's events (all statuses). Use `EventModel.aggregate(...)` with a `$lookup` on `Registration` to attach registration count per event.
- `GET /api/events/:id` — Single event. If status is not `"APPROVED"`, only organizer/admin can view.

**Acceptance criteria:**
- Events created via API are stored in MongoDB.
- Publishing any event always sets status to `PENDING` (admin approval required every time).
- FREE tier user cannot publish a third active event (receives `403 TIER_LIMIT_EXCEEDED`).
- Organizer cannot delete an event that has registrations.

---

#### S2-006 · Event Search & Public Listing — Backend
**Type:** Backend  
**Depends on:** S2-005  
**Checkpoint:** 1 (Bare Minimum) — PDF Module 4.1 search/filter  
**Status:** ✅ Done  

**What to build:**
- `GET /api/events` — Public listing. Build a Mongoose filter that always includes `{ status: "APPROVED", visibility: { $in: ["PUBLIC", "UNLISTED"] } }`. Support query params: `?q=` (text search on title + description), `?category=`, `?location=`, `?dateFrom=`, `?dateTo=`, `?page=1`, `?limit=20`. Use `EventModel.find(filter).skip().limit().lean()` + `EventModel.countDocuments()` for pagination.
- Create a MongoDB text index on `title` and `description` by adding `eventSchema.index({ title: "text", description: "text" })` in `event.model.js` — Mongoose creates it on first connection. For `?q=`, use `{ $text: { $search: q } }` in the filter.
- Remove the existing mock event data from `event.service.js` (the current `getAllEvents` returning a hardcoded list). All data now comes from the `Event` collection.

**Acceptance criteria:**
- `GET /api/events` never returns unapproved events.
- `GET /api/events?q=hackathon` returns events with "hackathon" in title or description.
- Unauthenticated user can list and view public events.

---

#### S2-007 · Event Creation & Management — Frontend Integration
**Type:** Frontend  
**Depends on:** S2-005, S2-006  
**Checkpoint:** 1 (Bare Minimum)  
**Status:** ✅ Done  

**What to build:**
- Wire `EventCreationForm.tsx` to `POST /api/events` then `POST /api/events/:id/publish`.
- After submission, if status comes back as `PENDING`, show an info banner: "Your event has been submitted for admin review. You'll be notified once it's approved."
- If status is `APPROVED` (returning user), show a success screen with a link to the event.
- Add a **Step 4** to the creation form: **Visibility & Team Settings**:
  - Visibility selector: Public / Unlisted / Private. Show a locked icon with tooltip "Upgrade to PRO" for Private on FREE tier.
  - Team event toggle. When enabled: min and max team size number inputs appear.
- Wire `Global_Event.tsx` search and filters to `GET /api/events` (replacing the in-memory filter on mock data). Add pagination controls.
- Wire the event detail view to `GET /api/events/:id` (real data).

**Acceptance criteria:**
- Creating an event from the form persists it to the database.
- First-time publisher sees the pending review message.
- Search and filter work against the real API.
- FREE tier user sees a locked/disabled Private option with an upgrade prompt.

---

#### S2-008 · My Events Dashboard & Event Editing — Frontend
**Type:** Frontend  
**Depends on:** S2-005, S2-007  
**Checkpoint:** 1 (Bare Minimum)  
**Status:** ✅ Done  

**What to build:**
- Rework the "Events You're Organizing" section in `Dashboard.tsx` to use `GET /api/events/mine`.
- Each event card shows a status badge: `Draft`, `Pending Review` (yellow), `Approved` (green), `Rejected` (red with reason on hover/click).
- Rejected events have a "Edit & Resubmit" button that opens the edit form pre-filled with existing data.
- Add an "Edit Event" flow: same 4-step form pre-populated. Only editable if status is `DRAFT` or `REJECTED`.
- Add a "Delete Event" option (only for events with 0 registrations). Shows a confirmation modal.
- "Publish" button for DRAFT events.

**Acceptance criteria:**
- Dashboard shows real events from the API, not localStorage.
- Status badges reflect actual event state.
- Rejected event can be edited and resubmitted.
- Delete requires confirmation and is blocked (with an error message) if registrations exist.

---

### Module 4 — Event Registration / RSVP

---

#### S2-009 · Event Registration — Backend
**Type:** Backend  
**Depends on:** S2-005  
**Checkpoint:** 1 (Bare Minimum) — PDF Module 4.3 Ticket Booking  
**Status:** 🟡 In Progress

**Audit (2026-05-15) — gaps remaining:**
- `formData` is NOT declared on `RegistrationModel` schema — service writes it but Mongoose strict mode drops it. Form-submission data is silently lost.
- `registration.service.js` still has a local `createNotification` stub (console.log). Should call the real `notification.service.createNotification` so `REGISTRATION_CONFIRMED` rows land in the `Notification` collection.
- `teamId` field on Registration not present (needed by S2-013).
- The non-unique indexes `{userId: 1}` and `{eventId: 1, status: 1}` from the spec are not declared.
- `GET /api/registrations/mine` route is actually mounted at `/api/registrations/my-registrations` (cosmetic — frontend uses this path).


**What to build:**

Declare the following constant array in `server/src/models/registration.model.js`:

```js
export const REGISTRATION_STATUSES = ["CONFIRMED", "CANCELLED"];
```

New `Registration` collection + Mongoose schema in `server/src/models/registration.model.js`:
```js
const registrationSchema = new mongoose.Schema({
    eventId:      { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status:       { type: String, enum: REGISTRATION_STATUSES, default: "CONFIRMED" },
    formData:     { type: mongoose.Schema.Types.Mixed, default: null },
    teamId:       { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
registrationSchema.index({ userId: 1 });
registrationSchema.index({ eventId: 1, status: 1 });

export const RegistrationModel = mongoose.model("Registration", registrationSchema);
export const REGISTRATION_COLLECTION = "Registration";
```

Export `RegistrationModel` from `server/src/models/index.js` alongside the other models.

Endpoints:
- `POST /api/events/:id/register` (auth + consentCheck) — Register for an event. Validate: event is `"APPROVED"`, not full (compare `event.capacity` vs `registrations().countDocuments({ eventId, status: "CONFIRMED" })`), user not already registered (the unique index will reject on race), event is not a team event (team events use the team registration flow). If event has a `formSchemaId`, validate `formData` against it. Insert a Registration doc. Trigger confirmation notification. On `MongoServerError` with code 11000 (dup-key), return `409`.
- `DELETE /api/events/:id/register` (auth) — Cancel registration. Only allowed if event date is >24h away (configurable). `findOneAndUpdate` to set `status: "CANCELLED"`.
- `GET /api/events/:id/registrations` (auth) — Organizer or admin only. Returns registrations joined to users via aggregation (`$lookup` on User).
- `GET /api/registrations/mine` (auth) — Current user's registrations across all events.

**Acceptance criteria:**
- User cannot register for the same event twice (returns `409`).
- Registration is blocked if event is at capacity (returns `409 EVENT_FULL`).
- Registration is blocked if event is not `APPROVED` (returns `403`).
- Cancellation is blocked within 24h of event start (returns `403 TOO_LATE_TO_CANCEL`).
- Private event registration is possible only if user has the event link (the GET /events/:id already guards this).

---

#### S2-010 · Event Registration — Frontend
**Type:** Frontend  
**Depends on:** S2-009  
**Checkpoint:** 1 (Bare Minimum) — PDF Module 4.3 Ticket Booking  
**Status:** 🟡 In Progress

**Audit (2026-05-15) — gaps remaining:**
- "My Registrations" Dashboard section is NOT implemented — the backend endpoint `GET /api/registrations/my-registrations` exists but no frontend component consumes it.
- The Register CTA has no `Event Full` state — capacity errors only surface as a toast after the user clicks Register.
- All other states (Login to Register / Register / ✓ Already Registered / Registration Closed / Event Cancelled) and the optional registration form modal are wired and working. Cancel Registration button works and freed seats are reclaimable (re-register reactivates a CANCELLED row).


**What to build:**
- On the event detail page (`SingleEvent.tsx` / `Event.tsx`), replace any placeholder with a real **Register** button.
- Button states: `Register` (default), `Registered ✓` (already registered), `Event Full`, `Past Event`, `Registration Cancelled`.
- If the event has a custom form schema (see S2-015), clicking Register opens a modal with the rendered form before submitting.
- On successful registration: toast notification + button switches to `Registered ✓`.
- "Cancel Registration" option appears after registration (visible as a secondary button or in a dropdown). Show confirmation modal with the 24h warning if applicable.
- **"My Registrations" section in Dashboard:** List of upcoming events the user has registered for (from `GET /api/registrations/mine`). Each card shows event title, date, status badge. Link to event detail.

**Acceptance criteria:**
- Register button reflects actual registration state fetched from API.
- Registering for a full event shows an appropriate error toast.
- My Registrations section appears in Dashboard with real data.
- If event has a form, the modal form appears before registration is confirmed.

---

### Module 5 — Form Builder

---

#### S2-011 · Custom Form Builder — Backend
**Type:** Backend  
**Depends on:** S2-005 (event model with `formSchemaId`)  
**Checkpoint:** 3 (Plus Feature) — descopable  
**Status:** ⏳ Pending  

**What to build:**

New `FormSchema` collection + Mongoose schema in `server/src/models/form-schema.model.js`:
```js
export const FIELD_TYPES = ["short_text", "long_text", "dropdown", "checkbox", "radio", "number", "email"];

const formFieldSchema = new mongoose.Schema({
    id:          { type: String, required: true },  // uuid
    type:        { type: String, enum: FIELD_TYPES, required: true },
    label:       { type: String, required: true },
    placeholder: String,
    required:    { type: Boolean, default: false },
    options:     [String],
    validation:  {
        min: Number,
        max: Number,
        pattern: String,
    },
}, { _id: false });

const formSchemaSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    fields:  { type: [formFieldSchema], default: [] },
}, { timestamps: true });

formSchemaSchema.index({ eventId: 1 }, { unique: true });

export const FormSchemaModel = mongoose.model("FormSchema", formSchemaSchema);
export const FORM_SCHEMA_COLLECTION = "FormSchema";
```

Endpoints:
- `POST /api/events/:id/form` (auth + tierCheck: PRO+ only) — Create or replace via `FormSchemaModel.findOneAndUpdate({ eventId }, doc, { upsert: true, new: true })`. After upsert, update `EventModel.findByIdAndUpdate(eventId, { $set: { formSchemaId: result._id } })`. Only organizer or admin.
- `GET /api/events/:id/form` — Return form schema via `FormSchemaModel.findOne({ eventId }).lean()`. Visibility follows the parent event's visibility rules.
- `DELETE /api/events/:id/form` (auth) — `FormSchemaModel.deleteOne({ eventId })` and `EventModel.findByIdAndUpdate(eventId, { $unset: { formSchemaId: "" } })`. Only organizer or admin.

Form submission validation (used in S2-009's register endpoint):
- Extract shared form validation logic into `form.service.ts`.
- `validateFormData(schema: FormSchemaDoc, data: Record<string, unknown>): { valid: boolean; errors: Record<string, string> }`
- Validates required fields, type coercion, and pattern/range validation.

**Acceptance criteria:**
- Attempting to create a form as a FREE tier user returns `403 TIER_REQUIRED`.
- `validateFormData` rejects a submission missing a required field.
- Deleting the form removes the `formSchemaId` reference from the event.

---

#### S2-012 · Custom Form Builder — Frontend
**Type:** Frontend  
**Depends on:** S2-011  
**Checkpoint:** 3 (Plus Feature) — descopable  
**Status:** ⏳ Pending  

**What to build:**
- Form builder UI accessible from the Event editing page (a new "Registration Form" tab, shown only to the organizer).
- Show "Upgrade to PRO" prompt if user is on FREE tier.
- Field palette on the left (Short Text, Long Text, Dropdown, Checkbox, Radio, Number, Email).
- Drag fields from palette to the builder canvas (use `@dnd-kit/core` for drag-and-drop — add as a dependency).
- Each field in the canvas can be: edited (label, placeholder, required toggle, options for dropdown/radio/checkbox), reordered (drag handle), deleted.
- "Preview" toggle: switch canvas from edit mode to a rendered preview of what registrants will see.
- "Save Form" button: `POST /api/events/:id/form`. Show success toast.
- "Remove Form" button: `DELETE /api/events/:id/form`. Confirm modal.

**Acceptance criteria:**
- Organizer can build a form with at least 3 field types.
- Saving persists the schema to the backend.
- PRO tier guard is enforced — FREE user sees a locked state, not an error.
- Preview mode renders the form fields in read-only view.

---

### Module 6 — Team Participation

---

#### S2-013 · Team Participation — Backend
**Type:** Backend  
**Depends on:** S2-009 (Registration model)  
**Checkpoint:** 3 (Plus Feature) — descopable  
**Status:** ⏳ Pending  

**What to build:**

Declare the following constant array in `server/src/models/team.model.js`:

```js
export const TEAM_MEMBER_STATUSES = ["INVITED", "ACCEPTED", "DECLINED"];
```

New `Team` collection + Mongoose schema with an embedded members array in `server/src/models/team.model.js`:
```js
const teamMemberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: TEAM_MEMBER_STATUSES, default: "INVITED" },
}, { _id: false });

const teamSchema = new mongoose.Schema({
    eventId:  { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name:     { type: String, required: true },
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members:  { type: [teamMemberSchema], default: [] },
}, { timestamps: true });

teamSchema.index({ eventId: 1 });
teamSchema.index({ eventId: 1, "members.userId": 1 });

export const TeamModel = mongoose.model("Team", teamSchema);
export const TEAM_COLLECTION = "Team";
```

Endpoints:
- `POST /api/events/:id/teams` (auth + consentCheck + tierCheck: PRO+) — Create a team. Validates: event `isTeamEvent === true`, `event.status === "APPROVED"`, user not already in a team for this event (`TeamModel.findOne({ eventId, "members.userId": userId })`), total teams × `event.maxTeamSize` does not exceed capacity. Leader is auto-added as `"ACCEPTED"`. Create a Registration doc for the leader with the new `teamId`.
- `POST /api/events/:id/teams/:teamId/invite` (auth) — Invite a user by email. Only team leader. Validates: team not full (accepted member count < `event.maxTeamSize`), invitee not already in a team for this event. Push a member entry with status `"INVITED"` via `TeamModel.findByIdAndUpdate(teamId, { $push: { members: { userId, status: "INVITED" } } })`. Trigger notification.
- `PATCH /api/events/:id/teams/:teamId/respond` (auth) — Accept or decline invite. Body: `{ action: "accept" | "decline" }`. On accept: re-validate team still has room, update the matching member subdoc via `$set: { "members.$[m].status": "ACCEPTED" }` with an arrayFilter on `m.userId`, and insert a Registration doc. On decline: set status `"DECLINED"` the same way.
- `GET /api/events/:id/teams` (auth) — Organizer/admin gets all teams with member details (`TeamModel.aggregate([..., { $lookup: { from: "User", ... } }])`). Regular user gets only their own team.
- `DELETE /api/events/:id/teams/:teamId/members/:userId` (auth) — Remove a member via `TeamModel.findByIdAndUpdate(teamId, { $pull: { members: { userId } } })` (leader only, or self-removal). Cannot remove leader; leader must disband instead.
- `DELETE /api/events/:id/teams/:teamId` (auth) — Disband (leader only). `TeamModel.findByIdAndDelete(teamId)` + `RegistrationModel.updateMany({ teamId }, { $set: { status: "CANCELLED" } })`.

**Acceptance criteria:**
- FREE tier user cannot create a team (403).
- Inviting a user who is already in a team for the event returns 409.
- A team cannot exceed `event.maxTeamSize` accepted members.
- Disbanding a team cancels all associated Registration docs.

---

#### S2-014 · Team Participation — Frontend
**Type:** Frontend  
**Depends on:** S2-013  
**Checkpoint:** 3 (Plus Feature) — descopable  
**Status:** ⏳ Pending  

**What to build:**
- On the event detail page, if `event.isTeamEvent === true`, replace the individual Register button with a **Team Registration** section:
  - If user has no team: show "Create Team" button (opens a modal: team name input) and "Join via Invite" notice (invites come through notifications).
  - If user is team leader: show team management card — team name, member list with status badges, "Invite Member" button (opens modal: email input), "Disband Team" option.
  - If user is a team member: show team card (name, members). Option to leave team.
- **Notification integration:** When a user receives a team invite notification, the notification has "Accept" and "Decline" action buttons that call the respond endpoint directly.
- Team size indicator on the event detail page (e.g., "Teams: 4/20 slots filled").

**Acceptance criteria:**
- Team leader can create a team, invite members, and see their status.
- Invited user can accept/decline from the notification.
- Accepting an invite when the team is now full shows an error (race condition handled).
- Event detail shows correct team slot availability.

---

### Module 7 — File Uploads

---

#### S2-015 · File Upload — Backend (Avatar + Event Images)
**Type:** Backend  
**Depends on:** Nothing (Multer already configured)  
**Checkpoint:** 1 (avatar — Bare Minimum) / 3 (event-image gallery — Plus Feature)  
**Status:** ✅ Done  *(both avatar and event-image gallery)*


**What to build:**
- `POST /api/user/avatar` (auth) — Upload profile avatar. Accept: `image/jpeg`, `image/png`, `image/webp`. Max size: 2MB. Store in `server/public/avatars/`. Return the public URL. Update `User.avatar` in DB.
- `POST /api/events/:id/images` (auth + tierCheck for gallery: PRO+ for multiple images, FREE gets 1) — Upload event banner/gallery images. Accept: `image/jpeg`, `image/png`, `image/webp`. Max size: 5MB each. Max count: 1 for FREE, 5 for PRO, 10 for ULTIMATE. Store in `server/public/events/:eventId/`. Append URL to `Event.imgUrls`. Return updated list.
- `DELETE /api/events/:id/images` (auth) — Body: `{ url: string }`. Removes URL from `Event.imgUrls` and deletes the file. Only organizer or admin.
- Ensure Multer is configured with correct `limits.fileSize` and a `fileFilter` that rejects non-image MIME types with a proper error (not a crash).

**Acceptance criteria:**
- Uploading a non-image file returns `400 INVALID_FILE_TYPE`.
- Uploading a file over the size limit returns `400 FILE_TOO_LARGE`.
- FREE tier user uploading a second event image returns `403 TIER_LIMIT_EXCEEDED`.
- Avatar upload updates the user record in DB and returns the new URL.

---

#### S2-016 · File Upload — Frontend (Avatar + Event Images)
**Type:** Frontend  
**Depends on:** S2-015  
**Checkpoint:** 1 (avatar — Bare Minimum) / 3 (event-image gallery — Plus Feature)  
**Status:** 🟡 In Progress

**Audit (2026-05-15) — gaps remaining:**
- Event banner upload in EventCreationForm is **done** (tier-aware, client-side type/size validation, previews).
- Profile avatar is currently a **preset-image picker**, not a real file upload — `BasicProfileInfo.tsx` does not call `POST /api/user/avatar`. Wire the existing backend endpoint and add file-picker + client-side validation.


**What to build:**
- **Profile avatar upload:** In `BasicProfileInfo.tsx`, clicking the avatar opens a file picker. Validate type (JPEG/PNG/WebP) and size (<2MB) client-side. Show a preview before uploading. On confirm, call `POST /api/user/avatar`. Update `useAuthStore` with the new avatar URL. Show progress indicator.
- **Event image upload in EventCreationForm:** In Step 1 (or Step 4), add a drag-and-drop upload zone for event banner. Show thumbnail preview. Indicate tier limit (e.g., "1 image on FREE, up to 5 on PRO"). Upload immediately on file selection (`POST /api/events/:id/images` — requires event to be created first as a draft). Note: creation flow should split into create-draft then upload-images then publish.
- Show client-side errors for type/size violations before hitting the API.

**Acceptance criteria:**
- Invalid file types are caught and rejected client-side with a clear message before any API call is made.
- Avatar preview is shown before upload is confirmed.
- Successful avatar upload immediately reflects the new image in the Navbar and profile.

---

### Module 8 — Notifications

---

#### S2-017 · Notification System — Backend
**Type:** Backend  
**Depends on:** S2-003 (approve/reject), S2-009 (registration)  
**Checkpoint:** 1 (Bare Minimum) — PDF Module 4.4 Notifications & Reminders  
**Status:** 🟡 In Progress

**Audit (2026-05-15) — gaps remaining:**
- `NotificationModel`, `createNotification`, `notifyAdminsEventSubmitted`, list / mark-read / mark-all / delete endpoints — **done**.
- **Not wired** anywhere in the request path: `admin.service::approveEvent` / `rejectEvent` do not call `createNotification`, `registration.service::registerForEvent` uses a local console.log stub, and `event.service::publishEvent` does not call `notifyAdminsEventSubmitted`. The collection stays empty in practice.
- `EVENT_REMINDER` cron job not implemented (backlog item).


**What to build:**

Declare the following constant array in `server/src/models/notification.model.js`:

```js
export const NOTIFICATION_TYPES = [
    "EVENT_APPROVED",
    "EVENT_REJECTED",
    "TEAM_INVITE",
    "REGISTRATION_CONFIRMED",
    "EVENT_REMINDER",
];
```

New `Notification` collection + Mongoose schema in `server/src/models/notification.model.js`:
```js
const notificationSchema = new mongoose.Schema({
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:    { type: String, enum: NOTIFICATION_TYPES, required: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    data:    { type: mongoose.Schema.Types.Mixed, default: null },
    read:    { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export const NotificationModel = mongoose.model("Notification", notificationSchema);
export const NOTIFICATION_COLLECTION = "Notification";
```

`notification.service.ts` with a `createNotification(userId, type, title, message, data?)` function. Call this from:
- `admin.controller.ts` approve → `EVENT_APPROVED` to organizer.
- `admin.controller.ts` reject → `EVENT_REJECTED` to organizer (include `reason` in data).
- `team.controller.ts` invite → `TEAM_INVITE` to invited user (include `teamId`, `eventId`).
- `registration.controller.ts` register → `REGISTRATION_CONFIRMED` to registrant.
- (Future) Scheduled job for `EVENT_REMINDER` 24h before event.

Endpoints:
- `GET /api/notifications?page=&limit=20` (auth) — User's notifications, newest first. Returns `{ notifications, unreadCount }`.
- `PATCH /api/notifications/:id/read` (auth) — Mark one as read.
- `POST /api/notifications/read-all` (auth) — Mark all as read.

**Acceptance criteria:**
- Admin approving an event creates a notification for the organizer.
- Team invite creates a notification for the invited user.
- `GET /api/notifications` only returns notifications for the requesting user (cannot see others').
- `unreadCount` is accurate.

---

#### S2-018 · Notification System — Frontend
**Type:** Frontend  
**Depends on:** S2-017  
**Checkpoint:** 1 (Bare Minimum) — PDF Module 4.4 Notifications & Reminders  
**Status:** 🟡 In Progress

**Audit (2026-05-15) — gaps remaining:**
- `NotificationPage.tsx` still renders **hardcoded mock data** — not wired to `GET /api/notifications`.
- Navbar has a bell icon but no unread-count badge (no call to the unread count endpoint).
- No "Mark all as read" button surfaced in the page UI.
- No type-specific icons or Team Invite Accept/Decline action buttons.


**What to build:**
- Wire `NotificationPage.tsx` to `GET /api/notifications`. Render notifications in a list with type icons:
  - `EVENT_APPROVED` → green checkmark icon.
  - `EVENT_REJECTED` → red X icon; show rejection reason inline.
  - `TEAM_INVITE` → people icon; show "Accept" and "Decline" buttons that call `PATCH /api/events/:id/teams/:teamId/respond`.
  - `REGISTRATION_CONFIRMED` → calendar icon.
- Unread notifications have a highlighted background. Clicking marks them read (`PATCH /api/notifications/:id/read`).
- **Navbar bell icon** (`Navbar.tsx`): show a red badge with unread count. Fetch count on mount and after route changes via `GET /api/notifications?limit=1` (the `unreadCount` field). Poll every 60 seconds or use a manual refresh button.
- "Mark all as read" button at the top of the notification page.

**Acceptance criteria:**
- Unread count badge in Navbar updates after new notifications arrive.
- Team invite notifications show Accept/Decline actions and work correctly.
- Rejected event notifications show the admin's reason.
- Clicking "Mark all as read" sets all to read and removes the badge.

---

### Module 9 — Security & Auth Hardening

---

#### S2-019 · Backend Security Hardening
**Type:** Backend  
**Depends on:** Nothing (can start immediately, apply as other tasks land)  
**Checkpoint:** 2 (Hardening) — cross-cutting, run alongside CP1  
**Status:** 🟡 In Progress

**Audit (2026-05-15) — gaps remaining:**
- **Ownership checks** are in place for PATCH/DELETE on events and images (organizerId vs req.user.userId, admin bypass).
- **Zod input validation** not started — no `zod` dependency, no `validate.middleware.js`.
- **Rate limiting** not started — no `express-rate-limit`.
- **Env validation** on startup not implemented.
- **File upload MIME check** is `mimetype` only — no magic-byte verification.
- **`eventVisibilityFilter` utility** not extracted — current filters are inline.


**What to build:**
- **Input validation:** Install `zod`. Create a `validate(schema)` middleware factory in `server/src/middleware/validate.middleware.js`. Apply Zod schemas to request bodies for: register, login, event create/update, form schema create, team create, invite. Return `400` with a structured error list on validation failure. Note: Mongoose `enum` validation provides a schema-level safety net, but Zod handles full request-body validation at the controller layer.
- **Rate limiting:** Install `express-rate-limit`. Apply limiters:
  - Auth routes (`/api/auth/*`): 10 requests / 15 min per IP.
  - Event create + publish: 20 requests / hour per user.
  - Registration: 30 requests / hour per user.
  - Admin routes: 100 requests / 15 min per IP.
- **Environment validation:** On app startup, check that `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and `DATABASE_URL` are set and not equal to `"abc"` or `"def"` (dev defaults). Throw a startup error if in `NODE_ENV=production` with default secrets.
- **Ownership checks:** Audit all `PATCH` and `DELETE` event/form/team endpoints to verify `event.organizerId.toString() === req.user.userId` before allowing the operation. Admin bypasses this check.
- **Query visibility guard:** Add a shared `eventVisibilityFilter(userId, role)` utility that returns a plain Mongoose filter object ensuring unapproved events are never leaked. Every `EventModel.find(...)` call must spread this filter into the query.
- **File upload security:** Verify MIME type by reading file buffer magic bytes (not just `Content-Type` header) in Multer's `fileFilter`.

**Acceptance criteria:**
- Sending an empty `title` to `POST /api/events` returns `400` with a field-level error message.
- Sending more than 10 auth requests in a minute from the same IP returns `429`.
- User A cannot edit User B's event (returns `403`).
- App refuses to start in production with default JWT secrets.

---

#### S2-020 · Frontend Auth Guards & Route Protection
**Type:** Frontend  
**Depends on:** Nothing  
**Checkpoint:** 2 (Hardening) — cross-cutting, run alongside CP1  
**Status:** 🟡 In Progress

**Audit (2026-05-15) — gaps remaining:**
- **Inline auth checks** on `/dashboard` and `/admin` redirect non-auth / non-admin users — works, but not reusable.
- **`ProtectedRoute`, `AdminRoute`, `TierGate` components** are NOT extracted. Inline checks duplicated across pages.
- **Routes still unguarded:** `/notifications`, `/support`.
- **No intended-path redirect** after login (always lands on `/dashboard`).
- **Token-refresh 401 flow** is wired in `lib/api.ts` and verified end-to-end (Hydrate serialization, Event/Dashboard wait-for-token).


**What to build:**
- **`ProtectedRoute` component:** Wraps routes that require authentication. If `!isAuthenticated`, redirect to `/login` and store the intended path in location state so the user is redirected back after login.
- **`AdminRoute` component:** Wraps `/admin`. If authenticated but `user.role !== 'ADMIN'`, redirect to `/dashboard` with a toast "Access denied."
- **`TierGate` component:** Props: `requiredTier: 'PRO' | 'ULTIMATE'`, `children`. If user's tier is insufficient, renders a locked overlay with "Upgrade to [tier]" button instead of `children`. Use this throughout the UI for gated features.
- Apply `ProtectedRoute` to: `/dashboard`, `/admin`, `/notifications`, `/support`.
- Handle token expiry: the existing 401 refresh flow in `lib/api.ts` clears auth and redirects to `/login` on refresh failure — verify this works correctly end-to-end and does not leave the user on a broken page.
- After a successful login, redirect to the stored intended path (if any), else `/dashboard`.

**Acceptance criteria:**
- Navigating to `/dashboard` without being logged in redirects to `/login`.
- After logging in, the user is taken to `/dashboard` (or the previously intended route).
- `TierGate` around a PRO feature shows an upgrade prompt for FREE users.
- Admin navigating to `/dashboard` works normally; non-admin navigating to `/admin` gets redirected.

---

### Module 10 — User Profile & Subscription UI

---

#### S2-021 · User Profile — Backend Integration & Subscription Tier
**Type:** Frontend  
**Depends on:** S2-015 (avatar upload)  
**Checkpoint:** 1 (Bare Minimum) — PDF Module 4.2 Manage user profiles  
**Status:** ✅ Done  *(avatar-as-file-upload tracked under S2-016)*


**What to build:**
- Wire all profile tabs to the real API:
  - `BasicProfileInfo.tsx` → reads from `useAuthStore`, submits `PATCH /api/user/profile` on save. Include avatar upload (from S2-016).
  - `Address.tsx` → same — update address fields.
  - `OrganizationalInfo.tsx` → update org info.
- After any profile update, call `useAuthStore.updateUser()` with the response data so Navbar/avatar updates immediately.
- **Subscription / Tier display:** In the Payment Info tabs, show the user's current tier prominently (badge + description of what's included). The "Upgrade" buttons on `SubscriptionPlans.tsx` should currently show a "Coming Soon" / "Contact Us" state (no payment integration required yet — just a disabled button with a tooltip explaining payment integration is in progress).
- `TransactionHistory.tsx` — show an empty state message ("No transactions yet") since payment is not integrated.

**Acceptance criteria:**
- Updating the user's name reflects in the Navbar without a page reload.
- Uploading a new avatar from the profile page updates the avatar globally.
- Subscription plan UI shows the user's current tier correctly.
- No dummy/hardcoded data remains visible on the profile page.

---

### Module 11 — Feedback & Ratings

> **PDF reference:** Module 4.5 Feedback and Ratings — collect user feedback and ratings for events, display average ratings. This module was missing from earlier revisions of this plan and is added to satisfy the LLD.

---

#### S2-022 · Feedback & Ratings — Backend
**Type:** Backend  
**Depends on:** S2-005 (Event), S2-009 (Registration)  
**Checkpoint:** 1 (Bare Minimum) — PDF Module 4.5 Feedback and Ratings  
**Status:** ⏳ Pending  

**What to build:**

Declare `server/src/models/feedback.model.js`:

```js
const feedbackSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null },
}, { timestamps: true });

feedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });
feedbackSchema.index({ eventId: 1 });

export const FeedbackModel = mongoose.model("Feedback", feedbackSchema);
export const FEEDBACK_COLLECTION = "Feedback";
```

Export `FeedbackModel` from `server/src/models/index.js` alongside the other models.

Endpoints:
- `POST /api/events/:id/feedback` (auth + consentCheck) — Submit feedback. Validate: event status is `"APPROVED"`, event date is in the past (`event.date < now()`), requester has a `Registration` doc with `status: "CONFIRMED"` for this event, no prior feedback exists for this (eventId, userId) pair. Body: `{ rating: number (1..5), comment?: string }`. On duplicate key error (Mongoose `code: 11000`), return `409`.
- `GET /api/events/:id/feedback` — Public. Returns `{ items: [...], avgRating: number, totalRatings: number }`. Use `FeedbackModel.aggregate(...)`: `$match { eventId }`, then `$lookup` on User for the reviewer's display name, then `$facet` to compute `avgRating` and the paginated list in one round-trip.
- `GET /api/feedback/mine` (auth) — Current user's submitted feedback across all events. Joins to Event for event title.
- `PATCH /api/events/:id/feedback` (auth) — Edit own feedback within 7 days of submission. Body: `{ rating?, comment? }`.
- `DELETE /api/events/:id/feedback` (auth) — Delete own feedback within 7 days. Admin can delete any feedback.

Update event listing/detail responses (`event.service.js::getAllEvents`, `getEventById`, the `fromDoc` mapper) to include `avgRating` and `totalRatings` per event — pull these via a `$lookup` on the Feedback collection in the aggregation pipeline.

**Acceptance criteria:**
- User who didn't register (or whose registration is `CANCELLED`) cannot submit feedback (returns `403`).
- User cannot submit feedback before the event end date (returns `403 EVENT_NOT_ENDED`).
- User cannot submit two feedbacks for the same event (returns `409 DUPLICATE_FEEDBACK`).
- `GET /api/events/:id/feedback` returns accurate average rating and totalRatings count.
- Public event listing (`GET /api/events`) includes `avgRating` and `totalRatings` per event card.
- Admin can delete any feedback; non-admin cannot delete other users' feedback.

---

#### S2-023 · Feedback & Ratings — Frontend
**Type:** Frontend  
**Depends on:** S2-022  
**Checkpoint:** 1 (Bare Minimum) — PDF Module 4.5 Feedback and Ratings  
**Status:** ⏳ Pending  

**What to build:**
- On the event detail page (`SingleEvent.tsx` / `Event.tsx`), add a **Feedback section** below the event description:
  - **Header:** average rating display, e.g. `⭐ 4.3 / 5 (12 reviews)`. Hidden if `totalRatings === 0` (show "Be the first to leave feedback").
  - **Submit form** (visible only when event has ended AND user has a confirmed registration AND has not already submitted): 5-star rating widget (radio-style, hover highlight) + optional comment textarea + Submit button. Wire to `POST /api/events/:id/feedback`. On success, replace form with the user's submitted feedback view.
  - **My feedback view** (visible if the user has already submitted): show their rating, comment, submitted date, and an "Edit" button that re-opens the form prefilled (calls `PATCH`) and a "Delete" button (calls `DELETE`) — both only enabled within 7 days of submission.
  - **Feedback list:** scrollable list of all feedback fetched from `GET /api/events/:id/feedback` with reviewer display name, star count, comment, submitted date. Paginate or "Load more" if > 10.
- On event cards in `Global_Event.tsx` listings, show a small rating indicator next to event metadata: `⭐ 4.3 (12)`. Render only if `totalRatings > 0`.
- **Profile dashboard:** Add a new "My Reviews" tab listing feedback the user has submitted (via `GET /api/feedback/mine`), each row linking to the event detail page.

**Acceptance criteria:**
- Star widget allows 1–5 selection; submit button is disabled until a rating is chosen.
- Submitting feedback updates the average rating display immediately (optimistic update or refetch).
- After submission, the form is replaced by the user's submitted feedback view.
- "Edit" and "Delete" buttons are hidden once 7 days have passed since submission.
- User cannot see a submit form for an event they didn't attend (form hidden, replaced with "Only registered attendees can leave feedback").
- Average rating on event listing cards reflects backend `avgRating` accurately.

---

### Module 12 — Event Stats

---

#### S2-024 · Event Stats Collection — Backend + Frontend
**Type:** Full-stack
**Depends on:** S2-005 (Event), S2-009 (Registration)
**Checkpoint:** 1 (Bare Minimum) — supports organizer attendee tracking
**Status:** ✅ Done (2026-05-15)

**What was built:**
- New `EventStatModel` (`server/src/models/eventStat.model.js`):
  ```js
  { eventId: ObjectId (unique ref Event), attendees: [ObjectId ref User], avgFeedback?: Number }
  ```
- One-to-one with `Event` via the unique `eventId` index.
- `registerForEvent` upserts the doc and `$addToSet`s the registrant's `userId`.
- `cancelRegistration` `$pull`s the registrant's `userId` — cancelled attendees never count toward stats *or* capacity (capacity already filters on `status: "CONFIRMED"`).
- New endpoint `GET /api/events/:id/stats` (auth + organizer/admin guard) — returns the EventStat doc or `null`.
- `event.service.getEventById` attaches `userRegistration` (current viewer's CONFIRMED reg) to the response.
- Frontend (`SingleEvent.tsx`):
  - Fetches `/events/:id/stats` when organizer/admin is viewing; renders attendee count in the Organizer Panel.
  - Registered users see a disabled **✓ Already Registered** CTA plus a **Cancel Registration** button.
  - Organizer's **Cancel Event** button is hidden once anyone has registered (`!eventStat`).

**Acceptance criteria (met):**
- Registering creates/updates the EventStat doc with the userId in `attendees`.
- Cancelling removes the userId; the slot is freed for someone else.
- Non-organizer/non-admin GET to `/events/:id/stats` returns `403`.
- Re-registering after cancelling works (reactivates the existing row instead of hitting the unique-index constraint).

---

## Backlog (Post-Sprint 2)

These are real requirements but descoped to keep Sprint 2 shippable. They should be planned in Sprint 3.

- **Payment Integration** — Stripe or Razorpay integration for PRO/ULTIMATE subscription purchase. Webhook to update User.tier on payment success.
- **Analytics Dashboard** (ULTIMATE tier) — Event views, registration trends, conversion rate.
- **QR Code Check-in** — Generate unique QR per registration; organizer scans at venue.
- **Email Notifications** — Nodemailer integration for critical notifications (event approval, invite, reminder).
- **Event Reminder Cron** — Scheduled job (24h before event) to send reminders to registrants.
- **Social Sharing** — Open Graph meta tags for events, share buttons.
- **Recurring Events** — `rrule`-based recurrence patterns for weekly/monthly events.
- **Waitlist** — When event is full, allow users to join a waitlist and auto-promote when a slot opens.

---

## Priority Order for Sprint 2

Pick up tasks in this order to minimize blocking dependencies. Waves map directly onto the Checkpoint Status dashboard at the top of this file — finish all of CP1 (Bare Minimum) before touching CP3 (Plus Features).

| Wave | Checkpoint | Tasks | Why |
|------|------------|-------|-----|
| 1 | CP1 + CP2 backend | S2-003, S2-005, S2-006, S2-009, S2-015 *(avatar)*, S2-017, S2-019, S2-022 | Bare-minimum backend foundation; admin needed for the publish state machine; feedback model is part of bare-minimum |
| 2 | CP1 + CP2 frontend | S2-004, S2-007, S2-010, S2-016 *(avatar)*, S2-018, S2-020, S2-023 | Bare-minimum frontend wiring including admin dashboard for approvals and feedback UI |
| 3 | CP1 polish | S2-008, S2-021 | My-events dashboard + profile integration |
| 4 | CP3 (only if time) | S2-011, S2-012, S2-013, S2-014, S2-015 *(gallery)*, S2-016 *(gallery)* | Plus-features in descopable order — descope first if the bare minimum is at risk |

**Quick-start for each dev (Day 1 pick-up, no dependencies — all CP1 tasks):**
- Dev 1 → S2-003 (Admin backend) — unblocks event publish/approval flow
- Dev 2 → S2-005 (Event CRUD backend) — core entity for everything else
- Dev 3 → S2-019 (Security hardening backend) — cross-cutting, applies as other tasks land
- Dev 4 → S2-020 (Frontend auth guards) — unblocks all frontend wiring
- Dev 5 → S2-022 (Feedback backend) once S2-005 lands — fills the PDF gap

> **Note:** S2-001 / S2-002 (Consent) are already complete and intentionally not in the Day-1 list.

---

## Open Questions / Assumptions Made

These decisions were made to keep planning unblocked. Confirm or override as needed:

1. **Every event needs admin review on every publish.** All publishes transition through `PENDING` before reaching `APPROVED`.
2. **Team counts as one registration slot** — Assumed the team occupies 1 slot by default. The `teamCapacityMode` field supports switching to "per_member" if needed.
3. **No payment integration in Sprint 2** — Tier is currently a field on the User document. Upgrading requires direct DB edit or an admin action until Stripe is integrated (Sprint 3).
4. **Unlisted events are accessible by direct link without login** — If you want unlisted events to require login, the `GET /api/events/:id` guard in S2-006 needs a small change.
5. **Cancellation window is 24h** — Hardcoded as a constant. Can be made configurable per event by the organizer (future feature).
