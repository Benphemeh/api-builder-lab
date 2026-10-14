# API Builder Lab

> A practical backend engineering laboratory built with NestJS and TypeScript.
> It explores how backend concepts — routing, authentication, databases,
> validation, payments, caching, observability, and testing — are applied in a
> working codebase, with lessons relevant to a broader commerce-platform vision.

---

## Contents

1. [Why this repository exists](#1-why-this-repository-exists)
2. [Project history](#2-project-history)
3. [Relationship to the O'Ben Brands vision](#3-relationship-to-the-oben-brands-vision)
4. [What the repository currently implements](#4-what-the-repository-currently-implements)
5. [Backend concepts demonstrated](#5-backend-concepts-demonstrated)
6. [High-level architecture](#6-high-level-architecture)
7. [Technology stack](#7-technology-stack)
8. [Exploring the API](#8-exploring-the-api)
9. [Setup prerequisites](#9-setup-prerequisites)
10. [Installation and local development](#10-installation-and-local-development)
11. [Environment configuration](#11-environment-configuration)
12. [Running the application and tests](#12-running-the-application-and-tests)
13. [API documentation](#13-api-documentation)
14. [Known limitations and areas for improvement](#14-known-limitations-and-areas-for-improvement)
15. [Future learning and mentorship direction](#15-future-learning-and-mentorship-direction)
16. [Contribution and learning guidelines](#16-contribution-and-learning-guidelines)
17. [Licence and usage](#17-licence-and-usage)

---

## 1. Why this repository exists

API Builder Lab is a hands-on environment for learning backend engineering by
studying and changing a real codebase.

Instead of isolated tutorials, it gives learners a complete (though still
evolving) system to explore: HTTP routes, controllers, services, data models,
a relational database, authentication, input validation, third-party payment
integration, caching, metrics, email notifications, and automated tests.

The goal is to practise the full loop of backend work: read existing code,
trace a request end to end, make a controlled change, write or extend a test,
document the decision, and reason about reliability, security, and trade-offs.
## 2. Project history

API Builder Lab began nearly two years ago as a personal engineering and
learning project. The original intention was to explore backend technologies,
understand how they work in practice, and apply those lessons to a larger
product vision for O'Ben Brands.

At the time, the repository was used to experiment with the backend
capabilities a commerce platform needs: user accounts, product catalogues,
carts, orders, payments, deliveries, notifications, and the operational
concerns around them (caching, logging, metrics, testing).

Over time the work became more structured. Early commits set up authentication,
data models, and basic CRUD routes; later work added concepts one at a time —
request logging, catalogue filtering, cart checkout flows, payment
initialisation and verification, signed webhook handling, Redis caching,
Prometheus metrics, and progressively broader test coverage. The Git history
reflects this: small feature branches merged through pull requests, with
visible rounds of test fixes and lint fixes.

The project is now evolving beyond personal experimentation. The aim is to
shape it into a structured, hands-on learning environment where people who are
new to backend development can study a real codebase and learn how backend
systems are designed, implemented, tested, and improved.

Honest summary of where things stand:

- Personal learning project → practical backend experimentation →
  increasingly structured engineering work → potential learning resource.
- The mentorship direction described in section 15 is a plan, not a completed
  programme. No cohort, curriculum delivery history, or learner outcomes are
  claimed here, because the repository does not evidence them.

## 3. Relationship to the O'Ben Brands vision

It helps to keep two ideas separate:

- **API Builder Lab** is this repository: the learning and experimentation
  codebase. It is where backend concepts are tried out, tested, and refined.
- **O'Ben Brands** is the broader commerce product vision that informed some
  of the project's direction — the idea of a fuller store platform with
  catalogue, checkout, payments, delivery, and customer communication.

Some feature choices in this repository (for example, Paystack payments,
delivery tracking, or order emails) were motivated by that vision. But this
repository should not be read as the complete backend of a finished O'Ben
Brands product, and not every experimental feature here should be assumed
production-ready. Where the code is incomplete or unverified, section 14 says
so explicitly.

## 4. What the repository currently implements

The following is verified against the source in `src/`. It describes what the
code does, not a claim that every path is hardened or complete — see
section 14 for gaps.

**Identity and access.** Email signup and login with JWT bearer tokens and
bcrypt-hashed passwords; email verification and password-reset flows using
single-use tokens; role-based access distinguishing standard users from admin
and super-admin roles; a first super-admin account provisioned from
environment configuration on startup.

**Catalogue.** Product records with image upload to a cloud media service,
filtering (category, price band, brand, rating), pagination, sorting, stock
management including a restock path, and an admin bulk-import path for
CSV/spreadsheet files. Category records support catalogue organisation.

**Cart and orders.** A per-user cart (add, view, update quantities, remove,
clear) that can be converted into an order; direct order creation from a
product list is also present. Order creation checks stock, decrements it,
computes totals server-side, supports coupon discounts, auto-creates a
delivery record, and sends order emails.

**Payments.** Paystack transaction initialisation and server-side verification
by reference, with payment records tracked through pending/success/failed
states. A webhook endpoint receives asynchronous Paystack events, verifies the
provider signature before trusting the payload, and records processed events
so retried deliveries are not applied twice.

**Delivery, engagement, admin.** Delivery creation, status updates, and
filtered listing; wishlist add/list/remove; product reviews with ratings and
comments; and admin operations over orders, products, deliveries, coupons, and
users, protected by an admin role check.

**Platform behaviour.** Global input validation on request DTOs; JWT and admin
guards on protected routes; per-request activity logging persisted to the
database; Redis-backed caching of frequently read listings with short
time-to-live values and graceful fallback when the cache is unavailable;
Prometheus metrics including a custom order counter with an alert rule;
transactional emails across signup, verification, catalogue, order, payment,
delivery, and password-reset events; and Swagger UI generated from the code.

## 5. Backend concepts demonstrated

Each concept below maps to something a learner can read, run, and modify in
this codebase:

- **Modular monolith design** — bounded feature modules sharing a common core
  (database, guards, mail, middleware, validation), composed in one
  application module.
- **Layered request handling** — middleware → guards → validation pipe →
  controller → service → database, with side effects (emails, metrics, cache)
  coordinated in services.
- **Authentication and authorisation** — Passport JWT and local strategies,
  bearer-token guards, role checks, duplicate-email protection on signup.
- **Input validation** — a single global validation pipe applying
  decorator-based DTO rules with readable error messages.
- **Relational modelling with an ORM** — Sequelize models, associations
  (users, products, carts, orders, payments, deliveries, reviews, wishlists,
  webhook events, logs), UUID keys, and enum-constrained statuses.
- **Migrations** — versioned schema changes applied with the Sequelize CLI.
- **Third-party payment integration** — initialise/verify REST calls plus
  asynchronous signed webhooks with duplicate-delivery protection.
- **Caching** — cache-aside reads with composite keys, short TTLs, and
  pattern-based invalidation, backed by Redis with fallback to the database.
- **Observability** — Prometheus metrics exposition, a business-level order
  counter, an alert rule, and database-persisted request logs.
- **Transactional email** — templated lifecycle emails triggered by domain
  events (auth, catalogue, orders, payments, delivery).
- **Automated testing** — unit tests for services and controllers with mocked
  repositories, plus an end-to-end test configuration.
- **Operational trade-offs** — where caching helps and where it risks staleness;
  where transactions are used and where atomicity is still missing; what is
  logged and what that implies for privacy (see section 14).

## 6. High-level architecture

The application is a modular NestJS monolith: one deployable process composed
of feature modules (`auth`, `users`, `admin`, `products`, `categories`,
`cart`, `order`, `payment`, `webhooks`, `delivery`, `wishlist`, `review`) plus
platform modules (`cache`, `redis`, `prometheus`, `guards`) and a shared core
(database, mail, middleware, pipes, enums, guards, configuration).

A typical authenticated request flows through:

```text
HTTP request
  -> request-logging middleware
  -> authentication / role guard
  -> global input-validation pipe
  -> controller (thin; delegates to a service)
  -> service (database access, cache, emails, metrics)
  -> HTTP response
```

External systems involved: a relational database (MySQL in the checked-in
configuration; the ORM also lists Postgres support — see section 14), Redis
for caching, Paystack for payments (REST plus signed webhooks), a cloud media
service for product images, and an SMTP server for email. Prometheus scrapes a
metrics endpoint; Swagger UI is generated from the controllers.

The monolith shape was a pragmatic fit for learning: checkout touches carts,
stock, orders, payments, and delivery in ways that need to stay consistent,
which is simpler to reason about inside one process and one database than
across services.

## 7. Technology stack

Verified against `package.json`, imports, and configuration files:

| Layer | Choice |
|-------|--------|
| Runtime / framework | Node.js, NestJS 10, TypeScript, Express |
| ORM / drivers | Sequelize + sequelize-typescript; MySQL driver installed; Postgres drivers listed |
| Auth | Passport (JWT and local strategies), JSON Web Tokens, bcrypt |
| Validation | class-validator + class-transformer via a global pipe |
| Cache | ioredis with cache-manager, wrapped in a cache-aside service |
| Payments | Paystack REST API plus signed webhooks |
| Media | multer uploads with cloud storage |
| Email | Nodemailer / NestJS mailer with Handlebars templates |
| Observability | prom-client with Prometheus scrape config and an alert rule; database request logs |
| Docs | NestJS Swagger (Swagger UI) |
| Bulk import | csv-parse, xlsx |
| Testing | Jest + ts-jest + supertest + NestJS testing utilities |
| Tooling | ESLint + Prettier, Sequelize CLI, dotenv |

TypeScript compiles cleanly (`tsc --noEmit` passes) and the unit suite runs
with `npm test` (see section 12 for the verified result).

## 8. Exploring the API

The application serves its API under a global `/api` prefix (default port
`3030`, so the base URL is `http://localhost:3030/api`). The main resource
areas are:

- **Auth** (`/api/auth`) — signup, login, email verification, forgot/reset
  password.
- **Users** (`/api/users`, `/api/admin/users`) — profile reads and updates,
  paginated and searchable admin listing, admin-only deletion.
- **Products** (`/api/products`) — create (with image upload), filtered and
  paginated listing, detail, update, restock, delete.
- **Categories** (`/api/categories`) — taxonomy CRUD.
- **Cart** (`/api/cart`) — add, view, update items, remove items, clear; all
  scoped to the authenticated user.
- **Orders** (`/api/order`) — create directly or from the cart, verify payment
  by reference, apply a coupon, filtered listing, detail, delete.
- **Payments** (`/api/payments`) — initialise a transaction, verify by
  reference, update payment status; plus the signed webhook receiver at
  `POST /api/payments/webhook`.
- **Admin** (`/api/admin`) — order, product (including bulk upload),
  delivery, coupon, and user management behind an admin role check.
- **Delivery** (`/api/deliveries`) — create, status updates, tracking reads,
  filtered listing.
- **Wishlist** (`/api/wishlist`) and **reviews** (`/api/reviews`) — saved
  products and product ratings scoped to the authenticated user.
- **Logs and metrics** — persisted API logs and a Prometheus metrics endpoint
  (see section 13).

For exact request and response shapes, use the live Swagger UI described in
section 13 rather than trusting any static example.

## 9. Setup prerequisites

To run the project locally you need:

- Node.js 18 or later and npm.
- A running relational database. The checked-in CLI configuration uses MySQL;
  the application reads its database settings from environment variables.
- A running Redis instance for caching (reads fall back to the database when
  Redis is unavailable, but caching behaviour cannot be exercised without it).
- A Paystack test secret key if you want to exercise payment initialisation,
  verification, or webhooks. Payment calls are not needed to boot the app or
  run the unit tests.
- Cloud media-service credentials if you want to exercise product image
  uploads; other product endpoints work without them.
- SMTP credentials if you want emails to actually send. The app boots without
  them, but email-sending paths will fail at send time.

You do not need all third-party credentials to explore the codebase, run the
type check, or run the unit tests.

## 10. Installation and local development

```bash
# 1. Clone the repository
git clone git@github.com:Benphemeh/api-builder-lab.git
cd api-builder-lab

# 2. Install dependencies
npm install

# 3. Create your environment file (see section 11 for the variables).
#    There is currently no committed .env.example — this is flagged in
#    section 14 as something to add. Create .env manually with your own values.

# 4. Make sure MySQL and Redis are running, then apply migrations
npx sequelize-cli db:migrate

# 5. Start the API in watch mode
npm run start:dev

# 6. Open the API docs
#    http://localhost:3030/api-docs
```

Other scripts from `package.json`: `npm run build`, `npm start`,
`npm run start:debug`, `npm run start:prod` (runs the compiled output),
`npm run lint` (ESLint with `--fix`), `npm run format` (Prettier),
`npm run test:watch`, `npm run test:cov`, `npm run test:e2e`,
`npm run test:debug`.

> Note: step 4 assumes the Sequelize CLI can reach your database with the
> values in your `.env`. If migration paths or database creation steps need
> adjusting for your setup, treat the CLI output as authoritative and record
> what you changed — that is itself a useful learning exercise.

## 11. Environment configuration

Create a `.env` file in the project root (it is git-ignored; never commit it)
using **your own values**. Every value below is a placeholder — generate real
secrets yourself and never reuse the examples.

```bash
# App
NODE_ENV=development
TOKEN_EXPIRATION=1d
JWT_SECRET=<generate-a-long-random-string>

# Database (used by the application config)
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=<your-db-user>
DB_PASS=<your-db-password>
DB_NAME_DEVELOPMENT=<your-dev-database>
DB_NAME_TEST=<your-test-database>
DB_NAME_PRODUCTION=<your-prod-database>

# First admin account (created on startup when the email is not found)
SUPER_ADMIN_EMAIL=<admin-email-you-control>
SUPER_ADMIN_FIRST_NAME=<name>
SUPER_ADMIN_LAST_NAME=<name>
SUPER_ADMIN_PASSWORD=<strong-unique-password>

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=<your-redis-password-if-set>

# Paystack (test keys for local work; live keys only in production, if ever)
PAYSTACK_SECRET_KEY=<your-paystack-test-secret-key>
PAYSTACK_PUBLIC_KEY=<your-paystack-test-public-key>

# Cloud media uploads
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Outgoing email (SMTP)
MAIL_HOST=<your-smtp-host>
MAIL_PORT=587
MAIL_USER=<your-smtp-user>
MAIL_PASSWORD=<your-smtp-password>
MAIL_FROM=<your-sender-address>

# Frontend base URL used to build verification and reset links
FRONTEND_URL=http://localhost:3000
```

Practical rules for learners: use test keys locally; generate a fresh JWT
secret per environment; rotate any credential that may have been shared or
committed; and never paste real secrets into issues, chat logs, or docs.

## 12. Running the application and tests

```bash
# Type check (verified: passes with no errors)
npx tsc --noEmit -p tsconfig.json

# Unit tests — verified 14 Oct 2026:
#   Test Suites: 18 passed, 18 total
#   Tests:       301 passed, 301 total
npm test

# Coverage report
npm run test:cov

# End-to-end tests (separate Jest project in test/jest-e2e.json).
# Requires a reachable test database; not executed during this audit.
npm run test:e2e

# Lint
npm run lint
```

The unit suite (`rootDir: src`, matching `*.spec.ts`) covers services and
controllers for auth, users, admin, products, cart, orders, payments,
delivery, and the Redis client, using mocked repositories. Controller specs
assert guards, status codes, and response shapes; service specs cover success
paths and edge cases such as insufficient stock, expired coupons, unknown
payment references, and invalid tokens.

## 13. API documentation

Swagger UI is generated from the controllers and served while the app runs:

- Docs: `http://localhost:3030/api-docs`
- Metrics (Prometheus exposition): `http://localhost:3030/metrics`

Authenticated routes expect `Authorization: Bearer <JWT>`. The Swagger setup
declares bearer auth, so tokens obtained from the login endpoint can be used
directly in the UI.

## 14. Known limitations and areas for improvement

This section is deliberately honest. These are real gaps or unverified areas
found (or confirmed) during a code audit — good starting points for learning
exercises, but not things to ignore in any serious deployment.

**Request logging needs a privacy review.** The logging middleware persists
request bodies and headers to the database. Only the login password is
explicitly redacted. Bearer tokens (in headers), signup passwords, reset and
verification tokens, payment data, and other personal data on non-login routes
do not appear to be redacted. Additionally, the log-retrieval endpoints
(`GET /logs`, `GET /logs/activity`) have no authentication or authorisation
guard in the current code. Before any shared or public deployment: redact
sensitive fields broadly, restrict log access to privileged roles, and
consider whether full-body logging is needed at all. **Left for your review.**

**Order and payment routes need an ownership review.** `POST /api/order`
accepts a client-supplied `userId` without an authentication guard, so orders
can currently be created for any user id. `PATCH /api/payments/:reference`
accepts a client-supplied payment status without re-verifying with the payment
provider. Treat these as learning exercises in authorisation and
trust-boundary design: require authentication, derive ownership from the
token, and treat provider verification as the only settlement truth.
**Left for your review.**

**Order creation is not fully atomic.** Stock decrements happen in a loop
followed by order creation, outside a single database transaction (cart
mutation paths do use transactions — a useful contrast to study). Concurrent
checkouts of the same low-stock product could oversell. Wrapping
stock-decrement plus order-plus-delivery creation in one transaction is a
natural follow-up exercise.

**Database compatibility is narrower than the dependencies suggest.** The
checked-in CLI config and migration history target MySQL, and that is the only
dialect this audit treats as verified. Postgres drivers are installed and the
application config reads a dialect from the environment, but Postgres support
has not been verified here — do not claim it until it is tested.

**No committed `.env.example`.** There is no checked-in environment template,
so section 11 above is reconstructed from the code's `process.env` usage.
Adding a verified `.env.example` (placeholders only) would help new learners.

**Other unfinished work.** A commented-out order-update route, an unused
`wallet/paystack` stub, a duplicated module import in the application module,
pagination shapes that vary between endpoints, and a local Prometheus scrape
target that needs adjusting per environment. The email flow depends on SMTP
credentials that are not part of the repo. None of these block learning, but
they should be resolved or documented before anyone calls the system complete.

## 15. Future learning and mentorship direction

API Builder Lab is being shaped into a practical backend learning environment.
The *plan* — not a completed programme — is for beginners to use this
repository to:

- Navigate an existing backend repository and explain what each part does.
- Trace a request through routes, guards, validation, controllers, services,
  and data models.
- Understand APIs, relational databases, authentication, validation, and
  error handling by reading and changing real code.
- Write and run tests, including tests for failure and edge cases.
- Investigate bugs, reproduce them, fix them, and document the reasoning.
- Learn secure-coding and reliability fundamentals (secret handling, input
  trust boundaries, idempotency, logging privacy, transactions).
- Document technical decisions and communicate changes clearly through pull
  requests.

Suggested first exercises: add the missing `.env.example`; write a test for an
uncovered edge case; redact sensitive fields in the request logger and add a
test proving it; require authentication on the direct order-creation route and
derive the user from the token; wrap order creation in a transaction.

No cohort size, start date, curriculum history, mentor count, or learner
outcomes are stated here, because none are evidenced by the repository. If and
when mentoring activity happens, its outcomes should be documented separately
with real evidence.

## 16. Contribution and learning guidelines

1. Create a branch from `dev` (for example `fx/<topic>`) and keep changes
   focused on one concept at a time.
2. Keep feature code inside its module; shared logic belongs in the core
   directory.
3. Add or extend tests for services and controllers; keep `npm test` green.
4. Run the linter and formatter before opening a pull request.
5. Update the Swagger annotations and the API overview in section 8 when routes
   change.
6. Never commit `.env` files, API keys, tokens, private keys, signed payload
   fixtures, database dumps, or log files. Test helpers that need secrets must
   read them from the environment.
7. Write pull-request descriptions that explain the problem, the change, the
   alternatives considered, and how it was tested — this is part of the
   learning.
8. Do not change the repository's visibility, licence, or permissions as part
   of a learning exercise; those decisions stay with the repository owner.

## 17. Licence and usage

API Builder Lab is licensed under the [MIT License](LICENSE).

The MIT Licence permits use, modification, distribution, and reuse of the
software, subject to the terms in the licence file — including keeping the
copyright and permission notices in copies or substantial portions of the
software. See [MIT License](LICENSE) for the full terms.

Note: the licence applies to this repository's own code. It does not change
the licences of third-party dependencies or services, which remain under
their own terms.

If you notice that `package.json` metadata (such as the licence field) does
not yet match the `LICENSE` file, that is a known follow-up for the
repository owner to align — the `LICENSE` file is authoritative.

