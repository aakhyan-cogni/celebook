# EMS Backend — Developer Onboarding Guide

> **Audience:** developers joining the EMS team who need to understand how the backend works today.
> **Scope:** what exists right now in `server/` — not what's planned. For the planned work, see [plan.md](plan.md).
> **TL;DR:** Express 5 + MongoDB (Mongoose ORM) + JWT (access in header, refresh in httpOnly cookie). Three layers: routes → controllers → services. Only auth, consent, user profile, and a mock event listing are wired up so far.

---

## 1. Stack and tooling

| Concern | Choice |
|---|---|
| Runtime | Node.js (ESM) |
| HTTP framework | Express 5 |
| Language | JavaScript (ESM) |
| Database | MongoDB via Mongoose ORM |
| Auth | JWT (`jsonwebtoken`) — access token in `Authorization: Bearer …`, refresh token in an httpOnly cookie |
| Password hashing | `bcryptjs` |
| Cookies | `cookie-parser` |
| File uploads | `multer` (declared as a dependency; not wired up yet) |
| Dev loop | `nodemon src/index.js` re-starts the server on every save |
| CORS | locked to `http://localhost:5173` (Vite dev server) with credentials |

The MongoDB instance is expected to run as a **single-node replica set** on port `27018`, started locally via `npm run db:up` (see `server/package.json`).

---

## 2. Running it locally

```bash
cd server
npm install

# In one terminal — start a local MongoDB replica set on port 27018
npm run db:up

# In another terminal — start the API with hot reload
npm run dev
```

The API listens on `http://localhost:5000`. Static files in `server/public/` are served from `/`.

### Environment variables

`server/.env` is committed today with development defaults (these must be replaced before any non-dev deployment):

```env
DATABASE_URL="mongodb://localhost:27018/ems?directConnection=true"
ACCESS_TOKEN_SECRET=abc
REFRESH_TOKEN_SECRET=def
ACCESS_TOKEN_EXPIRY=900            # seconds (15 min)
REFRESH_TOKEN_EXPIRY=604800        # seconds (7 days)
```

> **Gotcha:** `lib/jwt.js` reads env vars at module load time. If `ACCESS_TOKEN_SECRET` is missing the server will crash when `jwt.sign` is called — there is no startup guard yet. (Hardening this is task S2-019.)

---

## 3. Directory layout

```
server/
├── .env                         ← dev secrets (DATABASE_URL, JWT secrets, expiries)
├── package.json
└── src/
    ├── index.js                 ← entry point: connectDB() then app.listen(PORT)
    ├── app.js                   ← Express app: middleware, routes, error handler
    ├── seed.js                  ← admin user seeding script (npm run db:seed)
    ├── config/
    │   └── constants.js         ← PORT, DEFAULT_TERMS_VERSION
    ├── routes/                  ← Router definitions (one file per domain)
    │   ├── index.js             ← barrel re-export
    │   ├── auth.routes.js
    │   ├── consent.routes.js
    │   ├── event.routes.js
    │   ├── user.routes.js
    │   └── admin.routes.js
    ├── controllers/             ← HTTP handlers — parse req, call services, build res
    │   ├── auth.controller.js
    │   ├── consent.controller.js
    │   ├── event.controller.js
    │   ├── user.controller.js
    │   └── admin.controller.js
    ├── services/                ← business logic and DB access
    │   ├── auth.service.js
    │   ├── consent.service.js
    │   ├── event.service.js     ← currently returns mock data only
    │   ├── user.service.js
    │   └── admin.service.js
    ├── middleware/
    │   ├── auth.middleware.js   ← authenticate, authorize
    │   └── consent.middleware.js ← consentCheck
    ├── models/                  ← Mongoose schemas + model exports + utility
    │   ├── index.js
    │   ├── user.model.js        ← UserModel, USER_COLLECTION
    │   ├── event.model.js       ← EventModel, EVENT_COLLECTION
    │   ├── terms-config.model.js ← TermsConfigModel, TERMS_CONFIG_COLLECTION
    │   └── util.js              ← fromDoc helper (ObjectId → string id)
    └── lib/                     ← cross-cutting infrastructure
        ├── index.js
        ├── jwt.js               ← token signing/verifying
        ├── mongoose.js          ← Mongoose connection (connectDB)
        └── util.js              ← excludeFields helper
```

