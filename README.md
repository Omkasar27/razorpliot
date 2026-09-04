**# RazorPilot

**AI Agentic Commerce for Razorpay — Buildathon Track 01: AI Growth & Agentic Commerce**

RazorPilot is an AI commerce agent that understands what a customer wants, searches a merchant's
catalog, recommends the right add-on, and completes checkout through Razorpay — all inside
deterministic safety limits a merchant controls, with every money-related decision logged and
explainable.

It is **not a chatbot**. Chat is one way a customer reaches it; the product is the full pipeline —
intent → catalog search → recommendation → safety check → merchant approval (when needed) →
Razorpay checkout → payment → audit trail → revenue analytics.

## Live demo

- Customer experience: `/shop`
- Merchant dashboard: `/merchant`
- [5-minute demo video](#) *(add link once recorded)*

## Why this architecture

The single most important decision in this project: **the LLM never decides whether money moves.**
It understands intent and phrases explanations — every safety, approval, and payment decision is
plain deterministic code (`server/src/commerce/safetyEngine.js`), independently testable and
impossible for a prompt to override.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (JavaScript), Tailwind CSS v4, shadcn/ui primitives, GSAP, Recharts |
| Backend | Node.js + Express (JavaScript) |
| Database | MongoDB Atlas + Mongoose |
| AI | Groq (`groq-sdk`), behind a swappable provider interface |
| Payments | Razorpay Test Mode APIs |
| Auth | Firebase Authentication (merchant / customer roles) |

## Project structure
razorpilot/
client/ React + Vite frontend
src/
pages/ customer/, merchant/, auth/
components/ customer/, merchant/, layout/, ui/ (shadcn), landing/
hooks/ useAuth, useCart, useConversation
lib/ api.js (fetch wrapper), firebaseClient.js
server/ Express backend
src/
ai/ provider.js (interface), groqProvider.js, intent.js, explain.js
commerce/ catalogSearch, recommend, safetyEngine, cartService,
checkoutService, approvalService, conversationOrchestrator
audit/ logger.js — every meaningful action writes one line here
auth/ firebaseAdmin.js, verifyToken/requireRole middleware
db/models/ User, Merchant, Product, Cart, Order, Conversation,
Recommendation, Rule, AuditLog, PaymentAttempt
controllers/ + routes/ one pair per resource
seed/ demo catalog + default safety rules


## Core architecture

Customer message
│
▼
AI intent extraction (Groq) ← understands, never decides
│
▼
Deterministic catalog search ← plain MongoDB query/ranking, no vector DB
│
▼
Deterministic recommendation engine ← merchant-curated "frequently bought with" links
│
▼
Cart
│
▼
Deterministic safety engine ← re-checks live inventory/price, not a cart snapshot
│
├── blocked ──────────────► order rejected, nothing charged
├── approval_required ────► pending order created, merchant notified, no Razorpay order yet
└── auto ─────────────────► Razorpay Test Mode order created immediately
│
▼
Razorpay Checkout.js
│
┌───────────┴───────────┐
▼ ▼
payment success payment failure
│ │
▼ ▼
order marked paid retry (once, configurable)
│
┌─────────┴─────────┐
▼ ▼
retry succeeds limit reached →
order marked failed


## Getting started

### Prerequisites
- Node.js 18+
- A free MongoDB Atlas cluster
- A free Groq API key ([console.groq.com](https://console.groq.com))
- A Firebase project (Authentication → Email/Password enabled)
- Razorpay Test Mode API keys *(optional — see Mock mode below)*

### 1. Server

```bash
cd server
cp .env.example .env
```

Fill in `.env`:

PORT=5000
CLIENT_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/razorpilot

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
MOCK_PAYMENTS=false # set true to run the full flow without real Razorpay keys

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=


```bash
npm install
npm run seed   # creates a demo merchant, 10-product catalog, and default safety rules
npm run dev    # http://localhost:5000
```

**Note the `merchantId` the seed script prints** — you need it for the client's env below.

### 2. Client

```bash
cd client
cp .env.example .env
```

Fill in `.env`:
VITE_API_URL=
VITE_DEMO_MERCHANT_ID=<the merchantId from the seed step above>
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=


```bash
npm install
npm run dev    # http://localhost:5173
```

### 3. Try it

1. Visit `http://localhost:5173`, sign up as a **customer**, go to `/shop`.
2. Ask for something — e.g. *"I need a gaming mouse under 2000 rupees"*.
3. Accept the recommended add-on, go to checkout, complete payment.
4. Sign up a second account as **merchant** (or open an incognito window), visit `/merchant`
   to see the order, approvals queue, audit trail, and revenue dashboard.

## Mock payments mode

Real Razorpay Test Mode API keys require completing Razorpay's account/PAN verification step
before generating keys. To keep development unblocked, set `MOCK_PAYMENTS=true` — the app
generates synthetic order/payment IDs and exercises the exact same checkout/verification code
path. Switching to real payments later requires **zero code changes** — flip the flag and add
real keys to both `server/.env` and `client/.env`.

## Deterministic vs. AI-driven, explicitly

| Decision | Made by |
|---|---|
| Understanding customer intent | AI (Groq) |
| Phrasing replies and explanations | AI (Groq) |
| Product search & ranking | Code |
| Recommendation selection | Code (merchant-curated compatibility data) |
| Safety/approval decision | Code |
| Payment retry limit | Code (merchant-configurable) |
| Razorpay order creation & signature verification | Code |

## Known limitations / explicitly out of scope

- Single-merchant demo — no merchant marketplace/switching UI (matches the buildathon's own
  "cut if time-constrained" guidance).
- Catalog search is keyword/tag/price based, not semantic/vector search — deliberate, per the
  brief's guidance to start simple and add semantic search only if it proves necessary.
- No discount-code system.

## License / attribution

Built for the Razorpay Buildathon — Track 01: AI Growth & Agentic Commerce.**# RazorPilot — AI Agentic Commerce for Razorpay

> **Built for Razorpay Buildathon 2026 — Track 01: AI Growth & Agentic Commerce**

RazorPilot is an **AI-powered commerce agent** that understands customer intent, searches a merchant's catalog, recommends relevant add-ons, enforces merchant-defined safety rules, and completes checkout through **Razorpay**.

Unlike a traditional chatbot, RazorPilot is an **agentic commerce pipeline** where AI handles language understanding while **deterministic code controls every money-related decision**.

---

## Demo

* 🛍️ **Customer Experience:** `/shop`
* 🏪 **Merchant Dashboard:** `/merchant`
* 🎥 **5-Minute Demo Video:** *Add your YouTube/Drive link here*

---

## What RazorPilot Does

A customer can type something like:

> *"I need a gaming mouse under ₹2,000."*

RazorPilot will:

* Understand the purchase intent using AI.
* Search the merchant's catalog.
* Recommend compatible products or add-ons.
* Validate inventory, pricing, and merchant safety rules.
* Request merchant approval when required.
* Create a Razorpay checkout.
* Log every decision in an audit trail.

---

## Why This Architecture?

### AI never decides whether money moves.

The LLM is responsible for:

* Understanding customer intent.
* Generating natural language responses.
* Explaining recommendations.

The backend is responsible for:

* Inventory validation.
* Pricing validation.
* Safety policy enforcement.
* Approval workflows.
* Razorpay order creation.
* Payment verification.
* Audit logging.

This separation makes the payment flow deterministic, explainable, and independently testable.

---

## Architecture

```text
Customer Message
        │
        ▼
AI Intent Extraction (Groq)
        │
        ▼
Deterministic Catalog Search
        │
        ▼
Recommendation Engine
        │
        ▼
Cart
        │
        ▼
Safety Engine (Deterministic)
        │
        ├──────── Blocked
        │          │
        │          ▼
        │     Order Rejected
        │
        ├──────── Approval Required
        │          │
        │          ▼
        │   Merchant Approval Queue
        │
        └──────── Auto Approved
                   │
                   ▼
        Razorpay Order Creation
                   │
                   ▼
           Razorpay Checkout
                   │
        ┌──────────┴───────────┐
        ▼                      ▼
Payment Success          Payment Failed
        │                      │
        ▼                      ▼
 Order Marked Paid      Retry (Configurable)
                                │
                                ▼
                     Retry Limit Reached
                                │
                                ▼
                        Order Marked Failed
```

---

# Tech Stack

| Layer              | Technology                                                           |
| ------------------ | -------------------------------------------------------------------- |
| **Frontend**       | React + Vite, JavaScript, Tailwind CSS v4, shadcn/ui, GSAP, Recharts |
| **Backend**        | Node.js + Express                                                    |
| **Database**       | MongoDB Atlas + Mongoose                                             |
| **AI Provider**    | Groq (`groq-sdk`) via a swappable provider interface                 |
| **Authentication** | Firebase Authentication                                              |
| **Payments**       | Razorpay Test Mode APIs                                              |

---

# Project Structure

```text
razorpilot/
│
├── client/                     # React + Vite Frontend
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
│       │   └── ui/
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useCart.js
│       │   └── useConversation.js
│       └── lib/
│           ├── api.js
│           └── firebaseClient.js
│
└── server/                     # Express Backend
    └── src/
        ├── ai/
        │   ├── provider.js
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
        │   └── logger.js
        ├── auth/
        │   ├── firebaseAdmin.js
        │   └── middleware/
        ├── db/models/
        ├── controllers/
        ├── routes/
        └── seed/
```

---

# Core Features

### Customer Experience

* AI-powered shopping assistant.
* Intent-based product search.
* Smart add-on recommendations.
* Guided checkout with Razorpay.

### Merchant Dashboard

* Pending approvals queue.
* Live orders.
* Revenue analytics.
* Audit log for every important event.
* Configurable safety rules.

### Commerce Safety Engine

* Live inventory validation.
* Price mismatch detection.
* Merchant approval thresholds.
* Retry limits for failed payments.
* Deterministic policy enforcement.

### Audit Trail

Every important event is stored.

| Event                    | Logged |
| ------------------------ | ------ |
| Customer intent received | ✅      |
| Product recommendation   | ✅      |
| Safety decision          | ✅      |
| Merchant approval        | ✅      |
| Razorpay order creation  | ✅      |
| Payment success/failure  | ✅      |

---

# Getting Started

## Prerequisites

You'll need:

* Node.js **18+**
* MongoDB Atlas cluster
* Groq API Key
* Firebase project with Email/Password Authentication
* Razorpay Test Mode API Keys *(optional when using mock payments)*

---

## 1. Backend Setup

```bash
cd server
cp .env.example .env
```

Configure `.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/razorpilot

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret

MOCK_PAYMENTS=false

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Install dependencies:

```bash
npm install
```

Seed demo data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

> Save the **merchantId** printed after seeding.

---

## 2. Frontend Setup

```bash
cd client
cp .env.example .env
```

Configure `.env`:

```env
VITE_API_URL=http://localhost:5000

VITE_DEMO_MERCHANT_ID=<merchantId>

VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# Running the Demo

### Customer Flow

1. Sign up as a **Customer**.
2. Visit `/shop`.
3. Ask for a product.
4. Accept recommendations.
5. Checkout with Razorpay.

### Merchant Flow

1. Sign up as a **Merchant**.
2. Visit `/merchant`.
3. Review approval requests.
4. Monitor payments and analytics.
5. Inspect audit logs.

---

# Mock Payments Mode

If you don't have Razorpay Test API keys yet:

```env
MOCK_PAYMENTS=true
```

Mock mode:

* Generates synthetic Razorpay order IDs.
* Generates synthetic payment IDs.
* Uses the exact same checkout verification pipeline.
* Requires **zero code changes** to switch to real Razorpay.

To enable real payments later:

```env
MOCK_PAYMENTS=false
```

Then provide:

* Razorpay Test Key ID
* Razorpay Test Secret
* Frontend Razorpay Key ID

---

# AI vs Deterministic Logic

| Responsibility                | AI | Deterministic Code |
| ----------------------------- | -- | ------------------ |
| Customer intent understanding | ✅  | —                  |
| Response generation           | ✅  | —                  |
| Product search & ranking      | —  | ✅                  |
| Recommendation selection      | —  | ✅                  |
| Safety policy evaluation      | —  | ✅                  |
| Merchant approval workflow    | —  | ✅                  |
| Razorpay order creation       | —  | ✅                  |
| Payment verification          | —  | ✅                  |
| Retry limits                  | —  | ✅                  |
| Audit logging                 | —  | ✅                  |

---

# Safety Guarantees

RazorPilot is built with deterministic commerce controls:

* AI cannot trigger payments directly.
* Every payment request passes through the Safety Engine.
* Merchant approval is mandatory for configured scenarios.
* Inventory and pricing are checked live.
* Every payment decision is logged with an explanation.

---

# Known Limitations

This buildathon version intentionally keeps scope focused.

* Single merchant demo.
* Keyword/tag-based catalog search (no vector database).
* No discount or coupon engine.
* No multi-vendor marketplace.

These choices align with the buildathon recommendation to prioritize reliable commerce flows before semantic search.

---

# Future Improvements

* Semantic catalog search using embeddings.
* Multi-merchant marketplace.
* Personalized recommendations.
* Inventory forecasting.
* Dynamic merchant campaigns.
* Voice shopping interface.

---

# License

Built for **Razorpay Buildathon 2026** — **Track 01: AI Growth & Agentic Commerce**.


