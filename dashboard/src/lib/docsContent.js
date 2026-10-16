// docsContent.js - Comprehensive code examples and verified content for ObserveX developer portal

export const CODE_SNIPPETS = {
  // Quickstart & Express
  expressMiddleware: `// middleware/observex.js
// Production-ready, non-blocking ObserveX telemetry middleware for Express
import axios from 'axios';

const OBSERVEX_BASE_URL = process.env.OBSERVEX_BASE_URL || 'http://localhost:3000';
const OBSERVEX_API_KEY = process.env.OBSERVEX_API_KEY;

if (!OBSERVEX_API_KEY) {
  console.warn('[ObserveX] Warning: OBSERVEX_API_KEY environment variable is not set. Telemetry will be disabled.');
}

/**
 * ObserveX telemetry middleware
 * Captures request latency and status code asynchronously without blocking the user response.
 *
 * @param {Object} options
 * @param {string} options.serviceName - Unique name for your service (e.g. 'orders-api')
 */
export function observex(options = {}) {
  const serviceName = options.serviceName || process.env.OBSERVEX_SERVICE_NAME || 'api-service';

  return (req, res, next) => {
    // Record request start time
    const startTime = Date.now();

    // Listen for response completion so the client response is never delayed
    res.on('finish', () => {
      // Calculate server execution latency in milliseconds
      const latencyMs = Math.max(0, Date.now() - startTime);

      // Normalize endpoint path to avoid high-cardinality route explosion
      // Prefers route pattern like '/api/users/:id' over '/api/users/12345'
      const endpoint = req.route?.path
        ? (req.baseUrl || '') + req.route.path
        : (req.originalUrl || req.path).split('?')[0];

      // Ignore telemetry for health checks and ObserveX endpoints to prevent loops
      if (endpoint === '/health' || endpoint.includes('/api/hit')) {
        return;
      }

      const payload = {
        serviceName,
        endpoint,
        method: req.method.toUpperCase(),
        statusCode: res.statusCode,
        latencyMs, // CRITICAL: ObserveX requires 'latencyMs', not 'latency'
      };

      // Dispatch asynchronously to ObserveX Ingestion API
      // Fail-open: catch errors silently to guarantee zero impact on your service
      if (OBSERVEX_API_KEY) {
        axios
          .post(\`\${OBSERVEX_BASE_URL}/api/hit\`, payload, {
            headers: {
              'x-api-key': OBSERVEX_API_KEY,
              'Content-Type': 'application/json',
            },
            timeout: 3000, // 3-second timeout to avoid lingering sockets
          })
          .catch((err) => {
            // Debug log only — do not throw or disrupt your application
            if (process.env.NODE_ENV !== 'production') {
              console.debug('[ObserveX] Ingest warning:', err.response?.data?.message || err.message);
            }
          });
      }
    });

    next();
  };
}

export default observex;`,

  expressAppUsage: `// app.js - Registering ObserveX middleware in your Express application
import express from 'express';
import { observex } from './middleware/observex.js';

const app = express();
app.use(express.json());

// 1. Mount ObserveX middleware before your application routes
app.use(observex({ serviceName: 'user-service' }));

// 2. Define standard routes
app.get('/api/users/:id', (req, res) => {
  // Simulating database lookup
  res.json({ id: req.params.id, name: 'Alice', active: true });
});

app.post('/api/checkout', (req, res) => {
  res.status(201).json({ status: 'created', orderId: 'ord_9872' });
});

// 3. Health check (automatically filtered out by middleware)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(8080, () => {
  console.log('App listening on port 8080 with ObserveX monitoring enabled');
});`,

  // Node.js Vanilla HTTP
  nodeVanilla: `// lib/observex.js - Vanilla Node.js (Node 18+ native fetch)
const OBSERVEX_BASE_URL = process.env.OBSERVEX_BASE_URL || 'http://localhost:3000';
const OBSERVEX_API_KEY = process.env.OBSERVEX_API_KEY;

/**
 * Report an API hit event to ObserveX asynchronously
 *
 * @param {Object} event
 * @param {string} event.serviceName - Name of your service
 * @param {string} event.endpoint - HTTP route path (e.g. '/api/items')
 * @param {string} event.method - HTTP verb ('GET', 'POST', etc.)
 * @param {number} event.statusCode - Response HTTP status code (100-599)
 * @param {number} event.latencyMs - Processing duration in milliseconds
 */
export async function reportApiHit({ serviceName, endpoint, method, statusCode, latencyMs }) {
  if (!OBSERVEX_API_KEY) return;

  try {
    const response = await fetch(\`\${OBSERVEX_BASE_URL}/api/hit\`, {
      method: 'POST',
      headers: {
        'x-api-key': OBSERVEX_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceName,
        endpoint,
        method: method.toUpperCase(),
        statusCode: parseInt(statusCode, 10),
        latencyMs: parseFloat(latencyMs),
      }),
    });

    if (!response.ok && process.env.NODE_ENV !== 'production') {
      const errorData = await response.json().catch(() => ({}));
      console.debug('[ObserveX] Ingest warning:', errorData.message || response.statusText);
    }
  } catch (error) {
    // Fail-open: Never block or fail the primary application
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[ObserveX] Network error:', error.message);
    }
  }
}

// Example usage in a standard Node.js http server:
/*
import http from 'node:http';

const server = http.createServer(async (req, res) => {
  const start = Date.now();

  res.on('finish', () => {
    reportApiHit({
      serviceName: 'core-worker',
      endpoint: req.url.split('?')[0],
      method: req.method,
      statusCode: res.statusCode,
      latencyMs: Date.now() - start
    });
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello world' }));
});

server.listen(4000);
*/`,

  // React Proxy Pattern
  reactClientInterceptor: `// src/lib/apiClient.js (Frontend React Application)
// SECURITY NOTICE:
// Never put OBSERVEX_API_KEY or VITE_OBSERVEX_API_KEY in client-side code!
// Browser bundles are fully public and inspectable.
// Instead, forward client performance metrics through your own backend proxy route.

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// 1. Record request departure timestamp
apiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// 2. Compute client-observed latency and report to your backend proxy
apiClient.interceptors.response.use(
  (response) => {
    const latencyMs = Date.now() - (response.config.metadata?.startTime || Date.now());
    reportClientTelemetry({
      endpoint: response.config.url,
      method: response.config.method?.toUpperCase() || 'GET',
      statusCode: response.status,
      latencyMs,
    });
    return response;
  },
  (error) => {
    const latencyMs = Date.now() - (error.config?.metadata?.startTime || Date.now());
    reportClientTelemetry({
      endpoint: error.config?.url || 'unknown',
      method: error.config?.method?.toUpperCase() || 'GET',
      statusCode: error.response?.status || 500,
      latencyMs,
    });
    return Promise.reject(error);
  }
);

// Dispatches to your server-side proxy (which holds the secret ObserveX key)
function reportClientTelemetry(data) {
  // Use sendBeacon or detached fire-and-forget request
  navigator.sendBeacon?.(
    '/api/telemetry-proxy',
    JSON.stringify(data)
  );
}`,

  reactBackendProxy: `// server/routes/telemetryProxy.js (Server-Side Proxy in Express or Next.js)
// This backend handler runs securely on your server and injects OBSERVEX_API_KEY
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/api/telemetry-proxy', async (req, res) => {
  const { endpoint, method, statusCode, latencyMs } = req.body;

  // Immediately respond to frontend
  res.status(204).end();

  try {
    await axios.post(
      \`\${process.env.OBSERVEX_BASE_URL || 'http://localhost:3000'}/api/hit\`,
      {
        serviceName: 'frontend-web',
        endpoint: endpoint || '/unknown',
        method: method || 'GET',
        statusCode: parseInt(statusCode, 10) || 200,
        latencyMs: parseFloat(latencyMs) || 0,
      },
      {
        headers: {
          'x-api-key': process.env.OBSERVEX_API_KEY, // Kept secret on server
          'Content-Type': 'application/json',
        },
        timeout: 2000,
      }
    );
  } catch (err) {
    // Suppress proxy errors
  }
});

export default router;`,

  // Next.js App Router
  nextjsAppRouter: `// lib/observex-next.js (Next.js App Router API Route Wrapper)
// Works with Next.js 13+ App Router (route.ts / route.js)

const OBSERVEX_BASE_URL = process.env.OBSERVEX_BASE_URL || 'http://localhost:3000';
// Only accessible on server (no NEXT_PUBLIC_ prefix!)
const OBSERVEX_API_KEY = process.env.OBSERVEX_API_KEY;

export function withObserveX(handler, { serviceName = 'nextjs-api', endpoint }) {
  return async (request, context) => {
    const startTime = Date.now();
    let response;
    let statusCode = 500;

    try {
      response = await handler(request, context);
      statusCode = response.status;
      return response;
    } catch (error) {
      statusCode = 500;
      throw error;
    } finally {
      const latencyMs = Math.max(0, Date.now() - startTime);
      const url = new URL(request.url);
      const resolvedEndpoint = endpoint || url.pathname;

      if (OBSERVEX_API_KEY) {
        // Fire-and-forget detached async call
        fetch(\`\${OBSERVEX_BASE_URL}/api/hit\`, {
          method: 'POST',
          headers: {
            'x-api-key': OBSERVEX_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceName,
            endpoint: resolvedEndpoint,
            method: request.method.toUpperCase(),
            statusCode,
            latencyMs,
          }),
        }).catch((err) => {
          console.debug('[ObserveX Next.js error]:', err.message);
        });
      }
    }
  };
}

// Example usage in app/api/products/route.js:
/*
import { NextResponse } from 'next/server';
import { withObserveX } from '@/lib/observex-next';

async function getProductsHandler(req) {
  const products = [{ id: 1, name: 'Cloud Tier' }];
  return NextResponse.json({ success: true, data: products });
}

export const GET = withObserveX(getProductsHandler, {
  serviceName: 'storefront-api',
  endpoint: '/api/products'
});
*/`,

  // NestJS Interceptor
  nestjsInterceptor: `// src/common/interceptors/observex.interceptor.ts
// NestJS Interceptor using RxJS to record API hits
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import axios from 'axios';

@Injectable()
export class ObservexInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ObservexInterceptor.name);
  private readonly baseUrl = process.env.OBSERVEX_BASE_URL || 'http://localhost:3000';
  private readonly apiKey = process.env.OBSERVEX_API_KEY;
  private readonly serviceName = process.env.OBSERVEX_SERVICE_NAME || 'nestjs-service';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.sendHit(request, response, startTime),
        error: (err) => {
          const status = err.status || err.statusCode || 500;
          this.sendHit(request, { statusCode: status }, startTime);
        },
      })
    );
  }

  private sendHit(req: any, res: any, startTime: number): void {
    if (!this.apiKey) return;

    const latencyMs = Math.max(0, Date.now() - startTime);
    const endpoint = req.route?.path || req.url?.split('?')[0] || '/';

    const payload = {
      serviceName: this.serviceName,
      endpoint,
      method: (req.method || 'GET').toUpperCase(),
      statusCode: res.statusCode || 200,
      latencyMs,
    };

    axios
      .post(\`\${this.baseUrl}/api/hit\`, payload, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 2500,
      })
      .catch((err) => {
        this.logger.debug(\`Failed to send metric: \${err.message}\`);
      });
  }
}

// To register globally in main.ts:
// app.useGlobalInterceptors(new ObservexInterceptor());`,

  // Manual HTTP - cURL
  curlRequest: `curl -X POST https://api.observex.com/api/hit \\
  -H "x-api-key: apim_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceName": "payment-service",
    "endpoint": "/api/v1/payments",
    "method": "POST",
    "statusCode": 200,
    "latencyMs": 145.2
  }'`,

  // Manual HTTP - Python
  pythonSnippet: `# Python 3 with 'requests' library
import os
import requests

OBSERVEX_BASE_URL = os.getenv("OBSERVEX_BASE_URL", "https://api.observex.com")
OBSERVEX_API_KEY = os.getenv("OBSERVEX_API_KEY", "apim_your_api_key_here")

def report_api_hit(service_name, endpoint, method, status_code, latency_ms):
    payload = {
        "serviceName": service_name,
        "endpoint": endpoint,
        "method": method.upper(),
        "statusCode": int(status_code),
        "latencyMs": float(latency_ms),
    }
    headers = {
        "x-api-key": OBSERVEX_API_KEY,
        "Content-Type": "application/json",
    }
    try:
        response = requests.post(
            f"{OBSERVEX_BASE_URL}/api/hit",
            json=payload,
            headers=headers,
            timeout=2.0
        )
        return response.json()
    except requests.RequestException as e:
        print(f"[ObserveX] Warning: {e}")
        return None

# Test call
report_api_hit("billing-service", "/api/invoices", "GET", 200, 84.5)`,

  // Manual HTTP - Go
  goSnippet: `// Go standard net/http
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type ApiHitPayload struct {
	ServiceName string  \`json:"serviceName"\`
	Endpoint    string  \`json:"endpoint"\`
	Method      string  \`json:"method"\`
	StatusCode  int     \`json:"statusCode"\`
	LatencyMs   float64 \`json:"latencyMs"\`
}

func ReportApiHit(serviceName, endpoint, method string, statusCode int, latencyMs float64) {
	apiKey := os.Getenv("OBSERVEX_API_KEY")
	baseURL := os.Getenv("OBSERVEX_BASE_URL")
	if baseURL == "" {
		baseURL = "https://api.observex.com"
	}
	if apiKey == "" {
		return
	}

	payload := ApiHitPayload{
		ServiceName: serviceName,
		Endpoint:    endpoint,
		Method:      method,
		StatusCode:  statusCode,
		LatencyMs:   latencyMs,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return
	}

	client := &http.Client{Timeout: 2 * time.Second}
	req, err := http.NewRequest("POST", baseURL+"/api/hit", bytes.NewBuffer(jsonData))
	if err != nil {
		return
	}

	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("Content-Type", "application/json")

	go func() {
		resp, err := client.Do(req)
		if err == nil {
			_ = resp.Body.Close()
		}
	}()
}`,

  envSample: `# .env - Server configuration
# Your secret ObserveX Ingestion API key (generated in /admin/clients/:id/api-keys)
OBSERVEX_API_KEY=apim_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ObserveX Base URL (defaults to http://localhost:3000 in local dev, or your production URL)
OBSERVEX_BASE_URL=https://api.observex.com

# Service identifier reported to ObserveX
OBSERVEX_SERVICE_NAME=orders-service`,
};