### What goes where (the rule of thumb)

- **Route file:** wire a URL + HTTP verb + middleware chain to a controller function. No logic.
- **Controller:** parse `req`, call services, shape the response, set status codes. No DB calls.
- **Service:** business logic + Mongoose model calls. Returns plain objects (with string `id`, not `ObjectId`).
- **Model:** Mongoose schema + model export plus the collection name constant.
- **Middleware:** anything that decorates `req` (e.g. `authenticate` setting `req.user`) or short-circuits with a status.
- **Lib:** infrastructure utilities used across layers (Mongoose connection, JWT helpers).

Adding a new feature usually means: one model file + one service file + one controller file + one routes file, plus a registration in `routes/index.js` and `app.js`.

---

## 4. Request lifecycle

```
HTTP request
   │
   ▼
app.js                      cookieParser → cors → express.json → express.static
   │
   ▼
routes/<domain>.routes.js   match URL + verb, run middleware chain
   │
   ▼
middleware/                 e.g. authenticate (verify access token, set req.user)
   │                              consentCheck (block if user.consentVersion stale)
   ▼
controllers/<domain>.controller.js
                            parse req.body / req.params / req.user
   │                        call into services
   │                        build JSON response with status code
   ▼
services/<domain>.service.js
                            business rules + Mongoose model calls
   │
   ▼
lib/mongoose.js             Mongoose connection → model queries
   │
   ▼
MongoDB (port 27018)
```

The global error handler in `app.js` catches anything that bubbles up and returns `500 Internal server error`. It is intentionally minimal — most controllers wrap their own `try/catch` and return tailored error messages.

---

## 5. The Mongoose layer

The connection is established once at startup via [`server/src/lib/mongoose.js`](server/src/lib/mongoose.js):

```js
import mongoose from 'mongoose';

export async function connectDB() {
    const uri = process.env.DATABASE_URL;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB via Mongoose');
}
```

`index.js` calls `connectDB()` before `app.listen()`.

Mongoose **models** are the entry point for all DB queries — import the model directly in the service that needs it:

```js
import { UserModel } from '../models/user.model.js';
const user = await UserModel.findById(id).lean();
```

Key points:

1. **One Mongoose connection per process.** `connectDB` is called once in `index.js`; Mongoose manages the connection pool internally.
2. **Schema-level defaults.** Each Mongoose schema declares `default:` values, so you no longer need to manually set defaults like `role: "USER"` on every insert — the schema handles it.
3. **Use `.lean()` for read queries.** `.lean()` returns plain JavaScript objects (with `_id` as ObjectId) instead of Mongoose Document instances, which is faster and works seamlessly with the `fromDoc` utility.
4. **`fromDoc` mapper** ([`server/src/models/util.js`](server/src/models/util.js)) converts `{ _id: ObjectId, __v, … }` to `{ id: string, … }` before crossing layer boundaries. Always run service results through it before sending to the controller.
5. **Mongoose auto-casts string IDs.** When a schema field is typed as `ObjectId`, Mongoose automatically casts a plain string `id` in queries — no need to manually call `new ObjectId(id)`.

### Models currently in use

| Export | Collection name | Schema file |
|---|---|---|
| `UserModel` | `User` | [`models/user.model.js`](server/src/models/user.model.js) |
| `EventModel` | `Event` | [`models/event.model.js`](server/src/models/event.model.js) (defined but **no events are written yet** — the controller still returns mock data) |
| `TermsConfigModel` | `TermsConfig` | [`models/terms-config.model.js`](server/src/models/terms-config.model.js) |

---

## 6. Authentication — the whole flow

Auth is a textbook **JWT access + refresh** setup with refresh-token rotation. Every active session has two tokens:

