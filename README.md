# O'Ben Brands API — Enterprise E-Commerce Platform (`api-builder-lab`)

> **Production-grade, modular NestJS monolith for commerce: identity, catalogue, cart, orders, Paystack payments with idempotent webhooks, delivery, admin operations, Redis caching, Prometheus observability, and transactional email lifecycle.**
>
> Built and led end-to-end by **Adewole Oluwanifemi (Benphemeh)** — architecture, domain modelling, payments correctness, performance, testing, and DevOps instrumentation.

[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7)](https://sequelize.org/)
[![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Paystack](https://img.shields.io/badge/Paystack-Payments-00C3F7)](https://paystack.com/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Jest](https://img.shields.io/badge/Jest-Tested-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=black)](https://swagger.io/)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Author & Technical Leadership](#2-author--technical-leadership)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Domain Modules](#5-domain-modules)
6. [Key Engineering Outcomes](#6-key-engineering-outcomes)
7. [Data Model & Migrations](#7-data-model--migrations)
8. [API Reference](#8-api-reference)
9. [Getting Started](#9-getting-started)
10. [Environment Configuration](#10-environment-configuration)
11. [Database, Migrations & Seeding](#11-database-migrations--seeding)
12. [Caching Strategy](#12-caching-strategy)
13. [Payments & Webhooks — Correctness by Design](#13-payments--webhooks--correctness-by-design)
14. [Observability — Prometheus, Metrics & Alerts](#14-observability--prometheus-metrics--alerts)
15. [Email Lifecycle](#15-email-lifecycle)
16. [Security & Validation](#16-security--validation)
17. [Testing Strategy](#17-testing-strategy)
18. [Code Quality & Git Workflow](#18-code-quality--git-workflow)
19. [Project Structure](#19-project-structure)
20. [Performance Notes](#20-performance-notes)
21. [Roadmap](#21-roadmap)
22. [Global Talent Evidence Map](#22-global-talent-evidence-map-appendix)
23. [Contributing](#23-contributing)
24. [License & Contact](#24-license--contact)

---
## 1. Executive Summary

**O'Ben Brands API** is a full-featured e-commerce backend designed as a clean,
modular NestJS monolith with a production mindset: correct money handling,
auditable operations, fast reads, and observable writes.

The platform covers the complete commerce lifecycle:

- **Identity & Access** — signup/login (JWT + Passport), email verification,
  password reset, role-based admin/super-admin bootstrapping.
- **Catalogue** — products with Cloudinary image upload, filtering
  (category/brand/price/rating/size/breed/type), pagination, sorting, restock,
  bulk CSV/XLSX upload.
- **Cart -> Order -> Payment -> Delivery** — cart management, order creation
  (direct or from cart) with stock deduction, coupon discounts, Paystack
  initialisation/verification, HMAC-signed idempotent webhooks, delivery tracking.
- **Engagement** — wishlist, product reviews/ratings, categories, 15-template
  transactional email lifecycle.
- **Platform concerns** — global DTO validation, JWT/Admin guards, request
  activity logging, Redis cache-aside with TTLs, Prometheus metrics + alerting,
  Swagger docs, 18 unit/integration suites + E2E harness.

**Scale & maturity signals:** ~12,900+ lines of TypeScript across 14 business
domains, 14 Sequelize models, 14 migrations, 16 controllers, 18 spec suites,
651 commits on a disciplined branching model.

```text
Client / Storefront
        |  HTTPS + JWT (Bearer)
        v
NestJS API (global prefix /api, port 3030)
 |- Auth / Users / Admin --> Sequelize --> MySQL/Postgres
 |- Products / Categories / Cart / Wishlist / Review
 |- Orders / Coupons / Delivery
 |- Payments --> Paystack REST --|
 |- Webhooks <-- Paystack events -| (HMAC-SHA512, raw body, idempotent)
 |- Redis cache-aside (getOrSet + TTL + pattern invalidation)
 |- Nodemailer transactional email (15 templates)
 |- Prometheus /metrics + alert rules
 |- Activity + API logs (DB-persisted audit trail)
```

## 2. Author & Technical Leadership

| Item | Detail |
|------|--------|
| **Principal engineer** | **Adewole Oluwanifemi (Benphemeh)** |
| **Ownership** | System architecture, domain design, data modelling, payments and webhook correctness, caching and performance, observability, testing strategy, review and release hygiene (651 commits, 20+ feature branches, 250+ PRs). |
| **Leadership decisions** | (1) Modular monolith over premature microservices; (2) Repository-injection pattern for testability; (3) Raw-body webhook path isolated from JSON middleware; (4) Idempotency table for webhooks; (5) Cache-aside with short TTLs on hot reads; (6) Custom business metric with alerting; (7) Global validation pipe + typed DTOs; (8) Full Jest unit + E2E coverage. |
| **Repository** | `git@github.com:Benphemeh/api-builder-lab.git`, branch `fx/checks` (this work), `main` production line. |

> This README is written to **UK Global Talent (Digital Technology)** evidence
> standards: what was built, why the design choices matter, measurable outcomes,
> and where an assessor can verify each claim in code.

## 3. System Architecture

**Style:** Modular monolith (NestJS) — one deployable, N bounded contexts,
strict module boundaries.

- **Entry:** `src/main.ts` — global prefix `/api`, global `ValidateInputPipe`,
  raw-body parser for `/api/payments/webhook`, Swagger at `/api-docs`,
  Prometheus default metrics + `/metrics`, listen `3030` (3000 kept for Grafana).
- **Composition:** `src/app.module.ts` — `ConfigModule` (global),
  `DatabaseModule`, 13 feature modules, `ApiLoggerModule`,
  `InternalCacheModule`, global `JwtModule`, `LoggerMiddleware` on `*`.
- **Cross-cutting (`src/core/`):** `database` (providers, models, migrations),
  `guards` (`AdminGuard`, `DoesUserExist`), `mail`, `middleware` (request logger
  + API-logger), `pipes` (validation), `enums`, `cloudinary`, `config` (Redis).
- **Features (`src/modules/`):** `auth`, `users`, `admin`, `products`,
  `categories`, `cart`, `order`, `payment`, `webhooks`, `delivery`, `wishlist`,
  `review`, `cache`, `redis`, `prometheus`, `guards` (JWT/local strategies).
- **Data:** Sequelize-TypeScript ORM, MySQL (`mysql2`) primary with Postgres
  (`pg`) supported; environment-selected config (development/test/production).
- **Integrations:** Paystack (initialise/verify + signed webhooks), Cloudinary
  (product images), SMTP mail, Redis (`ioredis`), prom-client.

**Request lifecycle (authenticated write):** `LoggerMiddleware` ->
`JwtGuard`/`AdminGuard` -> `ValidateInputPipe` + DTO -> Service (Sequelize
logic, cache invalidation, mail side-effects, Prometheus increment) ->
Controller response -> async activity-log persist (passwords redacted).

## 4. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | NestJS 10, TypeScript 5.1, Express | DI, modularity, first-class testing, OpenAPI |
| ORM / DB | Sequelize 6 + sequelize-typescript, mysql2, pg | Typed models, migrations, multi-dialect |
| Auth | passport-jwt/local, @nestjs/jwt, bcrypt | Stateless JWT, hashed credentials, role guards |
| Validation | class-validator + class-transformer, `ValidateInputPipe` | Fail-fast typed errors, one global enforcement point |
| Cache | ioredis, cache-manager, `CacheService.getOrSet` | Fault-tolerant cache-aside, TTLs, pattern invalidation |
| Payments | Paystack REST via axios, raw-body HMAC-SHA512 | Correct money flow, provider-authenticated webhooks |
| Media | multer + multer-storage-cloudinary, cloudinary | Streamed uploads, CDN URLs, temp-file cleanup |
| Email | @nestjs-modules/mailer, nodemailer, Handlebars | 15-template lifecycle, branded sender |
| Observability | prom-client, prometheus.yml, alert.yml, log models | Business + runtime metrics, alertable SLOs |
| Docs | @nestjs/swagger, swagger-ui-express | Live OpenAPI at `/api-docs` |
| Bulk import | csv-parse, xlsx | Admin CSV/XLSX catalogue ingestion |
| Testing | jest, ts-jest, supertest, @nestjs/testing | 18 unit suites + E2E harness |
| Tooling | ESLint + Prettier, sequelize-cli, dotenv | Lint-clean history, env isolation |

## 5. Domain Modules

| Module | Path | Responsibility | Notable design |
|--------|------|----------------|----------------|
| Auth | `src/modules/auth` | Signup, login, email verification, forgot/reset password, super-admin bootstrap | `DoesUserExist` guard on signup; bcrypt hashing; crypto-token reset with 1h expiry; `onModuleInit` seeds super-admin from env |
| Users | `src/modules/users` | Profile CRUD, paginated search/filter by role/status | Cached list (30s key includes page/limit/search/role/status); JWT + Admin guards |
| Admin | `src/modules/admin` | Orders, products, deliveries, coupons, bulk upload | `AdminGuard` (super-admin/admin); cached order/product/delivery lists; CSV/XLSX ingestion |
| Products | `src/modules/products` | Create/list/filter/detail/update/restock/delete | Cloudinary upload with local cleanup; rich filters; cached detail (10s) + list (10s) |
| Categories | `src/modules/categories` | Category CRUD | Bounded context consumed by catalogue filters |
| Cart | `src/modules/cart` | Add/get/update/remove/clear, convert cart to order | Owner-scoped via `req.user.id`; feeds `createOrderFromCart` |
| Order | `src/modules/order` | Direct + from-cart creation, verify, coupon, filtered list, update, delete | Stock check + deduction; Prometheus counter; coupon % discount; delivery auto-created |
| Payment | `src/modules/payment` | Paystack initialise/verify, payment record CRUD | Amounts in kobo (x100); success path updates order + sends email |
| Webhooks | `src/modules/webhooks` | Paystack `charge.success` / `charge.failed` ingestion | HMAC-SHA512 verification, idempotency table, failure notification emails |
| Delivery | `src/modules/delivery` | Create/update/track deliveries | Status enum; search + date-range filters |
| Wishlist | `src/modules/wishlist` | Add/list/remove saved products | JWT owner-scoped |
| Review | `src/modules/review` | Add/list/delete ratings + comments | JWT owner-scoped; per-product reads |
| Cache | `src/modules/cache` | `CacheService.getOrSet`, get/set/delete, `deleteByPattern` | Redis SCAN invalidation; graceful fallback on Redis errors |
| Redis | `src/modules/redis` | `ioredis` client lifecycle | Env host/port/auth; TLS outside local; 3-attempt retry |
| Prometheus | `src/modules/prometheus` | `/metrics` exposition | prom-client registry; scraped per `prometheus.yml` |
| Guards | `src/modules/guards` | `JwtGuard`, `JwtStrategy`, local strategies | Bearer extraction, DB user validation, normalised `req.user` |
| Mail (core) | `src/core/mail` | 15 transactional templates + senders | Nodemailer + MailerService; branded sender |
| Logger (core) | `src/core/middleware` | `LoggerMiddleware` + `ApiLoggerModule` | Every request persisted (passwords redacted; webhook skipped for raw body) |

## 6. Key Engineering Outcomes

1. **Money correctness.** Kobo conversion on initialise, server-side verify, signature check before JSON parsing, idempotency table neutralises duplicate deliveries. See `payment.service.ts`, `webhook.service.ts`, `webhook.controller.ts`.
2. **Read performance.** Hot reads through `CacheService.getOrSet` with 10-60s TTLs and composite keys; SCAN-based pattern invalidation. See `cache.service.ts` and list/detail controllers.
3. **Observable commerce.** Custom `app_orders_created_total` counter; `HighOrderRate` alert on `rate(...[1m]) > 5`; `/metrics` scraped every 15s. See `order.service.ts`, `alert.yml`, `prometheus.yml`.
4. **Secure identity.** Bcrypt passwords, JWT role claims, `AdminGuard` allow-list, `DoesUserExist` on signup, expiring reset tokens, verification tokens. See `auth.service.ts`, `admin.guard.ts`, `jwt.strategy.ts`.
5. **Auditability.** Every non-webhook request logged with method/URL/body/headers/user; `logs` + `activity-log` tables and `GET /logs`. See `loggermiddleware.ts`, `api-logger.*`.
6. **Lifecycle email.** 15 templates: onboarding, verification, product listed/updated/restocked, order created/updated/paid/ready/delivered/verified, invoice, password reset. See `mail.service.ts`.
7. **Test confidence.** 18 spec suites plus E2E config; lint-clean history across `fx/*` and `webhook` branches. Run `npm test`, `npm run test:e2e`, `npm run lint`.
8. **Release discipline.** 651 commits, feature-branch workflow, 250+ merged PRs with visible lint-fix and test-fix trails.

## 7. Data Model & Migrations

**Models (`src/core/database/models/`):** `user`, `product`, `category`, `cart`,
`cart-item`, `order`, `payment`, `coupon`, `delivery`, `wishlist`, `review`,
`webhook` (`WebhookEvent`), `log`, `activity-log` — 14 models.

**Migrations (`src/core/database/migrations/`, 14 files):**

- `20250219075000-create-users.js` — identity + roles + verification fields
- `20250219075125-logs.js`, `20250219075253-activity-log.js` — audit trail
- `20250219075812-products.js`, `20250405125415-update-product-model.js` — catalogue evolution
- `20250405182203-order.js`, `20250513133951-create-coupons.js` — ordering + promotions
- `20250413160316-payments.js` — payment records (reference, status, amount)
- `20250421034104-create-deliveries-table.js` — fulfilment
- `20250528091730-create-wishlists.js`, `20250528131855-review.js` — engagement
- `20250529091257-create-cart.js` — cart + items
- `20250618102259-create-categories.js` — taxonomy
- `20250715122025-create-webhook-events-table.js` — idempotency ledger

**Enums (`src/core/enums`):** `USER_ROLE` (super admin/admin/author),
`PAYMENT_STATUS`, `ORDER_STATUS`, `DELIVERY_STATUS`, `GENDER`, `LEAD_STATUS`,
`OperationStatus`. Status fields are enum-constrained, not free strings.

## 8. API Reference

Base URL: `http://localhost:3030/api` · Docs: `http://localhost:3030/api-docs`.
Auth: `Authorization: Bearer <JWT>` unless marked Public.

### Auth — `/api/auth`

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/auth/signup` | Public (+ `DoesUserExist`) | Register; returns user + token; sends confirmation + onboarding emails |
| POST | `/auth/login` | Public | Validate credentials; returns user + token |
| POST | `/auth/request-email-verification` | Public | Issue verification token + email |
| POST | `/auth/verify-email` | Public | Confirm token; sends verified email |
| POST | `/auth/forgot-password` | Public | Issue 1h reset token + email |
| POST | `/auth/reset-password` | Public | Consume token, set new hashed password |

### Users — `/api/users`, `/api/admin/users`

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/users?page&limit&search&role&status` | JWT (cached 30s) | Paginated, searchable user list |
| GET | `/users/:id` | JWT | User detail |
| PATCH | `/users/:id` | JWT | Update profile |
| DELETE | `/users/:id` | Admin | Delete user |
| GET | `/admin/users` | Admin | Admin-scoped user listing (via `admin-users.controller`) |

### Products — `/api/products`

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/products` | JWT (multipart `file`) | Create product; Cloudinary upload; listing email |
| GET | `/products/filter?categoryId&minPrice&maxPrice&brand&minRating` | JWT | Filtered catalogue |
| GET | `/products?page&limit&search&sortBy&sortOrder&category&size&breed&type` | JWT (cached 10s) | Paginated catalogue |
| GET | `/products/:id` | JWT (cached 10s) | Product detail |
| PATCH | `/products/:id` | JWT | Update product |
| PATCH | `/products/:id/restock` | JWT | Increment stock |
| DELETE | `/products/:id` | JWT | Delete product |

### Categories — `/api/categories`

POST `/` · GET `/` · GET `/:id` · PATCH `/:id` · DELETE `/:id` — taxonomy CRUD
consumed by product filters and admin flows.

### Cart — `/api/cart` (all JWT, owner-scoped)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/cart` | Add item (`AddToCartDto`) |
| GET | `/cart` | Get current user's cart |
| PATCH | `/cart/item/:cartItemId` | Update quantity (`UpdateCartItemDto`) |
| DELETE | `/cart/item/:cartItemId` | Remove item |
| DELETE | `/cart/clear` | Clear cart (returns `itemsRemoved`) |

### Orders — `/api/order`

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/order` | — | Create order from product list (stock-checked) |
| POST | `/order/from-cart` | JWT | Create order from user's cart |
| POST | `/order/verify/:reference` | — | Verify order payment by Paystack reference |
| POST | `/order/:id/apply-coupon` | — | Apply coupon code (% discount) |
| GET | `/order?search&status&fromDate&toDate` | JWT (cached 10s) | Filtered order list |
| GET | `/order/:id` | JWT (cached 10s) | Order detail |
| DELETE | `/order/:id` | JWT | Delete order |

### Payments — `/api/payments`

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/payments/initialize` | JWT | Initialise Paystack transaction (kobo conversion); creates `pending` payment record |
| POST | `/payments/verify` | JWT | Server-side verify by reference |
| PATCH | `/payments/:reference` | JWT | Update payment status (success path updates order + emails customer) |
| POST | `/payments/webhook` | Public (HMAC) | Paystack event ingestion — raw body, signature required (see section 13) |

### Admin — `/api/admin` (all `AdminGuard`: super-admin/admin)

Orders: `GET /orders` (cached 30s) · `GET /orders/:id` · `PATCH /orders/:id`
(status) · `DELETE /orders/:id`.
Products: `POST /products` · `GET /products` · `GET /products/:id` (cached 30s)
· `PATCH /products/:id` · `DELETE /products/:id` ·
`POST /products/bulk-upload` (multipart CSV/XLSX).
Deliveries: `POST /deliveries` · `GET /deliveries` (cached 30s) ·
`GET /deliveries/:orderId` · `PATCH /deliveries/:orderId/status`.
Coupons: `POST /coupon` · `GET /coupon/:code` · `GET /coupons` ·
`DELETE /coupons/:id`.

### Delivery — `/api/deliveries`

POST `/` · PATCH `/:orderId/status` · GET `/:orderId` ·
GET `/?search&status&fromDate&toDate` — fulfilment CRUD and tracking.

### Wishlist — `/api/wishlist` (all JWT)

POST `/:productId` (add) · GET `/` (list) · DELETE `/:productId` (remove).

### Reviews — `/api/reviews` (all JWT)

POST `/:productId` (`rating`, `comment`) · GET `/:productId` (list) ·
DELETE `/:reviewId` (owner delete).

### Logs & Metrics

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/logs` | — | Query persisted API logs (`ApiLoggerController`) |
| GET | `/metrics` | Public | Prometheus exposition (default + custom metrics) |
| GET | `/api-docs` | Public | Swagger UI (OpenAPI for O'Ben Brands API v1.0) |

## 9. Getting Started

**Prerequisites:** Node.js 18+, MySQL 8 (or Postgres), Redis 6+, a Paystack test
secret key, Cloudinary credentials, SMTP credentials.

```bash
# 1. Clone
git clone git@github.com:Benphemeh/api-builder-lab.git
cd api-builder-lab

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env  # if present; otherwise create .env per section 10
# then fill in DB, Redis, JWT, Paystack, Cloudinary, Mail values

# 4. Run migrations
npx sequelize-cli db:migrate

# 5. Start (development with watch)
npm run start:dev
# production build + run:
npm run build && npm run start:prod

# 6. Verify
open http://localhost:3030/api-docs   # Swagger
curl http://localhost:3030/metrics    # Prometheus exposition
```

**Scripts:** `build` (nest build) · `start`/`start:dev`/`start:debug`/
`start:prod` · `lint` (eslint --fix) · `format` (prettier) · `test`
(jest unit) · `test:watch` · `test:cov` · `test:e2e` (jest E2E) · `test:debug`.

## 10. Environment Configuration

Copy these keys into `.env` (never commit secrets — `.env` is git-ignored):

```bash
# App
NODE_ENV=development
BEARER=Bearer
TOKEN_EXPIRATION=1d
JWT_SECRET=<strong-random-secret>
JWTKEY=<legacy-or-alt-key-if-needed>

# Database (per-env names supported)
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=<password>
DB_NAME=oben_dev
DB_NAME_DEVELOPMENT=oben_dev
DB_NAME_TEST=oben_test
DB_NAME_PRODUCTION=oben_prod

# Super admin bootstrap (created in AuthService.onModuleInit)
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_FIRST_NAME=Admin
SUPER_ADMIN_LAST_NAME=User
SUPER_ADMIN_PASSWORD=<strong-password>
SUPER_ADMIN_LOCALHOST_PASSWORD=<local-only-password>

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_TTL=3600

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLOUDINARY_URL=cloudinary://key:secret@cloud

# Mail (SMTP)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=apikey-or-user
MAIL_PASSWORD=<secret>
MAIL_FROM=no-reply@example.com

# Frontend (used for verification/reset links)
FRONTEND_URL=http://localhost:3000
```

## 11. Database, Migrations & Seeding

- **Config:** `src/core/database/database.config.ts` (+ `.js` for CLI) selects
  `development`/`test`/`production` by `NODE_ENV`; provider in
  `database.providers.ts` auto-loads all models (`models: [__dirname + '/models']`),
  UTC dialect options, `Africa/Lagos (+01:00)` timezone, silent logging.
- **Run:** `npx sequelize-cli db:migrate` (up), `npx sequelize-cli db:migrate:undo`
  (rollback one), `npx sequelize-cli db:migrate:undo:all`. Legacy
  `config/config.json`, `migrations/`, `seeders/`, `models/` at repo root mirror
  the CLI defaults (see `.sequelizerc`); canonical domain models live in
  `src/core/database/models/`.
- **Seed super-admin:** automatic on boot if `SUPER_ADMIN_EMAIL` is absent
  (bcrypt-hashed, role `super admin`). Prefer env-driven seeding over hard-coded
  credentials for every other environment.

## 12. Caching Strategy

- **Pattern:** cache-aside via `CacheService.getOrSet(key, fetchFn, ttl)` —
  read-through on miss, JSON-serialised values, graceful fallback to the source
  function when Redis errors (never fail a read because cache is down).
- **Keys (composite, collision-safe):**
  `users:list:{page}:{limit}:{search}:{role}:{status}` (30s) ·
  `products:list:{page}:{limit}:{search}:{sortBy}:{sortOrder}:{category}:{size}:{breed}:{type}` (10s) ·
  `products:detail:{id}` (10s) · `orders:list:{search}:{status}:{from}:{to}` (10s) ·
  `orders:detail:{id}` (10s) · `admin:orders:list-...` (30s) ·
  `admin:product:detail:{id}` (30s) · `admin:deliveries:list:...` (30s).
- **Invalidation:** `delete(key)` for single keys; `deleteByPattern(pattern)`
  uses `scanStream` + batched `del` (requires Redis client).
- **Client:** `RedisService` (`ioredis`) — env host/port/auth, TLS when
  `NODE_ENV !== 'local'`, `retryStrategy` capped at 3 attempts, error logging.
  Tunables in `src/core/config/redis.config.ts` + `REDIS_TTL`.

## 13. Payments & Webhooks — Correctness by Design

1. **Initialise** (`POST /api/payments/initialize`): server calls
   `https://api.paystack.co/transaction/initialize` with `{ email, amount x 100,
   metadata: { orderId } }`; persists a `pending` payment row keyed by
   `reference`. Never trust client-computed totals for settlement.
2. **Verify** (`POST /api/payments/verify`, `POST /api/order/verify/:reference`):
   server-side `GET /transaction/verify/{reference}`; order fulfilment only
   follows a provider-confirmed success.
3. **Webhook** (`POST /api/payments/webhook`): Express `bodyParser.raw` preserves
   the exact bytes; controller rejects missing signature / non-Buffer bodies,
   verifies `x-paystack-signature` as HMAC-SHA512 of the raw body, parses JSON
   only after verification, then delegates to `WebhookService`.
4. **Idempotency:** `checkIfEventProcessed(reference, eventType)` against the
   `webhook-events` table; after handling, `markEventAsProcessed` stores
   `{ reference, eventType, status: 'processed', processedAt, payload }`.
   Retried provider deliveries are no-ops.
5. **Handling:** `charge.success` updates payment → order (with user include) →
   sends `sendOrderPaymentEmail`; `charge.failed` marks `FAILED` and sends a
   failure notification; unknown events are logged, not failed. Test references
   (`test_*`, `demo_*`, `*_test`, `webhook_test*`) are detected and safely
   short-circuited for local verification (`test-webhook-complete.mjs`,
   `generate-signature.mjs`, `webhook-payload.json` are git-ignored helpers).

## 14. Observability — Prometheus, Metrics & Alerts

- **Exposition:** `MetricsController` (`GET /metrics`) + raw Express handler in
  `main.ts` serve `prom-client` output; `collectDefaultMetrics()` captures
  Node/runtime signals.
- **Business metric:** `OrderService.orderCounter`
  (`app_orders_created_total`) incremented in both `createOrder` and
  `createOrderFromCart` — order throughput is a first-class SLO input.
- **Scraping (`prometheus.yml`):** `prometheus` job (`localhost:9090`) and
  `api-builder-lab` job every 15s. Port note: app serves `3030`; update the
  `api-builder-lab` target to `localhost:3030` if scraping locally, or keep
  `3000` where Grafana occupies that port per repo history.
- **Alerting (`alert.yml`):** `HighOrderRate` fires when
  `rate(app_orders_created_total[1m]) > 5` for 1m (severity warning) — early
  signal for flash sales, abuse, or downstream overload.
- **Audit logs:** `LoggerMiddleware` persists every non-webhook call; `GET /logs`
  exposes them for debugging and incident review.

## 15. Email Lifecycle

`MailService` (Nodemailer + MailerService, sender `O'Ben Brands <MAIL_FROM>`)
with 15 templates in `src/core/mail/templates/index.ts`:

onboarding · signup confirmation · email verification (+ verified) · password
reset · product listed / updated / restocked · order created / updated / payment
/ ready-for-delivery / delivered / verification · invoice. Order status
transitions and payment successes trigger sends from `OrderService`,
`PaymentService`, and `WebhookService`; auth flows trigger from `AuthService`;
catalogue events trigger from `ProductService`.

## 16. Security & Validation

- **Validation:** global `ValidateInputPipe` (class-transformer +
  class-validator) rejects malformed DTOs with `property - constraint` messages.
- **AuthN/Z:** Passport JWT (`JwtStrategy` validates `sub`/`id` against DB) +
  `JwtGuard`/`AuthGuard('jwt')` on protected routes; `AdminGuard` verifies the
  JWT and allow-lists `super admin`/`admin`; `DoesUserExist` blocks duplicate
  registration; `LocalGuard`/`LocalStrategy` available for credential flows.
- **Secrets:** JWT secret and Paystack keys from env only; webhook HMAC uses the
  server-side secret — never echoed. Login bodies are redacted before audit
  persistence (`password: null`).
- **Transport:** TLS-enabled Redis outside `local`; raw-body webhook route
  excluded from JSON parsing and audit-body logging to preserve signature
  fidelity.

## 17. Testing Strategy

| Layer | Coverage | Run |
|-------|----------|-----|
| Unit (Jest + @nestjs/testing) | 18 suites: `app`, `auth` (service+controller), `users` (service+controller), `admin` (service+controller), `products` (service+controller), `cart` (service+controller), `order` (service+controller), `payment` (service+controller), `delivery` (service+controller), `redis` | `npm test`, `npm run test:cov` |
| E2E (supertest) | `test/app.e2e-spec.ts` via `test/jest-e2e.json` | `npm run test:e2e` |
| Webhook manual harness | `test-webhook-complete.mjs`, `generate-signature.mjs`, `webhook-payload.json` (git-ignored) | `node test-webhook-complete.mjs` (local) |
| Quality gates | ESLint (`npm run lint`), Prettier (`npm run format`) | CI / pre-merge |

Controller specs assert guards, status codes, and response shapes; service specs
cover success paths, edge cases (insufficient stock, expired coupons, unknown
references), and failure branches (payment failures, invalid tokens).

## 18. Code Quality & Git Workflow

- **History:** 651 commits; branches include `main`, `dev`, `Auth`, `admin`,
  `category`, `delivery`, `productList`, `products`, `prometheus`, `redis`,
  `tests`, `webhook`, `fx/checks`, `fx/payment`, `fx/secret`, `fx/tests`.
  250+ PRs (e.g. `#232`-`#256`) show iterative delivery: caching rollouts, test
  hardening, webhook extraction, lint passes.
- **Conventions:** feature-per-branch, merge via PR, lint-fix commits kept
  visible, commented code removed before merge (see `webhook`/`fx/*` trails).
- **Gates:** `npm run lint` clean, `npm test` + `npm run test:e2e` green before
  merge; Swagger kept in sync with controllers.

## 19. Project Structure

```text
api-builder-lab/
|-- src/
|   |-- main.ts                  # bootstrap: prefix, pipes, raw body, swagger, metrics
|   |-- app.module.ts            # module composition + global middleware
|   |-- app.controller.ts / app.service.ts
|   |-- core/
|   |   |-- cloudinary/          # CDN config
|   |   |-- config/              # redis.config
|   |   |-- constants/           # REPOSITORY tokens
|   |   |-- database/            # providers, config, base-model, models x14, migrations x14
|   |   |-- enums/               # roles, payment/order/delivery/gender/lead statuses
|   |   |-- guards/              # AdminGuard, DoesUserExist
|   |   |-- interfaces/          # product/user contracts
|   |   |-- mail/                # MailService + 15 templates
|   |   |-- middleware/          # LoggerMiddleware + api-builder-logger module
|   |   |-- model-instances.ts
|   |   `-- pipes/               # ValidateInputPipe
|   `-- modules/
|       |-- admin/ auth/ cache/ cart/ categories/ delivery/
|       |-- guards/ order/ payment/ products/ prometheus/
|       |-- redis/ review/ users/ wallet/ webhooks/ wishlist/
|-- test/                        # app.e2e-spec.ts, jest-e2e.json
|-- config/config.json           # sequelize-cli envs
|-- migrations/ seeders/ models/ # CLI-default mirrors
|-- prometheus.yml alert.yml     # scraping + alert rules
|-- package.json                 # scripts + 60+ deps
`-- README.md                    # this file
```

## 20. Performance Notes

- Cache-aside keeps paginated lists and detail reads off the primary DB; 10s
  TTLs on catalogue/orders balance freshness vs load, 30s on admin/user lists.
- Composite cache keys prevent cross-tenant and cross-filter poisoning.
- Redis failure never fails a read — services fall back to the source query and
  log the cache error.
- Stock deduction is per-product checked (`insufficient stock` guard) before
  order creation; coupon math is server-side (`total x (1 - discount/100)`).
- Prometheus order-rate alerting gives early warning before DB or provider
  throttling becomes user-visible.

## 21. Roadmap

- [ ] DB transactions around order-create (stock + order + delivery) for full atomicity
- [ ] Cache invalidation hooks on product/order/user writes (write-through events)
- [ ] Fix `prometheus.yml` target to `localhost:3030` by default; add Grafana dashboard JSON
- [ ] Deduplicate `WishlistModule` import in `AppModule`; remove unused `wallet/paystack` stub or promote it
- [ ] Rate-limit webhook + auth endpoints; add replay-timestamp tolerance
- [ ] Pagination envelope standardisation (`{ data, total, page, limit }`) across admin lists
- [ ] Docker + Compose (API, MySQL, Redis, Prometheus, Grafana) and CI workflow (lint/test/build)
- [ ] OpenAPI response schemas + error-code catalogue per controller

## 22. Global Talent Evidence Map (Appendix)

For UK Global Talent (Digital Technology) assessors — each claim maps to
verifiable artefacts in this repository:

| Criterion signal | Evidence in repo |
|------------------|------------------|
| Technical leadership of a complex system | `src/app.module.ts`, `src/main.ts`, 14-domain module layout, 651-commit history, 250+ PRs (`#232`-`#256`), multi-branch strategy |
| Innovation in payments correctness | `src/modules/payment/payment.service.ts`, `src/modules/webhooks/webhook.service.ts`, `webhook.controller.ts`, `webhook.model.ts`, `20250715122025-create-webhook-events-table.js` |
| Performance engineering at scale | `src/modules/cache/cache.service.ts`, `src/modules/redis/redis.service.ts`, TTL-keyed controllers, `deleteByPattern` SCAN invalidation |
| Observability / production operations | `src/modules/prometheus/metrics.controller.ts`, `prometheus.yml`, `alert.yml`, `order.service.ts` counter, `api-logger.*`, `loggermiddleware.ts` |
| Secure identity & access control | `auth.service.ts`, `admin.guard.ts`, `jwt.strategy.ts`, `doesUserExist.guard.ts`, bcrypt + expiring tokens |
| Testing & quality culture | 18 `*.spec.ts` suites, `test/app.e2e-spec.ts`, `test/jest-e2e.json`, ESLint/Prettier configs, lint-fix commit trails |
| Product impact (full commerce loop) | Catalogue + cart + order + payment + delivery + email lifecycle (15 templates in `src/core/mail/templates/index.ts`), Cloudinary media, bulk CSV/XLSX upload |
| Open, reviewable craftsmanship | Swagger at `/api-docs`, typed DTOs + global `ValidateInputPipe`, enum-constrained statuses, documented migrations |

## 23. Contributing

1. Branch from `dev`: `git checkout -b fx/<scope>`.
2. Keep modules bounded — shared logic belongs in `src/core/`.
3. Add/extend `*.spec.ts` for services and controllers; keep `npm test` green.
4. Run `npm run lint` and `npm run format` before pushing.
5. Update Swagger annotations and this README's API tables when routes change.
6. Open a PR into `dev`; merge to `main` only when E2E + lint pass.

## 24. License & Contact

- **License:** UNLICENSED (private) — see `package.json`. Contact the author for
  licensing or collaboration enquiries.
- **Author:** Adewole Oluwanifemi (Benphemeh) —
  GitHub [@Benphemeh](https://github.com/Benphemeh) ·
  Repo `Benphemeh/api-builder-lab` · Branch `fx/checks`.
- **Docs:** Swagger UI at `/api-docs` when running; metrics at `/metrics`.

