# 🚀 ObserveX: Real-Time API Hit Tracking & Monitoring System Workflow Documentation

<div align="center">

<br/>

[![Node.js](https://img.shields.io/badge/Node.js_18-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js_4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React_18-20232F?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Capacitor](https://img.shields.io/badge/Capacitor_6-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://rabbitmq.com)

**ObserveX** is a high-throughput, multi-tenant API telemetry and monitoring solution.  
**Track hits. Aggregate metrics. Analyze latency. Secure endpoints.**

[🚀 Getting Started](#⚙️-quick-start--setup) &nbsp;&middot;&nbsp; [🏗️ System Architecture](#🏗️-system-architecture) &nbsp;&middot;&nbsp; [🏛️ SOLID Architecture](#🏛️-solid-principles-architecture) &nbsp;&middot;&nbsp; [🌊 Core Pipelines](#🌊-event-driven-ingest-pipeline) &nbsp;&middot;&nbsp; [🔌 API Reference](#🔌-api-endpoints)

</div>

---

## 📋 Table of Contents
1. [🚀 Overview](#🚀-overview)
2. [🛠️ Tech Stack](#🛠️-tech-stack)
3. [📁 Folder Structure](#📁-folder-structure)
4. [🏗️ System Architecture](#🏗️-system-architecture)
5. [💾 Database Design](#💾-database-design)
6. [🛠️ Advanced System Design & Fault Tolerance Patterns](#🛠️-advanced-system-design--fault-tolerance-patterns)
7. [🏛️ SOLID Principles Architecture](#🏛️-solid-principles-architecture)
8. [🛡️ Authentication & Authorization](#🛡️-authentication-&-authorization)
9. [🌊 Event-Driven Ingest Pipeline](#🌊-event-driven-ingest-pipeline)
10. [📊 Analytics & Aggregation Engine](#📊-analytics-&-aggregation-engine)
11. [🔌 API Endpoints](#🔌-api-endpoints)
12. [💻 Frontend Application & PWA](#💻-frontend-application--pwa)
13. [⚙️ Quick Start & Setup](#⚙️-quick-start--setup)
14. [📝 Environment Configurations](#📝-environment-configurations)

---

## 🚀 Overview

**ObserveX** is designed to capture, process, and visualize API metrics at scale. Instead of forcing application servers to block or run slow queries while logging requests, ObserveX provides a high-throughput `/api/hit` ingestion endpoint that offloads analytics asynchronously using **RabbitMQ** and segregates raw transactional logs (**MongoDB**) from aggregated metrics (**PostgreSQL**).

### ✨ Key Features
- **⚡ Asynchronous Telemetry Ingestion**: Decouples API hit logging from analytics using RabbitMQ queues with publisher confirms.
- **🛡️ Resilient Fallback Design**: Ensures that if database updates fail, raw records are protected, and client applications receive non-blocking immediate feedback.
- **⏱️ Circuit Breaking & Retries**: Employs exponential backoff, jitter, and circuit breaker patterns to survive high load and transient queue downtime.
- **🔑 Granular API Key Management**: Multi-tenant key scopes including environments, allowed IP/origins, service limits, and permissions.
- **📊 Interactive Dashboards**: Real-time traffic, latency, and status charts using React, TanStack Query, and ApexCharts.
- **📱 Progressive Web App (PWA) & Mobile Native**: Installable on iOS, Android, and Desktop with offline caching, mobile safe-area calibration, tactile haptic feedback, and network monitoring via Capacitor.


---

## 🛠️ Tech Stack

ObserveX leverages a robust modern polyglot tech stack to handle high-throughput telemetry writes and analytical aggregations:

| Technology | Category | Version | Purpose / Description |
| :--- | :--- | :--- | :--- |
| **Node.js** | Runtime | `^18.x` | JavaScript server runtime environment |
| **Express.js** | Backend Framework | `^4.18.2` | Fast, minimalist web framework for ingestion & admin REST APIs |
| **React** | Frontend Library | `^18.2.0` | Library for building the single-page admin console UI |
| **Vite** | Build Tool / Dev Server | `^5.0.0` | Next-generation frontend tooling and fast hot module replacement |
| **RabbitMQ** | Message Broker | `^3.10.x` | High-performance message queue for asynchronous event ingestion |
| **MongoDB & Mongoose** | NoSQL Database & ODM | `^6.0` / `^8.0.0` | Stores raw telemetry events, tenant metadata, users, and API key policies |
| **PostgreSQL** | Relational Database | `^15.x` | Relational store for aggregated metrics and fast dashboard query reads |
| **TanStack React Query** | Frontend State Sync | `^5.8.4` | Powerful data fetching, caching, and server-state synchronization |
| **ApexCharts** | Data Visualization | `^5.3.6` | Interactive charting library for real-time latencies, hits, and status codes |
| **Zod** | Schema Validation | `^4.3.6` | Type-safe schema validation for ingestion payloads and database models |
| **Docker & Compose** | Containerization | - | Multi-container environment orchestration for databases and microservices |
| **SASS** | CSS Preprocessor | `^1.94.2` | Modern styling for custom layout UI |
| **Capacitor** | Native Mobile Runtime & Bridge | `^6.0.0` | Cross-platform hardware bridge (`@capacitor/network`, `@capacitor/haptics`, `@capacitor/app`) |
| **vite-plugin-pwa** | Service Worker & Manifest | `^0.20.0` | Zero-config PWA generation, Workbox caching strategies, asset precaching |

---

## 📁 Folder Structure

Below is the directory structure of the ObserveX repository:

```text
observex/
├── dashboard/               # Frontend single-page application (Vite + React)
│   ├── capacitor.config.json # Capacitor cross-platform runtime configuration
│   ├── public/              # Static assets, Web App Manifest (site.webmanifest), icons
│   ├── src/
│   │   ├── api/             # API client configurations and endpoints
│   │   ├── components/      # Reusable UI components, charts, and PWA widgets
│   │   │   ├── pwa/         # PWA banner, install guide modal, offline banner
│   │   ├── contexts/        # React Contexts (Auth, Theme, PwaContext)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Pages and route-level components
│   │   ├── services/        # Service helper functions & capacitorService bridge
│   │   ├── App.jsx          # Main application entry, routing, and PWA providers
│   │   └── main.jsx         # App mounting point with PWA elements setup
│   ├── package.json         # Frontend dependencies and scripts
│   └── vite.config.js       # Vite build & Workbox PWA configuration
└── server/                  # Backend application (Express.js)
    ├── scripts/             # Database initialization and setup scripts
    ├── src/
    │   ├── services/        # Domain-driven backend modules
    │   │   ├── analytics/   # Analytics query handlers & routes
    │   │   ├── auth/        # Authentication, JWT logic & routes
    │   │   ├── client/      # Client and Tenant management
    │   │   ├── ingest/      # API hit ingestion gateway & routes
    │   │   └── processor/   # Background RabbitMQ consumer & PostgreSQL upserts
    │   ├── shared/          # Shared configuration and utilities
    │   │   ├── config/      # Shared environment configuration loaders
    │   │   ├── constants/   # Global constants
    │   │   ├── events/      # Circuit breaker and RabbitMQ event producer
    │   │   ├── middlewares/ # Express authentication & verification middlewares
    │   │   ├── models/      # Mongoose schemas for MongoDB
    │   │   └── utils/       # Shared utility functions
    │   └── server.js        # Main Express server entry point
    ├── docker-compose.yml   # Multi-container local deployment spec
    ├── Dockerfile           # Docker configuration for Ingestion Server
    ├── Dockerfile.consumer  # Docker configuration for Background Consumer
    └── package.json         # Backend dependencies and scripts
```

---

## 🏗️ System Architecture

ObserveX utilizes a split-database approach: **MongoDB** acts as the high-write transactional store for raw logging and client settings, while **PostgreSQL** handles time-bucketed aggregation queries for high-performance dashboard reads.

```
                  ┌────────────────────────────────────────┐
                  │          Client Applications           │
                  └──────────────────┬─────────────────────┘
                                     │ 
                        POST /api/hit (with API Key)
                                     ▼
                  ┌────────────────────────────────────────┐
                  │          Express Ingest App            │ (Port 5000)
                  │   - Validate API Key (MongoDB)         │
                  │   - Rate Limit (Express Rate Limit)    │
                  │   - Circuit Breaker check              │
                  └──────────────────┬─────────────────────┘
                                     │ Asynchronous Publish
                                     ▼
                  ┌────────────────────────────────────────┐
                  │               RabbitMQ                 │ (Queue: api_hits)
                  └──────────────────┬─────────────────────┘
                                     │ Consumer Subscription
                                     ▼
                  ┌────────────────────────────────────────┐
                  │          Background Consumer           │
                  │   - Idempotency & Zod Validation       │
                  │   - Save Raw Hits to MongoDB           │
                  │   - Fallback-Safe Upsert to Postgres   │
                  └───────────┬──────────────────┬─────────┘
                              │                  │
                              ▼                  ▼
                     ┌──────────────┐   ┌──────────────┐
                     │   MongoDB    │   │  PostgreSQL  │ (Aggregated
                     │ (Raw Logs &  │   │  (Metrics &  │  endpoint stats)
                     │  Metadata)   │   │  Analytics)  │
                     └──────────────┘   └──────────────┘
```

---

## 💾 Database Design

### 🍃 MongoDB Models (NoSQL - Flexible Metadata & Raw Event Logs)
MongoDB stores client configuration metadata, API credentials, and long-tail raw audit logs.

#### 🏢 1. Client Schema
Represents a multi-tenant client organization. Defined in [Client.js](server/src/shared/models/Client.js).
- `name` (String, Required): Company or organization name.
- `slug` (String, Unique, Required): Url-safe unique slug.
- `email` (String, Required): Primary contact email.
- `createdBy` (ObjectId, Ref: User): User who registered the client.
- `isActive` (Boolean, Default: true): Client tenant status.
- `settings` (Object): Custom parameters.
  - `dataRetentionDays` (Number, Default: 30)
  - `alertsEnabled` (Boolean, Default: true)
  - `timezone` (String, Default: 'UTC')

#### 👥 2. User Schema
Enforces credentials and permissions. Defined in [User.js](server/src/shared/models/User.js).
- `username` (String, Unique, Required)
- `email` (String, Unique, Required)
- `password` (String, Hashed, Required)
- `role` (String, Enum: `super_admin`, `client_admin`, `client_viewer`)
- `clientId` (ObjectId, Ref: Client, Conditional Require): Required for all client-scoped users.
- `isActive` (Boolean, Default: true)
- `permissions` (Object):
  - `canCreateApiKeys` (Boolean, Default: false)
  - `canManageUsers` (Boolean, Default: false)
  - `canViewAnalytics` (Boolean, Default: true)
  - `canExportData` (Boolean, Default: false)

#### 🔑 3. API Key Schema
Defines credentials used to validate client agents. Defined in [ApiKey.js](server/src/shared/models/ApiKey.js).
- `keyId` (String, Unique, Index): Identifies the key.
- `keyValue` (String, Unique, Index): Hashed or unique key secret.
- `clientId` (ObjectId, Ref: Client): Associated tenant.
- `name` (String, Required): Human name identifier.
- `environment` (String, Enum: `production`, `staging`, `development`, `testing`)
- `isActive` (Boolean, Default: true)
- `permissions` (Object):
  - `canIngest` (Boolean, Default: true)
  - `canReadAnalytics` (Boolean, Default: false)
  - `allowedServices` (Array of Strings)
- `security` (Object):
  - `allowedIPs` (Array of IP Subnets / Wildcards)
  - `allowedOrigins` (Array of Domains / Wildcards)
- `expiresAt` (Date): Auto-expiring TTL index context.

#### 📈 4. Raw API Hits Schema
Logs individual API requests. Defined in [ApiHits.js](server/src/shared/models/ApiHits.js).
- `eventId` (String, Unique): ID assigned to query.
- `timestamp` (Date, Required): Time of API execution.
- `serviceName` (String, Required)
- `endpoint` (String, Required)
- `method` (String, Enum: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, etc.)
- `statusCode` (Number, Required)
- `latencyMs` (Number, Required)
- `clientId` (ObjectId, Ref: Client)
- `apiKeyId` (ObjectId, Ref: ApiKey)
- `ip` (String)
- `userAgent` (String)

---

### 🐘 PostgreSQL Schema (Relational - Fast Metric Aggregations)
PostgreSQL handles optimized time-bucket metrics to power charts and aggregates.
Defined in [init-postgres.sql](server/scripts/init-postgres.sql).

#### Table: `endpoint_metrics`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Autoincrement PK |
| `client_id` | `VARCHAR(24)` | `NOT NULL` | References MongoDB Client id string |
| `service_name` | `VARCHAR(255)` | `NOT NULL` | Client Microservice name |
| `endpoint` | `VARCHAR(500)` | `NOT NULL` | Executed URL path |
| `method` | `VARCHAR(10)` | `NOT NULL` | HTTP verb |
| `time_bucket` | `TIMESTAMP` | `NOT NULL` | Hourly aggregated timestamp bucket |
| `total_hits` | `INTEGER` | `DEFAULT 0` | Total calls in this hour bucket |
| `error_hits` | `INTEGER` | `DEFAULT 0` | Total error calls (status >= 400) |
| `avg_latency` | `NUMERIC(10,3)` | `DEFAULT 0.000` | Running average latency (ms) |
| `min_latency` | `NUMERIC(10,3)` | `DEFAULT 0.000` | Minimum latency recorded (ms) |
| `max_latency` | `NUMERIC(10,3)` | `DEFAULT 0.000` | Maximum latency recorded (ms) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Table creation |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Table update |

- **Unique Constraint**: `UNIQUE(client_id, service_name, endpoint, method, time_bucket)` ensures that the processor can perform safe UPSERT statements.
- **Optimization Indexes**:
  - `idx_endpoint_metrics_client_id` on `client_id`
  - `idx_endpoint_metrics_service` on `(client_id, service_name)`
  - `idx_endpoint_metrics_time` on `time_bucket`
  - `idx_endpoint_metrics_endpoint` on `(client_id, service_name, endpoint)`

---

## 🛠️ Advanced System Design & Fault Tolerance Patterns

ObserveX implements state-of-the-art distributed systems patterns to achieve extreme resilience, fault isolation, and sub-millisecond API response latency.

### 🔌 1. Circuit Breaker Pattern
ObserveX uses a custom state-machine [CircuitBreaker](server/src/shared/events/producer/CircuitBreaker.js) to isolate telemetry ingestion from downstream message broker failures. This prevents cascading crashes and resource exhaustion when RabbitMQ is congested or offline.

```mermaid
stateDiagram-v2
    [*] --> CLOSED : Initial State
    
    CLOSED --> OPEN : Consecutive Failures >= failureThreshold (5)
    note right of CLOSED
        - All requests allowed
        - Track consecutive failures
    end note

    OPEN --> HALF_OPEN : Cooldown Elapsed (30s)
    note right of OPEN
        - Fail-fast immediately
        - Returns HTTP 503
        - Rejects broker calls
    end note

    HALF_OPEN --> CLOSED : Test Successes >= halfOpenMaxAttempts (3)
    HALF_OPEN --> OPEN : Any single failure probe fails
    note right of HALF_OPEN
        - Allows limited probes (3)
        - Monitors probe success
    end note
```

- **🟢 CLOSED State**: In normal operation, requests flow through to RabbitMQ. Successful publishes reset the failure count.
- **🔴 OPEN State**: If publishes fail consecutively `5` times, the circuit trips. The publisher fails fast, returning a `503 Service Unavailable` with `retryAfter: '30 seconds'` parameters immediately. No connection resource is wasted.
- **🟡 HALF_OPEN State**: After a `30,000ms` cooldown, the circuit enters `HALF_OPEN`. It allows exactly `3` probe attempts. If all `3` probe requests succeed, the breaker resets to `CLOSED`. If any single request fails, the breaker trips back to `OPEN`, starting a new cooldown cycle.

---

### 📂 2. Polyglot Persistence Pattern
ObserveX splits its data footprint based on access characteristics:
- **Write-Heavy Ingest Log (MongoDB)**: Raw telemetry hits require sub-millisecond writes and dynamic document structures. Mongoose schemas model client/key settings, indexing key IDs and values for validation.
- **Read-Heavy Query Aggregates (PostgreSQL)**: Time-series dashboards need relational joins, filters, and fast sorted ranges. Background processing updates PostgreSQL in optimized tables using native database upserts.

---

### 🔄 3. Asynchronous Decoupling (Producer-Consumer)
By buffering event logging using RabbitMQ queue structures, ObserveX guarantees that the client ingestion request experiences low latency. The Express gateway acts as a lightweight publisher that pushes hits to the broker and returns an immediate `202 Accepted` status.

---

### ⏱️ 4. Exponential Backoff with Jitter Retry Strategy
Transient system errors (network drops, buffer overflows, broker socket resets) are retried using [RetryStrategy.js](server/src/shared/events/producer/RetryStrategy.js).
- **Transient Classification**: Analyzes error codes (`ECONNRESET`, `ECONNREFUSED`, `ETIMEDOUT`, etc.) to isolate retryable exceptions.
- **Exponential Delay**: Computes backoff duration:
  $$t = \text{base} \times 2^{\text{attempt}}$$
- **Randomized Jitter**: Multiplies the delay by a randomized jitter factor (`0.3`) to prevent the **Thundering Herd** problem (where concurrent clients retry in lockstep, repeatedly knocking over a recovering node).

---

### 🆔 5. Idempotent Consumer (Deduplication Cache)
To support at-least-once message delivery guarantees without creating duplicate records, the consumer maintains a rolling deduplication cache of processed message IDs. If an event ID is already present in the cache, it is safely acknowledged and discarded without re-processing.

---

### 🧱 6. Repository & Dependency Injection (DI) Patterns
To ensure clean code boundaries and ease unit testing:
- **Repository Pattern**: Abstracted database interfaces encapsulate raw queries (MongoDB queries in [ApiHitRepository.js](server/src/services/processor/repository/ApiHitRepository.js) and SQL aggregates in [MetricsRepository.js](server/src/services/processor/repository/MetricsRepository.js)).
- **DI Container Pattern**: Instantiated in [dependencies.js](server/src/services/processor/Dependencies/dependencies.js) to wire up services and inject repository instances dynamically.

---

## 🏛️ SOLID Principles Architecture

ObserveX adheres to the **SOLID** software design principles across both backend microservices and frontend client applications to guarantee maintainability, testability, loose coupling, and clean boundaries.

| Principle | Adherence | Architectural Implementation in ObserveX | Key Repository References |
| :--- | :---: | :--- | :--- |
| **S** – Single Responsibility | **100% (Followed)** | Strict layered separation across Controllers, Services, Repositories, Validation schemas, and discrete single-purpose Middlewares. Infrastructure primitives (Circuit Breaker, Confirm Channel Manager, Retry Strategy) and React Contexts are completely isolated. | [ProcessorService.js](server/src/services/processor/service/ProcessorService.js), [CircuitBreaker.js](server/src/shared/events/producer/CircuitBreaker.js), [AuthContext.jsx](dashboard/src/contexts/AuthContext.jsx) |
| **O** – Open / Closed | **100% (Followed)** | Systems are open for extension but closed for modification using abstract base repositories (`BaseRepository`), modular Express middleware pipelines, schema-agnostic Zod validation, and decoupled email templates. | [BaseRepository.js](server/src/services/processor/repository/BaseRepository.js), [validate.js](server/src/shared/middlewares/validate.js), [emailTemplates.js](server/src/services/email/emailTemplates.js) |
| **L** – Liskov Substitution | **100% (Followed)** | Concrete storage repositories strictly inherit and implement abstract contracts (`BaseRepository`, `BaseClientRepository`, `BaseApiKeyRepository`), allowing transparent substitution of database adapters. `EmailService` accepts interchangeable transport drivers (Nodemailer, mock, or alternative SMTP engines). | [ApiHitRepository.js](server/src/services/processor/repository/ApiHitRepository.js), [ClientRepository.js](server/src/services/client/repository/ClientRepository.js), [EmailService.js](server/src/services/email/emailService.js) |
| **I** – Interface Segregation | **100% (Followed)** | Domain-segregated repositories avoid bloated "God interfaces". Services depend solely on the precise repositories they need. Express middlewares attach only relevant scopes (`req.user`, `req.client`), and frontend contexts are segregated into focused domains. | [ApiKeyRepository.js](server/src/services/client/repository/ApiKeyRepository.js), [validateApiKey.js](server/src/shared/middlewares/validateApiKey.js), [contexts/](dashboard/src/contexts/) |
| **D** – Dependency Inversion | **100% (Followed)** | High-level business logic modules depend on abstractions rather than low-level database drivers (`mongoose`, `pg`) or network libraries. Dedicated Dependency Injection (DI) containers in each module wire dependencies and pass them via constructor injection. | [dependencies.js (Processor)](server/src/services/processor/Dependencies/dependencies.js), [dependencies.js (Client)](server/src/services/client/Dependencies/dependencies.js), [dependencies.js (Auth)](server/src/services/auth/Dependencies/dependencies.js) |

---

### 1. 🔹 Single Responsibility Principle (SRP)
> *"A class or module should have one, and only one, reason to change."*

ObserveX enforces strict separation of concerns across every tier of the application:

- **Backend Layered Decoupling**:
  - **Routing Layer (`routes/`)**: Focuses solely on path definitions, HTTP verbs, and composing middleware chains (e.g. [ingestRoutes.js](server/src/services/ingest/routes/ingestRoutes.js), [clientRoutes.js](server/src/services/client/routes/clientRoutes.js)).
  - **Controller Layer (`controller/`)**: Acts as the HTTP transport boundary; extracts headers/params, delegates to domain services, and serializes status codes and response bodies (e.g. [ingestController.js](server/src/services/ingest/controller/ingestController.js), [clientController.js](server/src/services/client/controller/clientController.js)).
  - **Service Layer (`service/` / `services/`)**: Encapsulates pure business rules and domain orchestration without direct dependency on HTTP request/response objects (e.g. [ProcessorService.js](server/src/services/processor/service/ProcessorService.js), [clientService.js](server/src/services/client/services/clientService.js), [authService.js](server/src/services/auth/service/authService.js)).
  - **Repository Layer (`repository/`)**: Confined solely to persistence operations and database-specific querying for MongoDB and PostgreSQL (e.g. [ApiHitRepository.js](server/src/services/processor/repository/ApiHitRepository.js), [MetricsRepository.js](server/src/services/processor/repository/MetricsRepository.js)).
  - **Validation Layer (`validation/`)**: Isolated Zod schemas that validate payload structures independently of HTTP handlers or database models (e.g. [authValidation.js](server/src/services/auth/validation/authValidation.js)).
  - **Single-Purpose Middlewares (`middlewares/`)**: Discrete cross-cutting concerns are divided into dedicated files rather than bundled together: [authenticate.js](server/src/shared/middlewares/authenticate.js) (JWT validation), [authorize.js](server/src/shared/middlewares/authorize.js) (RBAC access checks), [validateApiKey.js](server/src/shared/middlewares/validateApiKey.js) (API key verification), and [errorHandler.js](server/src/shared/middlewares/errorHandler.js) (centralized exception handling).

- **Isolated Infrastructure Components**:
  - [CircuitBreaker.js](server/src/shared/events/producer/CircuitBreaker.js): Manages circuit trip states (`CLOSED`, `OPEN`, `HALF_OPEN`) without concern for network transport mechanics.
  - [RetryStrategy.js](server/src/shared/events/producer/RetryStrategy.js): Exclusively computes exponential backoff and randomized jitter delays.
  - [ConfirmChannelManager.js](server/src/shared/events/producer/ConfirmChannelManager.js): Dedicated to RabbitMQ channel allocation, publisher confirms, and broker reconnection.

- **Frontend State Isolation**:
  - Instead of a single monolithic state store, React contexts are split into granular responsibilities: [AuthContext.jsx](dashboard/src/contexts/AuthContext.jsx) (authentication), [ThemeContext.jsx](dashboard/src/contexts/ThemeContext.jsx) (UI theme), [PwaContext.jsx](dashboard/src/contexts/PwaContext.jsx) (PWA install/offline events), and [ToastContext.jsx](dashboard/src/contexts/ToastContext.jsx) (notifications).

---

### 2. 🔹 Open/Closed Principle (OCP)
> *"Software entities should be open for extension, but closed for modification."*

ObserveX is designed so that new features, storage engines, and processing pipelines can be introduced without modifying existing, tested code:

- **Pluggable Base Repositories**:
  - Abstract base classes ([BaseRepository.js](server/src/services/processor/repository/BaseRepository.js), [BaseClientRepository.js](server/src/services/client/repository/BaseClientRepository.js), [BaseApiKeyRepository.js](server/src/services/client/repository/BaseApiKeyRepository.js)) define standard persistence contracts. New storage engines (e.g., Redis caching, DynamoDB, or Elasticsearch) can be added simply by extending these base classes without altering consuming services.
- **Middleware Pipeline Extension**:
  - Express middleware architecture allows plugging new operational behaviors (rate limiting, audit logs, tracing, compression) into the request processing lifecycle without modifying core route logic or controllers.
- **Schema-Agnostic Validation Middleware**:
  - The [validate.js](server/src/shared/middlewares/validate.js) middleware is a higher-order function that accepts any Zod schema:
    ```javascript
    export const validate = (schema) => (req, res, next) => { ... };
    ```
    New validation constraints for new endpoints are introduced by defining schemas, leaving the validation middleware completely untouched.
- **Decoupled Notification Templates**:
  - [emailTemplates.js](server/src/services/email/emailTemplates.js) separates visual email rendering from SMTP delivery logic in [EmailService.js](server/src/services/email/emailService.js). Adding new notification email designs does not require touching the transmission engine.

---

### 3. 🔹 Liskov Substitution Principle (LSP)
> *"Subtypes must be substitutable for their base types without altering program correctness."*

ObserveX guarantees that derived classes adhere strictly to base class behavioral contracts:

- **Repository Polymorphism**:
  - [ApiHitRepository](server/src/services/processor/repository/ApiHitRepository.js) subclasses [BaseRepository](server/src/services/processor/repository/BaseRepository.js) implementing its interface methods (`save`, `find`, `count`, `deleteOldHits`).
  - [ClientRepository](server/src/services/client/repository/ClientRepository.js) subclasses [BaseClientRepository](server/src/services/client/repository/BaseClientRepository.js) implementing (`create`, `findById`, `findBySlug`, `find`, `count`, `deleteById`).
  - Any consumer (such as [ProcessorService](server/src/services/processor/service/ProcessorService.js) or [clientService](server/src/services/client/services/clientService.js)) depends on the base contract; any concrete or mock repository subclass can be substituted transparently with no changes to the consumer.
- **Transporter Interchangeability**:
  - [EmailService](server/src/services/email/emailService.js) accepts an optional `transporter` in its constructor:
    ```javascript
    constructor(transporter = null) {
        this.transporter = transporter || nodemailer.createTransport(transportConfig);
    }
    ```
    During automated integration testing or migration to different cloud providers (AWS SES, SendGrid), an alternative or mock transporter can be substituted without modifying any caller code.

---

### 4. 🔹 Interface Segregation Principle (ISP)
> *"Clients should not be forced to depend upon interfaces that they do not use."*

In JavaScript and React, ISP is applied through granular domain interfaces, specialized repositories, and focused state hooks:

- **Domain-Specific Repositories**:
  - Rather than a bloated, monolithic `DatabaseService` containing dozens of unrelated queries, persistence is strictly split by domain:
    - [ApiHitRepository.js](server/src/services/processor/repository/ApiHitRepository.js): Raw telemetry hits and retention cleanup.
    - [MetricsRepository.js](server/src/services/processor/repository/MetricsRepository.js): Aggregated time-bucketed metrics and analytics.
    - [UserRepository.js](server/src/services/auth/repository/UserRepository.js): User identity and credentials.
    - [ApiKeyRepository.js](server/src/services/client/repository/ApiKeyRepository.js): API key access management.
    - [ClientRepository.js](server/src/services/client/repository/ClientRepository.js): Multi-tenant client metadata.
  - Services only inject and depend on the exact repositories they require. For example, [AuthService](server/src/services/auth/service/authService.js) only depends on `UserRepository` and `EmailService`.
- **Targeted Middleware Attachments**:
  - Middlewares only expose and inject the specific context required:
    - `authenticate.js` attaches only `req.user`.
    - `validateApiKey.js` attaches only `req.client` and `req.apiKey`.
- **Frontend Context Segregation**:
  - Rather than storing global state in a single giant context, the dashboard splits state into isolated contexts (`AuthContext`, `ThemeContext`, `PwaContext`, `ToastContext`). Components subscribing to `useTheme()` do not suffer re-renders when authentication tokens or PWA status change.

---

### 5. 🔹 Dependency Inversion Principle (DIP)
> *"High-level modules should not depend on low-level modules; both should depend on abstractions."*

ObserveX avoids hardcoded dependencies by implementing explicit Dependency Injection (DI) across all modules:

- **Explicit DI Containers (`Dependencies/dependencies.js`)**:
  - Every domain module implements an explicit Dependency Injection container that instantiates and wires components from the ground up:
    - **Processor DI Container** ([dependencies.js](server/src/services/processor/Dependencies/dependencies.js)): Instantiates `ApiHitRepository` and `MetricsRepository`, injecting them into `ProcessorService`:
      ```javascript
      class Container {
          static init() {
              const repositories = {
                  apiHitRepository: new ApiHitRepository({ model: ApiHit, logger }),
                  metricsRepository: new MetricsRepository({ logger, postgres }),
                  clientRepository: MongoClientRepository,
              };
              const services = {
                  processorService: new ProcessorService(repositories),
              };
              return { repositories, services };
          }
      }
      ```
    - **Client DI Container** ([dependencies.js](server/src/services/client/Dependencies/dependencies.js)): Wires repositories and injects them into `ClientService`, which in turn is injected into `ClientController`.
    - **Auth DI Container** ([dependencies.js](server/src/services/auth/Dependencies/dependencies.js)): Injects `UserRepository` and `emailService` into `AuthService`, which is then injected into `AuthController`.
- **Decoupled Low-Level Infrastructure**:
  - High-level business logic in `ProcessorService`, `ClientService`, or `AuthService` never directly imports or creates Mongoose models, raw SQL clients, or SMTP sockets. They interact exclusively with injected abstractions.
- **Effortless Unit Testing & Mocking**:
  - Because all dependencies are supplied via constructor parameters, unit test suites can pass in mock repositories, mock event producers, and mock email services without monkey-patching globals.

---

## 🛡️ Authentication & Authorization

### 🔒 Client Ingestion Authentication
External client application hits are authenticated via the [validateApiKey.js](server/src/shared/middlewares/validateApiKey.js) middleware.
1. The request supplies an `x-api-key` header.
2. The server calls the client services database layer [clientService.js](server/src/services/client/services/clientService.js) to retrieve client and API key details.
3. Checks if the client `isActive` and if the API key has the `canIngest` permission scope.
4. Attaches `req.client` and `req.apiKey` context to downstream requests.

### 🛡️ Role-Based Access Control (RBAC)
User access control is verified via [authenticate.js](server/src/shared/middlewares/authenticate.js) (extracting JWT cookie sessions) and [authorize.js](server/src/shared/middlewares/authorize.js) middleware enforcing role scopes.

| Role | Client Admin Scope | Clients List Scope | Onboard Clients | Manage Keys | View Analytics |
|---|:---:|:---:|:---:|:---:|:---:|
| **super_admin** | ✓ | ✓ | ✓ | ✓ | ✓ (All tenants) |
| **client_admin**| ✓ (Own tenant) | — | — | ✓ (Own tenant) | ✓ (Own tenant) |
| **client_viewer**| ✓ (Own tenant) | — | — | — | ✓ (Own tenant) |

---

## 🌊 Event-Driven Ingest Pipeline

The core mechanism of ObserveX is designed for reliability and zero-blocking of client systems.

```
Client Hit ➔ API Gateway ➔ [Validate Key & Rate Limit] ➔ [Confirm Channel Publish] ➔ [Ack / 202 Response]
                                                                │
                                                        RabbitMQ Broker
                                                                │
                                                   [Queue Consumer Engine]
                                                                │
                                                  ┌─────────────┴─────────────┐
                                                  ▼                           ▼
                                            [Write MongoDB]             [Upsert Postgres]
                                            (Throws error)             (Fallback Log-only)
```

### 📩 1. Ingestion Request
The client makes a `POST /api/hit` request. Inside [ingestController.js](server/src/services/ingest/controller/ingestController.js):
- Checks rate limits configured in [ingestRoutes.js](server/src/services/ingest/routes/ingestRoutes.js).
- Binds metadata (incoming IP, client ID, API key reference).
- Sends raw data payload to the Event Producer.

### 📤 2. Event Producer Publishing
Defined in [eventProducer.js](server/src/shared/events/producer/eventProducer.js):
- **Circuit Breaker check**: If RabbitMQ is down, the Circuit Breaker opens. New events fail fast, notifying the client via a `503 Service Unavailable` response.
- **Persistent Message Routing**: Messages are converted to JSON buffers and published with the `persistent: true` attribute.
- **Publisher Confirms**: Utilizes confirm channels to wait for RabbitMQ broker acknowledgment.
- **Transient Retries**: Attempts to republish on failures using the retry strategy (exponential backoff with jitter).

### 📥 3. Background Event Consumer
Defined in [consumer.js](server/src/services/processor/consumer.js):
- **Schema Validation**: Validates message payload formats using Zod schema models.
- **Idempotency Check**: Keeps an in-memory cache of the last 100,000 processed `messageId`s to reject duplicates.
- **MongoDB Storage (Critical)**: Writes the raw event object to MongoDB first. If this operation fails, the consumer rejects/re-queues the message.
- **PostgreSQL Telemetry Upsert (Non-Critical)**: Aggregates the request data into an hourly metric bucket and upserts PostgreSQL. If PostgreSQL fails, it logs a non-critical error but does **not** fail the message processing.
- **DLQ & Poison Message Control**: If a message fails consecutive validation or retries exceed maximum configuration thresholds, the message is routed to the Dead Letter Queue (`api_hits.dlq`) with details for manual inspection.

---

## 📊 Analytics & Aggregation Engine

Aggregated statistics are managed by [ProcessorService.js](server/src/services/processor/service/ProcessorService.js) and calculated inside [MetricsRepository.js](server/src/services/processor/repository/MetricsRepository.js).

### ⏱️ Time Buckets
Incoming events round their timestamp to the nearest hour using the `getTimeBucket` helper:
```javascript
getTimeBucket(timestamp, interval = 'hour') {
    const date = new Date(timestamp);
    date.setMinutes(0, 0, 0);
    return date;
}
```

### ⚡ PostgreSQL UPSERT Operation
When a metric record is written, PostgreSQL handles unique bucket conflicts:
```sql
INSERT INTO endpoint_metrics (
    client_id, service_name, endpoint, method, total_hits, error_hits,
    avg_latency, min_latency, max_latency, time_bucket
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
ON CONFLICT (client_id, service_name, endpoint, method, time_bucket)
DO UPDATE SET
   total_hits = endpoint_metrics.total_hits + EXCLUDED.total_hits,
   error_hits = endpoint_metrics.error_hits + EXCLUDED.error_hits,
   avg_latency = (
        (endpoint_metrics.avg_latency * endpoint_metrics.total_hits) +
        (EXCLUDED.avg_latency * EXCLUDED.total_hits)
    ) / (endpoint_metrics.total_hits + EXCLUDED.total_hits),
    min_latency = LEAST(endpoint_metrics.min_latency, EXCLUDED.min_latency),
    max_latency = GREATEST(endpoint_metrics.max_latency, EXCLUDED.max_latency),
    updated_at = CURRENT_TIMESTAMP
```

---

## 🔌 API Endpoints

### 📡 1. Ingestion Endpoint
- **URL**: `POST /api/hit`
- **Auth**: `x-api-key` header (required)
- **Headers**:
  ```http
  x-api-key: obs_live_38d8fjs...
  Content-Type: application/json
  ```
- **Payload**:
  ```json
  {
    "eventId": "evt_98374987",
    "timestamp": "2026-06-06T14:40:00Z",
    "serviceName": "payment-service",
    "endpoint": "/v1/charges",
    "method": "POST",
    "statusCode": 201,
    "latencyMs": 145.5
  }
  ```
- **Response** (`202 Accepted`):
  ```json
  {
    "success": true,
    "message": "API hit queued for processing",
    "statusCode": 202,
    "data": {
      "eventId": "evt_98374987",
      "status": "queued"
    }
  }
  ```

### 👤 2. Authentication Router (`/api/auth`)
- `POST /onboard-super-admin`: Registers a new independent Super Admin workspace.
- `POST /register`: Registers tenant users (`super_admin` only).
- `POST /login`: Verifies user credentials and sets secure httpOnly cookies.
- `GET /profile`: Retrieves the active user session details.
- `GET /logout`: Destroys the cookie session.

### 🏢 3. Client & Tenant Management Router (`/api`)
Defined in [clientRoutes.js](server/src/services/client/routes/clientRoutes.js).
- `GET /admin/clients`: Retrieves registered clients list for the authenticated Super Admin.
- `POST /admin/clients/onboard`: Registers a new tenant under the Super Admin's workspace.
- `POST /admin/clients/:clientId/users`: Adds a client user.
- `POST /admin/clients/:clientId/api/keys`: Issues a new scoped API Key.
- `GET /admin/clients/:clientId/api/keys`: Lists active API Keys.

### 📊 4. Telemetry Analytics Router (`/api/analytics`)
Defined in [analyticsRoutes.js](server/src/services/analytics/routes/analyticsRoutes.js).
- `GET /stats`: Aggregated summary statistics (hits, errors, latencies, counts).
- `GET /dashboard`: Full dashboard payload combining overall stats, top endpoints list, and recent activity metrics.

---

## 💻 Frontend Application & PWA

The frontend is a single-page React application hosted via Vite, integrating TanStack React Query for cached server syncs, ApexCharts for charts, and a full Progressive Web App (PWA) architecture with Capacitor native runtime support.

### 🗺️ Main Layout Routing Hierarchy
Defined in [App.jsx](dashboard/src/App.jsx).
- **Public Routes**:
  - `/` -> [LandingPage.jsx](dashboard/src/pages/LandingPage.jsx): Product overview and registration portal.
  - `/login`: Secure authentication portal.
  - `/onboard-super-admin`: Guided setup wizard for Super Admin workspaces.
- **Protected Layout Console Routes**:
  - `/client/dashboard` -> [ClientDashboardPage.jsx](dashboard/src/pages/ClientDashboardPage.jsx): Tenant-scoped usage data.
  - `/analytics` -> [AnalyticsOverviewPage.jsx](dashboard/src/pages/AnalyticsOverviewPage.jsx): Traffic aggregation dashboards.
  - `/analytics/endpoints` -> [EndpointAnalyticsPage.jsx](dashboard/src/pages/EndpointAnalyticsPage.jsx): In-depth path-by-path latency breakdown.
  - `/admin/clients` -> [ClientsListPage.jsx](dashboard/src/pages/ClientsListPage.jsx): Global client oversight panel (`super_admin` only).
  - `/admin/clients/:id` -> [ClientDetailsPage.jsx](dashboard/src/pages/ClientDetailsPage.jsx): Configuration settings for specific tenants.
  - `/admin/clients/:id/api-keys` -> [ApiKeysPage.jsx](dashboard/src/pages/ApiKeysPage.jsx): Key rotation and scoping controls.
  - `/activity` -> [ActivityLogsPage.jsx](dashboard/src/pages/ActivityLogsPage.jsx): Audit tracking page.
  - `/docs` -> [DocumentationPage.jsx](dashboard/src/pages/DocumentationPage.jsx): Integration SDK guides and quickstart commands.

### 📈 Visualization Dashboards
Recharts and ApexCharts are initialized dynamically inside components:
- [ApiHitsChart.jsx](dashboard/src/components/charts/ApiHitsChart.jsx): Chronological traffic volumes showing hit-to-error ratios.
- [LatencyChart.jsx](dashboard/src/components/charts/LatencyChart.jsx): Min/Max/Avg response times over time.
- [StatusDistributionChart.jsx](dashboard/src/components/charts/StatusDistributionChart.jsx): Breakdown of response statuses (2xx, 3xx, 4xx, 5xx).

### 📱 Progressive Web App (PWA) & Mobile Architecture
ObserveX provides a production-grade Progressive Web App experience designed for instant load times, offline resilience, and installability across mobile and desktop devices.

#### 1. Service Worker & Workbox Caching Strategy
Configured in [vite.config.js](dashboard/vite.config.js) using `vite-plugin-pwa`:
- **Pre-caching**: Automatically precaches core static bundles (HTML, JS, CSS, SVG, PNG icons) upon initial visit.
- **Google Fonts (Stylesheets)**: Uses **Stale-While-Revalidate** caching (`google-fonts-stylesheets`) with a 7-day cache TTL for immediate rendering with background updates.
- **Webfonts**: Uses **Cache-First** strategy (`google-fonts-webfonts`) caching font binaries for 365 days.
- **API Telemetry & Statistics**: Uses **Network-First** strategy with automatic fallback to cached responses (`api-cache`) over a 24-hour window when network connectivity is degraded or offline.

#### 2. Cross-Platform Bridge via Capacitor
Integrated through [capacitorService.js](dashboard/src/services/capacitorService.js) and [capacitor.config.json](dashboard/capacitor.config.json):
- **Network Status Monitoring (`@capacitor/network`)**: Real-time connectivity listener that automatically displays [OfflineIndicator.jsx](dashboard/src/components/pwa/OfflineIndicator.jsx) whenever the user loses internet access.
- **Tactile Haptic Feedback (`@capacitor/haptics`)**: Provides subtle physical feedback (`light`, `medium`, `selection`) when users refresh data, interact with primary buttons, or copy API keys.
- **Native Lifecycle (`@capacitor/app`)**: Listens to app state changes (foreground/background transitions) to refresh stale telemetry automatically when resumed.

#### 3. Installation Flow & User Experience
- **[PwaContext.jsx](dashboard/src/contexts/PwaContext.jsx)**: Global React context providing reactive access to `isInstallable`, `isInstalled`, `isStandalone`, and trigger methods.
- **[PwaInstallBanner.jsx](dashboard/src/components/pwa/PwaInstallBanner.jsx)**: Native-styled ObserveX floating banner on mobile and desktop with a polite 3-second auto-dismiss timer and smooth exit animations.
- **[PwaInstallModal.jsx](dashboard/src/components/pwa/PwaInstallModal.jsx)**: Contextual installation guide:
  - **iOS / Safari**: Shows clear visual steps to tap *Share* followed by *Add to Home Screen*.
  - **Android / Chrome**: Triggers the native `beforeinstallprompt` browser dialog.
  - **Desktop Chrome / Edge**: One-click install prompt to run ObserveX in its own dedicated app window.

#### 4. Mobile Viewport & Notch / Safe-Area Calibration
- **Viewport Cover**: Configured with `viewport-fit=cover` to allow seamless edge-to-edge layouts.
- **Notch & Status Bar**: Hardened status bar theming with `#000000` theme color and CSS `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` to ensure headers, sidebars, and auth cards naturally clear the iPhone Dynamic Island, camera notches, and home indicator bars.

---

## ⚙️ Quick Start & Setup

### 📋 Requirements
Ensure you have the following installed on your machine:
```text
Node.js     ≥ 18
MongoDB     ≥ 6.0
PostgreSQL  ≥ 15
RabbitMQ    ≥ 3.10
```

### 💻 Local Dev Setup

1. **Clone and Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure Database Schema**:
   Run the init script against your local PostgreSQL instance:
   ```bash
   psql -h localhost -U postgres -d api_monitoring -f scripts/init-postgres.sql
   ```

3. **Initialize Environment Variables**:
   Setup the `.env` file in the server directory based on the configuration guide below.

4. **Start Backend**:
   - Start the main Express server:
     ```bash
     npm run dev
     ```
   - Start the background queue consumer:
     ```bash
     npm run processor
     ```

5. **Start Frontend Dashboard**:
   ```bash
   cd ../dashboard
   npm install
   npm run dev
   ```
   Open and access the portal at `http://localhost:5173`.

---

### 🐳 Docker Compose Setup (Recommended)
ObserveX provides a complete containerized stack configured in [docker-compose.yml](server/docker-compose.yml) to deploy databases, message brokers, administration dashboard, ingestion servers, and consumers in one command.

#### Services Orchestrated:
- **`postgres`**: PostgreSQL database container (`postgres:15-alpine`) with SQL volume persistence and auto-initialized schema from [init-postgres.sql](server/scripts/init-postgres.sql). Runs internally on port `5432` (mapped to host `5433`).
- **`mongo`**: MongoDB document database (`mongo:6.0`) for raw event logging and client metadata persistence.
- **`rabbitmq`**: RabbitMQ message broker (`rabbitmq:3-management-alpine`) with the management dashboard enabled.
- **`pgadmin`**: pgAdmin portal (`dpage/pgadmin4:7`) for PostgreSQL monitoring (runs on host port `8080`).
- **`api-app`**: Ingestion server built from [Dockerfile](server/Dockerfile) (runs internally on port `5000` and maps to port `5001`).
- **`consumer`**: Event consumer built from [Dockerfile.consumer](server/Dockerfile.consumer) to process RabbitMQ event backlogs.

#### Commands:
- **Build and start the entire stack in the background**:
  ```bash
  cd server
  docker-compose up --build -d
  ```
- **Check container statuses and health check responses**:
  ```bash
  docker-compose ps
  ```
- **View streaming logs for the processor or server**:
  ```bash
  docker-compose logs -f consumer
  docker-compose logs -f api-app
  ```
- **Stop and terminate containers, networks, and resources**:
  ```bash
  docker-compose down
  ```

---

## 📝 Environment Configurations

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development

# Database connections
MONGO_URI=mongodb://localhost:27017/api_monitoring
MONGO_DB_NAME=api_monitoring

PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=api_monitoring
PG_USER=your_pg_user
PG_PASSWORD=your_pg_password

# Message Broker queue settings
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=api_hits
RABBITMQ_RETRY_ATTEMPTS=5
RABBITMQ_RETRY_DELAY=1000

# Auth credentials
JWT_SECRET=super_secret_high_entropy_key_observex_production
JWT_EXPIRES_IN=24h

# Global Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Frontend Application URL (used in email notifications)
APP_URL=http://localhost:5173

# Email & SMTP notifications (e.g. Brevo, Zoho, AWS SES)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=ObserveX <notifications@observex.io>
```

### Dashboard (`dashboard/.env`)
```env
VITE_API_URL=http://localhost:5000

# Optional: Remote backend proxy target for mobile device testing or production
VITE_API_PROXY_TARGET=https://observex-1.onrender.com
```