| Token | Lifetime | Stored where | Sent how |
|---|---|---|---|
| Access token | `ACCESS_TOKEN_EXPIRY` (15 min default) | Frontend memory only | `Authorization: Bearer <token>` header on every request |
| Refresh token | `REFRESH_TOKEN_EXPIRY` (7 days default) | httpOnly cookie + mirrored in `User.refreshToken` in DB | Cookie automatically sent by the browser |

Both tokens are signed JWTs with the same payload shape (from [`lib/jwt.js`](server/src/lib/jwt.js)):

```js
{ userId: string, email: string, role: string }
```

### 6.1 Register — `POST /api/auth/register`

File: [`controllers/auth.controller.js`](server/src/controllers/auth.controller.js)

```
client                          controller                      service / DB
──────                          ──────────                      ────────────
{ email, password,
  name, termsAccepted } ──────▶ if !termsAccepted  → 400
                                AuthService.findUserByEmail ──▶ UserModel.findOne
                                if exists           → 400
                                AuthService.hashPassword (bcrypt salt+hash)
                                AuthService.createUser ──────▶ UserModel.create(...)
                                generateTokens(user)
                                AuthService.updateRefreshToken ▶ UserModel.findByIdAndUpdate
                                res.cookie("refreshToken", …, { httpOnly, sameSite: "strict" })
                          ◀── 201 { accessToken, user }
```

Notable details:

- The frontend sends `termsAccepted: true` from the registration form's checkbox. The server stamps `consentAccepted`, `consentAcceptedAt`, and `consentVersion` immediately based on the active `TermsConfig`.
- Password is hashed with `bcryptjs` (auto-salt). The plain password never touches MongoDB.
- The refresh token is **persisted on the user record**. This enables server-side revocation (set it to `null` on logout) and rotation.

### 6.2 Login — `POST /api/auth/login`

```
client                          controller                      service / DB
──────                          ──────────                      ────────────
{ email, password } ──────────▶ AuthService.findUserByEmail ──▶ UserModel.findOne
                                if !user            → 400 "Invalid email or password"
                                AuthService.comparePassword (bcrypt.compare)
                                if invalid          → 400 (same message — avoids enumeration)
                                generateTokens(user)
                                AuthService.updateRefreshToken ▶ UserModel.findByIdAndUpdate
                                res.cookie("refreshToken", …)
                          ◀── 200 { accessToken, user (without password/refreshToken) }
```

`excludeFields` ([`lib/util.js`](server/src/lib/util.js)) strips sensitive fields before the user object is returned to the client.

### 6.3 Authenticated requests — the `authenticate` middleware

File: [`middleware/auth.middleware.js`](server/src/middleware/auth.middleware.js)

```js
authHeader = req.headers.authorization;
if (!authHeader?.startsWith("Bearer ")) → 401
token = authHeader.split(" ")[1];
decoded = verifyAccessToken(token);   // throws if invalid/expired
req.user = decoded;                    // { userId, email, role }
next();
```

Any route that wires `authenticate` into its chain gets `req.user` populated downstream. `req.user.userId` is what services use to scope queries.

### 6.4 Refresh — `POST /api/auth/refresh`

This is how the frontend keeps a session alive after the access token expires. It is called in the 401-handler of the frontend's API client.

```
client (no body, cookie auto-sent)    controller
─────────────────────────────────     ──────────
                                       refreshToken = req.cookies.refreshToken
                                       if missing               → 401
                                       decoded = verifyRefreshToken(refreshToken)
                                       AuthService.validateRefreshToken
                                          (compare cookie value against User.refreshToken in DB)
                                       if no match              → 403
                                       generateTokens(user)         ← rotate
                                       updateRefreshToken (DB)      ← rotate
                                       res.cookie(new refreshToken)
                                  ◀──  200 { accessToken }
```

**Rotation:** every refresh issues a *new* refresh token and overwrites the one in the DB. If an attacker steals an old refresh token and uses it after the legitimate user has refreshed, the DB lookup fails and we return `403`.

