# 03. Backend Folder Structure: Modular & Production-Ready

## 1. Directory Tree Visualization

Below is the complete project directory structure designed for our modular monolith. It balances strict separation of domain concerns with practical simplicity:

```
lead-management-backend/
├── docs/                                # Architectural & Operational Documentation
│   ├── 00-project-overview.md
│   ├── 01-business-requirements.md
│   ├── 02-system-architecture.md
│   ├── 03-backend-folder-structure.md
│   ├── 04-postgresql-fundamentals.md
│   ├── 05-database-design.md
│   ├── 06-entity-relationship-diagram.md
│   ├── 07-meta-ingestion-architecture.md
│   ├── 08-api-design.md
│   ├── 09-security-and-configuration.md
│   ├── 10-testing-strategy.md
│   ├── 11-future-roadmap.md
│   └── 12-architecture-decisions.md
│
├── src/                                 # TypeScript Application Source Code
│   ├── config/                          # Configuration & Environment Parsing
│   │   ├── env.schema.ts                # Zod schema for runtime validation of .env
│   │   └── index.ts                     # Typed configuration export singleton
│   │
│   ├── core/                            # Shared Infrastructure Across All Modules
│   │   ├── database/                    # Database Connection Pool & Client
│   │   │   ├── client.ts                # PostgreSQL connection pool (pg.Pool)
│   │   │   └── index.ts                 # Drizzle instance initialized with pool
│   │   ├── errors/                      # Application Error Classes & Envelopes
│   │   │   ├── app-error.ts             # Base AppError class
│   │   │   ├── not-found-error.ts       # 404 handler
│   │   │   ├── validation-error.ts      # 422 handler
│   │   │   └── error-handler.ts         # Fastify global error plugin (RFC 7807)
│   │   ├── logger/                      # Structured Logging System
│   │   │   └── index.ts                 # Pino logger configuration
│   │   └── middleware/                  # Global HTTP Middlewares / Plugins
│   │       ├── correlation-id.ts        # x-request-id injection
│   │       └── rate-limiter.ts          # IP / Token rate limiter
│   │
│   ├── db/                              # Database Schema & Migrations
│   │   ├── migrations/                  # Generated SQL migration files (drizzle-kit)
│   │   ├── schema/                      # Drizzle Schema Definitions by Table
│   │   │   ├── business-units.ts        # business_units table
│   │   │   ├── meta-accounts.ts         # meta_business_accounts, meta_ad_accounts
│   │   │   ├── meta-entities.ts         # meta_campaigns, meta_ad_sets, meta_ads
│   │   │   ├── meta-insights.ts         # meta_insights_daily
│   │   │   ├── meta-sync.ts             # meta_sync_runs, meta_sync_errors
│   │   │   └── index.ts                 # Aggregated schema export
│   │   └── seeds/                       # Seed Data for Local Development
│   │       └── initial-seed.ts          # Inserts initial BUs (Vastu, Webinars)
│   │
│   ├── modules/                         # Feature Modules (Domain Encapsulation)
│   │   │
│   │   ├── health/                      # Health Check & Readiness Probes
│   │   │   ├── health.controller.ts
│   │   │   └── health.routes.ts
│   │   │
│   │   ├── business-units/              # Business Unit Management
│   │   │   ├── business-unit.schema.ts  # Zod validation schemas
│   │   │   ├── business-unit.repo.ts    # Database query methods
│   │   │   ├── business-unit.service.ts # Core business logic
│   │   │   ├── business-unit.controller.ts
│   │   │   └── business-unit.routes.ts  # Fastify route declarations
│   │   │
│   │   ├── meta-ads/                    # Meta Marketing Ingestion (Phase 1 Target)
│   │   │   ├── dto/                     # Data Transfer Objects
│   │   │   │   ├── sync-request.dto.ts
│   │   │   │   └── meta-graph-response.dto.ts
│   │   │   ├── adapters/                # Third-Party API Clients
│   │   │   │   └── meta-graph.adapter.ts # Communicates with graph.facebook.com
│   │   │   ├── meta-ads.schema.ts       # Zod validation for endpoints
│   │   │   ├── meta-ads.repo.ts         # SQL upserts for campaigns, ads, insights
│   │   │   ├── meta-ads.service.ts      # Synchronization workflow orchestration
│   │   │   ├── meta-ads.controller.ts   # API endpoints to trigger/inspect syncs
│   │   │   └── meta-ads.routes.ts       # Fastify route registration
│   │   │
│   │   ├── leads/                       # Future Module (Phase 2): Landing Page Leads
│   │   │   └── .gitkeep                 # Module boundary reserved
│   │   │
│   │   └── orders/                      # Future Module (Phase 3): Orders & Payments
│   │       └── .gitkeep                 # Module boundary reserved
│   │
│   ├── app.ts                           # Fastify App Assembly (Plugins, Routes)
│   └── server.ts                        # Server Entry Point (Listens on PORT)
│
├── tests/                               # Test Suites
│   ├── unit/                            # Pure function & validation tests
│   ├── integration/                     # Database and API endpoint tests
│   └── fixtures/                        # Synthetic test data & mock payloads
│
├── .env.example                         # Documented template of required variables
├── .gitignore                           # Git exclusions (node_modules, .env, dist)
├── drizzle.config.ts                    # Drizzle ORM migration configuration
├── package.json                         # Dependencies and build scripts
└── tsconfig.json                        # Strict TypeScript compiler configuration
```

