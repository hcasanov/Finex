# FO-Reporting-Agent - Development Guide

## Project Overview

Financial data extraction application using Next.js 14+ (App Router) with Clean Architecture. Allows finance professionals to search for publicly traded companies, select financial metrics, launch background extraction jobs via LangGraph workflow, and download generated PDF reports.

## Tech Stack

- **Framework**: Next.js 14.2 (App Router only)
- **Language**: TypeScript (strict mode with exactOptionalPropertyTypes)
- **UI**: Shadcn/ui + Tailwind CSS
- **Database**: PostgreSQL + pgvector (Drizzle ORM)
- **Queue**: Redis (Upstash) + BullMQ
- **AI/LLM**: Gemini API via Vercel AI SDK (@ai-sdk/google)
- **Workflow**: LangGraph
- **Storage**: Vercel Blob
- **Validation**: Zod

## Architecture (Clean Architecture)

```
src/
├── domain/           # Entities, Value Objects, Repository interfaces, Errors
├── application/      # Use Cases, DTOs, Ports, Mappers, Validators
├── infrastructure/   # DB implementations, External APIs, Queue, LangGraph
├── presentation/     # React Components, Hooks, Stores
├── app/              # Next.js App Router (pages + API routes)
└── lib/              # Shared utilities (constants, utils)
```

## Environment Variables

```bash
# Required
DATABASE_URL=             # PostgreSQL + pgvector connection string
FMP_API_KEY=              # Financial Modeling Prep API key
GOOGLE_GENERATIVE_AI_API_KEY=  # Gemini API key (for embeddings + LLM)
BLOB_READ_WRITE_TOKEN=    # Vercel Blob token
NEXT_PUBLIC_APP_URL=      # Application URL (default: http://localhost:3000)

# Optional (for production queue processing)
UPSTASH_REDIS_REST_URL=   # Redis Upstash URL (falls back to in-memory queue if not set)
UPSTASH_REDIS_REST_TOKEN= # Redis Upstash token
WEBHOOK_SECRET=           # Secret for webhook authentication (optional)
```

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Drizzle migrations
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
pnpm worker       # Start BullMQ background worker (requires Redis)
```

## Key Files

### Domain Layer
- `src/domain/entities/` - Company, Extraction, Task, Report, FinancialMetric
- `src/domain/value-objects/` - Symbol, Money, Percentage, TaskStatus, MetricCategory
- `src/domain/repositories/` - Repository interfaces (ICompanyRepository, etc.)
- `src/domain/errors/` - Domain-specific errors

### Application Layer
- `src/application/use-cases/` - Business logic (SearchCompanies, CreateExtraction, etc.)
- `src/application/dtos/` - Data transfer objects
- `src/application/ports/` - External service interfaces
- `src/application/validators/schemas/` - Zod validation schemas

### Infrastructure Layer
- `src/infrastructure/database/` - Drizzle schema and repository implementations
- `src/infrastructure/database/repositories/PostgresVectorStore.ts` - Vector similarity search
- `src/infrastructure/external-services/fmp/` - Financial Modeling Prep API client
- `src/infrastructure/external-services/gemini/` - Gemini embeddings and LLM services
- `src/infrastructure/external-services/vercel-blob/` - Blob storage service
- `src/infrastructure/di/container.ts` - Dependency injection container
- `src/infrastructure/langgraph/` - LangGraph workflow nodes and orchestration
- `src/infrastructure/queue/` - BullMQ queue service and workers

### Presentation Layer
- `src/presentation/components/ui/` - Shadcn/ui components
- `src/presentation/components/features/` - Feature components (search, company, tasks, reports)
- `src/presentation/components/layouts/` - Layout components
- `src/presentation/hooks/` - React hooks (useCompanySearch, useExtraction, etc.)

### App Router
- `src/app/(main)/` - Main pages (search, company/[symbol], tasks, reports/[id])
- `src/app/api/` - API routes

## Supported Financial Metrics

| Category | Metrics |
|----------|---------|
| Revenue & Profits | Revenue, Gross Margin, Operating Income, Net Income, EBITDA |
| Charges & Investments | OPEX, CAPEX, R&D Expenses |
| Balance Sheet | Total Assets, Total Liabilities, Shareholders Equity, Total Debt, Cash |
| Ratios | ROE, ROA, ROIC, IRR, Dividend Yield |
| Cash Flow | Operating Cash Flow, Free Cash Flow |

## LangGraph Workflow

```
START → FETCH_DOCUMENTS → VECTORIZE → EXTRACT_DATA → GENERATE_REPORT → END
                              ↓
                         (retry if missing data, max 2x)