### 6.5 Logout — `POST /api/auth/logout`

```
client (cookie auto-sent) ──▶ controller
                              if cookie present:
                                 decoded = verifyRefreshToken (best-effort, ignore errors)
                                 AuthService.updateRefreshToken(userId, null)
                              res.clearCookie("refreshToken")
                          ◀── 200 { message: "Logged out successfully" }
```

After logout, even if someone replays the old refresh-token cookie, the DB value is `null` and the refresh endpoint will return `403`.

### 6.6 The `req.user` object

`req.user` is set by the `authenticate` middleware and has the shape:

```js
{ userId: string, email: string, role: string }
```

Inside any handler that runs after `authenticate`, `req.user.userId`, `req.user.email`, and `req.user.role` are all available.

---

## 7. Authorization

A second middleware factory `authorize(roles)` is exported from [`auth.middleware.js`](server/src/middleware/auth.middleware.js) and is used on the admin routes:

```js
const adminOnlyMiddleware = [authenticate, authorize(['ADMIN'])];
adminRouter.use(...adminOnlyMiddleware);
```

`User.role` defaults to `"USER"` in the Mongoose schema. The `"ADMIN"` role is assigned via the seed script or via `PATCH /api/admin/users/:id/role`.

---

## 8. Consent enforcement

The consent system has three moving parts:

1. **`TermsConfig` collection** — a singleton document holding the current active terms version (e.g. `"v1.0"`). Created lazily on first read via `getOrCreateTermsConfig` in [`services/consent.service.js`](server/src/services/consent.service.js). `DEFAULT_TERMS_VERSION` lives in [`config/constants.js`](server/src/config/constants.js).
2. **`User.consentVersion`** — the version the user last accepted.
3. **`consentCheck` middleware** — blocks any authenticated route it's wired to if `user.consentVersion !== TermsConfig.currentVersion`.

### Endpoints (already mounted at `/api/consent/*`)

| Method | Path | Auth | What it does |
|---|---|---|---|
| `GET` | `/api/consent/status` | Required | Returns `{ accepted, userVersion, currentVersion, needsRenewal }` |
| `POST` | `/api/consent/accept` | Required | Stamps `consentAccepted: true`, `consentAcceptedAt: now`, `consentVersion: <current>` on the user |

### How the middleware behaves

```js
async function consentCheck(req, res, next) {
    if (!req.user)                  return 401;
    const status = await getConsentStatus(req.user.userId);
    if (status.needsRenewal)
        return 403 { code: "CONSENT_REQUIRED", currentVersion, userVersion };
    next();
}
```

The frontend's API client intercepts the `403 CONSENT_REQUIRED` body specifically and pops the consent modal instead of logging the user out. After accept, the original failed request is retried.

> **Note:** `consentCheck` is implemented but **not yet wired onto any route**. As soon as event creation, registration, etc. land (S2-005, S2-009), they will mount it after `authenticate`.

### Bumping the terms version

There is no admin endpoint for this yet. To force a global re-consent, edit the `TermsConfig.currentVersion` field directly in the database.

---

## 9. The User model — annotated

[`server/src/models/user.model.js`](server/src/models/user.model.js) defines the Mongoose schema:

```js
{
    email, password, name,
    avatar,            // default "default.png"

    // Profile fields, all optional
    phoneNumber, dob, gender, country, city, state, zipcode,
    orgName, designation, companyWebsite, bio,

    refreshToken,      // current refresh token (server-side mirror of cookie)
    role,              // "USER" | "ADMIN", default "USER"
    tier,              // "FREE" | "PRO" | "ULTIMATE", default "FREE"

    consentAccepted,   // boolean, default false
    consentAcceptedAt, // Date | null
    consentVersion,    // string | null
    // createdAt, updatedAt — auto-managed by { timestamps: true }
}
```

The `fromDoc` utility converts Mongoose `.lean()` results (plain objects with `_id: ObjectId`) to `{ id: string, … }` before returning from services. Controllers further strip `password` and `refreshToken` via `excludeFields(user, ["password", "refreshToken"])` before sending to the client.