---

## 2. Directory Responsibilities & Why They Exist

### `src/config/`
- **Why it exists**: Applications frequently fail in production when environment variables are missing, misnamed, or improperly formatted.
- **Responsibility**: Uses Zod to parse `process.env`. If `DATABASE_URL` is missing or not a valid URI, the server refuses to start immediately and outputs a clear error message. Code imports configuration from `src/config/index.ts`, never raw `process.env`.

### `src/core/`
- **Why it exists**: Shared low-level utilities and infrastructure that do not belong to any specific business domain.
- **Sub-packages**:
  - `database/`: Establishes the reusable PostgreSQL connection pool.
  - `errors/`: Custom error classes ensuring every error has an HTTP status code, an internal error code, and friendly messages.
  - `logger/`: Pre-configured Pino instance with redaction of sensitive fields (passwords, tokens).
  - `middleware/`: Fastify hooks for request logging, correlation ID tracking, and security headers.

### `src/db/`
- **Why it exists**: The single source of truth for database definition and schema evolution.
- **Sub-packages**:
  - `schema/`: TypeScript files defining tables, columns, relations, and indexes using Drizzle ORM.
  - `migrations/`: Auto-generated SQL files produced by `drizzle-kit generate`. These files are committed to Git and executed on deployment.
  - `seeds/`: Idempotent scripts that populate baseline data (e.g., initial `business_units`).

### `src/modules/` (Domain-Driven Organization)
- **Why it exists**: Prevents code sprawl. All files related to a specific business area (e.g., `meta-ads`) live inside that module's folder, rather than scattering controllers into a global `/controllers` folder, models into `/models`, etc.
- **Standard Module Pattern**:
  - `*.schema.ts`: Zod validation rules for HTTP requests and API responses.
  - `*.routes.ts`: Fastify route declarations (`app.get(...)`, `app.post(...)`).
  - `*.controller.ts`: HTTP request unboxing and response packing.
  - `*.service.ts`: Core business logic, coordination, and algorithms.
  - `*.repo.ts`: Direct database interaction and SQL queries.
  - `adapters/`: HTTP clients communicating with external vendor APIs.

---

## 3. Code Conventions and Standards

1. **File Naming**: All filenames use lower-case `kebab-case.ts` (e.g. `meta-graph.adapter.ts`, `app-error.ts`). No camelCase or PascalCase file names to prevent Windows-vs-Linux filesystem casing bugs.
2. **Strict Exports**: Prefer named exports (`export const ...`) over default exports (`export default ...`). Named exports make code navigation and auto-imports explicit and unambiguous.
3. **No Circular Dependencies**: A module may import from `core` or `config`. A module may import another module's public service, but module A must never import from module B if module B imports from module A.
4. **Clean Boundaries**: Controllers never call Repositories directly. Controllers always go through Services. Services never access `FastifyRequest` or `FastifyReply`.
