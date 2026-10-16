// docsData.js - Complete, verified documentation data model for ObserveX developer portal

export const DOCS_CATEGORIES = [
  {
    id: "get-started",
    title: "Get Started",
    description: "Foundational guides to get your services monitored in minutes.",
    pages: [
      { id: "overview", title: "Overview", icon: "BookOpen" },
      { id: "quickstart", title: "Quickstart", icon: "Rocket", badge: "5 min" },
      { id: "how-observex-works", title: "How ObserveX Works", icon: "Boxes" },
      { id: "create-first-service", title: "Create Your First Monitored Service", icon: "Server" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "SDK and middleware integration patterns for popular backend frameworks.",
    pages: [
      { id: "integration-node", title: "Node.js", icon: "Code2", status: "tested" },
      { id: "integration-express", title: "Express.js", icon: "Zap", status: "tested" },
      { id: "integration-react", title: "React Applications", icon: "Layers", status: "proxy-pattern" },
      { id: "integration-nextjs", title: "Next.js", icon: "Globe", status: "tested" },
      { id: "integration-nestjs", title: "NestJS", icon: "Terminal", status: "interceptor" },
      { id: "integration-manual-http", title: "Manual HTTP Integration", icon: "FileCode", status: "rest" },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    description: "Technical specifications for the ObserveX Ingestion REST API.",
    pages: [
      { id: "api-ingestion", title: "Ingestion API", icon: "Network", method: "POST" },
      { id: "api-authentication", title: "Authentication", icon: "Shield" },
      { id: "api-request-schema", title: "Request Schema", icon: "FileText" },
      { id: "api-response-codes", title: "Response Codes", icon: "CheckCircle2" },
      { id: "api-error-handling", title: "Error Handling", icon: "AlertTriangle" },
    ],
  },
  {
    id: "dashboard-guide",
    title: "Dashboard Guide",
    description: "Explore traffic analytics, endpoint latency, and client administration.",
    pages: [
      { id: "dashboard-clients-services", title: "Clients and Services", icon: "Building2" },
      { id: "dashboard-api-keys", title: "API Key Management", icon: "Key" },
      { id: "dashboard-traffic-analytics", title: "Traffic Analytics", icon: "BarChart3" },
      { id: "dashboard-endpoint-analytics", title: "Endpoint Analytics", icon: "LineChart" },
      { id: "dashboard-error-monitoring", title: "Error Monitoring", icon: "AlertOctagon" },
      { id: "dashboard-latency-analytics", title: "Latency Analytics", icon: "Clock" },
      { id: "dashboard-filters", title: "Filters and Time Ranges", icon: "Sliders" },
    ],
  },
  {
    id: "security-best-practices",
    title: "Security & Best Practices",
    description: "Security rules, zero-PII privacy, non-blocking telemetry, and reliability.",
    pages: [
      { id: "security-api-keys", title: "API Key Security", icon: "Lock" },
      { id: "security-env-vars", title: "Environment Variables", icon: "Cpu" },
      { id: "security-sensitive-data", title: "Sensitive Data Handling", icon: "ShieldCheck" },
      { id: "security-non-blocking", title: "Non-blocking Telemetry", icon: "Activity" },
      { id: "security-retries-buffering", title: "Retries and Buffering", icon: "RefreshCw" },
    ],
  },
  {
    id: "help",
    title: "Help",
    description: "Troubleshooting common errors and frequently asked questions.",
    pages: [
      { id: "troubleshooting", title: "Troubleshooting", icon: "Wrench" },
      { id: "faq", title: "FAQ", icon: "HelpCircle" },
    ],
  },
];

// Flat list of all pages for easy next/previous calculation
export const ALL_DOC_PAGES = DOCS_CATEGORIES.flatMap((category) =>
  category.pages.map((page) => ({
    ...page,
    categoryId: category.id,
    categoryTitle: category.title,
  }))
);

// Quickstart step-by-step checklist items
export const QUICKSTART_STEPS = [
  {
    step: 1,
    id: "step-client",
    title: "Select or Create Client",
    description: "In the ObserveX console, navigate to All Clients (/admin/clients) or your client dashboard. If you are Super Admin, you can onboard a client with a business name and slug.",
    badge: "Dashboard",
  },
  {
    step: 2,
    id: "step-key",
    title: "Generate an Ingestion API Key",
    description: "Open the API Keys page (/admin/clients/:id/api-keys). Click '+ Generate Key', select environment (Production/Staging), and copy your generated key immediately.",
    badge: "Security",
  },
  {
    step: 3,
    id: "step-env",
    title: "Configure Environment Variables",
    description: "Add OBSERVEX_API_KEY and OBSERVEX_BASE_URL to your server's .env file. Never commit this key to version control or expose it to frontend code.",
    badge: "Config",
  },
  {
    step: 4,
    id: "step-install",
    title: "Install Dependencies",
    description: "No proprietary agent or binary is needed. Use standard Node.js fetch (built into Node 18+) or axios in your backend project.",
    badge: "Terminal",
  },
  {
    step: 5,
    id: "step-middleware",
    title: "Mount ObserveX Middleware",
    description: "Add the non-blocking middleware to record start time, intercept response finish, and dispatch telemetry asynchronously to POST /api/hit.",
    badge: "Code",
  },
  {
    step: 6,
    id: "step-test",
    title: "Send a Test Request",
    description: "Trigger an endpoint in your application, or run a test cURL command with your API key to send a verified hit event.",
    badge: "Verify",
  },
  {
    step: 7,
    id: "step-dashboard",
    title: "Verify Metrics in Dashboard",
    description: "Open your ObserveX dashboard (/client/dashboard). Within seconds, your service name, endpoint, status code, and latency appear in the live metrics.",
    badge: "Complete",
  },
];

// Architecture Pipeline Steps
export const ARCHITECTURE_PIPELINE = [
  {
    id: "app",
    step: "01",
    title: "Client Request",
    subtitle: "Incoming HTTP Traffic",
    description: "User or mobile app makes an HTTP request to your monitored API server. Your server routes the request through standard middleware.",
    tech: "Your Service (Express, Next.js, Node)",
  },
  {
    id: "middleware",
    step: "02",
    title: "ObserveX Middleware",
    subtitle: "Non-blocking Finish Listener",
    description: "Middleware records start time (Date.now()). On res.on('finish'), captures endpoint path, method, status code, and computes latencyMs. Dispatches asynchronously.",
    tech: "res.on('finish') · Async Dispatch",
  },
  {
    id: "ingest",
    step: "03",
    title: "Ingestion API",
    subtitle: "POST /api/hit",
    description: "ObserveX validates x-api-key header, authenticates tenant, checks active status, validates request schema, and queues event to RabbitMQ. Returns 202 Accepted in ~10ms.",
    tech: "Express · Circuit Breaker · RabbitMQ",
  },
  {
    id: "processor",
    step: "04",
    title: "Event Consumer",
    subtitle: "Asynchronous Worker",
    description: "RabbitMQ consumer pulls events with prefetch control. Performs dual-write: stores raw event in MongoDB and upserts aggregated metrics in PostgreSQL with fallback protection.",
    tech: "RabbitMQ Consumer · Zod Validation",
  },
  {
    id: "storage",
    step: "05",
    title: "Dual-Database Storage",
    subtitle: "Audit + Aggregation",
    description: "MongoDB stores raw api_hits (with 30-day automatic TTL index). PostgreSQL stores pre-aggregated hourly rollups for instantaneous dashboard query performance.",
    tech: "MongoDB Atlas (Raw) + Neon PostgreSQL (Metrics)",
  },
  {
    id: "dashboard",
    step: "06",
    title: "Live Dashboard",
    subtitle: "Interactive Analytics",
    description: "TanStack React Query and ApexCharts query PostgreSQL aggregated data for instant throughput, latency percentiles, error rates, and endpoint breakdowns.",
    tech: "React 18 · ApexCharts · TanStack Query",
  },
];

// Verified API Request Fields from server/src/services/ingest/services/ingestServices.js
export const API_FIELDS = [
  {
    field: "serviceName",
    type: "string",
    required: true,
    constraints: "2 - 100 characters",
    description: "The unique identifier for the reporting service (e.g., 'auth-service', 'billing-api', 'payment-gateway').",
    example: '"auth-service"',
  },
  {
    field: "endpoint",
    type: "string",
    required: true,
    constraints: "Valid URL path string",
    description: "The HTTP route endpoint. We strongly recommend parameterized paths like '/api/users/:id' to prevent cardinality explosion.",
    example: '"/api/v1/auth/login"',
  },
  {
    field: "method",
    type: "string",
    required: true,
    constraints: "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
    description: "HTTP verb used for the request. Case-insensitive during ingestion; normalized to uppercase in storage.",
    example: '"POST"',
  },
  {
    field: "statusCode",
    type: "integer",
    required: true,
    constraints: "100 <= statusCode <= 599",
    description: "The final HTTP status code returned by your server to the client.",
    example: "200",
  },
  {
    field: "latencyMs",
    type: "number",
    required: true,
    constraints: "Float or Integer >= 0",
    description: "Total server response processing duration measured in milliseconds. (CRITICAL: Must be named 'latencyMs', not 'latency').",
    example: "142.5",
  },
  {
    field: "ip",
    type: "string",
    required: false,
    constraints: "Valid IPv4 or IPv6 string",
    description: "Originating client IP address. If omitted from payload, ObserveX automatically falls back to req.ip.",
    example: '"192.0.2.1"',
  },
  {
    field: "userAgent",
    type: "string",
    required: false,
    constraints: "String",
    description: "Client User-Agent header. If omitted, ObserveX automatically extracts it from the request headers.",
    example: '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"',
  },
];

// Verified API Response Status Codes
export const API_RESPONSE_CODES = [
  {
    code: 202,
    name: "Accepted",
    status: "success",
    meaning: "Payload passed authentication and schema validation, and was successfully queued in RabbitMQ for asynchronous aggregation.",
    sample: `{
  "success": true,
  "message": "API hit queued for processing",
  "data": {
    "eventId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "queued",
    "timestamp": "2026-10-16T14:48:00.000Z"
  },
  "statusCode": 202,
  "timestamp": "2026-10-16T14:48:00.000Z"
}`,
  },
  {
    code: 400,
    name: "Bad Request",
    status: "client-error",
    meaning: "Validation failed: missing required fields (e.g. latencyMs, serviceName), invalid HTTP method, status code out of 100-599 range, or API key passed in URL query parameter.",
    sample: `{
  "success": false,
  "message": "Missing required fields: latencyMs",
  "error": null,
  "statusCode": 400,
  "timestamp": "2026-10-16T14:48:00.000Z"
}`,
  },
  {
    code: 401,
    name: "Unauthorized",
    status: "client-error",
    meaning: "The required 'x-api-key' HTTP header was omitted from the request.",
    sample: `{
  "success": false,
  "message": "API key is required",
  "error": null,
  "statusCode": 401,
  "timestamp": "2026-10-16T14:48:00.000Z"
}`,
  },
  {
    code: 403,
    name: "Forbidden",
    status: "client-error",
    meaning: "The provided API key does not exist, belongs to an inactive client organization, or does not have ingest permissions enabled.",
    sample: `{
  "success": false,
  "message": "Invalid API key",
  "error": null,
  "statusCode": 403,
  "timestamp": "2026-10-16T14:48:00.000Z"
}`,
  },
  {
    code: 429,
    name: "Too Many Requests",
    status: "rate-limited",
    meaning: "Request rate exceeded the ingestion rate limit (100 requests/minute in production). Check RateLimit-* response headers.",
    sample: `{
  "success": false,
  "message": "Too many requests, please try again later",
  "statusCode": 429
}`,
  },
  {
    code: 503,
    name: "Service Unavailable",
    status: "server-error",
    meaning: "ObserveX RabbitMQ event producer circuit breaker is open due to downstream queue backpressure or maintenance.",
    sample: `{
  "success": false,
  "message": "Service temporarily unavailable",
  "error": {
    "eventId": "e98dfa21-9d93-4e89-b1d5-8664ecbfa34a",
    "reason": "service_unavailable",
    "retryAfter": "30 seconds"
  },
  "statusCode": 503,
  "timestamp": "2026-10-16T14:48:00.000Z"
}`,
  },
];

// Verified FAQ items
export const FAQ_ITEMS = [
  {
    q: "Does ObserveX store request or response payload bodies?",
    a: "No. ObserveX strictly enforces metadata-only ingestion. We only record serviceName, endpoint, method, statusCode, latencyMs, client IP, and User-Agent. Request bodies, query parameters, authorization tokens, passwords, cookies, and personal customer data are never ingested, stored, or processed.",
  },
  {
    q: "What is the retention period for API metrics and raw logs?",
    a: "Raw transactional API hits stored in MongoDB Atlas have an automatic TTL (Time-To-Live) index that permanently purges individual hit records after 30 days (2,592,000 seconds). High-level aggregated metrics stored in PostgreSQL are retained for reporting historical trends.",
  },
  {
    q: "Can I monitor multiple microservices under the same client organization?",
    a: "Yes. An API key belongs to a Client tenant organization. Any number of services or microservices (e.g. auth-service, orders-api, payments-worker) can report using the same client API key. The ObserveX dashboard lets you filter metrics by 'All Services' or drill down into any specific service.",
  },
  {
    q: "Can I send the API key as a URL query parameter?",
    a: "No. The ObserveX ingestion middleware strictly blocks API keys in URL query strings (e.g., ?apiKey=... or ?key=...) and immediately responds with a 400 Bad Request error ('Confidentiality violation: API keys must NOT be exposed in URL query parameters'). Query parameters leak into browser histories, server access logs, and proxy caches. You must always pass your key via the 'x-api-key' HTTP header.",
  },
  {
    q: "What happens to my API if ObserveX is temporarily unreachable?",
    a: "Nothing! ObserveX integrations follow the 'fail-open' non-blocking telemetry standard. Middleware dispatches telemetry after the HTTP response has already finished sending to the user (via res.on('finish')). Network errors or telemetry timeouts are caught silently in the background and will never disrupt, slow down, or fail your application's user responses.",
  },
  {
    q: "How does the ingestion circuit breaker work?",
    a: "The ObserveX backend incorporates a Circuit Breaker pattern on the ingestion producer. If RabbitMQ message brokers experience transient downtime or severe backpressure, the circuit breaker opens and returns HTTP 503 Service Unavailable with a 'retryAfter: 30 seconds' hint. This prevents thread starvation and protects both your service and ObserveX from cascade failures.",
  },
  {
    q: "How can I avoid high route cardinality with dynamic path parameters?",
    a: "When reporting endpoints like '/users/12345' or '/orders/uuid-here', avoid sending the raw dynamic path. Instead, use Express's req.route?.path (or req.baseUrl + req.route.path) so the endpoint is recorded as '/users/:id'. This keeps endpoint analytics grouped together and prevents database index degradation.",
  },
];

// Verified Troubleshooting Guides
export const TROUBLESHOOTING_ITEMS = [
  {
    id: "not-showing",
    title: "Metrics are not showing up in the dashboard",
    causes: [
      "The serviceName or endpoint in your request does not match the dashboard filter.",
      "The payload field was sent as 'latency' instead of the required 'latencyMs'.",
      "The RabbitMQ consumer service on the ObserveX backend is stopped.",
      "Your monitored application has not handled an incoming request yet.",
    ],
    solutions: [
      "Verify that your request payload specifies 'latencyMs' (e.g. { latencyMs: 120 }).",
      "Check that your dashboard filter is set to 'All Services' and the time range is set to 'Last 24 Hours' or 'All Time'.",
      "Send a verified test cURL request directly from your terminal to confirm that the ingestion endpoint returns HTTP 202 Accepted.",
      "Confirm that the backend background consumer (node src/services/processor/consumer.js) is running.",
    ],
  },
  {
    id: "err-401",
    title: "Receiving HTTP 401 Unauthorized",
    causes: [
      "The 'x-api-key' HTTP header is missing from your request.",
      "Header name was mistyped (e.g., 'apikey' or 'Authorization: Bearer' instead of 'x-api-key').",
    ],
    solutions: [
      "Ensure your HTTP client sends the header exactly as 'x-api-key: apim_your_key_here'.",
      "Check your server's .env file to confirm OBSERVEX_API_KEY is loaded and not undefined.",
    ],
  },
  {
    id: "err-403",
    title: "Receiving HTTP 403 Forbidden",
    causes: [
      "The API key string was rotated, revoked, or typed incorrectly.",
      "The client organization associated with the API key has been deactivated (isActive: false).",
      "The API key was created without ingest permissions (canIngest: false).",
    ],
    solutions: [
      "Log into ObserveX as a Client Admin or Super Admin and visit /admin/clients/:id/api-keys.",
      "Regenerate a new API key and update your server's OBSERVEX_API_KEY environment variable.",
      "Verify that your client account is marked 'Active' in the Clients list.",
    ],
  },
  {
    id: "err-400-query",
    title: "Receiving HTTP 400 'Confidentiality violation: API keys must NOT be exposed in URL query parameters'",
    causes: [
      "Your code passed the API key as a URL parameter like https://api.observex.com/api/hit?apiKey=...",
    ],
    solutions: [
      "Remove all query parameters from the URL. The endpoint MUST be exactly /api/hit.",
      "Pass the API key exclusively via the 'x-api-key' HTTP header.",
    ],
  },
  {
    id: "err-400-schema",
    title: "Receiving HTTP 400 'Missing required fields' or 'Invalid HTTP methods'",
    causes: [
      "Payload is missing one of: serviceName, endpoint, method, statusCode, latencyMs.",
      "Method is not in ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].",
      "Status code is not a valid integer between 100 and 599.",
      "latencyMs is negative or not a number.",
    ],
    solutions: [
      "Ensure all 5 required fields are present in the JSON body.",
      "Cast statusCode with parseInt(status, 10) and latencyMs with parseFloat(latency).",
      "Ensure method is capitalized or a standard HTTP string.",
    ],
  },
  {
    id: "err-429",
    title: "Receiving HTTP 429 Too Many Requests",
    causes: [
      "Your service exceeded the ingestion rate limit (100 requests/minute in production).",
    ],
    solutions: [
      "Inspect the standard RateLimit-Reset response header to see the retry window.",
      "Implement a small in-memory queue to batch or throttle telemetry dispatch under extreme loads.",
    ],
  },
  {
    id: "err-503",
    title: "Receiving HTTP 503 Service Unavailable",
    causes: [
      "The ObserveX RabbitMQ circuit breaker has tripped due to downstream queue backpressure.",
    ],
    solutions: [
      "ObserveX returns { error: { retryAfter: '30 seconds' } }.",
      "Your integration should catch the 503 gracefully without failing your primary request.",
      "Pause telemetry transmission for 30 seconds before resuming.",
    ],
  },
];
