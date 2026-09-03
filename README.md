# RazorPilot

AI agentic commerce platform for the Razorpay Buildathon (Track 01: AI Growth & Agentic Commerce).

## Stack

- **Client**: React + Vite (JavaScript), Tailwind CSS v4, react-router-dom, lucide-react, recharts, framer-motion
- **Server**: Node.js + Express (JavaScript)
- **Database**: MongoDB Atlas via Mongoose
- **AI**: Groq (`groq-sdk`), behind a provider abstraction (`server/src/ai/`, added in Phase 3)
- **Payments**: Razorpay Test Mode
- **Auth**: Firebase Authentication (added in Phase 11)

## Project layout

```
razorpilot/
  client/   React + Vite frontend
  server/   Express backend + MongoDB models
```

## Phase 1 — what's included

- Express server with health check (`GET /api/health`), CORS, JSON body parsing,
  centralized error handler, and MongoDB connection helper.
- Mongoose models for every core entity: User, Merchant, Product, Cart, Order,
  Conversation, Recommendation, Rule, AuditLog, PaymentAttempt.
- A demo catalog seed script (gaming mouse / running shoes / laptop bag scenarios,
  matching the buildathon example) with realistic "frequently bought with" links
  and one deliberately low-stock item to exercise the approval rule later.
- Default safety rules seeded per merchant (₹2000 approval threshold, 20% max
  discount, low-inventory threshold of 3, 1 payment retry).
- React + Vite client scaffold with routing for both surfaces (customer shopping/
  checkout, merchant dashboard/catalog/orders/approvals/audit/safety-rules), a
  shared API wrapper (`client/src/lib/api.js`), Tailwind theme tokens, and a
  landing page that live-checks connectivity to the backend.

## Running it locally

### 1. Server

```bash
cd server
cp .env.example .env
# Fill in MONGODB_URI at minimum. Groq/Razorpay/Firebase keys can be added
# as those milestones are built — they aren't required to run Phase 1.
npm install
npm run seed   # populates the demo merchant, catalog, and safety rules
npm run dev    # starts on http://localhost:5000
```

### 2. Client

```bash
cd client
cp .env.example .env   # defaults are fine for local dev
npm install
npm run dev    # starts on http://localhost:5173
```

Open http://localhost:5173 — the landing page's "Backend connectivity" box
should say **Connected** once both servers are running and `MONGODB_URI` points
to a reachable database (a free MongoDB Atlas cluster works fine).

### 3. Verify the seed worked

After `npm run seed`, check the server logs for the demo `merchantId`, or query
MongoDB Atlas directly — you should see 10 products across three demo scenarios
(Peripherals, Footwear, Bags) and one `Rule` document with the default thresholds.

## What's next

See the phase list in the project's architecture notes. Phase 2 (catalog CRUD +
deterministic search) builds directly on the models and seed data here.
