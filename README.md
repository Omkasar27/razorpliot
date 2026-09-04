# RazorPilot — AI Agentic Commerce for Razorpay

> Built for the Razorpay Buildathon 2026 — Track 01: AI Growth & Agentic Commerce

RazorPilot is an AI commerce agent that understands what a customer wants, searches a merchant's catalog, recommends the right add-on, and completes checkout through Razorpay — all inside deterministic safety limits a merchant controls, with every money-related decision logged and explainable.

It is **not a chatbot**. Chat is one way a customer reaches it; the product is the full pipeline — intent → catalog search → recommendation → safety check → merchant approval (when needed) → Razorpay checkout → payment → audit trail → revenue analytics.

---

## Demo

- 🛍️ **Customer experience:** `/shop`
- 🏪 **Merchant dashboard:** `/merchant`
- 🎥 **5-minute demo video:** *(add link once recorded)*

---

## What RazorPilot Does

A customer can type something like:

> *"I need a gaming mouse under ₹2,000."*

RazorPilot will:

- Understand the purchase intent using AI.
- Search the merchant's catalog.
- Recommend compatible products or add-ons.
- Validate inventory, pricing, and merchant safety rules.
- Request merchant approval when required.
- Create a Razorpay checkout.
- Log every decision in an audit trail.

---

## Why This Architecture

**The single most important decision in this project: the LLM never decides whether money moves.**

AI is responsible for:
- Understanding customer intent.
- Generating natural language responses.
- Explaining recommendations.

Deterministic backend code (`server/src/commerce/safetyEngine.js`) is responsible for:
- Inventory validation.
- Pricing validation.
- Safety policy enforcement.
- Approval workflows.
- Razorpay order creation and signature verification.
- Payment retry limits.
- Audit logging.

This separation makes the payment flow deterministic, independently testable, and impossible for a prompt to override.

---

## Architecture

```text
Customer Message
        │
        ▼
AI Intent Extraction (Groq)          ← understands, never decides
        │
        ▼
Deterministic Catalog Search         ← plain MongoDB query/ranking, no vector DB
        │
        ▼
Recommendation Engine                ← merchant-curated "frequently bought with" links
        │
        ▼
Cart
        │
        ▼
Safety Engine (Deterministic)        ← re-checks live inventory/price, not a cart snapshot
        │
        ├── Blocked ─────────────────► Order rejected, nothing charged
        │
        ├── Approval Required ───────► Pending order created, merchant notified,
        │                              no Razorpay order yet
        │
        └── Auto Approved ───────────► Razorpay Test Mode order created immediately
                    │
                    ▼
           Razorpay Checkout.js
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 Payment Success          Payment Failure
        │                       │
        ▼                       ▼
 Order Marked Paid      Retry (once, configurable)
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
             Retry Succeeds          Retry Limit Reached
                                                │
                                                ▼
                                      Order Marked Failed
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (JavaScript), Tailwind CSS v4, shadcn/ui primitives, GSAP, Recharts |
| Backend | Node.js + Express (JavaScript) |
| Database | MongoDB Atlas + Mongoose |
| AI | Groq (`groq-sdk`), behind a swappable provider interface |
| Payments | Razorpay Test Mode APIs |
| Auth | Firebase Authentication (merchant / customer roles) |

---

## Project Structure

```text
razorpilot/
│
├── client/                     # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── customer/
│       │   ├── merchant/
│       │   └── auth/
│       ├── components/
│       │   ├── customer/
│       │   ├── merchant/
│       │   ├── landing/
│       │   ├── layout/
│       │   └── ui/              # shadcn primitives
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useCart.js
│       │   └── useConversation.js
│       └── lib/
│           ├── api.js           # fetch wrapper
│           └── firebaseClient.js
│
└── server/                     # Express backend
    └── src/
        ├── ai/
        │   ├── provider.js       # interface
        │   ├── groqProvider.js
        │   ├── intent.js
        │   └── explain.js
        ├── commerce/
        │   ├── catalogSearch.js
        │   ├── recommend.js
        │   ├── safetyEngine.js
        │   ├── cartService.js
        │   ├── checkoutService.js
        │   ├── approvalService.js
        │   └── conversationOrchestrator.js
        ├── audit/
        │   └── logger.js          # every meaningful action writes one line here
        ├── auth/
        │   ├── firebaseAdmin.js
        │   └── middleware/        # verifyToken / requireRole
        ├── db/models/             # User, Merchant, Product, Cart, Order,
        │                          # Conversation, Recommendation, Rule,
        │                          # AuditLog, PaymentAttempt
        ├── controllers/           # one per resource
        ├── routes/                # one per resource
        └── seed/                  # demo catalog + default safety rules