---

## 10. Current API surface

Everything wired up *today*. Anything not in this table is not yet implemented.

| Method | Path | Middleware | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account, issue tokens, accept terms |
| `POST` | `/api/auth/login` | — | Verify credentials, issue tokens |
| `POST` | `/api/auth/refresh` | — (uses cookie) | Rotate access + refresh tokens |
| `POST` | `/api/auth/logout` | — (uses cookie) | Clear server-side refresh token + cookie |
| `GET` | `/api/user/profile` | `authenticate` | Return the current user (sans password/refreshToken) |
| `PATCH` | `/api/user/profile` | `authenticate` | Update profile fields |
| `GET` | `/api/consent/status` | `authenticate` | Return consent state & whether re-consent is needed |
| `POST` | `/api/consent/accept` | `authenticate` | Record acceptance of current terms version |
| `GET` | `/api/admin/users` | `authenticate` + `authorize(["ADMIN"])` | Paginated user list |
| `PATCH` | `/api/admin/users/:id/role` | `authenticate` + `authorize(["ADMIN"])` | Change a user's role |
| `GET` | `/api/admin/events` | `authenticate` + `authorize(["ADMIN"])` | Paginated event list (all statuses) |
| `PATCH` | `/api/admin/events/:id/approve` | `authenticate` + `authorize(["ADMIN"])` | Approve an event |
| `PATCH` | `/api/admin/events/:id/reject` | `authenticate` + `authorize(["ADMIN"])` | Reject an event with a reason |
| `GET` | `/api/admin/stats` | `authenticate` + `authorize(["ADMIN"])` | Platform stats |
| `GET` | `/api/events` | — | Returns 30 hardcoded mock events from `event.service.js` |

The event endpoint is intentionally a placeholder — the real CRUD lands in S2-005 / S2-006.

---

## 11. Common patterns and gotchas

- **Always use `fromDoc`** when handing a document out of a service. The frontend never sees `ObjectId`; it sees `id: string`. Forgetting this leaks Mongo internals into the API.
- **Always use `.lean()`** on read queries (`findOne`, `find`, `findById`). Mongoose Document instances have overhead; lean plain objects work directly with `fromDoc`.
- **Mongoose auto-casts ObjectId strings.** When a schema field type is `mongoose.Schema.Types.ObjectId`, you can pass a string `id` directly in queries — no need for `new ObjectId(id)`.
- **Defaults are in the schema.** Fields like `role: "USER"` and `tier: "FREE"` are set by the Mongoose schema default, not written manually in `createUser`. Do not re-declare defaults in service inserts.
- **Import paths must include `.js` extension.** Node.js ESM requires explicit file extensions: `import { fromDoc } from '../models/util.js'` — omitting `.js` will throw `ERR_MODULE_NOT_FOUND`.
- **Cookies are httpOnly + `sameSite: "strict"`.** This means CORS preflight in dev requires `credentials: true` on both the server (`app.js`) and the frontend's fetch/axios config.
- **No request validation yet.** Bodies come in as plain objects and are used as-is. Bad input = silently corrupted documents. Adding Zod schemas is part of S2-019.
- **No rate limiting yet.** Brute-force on `/api/auth/login` is not blocked. S2-019 again.
- **No indexes are created from code.** `mongoose.js` does not call `createIndex` anywhere. Email uniqueness is declared in the schema (`unique: true`) and Mongoose will create the index on first connection.

---

## 12. Where to look next

- **For the planned architecture** (event approval workflow, tiers, teams, notifications, feedback): see [plan.md](plan.md). Tasks `S2-003` through `S2-023` describe what's missing and where it goes.
- **For the frontend that talks to this API:** see `web/` (React 19 + Vite + Zustand). The frontend's `lib/api.ts` is where the access-token header is attached and the 401 → refresh dance lives.

If something here is out of date with the code, treat the code as the source of truth and update this doc.