```

### Workflow Nodes (Implemented)
1. `fetchDocumentsNode` - Fetches financial documents from FMP API (income statements, balance sheets, cash flows, key metrics)
2. `vectorizeNode` - Chunks documents, generates embeddings via Gemini, stores with cosine similarity support
3. `extractDataNode` - RAG + LLM extraction of financial metrics with confidence scoring
4. `generateReportNode` - Generates PDF report via @react-pdf/renderer, uploads to Vercel Blob

### Workflow Files
- `src/infrastructure/langgraph/state/ExtractionState.ts` - State definition
- `src/infrastructure/langgraph/nodes/*.ts` - Individual workflow nodes
- `src/infrastructure/langgraph/workflows/extractionWorkflow.ts` - Main workflow orchestrator
- `src/infrastructure/queue/workers/extractionWorker.ts` - Background job processor

## PDF Generation

The PDF generator uses @react-pdf/renderer with a custom template:
- `src/infrastructure/pdf/templates/FinancialReportTemplate.tsx` - PDF layout and styling
- `src/infrastructure/pdf/ReactPDFGenerator.ts` - Generator implementation

## Current Status

### Completed
- [x] Project structure and configuration
- [x] Domain layer (entities, value objects, repository interfaces, errors)
- [x] Application layer (use cases, DTOs, ports, validators)
- [x] Infrastructure layer (database schema, repositories, external services)
- [x] Presentation layer (UI components, feature components, hooks)
- [x] App Router pages and API routes
- [x] TypeScript strict mode compliance
- [x] LangGraph workflow nodes (fetchDocuments, vectorize, extractData, generateReport)
- [x] BullMQ queue service with Redis support
- [x] Webhook endpoint for queue job processing (`/api/webhooks/queue`)
- [x] BullMQ worker for background processing
- [x] PDF generation with @react-pdf/renderer
- [x] PostgreSQL vector store for embedding storage
- [x] Development fallback (SimpleQueueService when Redis not available)

### TODO
- [ ] Database migrations generation (`pnpm db:generate`)
- [ ] Enable pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] E2E testing of full user flow
- [ ] Error handling improvements
- [ ] Production deployment configuration

## TypeScript Notes

- Use bracket notation for env variables: `process.env["VAR_NAME"]`
- With `exactOptionalPropertyTypes`, don't pass `undefined` explicitly for optional props
- Prefix unused parameters with underscore: `_request`
- Use `Buffer.isBuffer()` for type narrowing instead of `instanceof Buffer`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/companies/search | Search companies (autocomplete) |
| GET | /api/companies/[symbol] | Get company details |
| POST | /api/extractions | Create new extraction (rate limited) |
| GET | /api/extractions/[id] | Get extraction status |
| POST | /api/extractions/[id]/cancel | Cancel extraction |
| GET | /api/tasks/[id] | Get tasks for extraction |
| GET | /api/reports/[id] | Get report details |
| GET | /api/reports/[id]/download | Download report PDF |
| GET | /api/rate-limit | Check rate limit status |
| POST | /api/webhooks/queue | Process extraction job (webhook) |
| POST | /api/dev/process-job | Dev-only: manually process extraction |

## Rate Limiting

Report generation is rate limited to **2 reports per day per user**.

### How it works:
- Users are identified by IP address + browser cookie (`fo_uid`)
- Rate limit data is stored in the `rate_limits` database table
- The limit resets 24 hours after the first request in the window

### API Headers:
All extraction-related responses include rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed (2)
- `X-RateLimit-Remaining`: Remaining requests in the window
- `X-RateLimit-Reset`: ISO timestamp when the limit resets

### Rate Limit Exceeded Response (HTTP 429):
```json
{
  "error": "Rate limit exceeded",
  "message": "You have reached the maximum of 2 report generations per day...",
  "remaining": 0,
  "resetAt": "2024-01-01T12:00:00.000Z"
}
```

### Check Rate Limit Status:
```bash
curl http://localhost:3000/api/rate-limit?action=extraction
```

## Running the Worker

For production with BullMQ:
```bash
# Terminal 1: Start the Next.js server
pnpm dev

# Terminal 2: Start the background worker
pnpm worker
```

For development without Redis:
- Jobs are enqueued to an in-memory queue
- Use `/api/dev/process-job` to manually trigger processing:
```bash
curl -X POST http://localhost:3000/api/dev/process-job \
  -H "Content-Type: application/json" \
  -d '{"extractionId": "your-extraction-uuid"}'
```