```

---

## Core Features

### Customer Experience
- AI-powered shopping assistant.
- Intent-based product search.
- Smart add-on recommendations.
- Guided checkout with Razorpay.

### Merchant Dashboard
- Pending approvals queue.
- Live orders.
- Revenue analytics.
- Audit log for every important event.
- Configurable safety rules.

### Commerce Safety Engine
- Live inventory validation.
- Price mismatch detection.
- Merchant approval thresholds.
- Retry limits for failed payments.
- Deterministic policy enforcement.

### Audit Trail

Every important event is stored:

| Event | Logged |
|---|---|
| Customer intent received | ✅ |
| Product recommendation | ✅ |
| Safety decision | ✅ |
| Merchant approval | ✅ |
| Razorpay order creation | ✅ |
| Payment success/failure | ✅ |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free MongoDB Atlas cluster
- A free Groq API key ([console.groq.com](https://console.groq.com))
- A Firebase project (Authentication → Email/Password enabled)
- Razorpay Test Mode API keys *(optional — see [Mock Payments Mode](#mock-payments-mode))*

### 1. Backend Setup

```bash
cd server
cp .env.example .env
```

Fill in `server/.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/razorpilot

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
MOCK_PAYMENTS=false   # set true to run the full flow without real Razorpay keys

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Install dependencies, seed demo data, and start the server:

```bash
npm install
npm run seed   # creates a demo merchant, 10-product catalog, and default safety rules
npm run dev    # http://localhost:5000
```

> **Note the `merchantId` the seed script prints** — you'll need it for the client's `.env` below.

### 2. Frontend Setup

```bash
cd client
cp .env.example .env
```

Fill in `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_DEMO_MERCHANT_ID=<the merchantId from the seed step above>
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Install dependencies and run:

```bash
npm install
npm run dev    # http://localhost:5173
```

---

## Running the Demo

### Customer Flow
1. Visit `http://localhost:5173`, sign up as a **customer**, and go to `/shop`.
2. Ask for something — e.g. *"I need a gaming mouse under 2000 rupees."*
3. Accept the recommended add-on and proceed to checkout.
4. Complete payment via Razorpay.

### Merchant Flow
1. Sign up a second account as **merchant** (or use an incognito window) and visit `/merchant`.
2. Review the pending approvals queue.
3. Monitor live orders and revenue analytics.
4. Inspect the audit trail.

---

## Mock Payments Mode

Real Razorpay Test Mode API keys require completing Razorpay's account/PAN verification step before they're issued. To keep development unblocked, set:

```env
MOCK_PAYMENTS=true
```

In mock mode, the app:
- Generates synthetic Razorpay order and payment IDs.
- Exercises the exact same checkout/verification code path as real payments.

To switch to real payments later, **no code changes are required** — just flip the flag and add real keys to both `server/.env` and `client/.env`:

```env
MOCK_PAYMENTS=false
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```

---

## AI vs. Deterministic Logic

| Decision | Made by |
|---|---|
| Understanding customer intent | AI (Groq) |
| Phrasing replies and explanations | AI (Groq) |
| Product search & ranking | Code |
| Recommendation selection | Code (merchant-curated compatibility data) |
| Safety/approval decision | Code |
| Payment retry limit | Code (merchant-configurable) |
| Razorpay order creation & signature verification | Code |
| Audit logging | Code |

---

## Safety Guarantees

- AI cannot trigger payments directly.
- Every payment request passes through the Safety Engine.
- Merchant approval is mandatory for configured scenarios.
- Inventory and pricing are checked live, not from a cart snapshot.
- Every payment decision is logged with an explanation.

---

## Known Limitations / Explicitly Out of Scope

- Single-merchant demo — no merchant marketplace/switching UI (matches the buildathon's own "cut if time-constrained" guidance).
- Catalog search is keyword/tag/price based, not semantic/vector search — deliberate, per the brief's guidance to start simple and add semantic search only if it proves necessary.
- No discount-code or coupon engine.
- No multi-vendor marketplace.

---

## Future Improvements

- Semantic catalog search using embeddings.
- Multi-merchant marketplace.
- Personalized recommendations.
- Inventory forecasting.
- Dynamic merchant campaigns.
- Voice shopping interface.

---

## License / Attribution

Built for the Razorpay Buildathon 2026 — Track 01: AI Growth & Agentic Commerce.
