# 08. API Design & HTTP Standards

## 1. RESTful Conventions & URL Standards

All HTTP API endpoints adhere to strict REST conventions:
- **Base Prefix**: `/api/v1`
- **Resource Nouns**: Use plural, lower-case kebab-case nouns (`/api/v1/business-units`, `/api/v1/meta-ads`).
- **HTTP Verbs**:
  - `GET`: Safe, idempotent read operations. Never alters database state.
  - `POST`: Create a new resource or trigger an asynchronous command/job.
  - `PUT` / `PATCH`: Idempotent full replacement or partial update of a resource.
  - `DELETE`: Remove or archive a resource.

---

## 2. Standardized Response Envelopes

Every API response returns a predictable JSON structure so frontend clients never have to guess property locations.

### Success Response Envelope
```json
{
  "success": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "code": "VASTU",
    "name": "Vastu Consultations & Audits",
    "status": "ACTIVE"
  },
  "meta": {
    "requestId": "req-a9f82d-102938",
    "timestamp": "2026-10-28T08:45:00.000Z"
  }
}
```

### Paginated List Response Envelope
```json
{
  "success": true,
  "data": [
    { "id": "uuid-1", "name": "Vastu Services" },
    { "id": "uuid-2", "name": "Webinar Funnels" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 2,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "meta": {
    "requestId": "req-a9f82d-102938",
    "timestamp": "2026-10-28T08:45:00.000Z"
  }
}
```

### Standard Error Response Envelope (RFC 7807 Inspired)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters provided",
    "details": [
      {
        "field": "dateFrom",
        "issue": "Date must be in YYYY-MM-DD format"
      }
    ],
    "requestId": "req-a9f82d-102938",
    "timestamp": "2026-10-28T08:45:00.000Z"
  }
}
```

---

## 3. Standard HTTP Status Codes

| Status Code | Meaning | When to Use |
| :--- | :--- | :--- |
| **200 OK** | Success | Standard response for successful `GET`, `PUT`, or `PATCH`. |
| **201 Created** | Created | Resource successfully created via `POST`. Returns location or ID. |
| **202 Accepted** | Accepted | Asynchronous sync job or background task enqueued. |
| **400 Bad Request** | Malformed Syntax | JSON syntax error or missing mandatory headers. |
| **401 Unauthorized** | Unauthenticated | Missing or expired API key or Bearer token. |
| **403 Forbidden** | Forbidden | Valid credentials, but caller lacks permission for this business unit. |
| **404 Not Found** | Not Found | Requested entity ID does not exist in the database. |
| **422 Unprocessable** | Semantic Validation Failed | Zod schema rejection (e.g. invalid phone number format). |
| **429 Too Many Requests** | Rate Limit Exceeded | Client exceeded API call threshold. |
| **500 Internal Error** | Server Error | Uncaught exception; logged to Pino with full stack trace. |

---

## 4. Phase 1 API Endpoint Catalog

### System Health
- `GET /api/v1/health`: Basic liveness probe (returns `{ status: "ok" }`).
- `GET /api/v1/health/ready`: Deep readiness probe (checks PostgreSQL connection pool responsiveness).

### Business Units
- `GET /api/v1/business-units`: Retrieve all commercial divisions.
- `POST /api/v1/business-units`: Register a new business unit.

### Meta Marketing Ingestion (Phase 1 Target)
- `POST /api/v1/meta-ads/sync`: Trigger an on-demand synchronization run for an ad account.
  ```json
  {
    "metaAccountId": "act_1029384756",
    "dateRangeStart": "2026-10-01",
    "dateRangeEnd": "2026-10-27",
    "syncType": "FULL_ACCOUNT"
  }
  ```
- `GET /api/v1/meta-ads/sync-runs`: Inspect historical sync executions and error logs.
- `GET /api/v1/meta-ads/campaigns`: Query synchronized campaigns with filters (`adAccountId`, `status`).
- `GET /api/v1/meta-ads/insights`: Query daily performance metrics aggregated by ad or campaign.

---

## 5. Input Validation with Zod

All incoming requests are strictly validated using Fastify pre-validation hooks backed by Zod schemas:

```typescript
import { z } from 'zod';

export const SyncRequestSchema = z.object({
  metaAccountId: z.string().min(5).max(64),
  dateRangeStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  dateRangeEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  syncType: z.enum(['CAMPAIGNS_ONLY', 'DAILY_INSIGHTS', 'FULL_ACCOUNT']),
});

export type SyncRequestDTO = z.infer<typeof SyncRequestSchema>;
```
