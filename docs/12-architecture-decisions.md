# 12. Architecture Decision Records (ADRs)

## Index of Architectural Decisions

- [ADR 001: Modular Monolith Architecture vs Microservices](#adr-001-modular-monolith-architecture-vs-microservices)
- [ADR 002: Fastify as Primary HTTP Engine over Express.js](#adr-002-fastify-as-primary-http-engine-over-expressjs)
- [ADR 003: Drizzle ORM for Data Access and Schema Migrations](#adr-003-drizzle-orm-for-data-access-and-schema-migrations)
- [ADR 004: Native Windows PostgreSQL vs Docker Desktop for Local Development](#adr-004-native-windows-postgresql-vs-docker-desktop-for-local-development)
- [ADR 005: Exact Numeric Data Types (`NUMERIC`) for Financial Accuracy](#adr-005-exact-numeric-data-types-numeric-for-financial-accuracy)
- [ADR 006: Deterministic Idempotent Upsert Strategy for Third-Party Ingestion](#adr-006-deterministic-idempotent-upsert-strategy-for-third-party-ingestion)
- [ADR 007: Mandatory Server-Side Evidence for Payment State Transitions](#adr-007-mandatory-server-side-evidence-for-payment-state-transitions)

---

### ADR 001: Modular Monolith Architecture vs Microservices

#### Status: ACCEPTED
#### Context
We are engineering an enterprise Lead Management Platform supporting multiple marketing channels, payment funnels, and future CRM workflows. A key architectural decision is whether to start with distributed microservices or a single codebase.

#### Decision
We will build a **Modular Monolith** in TypeScript / Node.js. All business domains (Meta Ads, Leads, Orders, Payments, AI Outreach) live within a single repository and execute within a single runtime process, but maintain strict module boundaries and isolated database schemas.

#### Consequences
- **Positive**: Zero network overhead for internal communication; shared database connection pool; atomic ACID transactions across domains; simple local development and CI/CD.
- **Negative**: If a memory leak occurs in one module, it affects the entire process.
- **Mitigation**: Strict domain isolation; linting rules preventing cross-module database access; clean service interfaces that can be extracted into microservices in the future if scale warrants.

---

### ADR 002: Fastify as Primary HTTP Engine over Express.js

#### Status: ACCEPTED
#### Context
Express.js is the traditional default for Node.js backends. Fastify is a modern, high-performance alternative.

#### Decision
We select **Fastify** as the HTTP framework.

#### Consequences
- **Positive**: 2x to 4x higher request throughput; built-in JSON schema compilation; native integration with Pino for structured JSON logging; first-class plugin encapsulation system.
- **Negative**: Slightly smaller ecosystem of third-party middleware compared to Express.
- **Mitigation**: Fastify supports `@fastify/express` compatibility bridge if legacy middleware is ever required.

---

### ADR 003: Drizzle ORM for Data Access and Schema Migrations

#### Status: ACCEPTED
#### Context
We need a type-safe database layer for PostgreSQL. The primary candidates are Prisma, Drizzle ORM, and Kysely.

#### Decision
We select **Drizzle ORM** paired with `drizzle-kit` for schema migrations.

#### Consequences
- **Positive**: Zero runtime overhead (compiles directly to parameterized SQL strings); full TypeScript type inference; schema defined in pure TypeScript; lightweight (no 40MB Rust query engine binaries like Prisma); excellent support for complex PostgreSQL features (`ON CONFLICT`, window functions, JSONB).
- **Negative**: Developers must write explicit SQL joins rather than deeply nested relation object queries.
- **Mitigation**: This is an educational and architectural advantage; writing explicit queries teaches real SQL and prevents the catastrophic "N+1 query problem" common in traditional ORMs.

---

### ADR 004: Native Windows PostgreSQL vs Docker Desktop for Local Development

#### Status: ACCEPTED
#### Context
The developer is working on a Windows environment. PostgreSQL can be installed natively or run in Docker Desktop. Inspection of the host system shows Docker Desktop is **not installed**.

#### Decision
We recommend and guide the **Native Windows PostgreSQL installer (v16 or v17)**.

#### Consequences
- **Positive**: Zero prerequisites; avoids the heavy resource overhead of Docker Desktop and WSL2 (~4GB RAM); native Windows service execution; includes pgAdmin 4 for visual database inspection; free open-source license without corporate licensing restrictions.
- **Negative**: Database binaries run directly on the host OS.
- **Mitigation**: Provide exact instructions for database creation, least-privilege users, and safe script resets.

---

### ADR 005: Exact Numeric Data Types (`NUMERIC`) for Financial Accuracy

#### Status: ACCEPTED
#### Context
Advertising spend and payment amounts can include fractional units (cents, paisas). IEEE-754 floating-point numbers (`FLOAT`, `DOUBLE PRECISION`, JavaScript `number`) suffer from binary representation errors (e.g. `0.1 + 0.2 = 0.30000000000000004`).

#### Decision
All financial figures (ad spend, order totals, payment amounts, CPC, CPM) must be stored in PostgreSQL as **`NUMERIC(14, 4)`**. Floating-point types are strictly forbidden.

#### Consequences
- **Positive**: 100% mathematical accuracy; prevents rounding discrepancies in financial ledgers and tax audits.
- **Negative**: Requires string or BigNumber handling in JavaScript to avoid floating-point cast in memory.
- **Mitigation**: Drizzle ORM maps `NUMERIC` to string or custom decimal types by default.

---

### ADR 006: Deterministic Idempotent Upsert Strategy for Third-Party Ingestion

#### Status: ACCEPTED
#### Context
Third-party APIs (Meta Graph API, webhooks) can send the same record multiple times due to retries, backfills, or scheduled sync overlaps.

#### Decision
All marketing ingestion queries use PostgreSQL **`INSERT ... ON CONFLICT (...) DO UPDATE`** (Upsert) keyed on natural vendor identifiers (`meta_campaign_id`, `meta_ad_id`, or composite `[ad_id, date]`).

#### Consequences
- **Positive**: Running a synchronization job twice results in zero duplicate rows and zero inflated metrics.
- **Negative**: Requires strict unique index maintenance on the database.
- **Mitigation**: Explicit unique constraints are defined in the schema from day one.

---

### ADR 007: Mandatory Server-Side Evidence for Payment State Transitions

#### Status: ACCEPTED
#### Context
Clients can manipulate frontend browser state, spoofing redirect URLs or fabricated "success" responses.

#### Decision
No Order or Payment Attempt may transition to `PAID` or `CAPTURED` based on a frontend client notification. State changes require either:
1. A cryptographically verified webhook payload with valid HMAC-SHA256 signature, or
2. A direct server-to-server HTTP API verification call to Razorpay (`GET /v1/payments/{payment_id}`).

#### Consequences
- **Positive**: Eliminates payment fraud and false conversion reporting.
- **Negative**: Frontend must display a temporary "Verifying..." state while polling or waiting for server confirmation.
- **Mitigation**: Standard pattern in all enterprise ecommerce and fintech platforms.
