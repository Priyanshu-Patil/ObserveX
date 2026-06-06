// DocumentationPage.jsx (PART 1)

import { useState } from "react";
import { Search,ChevronRight,Rocket,Shield,Code2,LayoutDashboard,Wrench,HelpCircle,Boxes,Copy,AlertTriangle,Info,Terminal,Activity,BarChart3,
} from "lucide-react";

import styles from "../styles/modules/pages/DocsPage.module.scss";

const DOC_PAGES = [
  {
    id: "quick-start",
    title: "Quick Start",
    icon: Rocket,
    category: "getting-started",
  },
  {
    id: "architecture",
    title: "Architecture",
    icon: Boxes,
    category: "getting-started",
  },
  {
    id: "authentication",
    title: "Authentication",
    icon: Shield,
    category: "guides",
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: Code2,
    category: "guides",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    category: "guides",
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: Wrench,
    category: "help",
  },
  {
    id: "faq",
    title: "FAQ",
    icon: HelpCircle,
    category: "help",
  },
];

function CopyButton({ text }) {
  const copy = async () => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <button type="button" className={styles.copyButton} onClick={copy}>
      <Copy size={14} />
      Copy
    </button>
  );
}

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSearch}>
        <Search size={16} />
        <input placeholder="Search documentation..." type="text" />
      </div>

      <div className={styles.sidebarGroup}>
        <p className={styles.groupTitle}>GETTING STARTED</p>

        {DOC_PAGES.filter((item) => item.category === "getting-started").map(
          (item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${
                  activePage === item.id ? styles.active : ""
                }`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={16} />
                {item.title}
              </button>
            );
          },
        )}
      </div>

      <div className={styles.sidebarGroup}>
        <p className={styles.groupTitle}>GUIDES</p>

        {DOC_PAGES.filter((item) => item.category === "guides").map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${
                activePage === item.id ? styles.active : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={16} />
              {item.title}
            </button>
          );
        })}
      </div>

      <div className={styles.sidebarGroup}>
        <p className={styles.groupTitle}>HELP</p>

        {DOC_PAGES.filter((item) => item.category === "help").map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${
                activePage === item.id ? styles.active : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={16} />
              {item.title}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function Hero() {
  return (
    <>
      <div className={styles.breadcrumb}>
        <span>Dashboard</span>

        <ChevronRight size={14} />

        <span>Documentation</span>
      </div>

      <div className={styles.hero}>
        <span className={styles.heroBadge}>DOCUMENTATION</span>

        <h1>Build, monitor and scale with ObserveX.</h1>

        <p>
          Everything you need to integrate the ObserveX API, understand your
          traffic, and ship with confidence.
        </p>
      </div>
    </>
  );
}

function SectionHeader({ label, title, description }) {
  return (
    <>
      <span className={styles.sectionLabel}>• {label}</span>

      <h2>{title}</h2>

      <p>{description}</p>
    </>
  );
}

const INTEGRATIONS = [
  {
    icon: "⬢",
    name: "Node.js",
    file: "observex.js",
    type: "javascript",
    description: "Generic integration for any Node.js environment using standard fetch API to send API request logs.",
    code: `// ObserveX API logs sender
async function reportApiHit(serviceName, endpoint, method, statusCode, latency) {
  try {
    const response = await fetch('https://api.observex.com/api/hit', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.OBSERVEX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceName,
        endpoint,
        method,
        statusCode: Number(statusCode),
        latency: Number(latency)
      })
    });
    return await response.json();
  } catch (error) {
    console.error('ObserveX log failed:', error);
  }
}

// Example usage:
const startTime = Date.now();
// ... run api logic ...
reportApiHit('auth-service', '/api/login', 'POST', 200, Date.now() - startTime);`
  },
  {
    icon: "🚂",
    name: "Express",
    file: "express.middleware.js",
    type: "javascript",
    description: "Drop-in middleware to automatically track endpoint routes, response statuses, and latencies across all API requests.",
    code: `const axios = require('axios');

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', async () => {
    try {
      await axios.post(
        'https://api.observex.com/api/hit',
        {
          serviceName: 'my-express-app',
          endpoint: req.route ? req.route.path : req.path,
          method: req.method,
          statusCode: res.statusCode,
          latency: Date.now() - start
        },
        {
          headers: {
            'x-api-key': process.env.OBSERVEX_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('ObserveX Express middleware logging error:', error.message);
    }
  });

  next();
});`
  },
  {
    icon: "⚛",
    name: "React",
    file: "apiClient.js",
    type: "javascript",
    description: "Client-side tracking for React projects using Axios request interceptors to automatically capture frontend API performance metrics.",
    code: `import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.myproject.com',
});

apiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

apiClient.interceptors.response.use(
  async (response) => {
    const latency = Date.now() - response.config.metadata.startTime;
    await reportToProxy(response, latency);
    return response;
  },
  async (error) => {
    const latency = Date.now() - error.config.metadata.startTime;
    await reportToProxy(error.response, latency, error.message);
    return Promise.reject(error);
  }
);

async function reportToProxy(response, latency, error = '') {
  if (!response) return;
  try {
    // Forward metrics securely through your backend server to keep the API key safe
    await axios.post('/api/monitor-proxy', {
      endpoint: response.config.url,
      method: response.config.method.toUpperCase(),
      statusCode: response.status,
      latency,
      error
    });
  } catch (err) {
    console.warn('ObserveX trace routing error:', err.message);
  }
}`
  },
  {
    icon: "▲",
    name: "Next.js",
    file: "middleware.js",
    type: "javascript",
    description: "ObserveX Next.js middleware logs routing times and status codes on the Edge for both standard Pages and App Router setups.",
    code: `import { NextResponse } from 'next/server';

export async function middleware(request) {
  const start = Date.now();
  const response = NextResponse.next();
  const endpoint = request.nextUrl.pathname;

  // Track API route performances asynchronously
  if (endpoint.startsWith('/api')) {
    const latency = Date.now() - start;

    fetch('https://api.observex.com/api/hit', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.OBSERVEX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceName: 'nextjs-api-route',
        endpoint,
        method: request.method,
        statusCode: response.status,
        latency
      })
    }).catch(err => console.error('ObserveX Next.js error:', err));
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};`
  },
  {
    icon: "🐈",
    name: "NestJS",
    file: "observex.interceptor.ts",
    type: "typescript",
    description: "NestJS Interceptor implementation. Intercepts incoming requests, processes, and submits status/latency info.",
    code: `import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import axios from 'axios';

@Injectable()
export class ObservexInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const start = Date.now();

    return next.handle().pipe(
      tap(async () => {
        const latency = Date.now() - start;
        try {
          await axios.post(
            'https://api.observex.com/api/hit',
            {
              serviceName: 'nestjs-microservice',
              endpoint: req.route ? req.route.path : req.url,
              method: req.method,
              statusCode: res.statusCode,
              latency
            },
            {
              headers: {
                'x-api-key': process.env.OBSERVEX_API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (error) {
          console.error('ObserveX NestJS log error:', error.message);
        }
      })
    );
  }
}`
  },
  {
    icon: "🌱",
    name: "Spring Boot",
    file: "ObservexFilter.java",
    type: "java",
    description: "OncePerRequestFilter implementation for Spring Boot applications to capture path, HTTP verb, response codes, and backend latency.",
    code: `package com.observex.filter;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

@Component
public class ObservexFilter extends OncePerRequestFilter {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey = System.getenv("OBSERVEX_API_KEY");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long latency = System.currentTimeMillis() - startTime;
            reportMetric(request.getRequestURI(), request.getMethod(), response.getStatus(), latency);
        }
    }

    private void reportMetric(String uri, String method, int status, long latency) {
        if (apiKey == null) return;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("serviceName", "spring-boot-service");
            body.put("endpoint", uri);
            body.put("method", method);
            body.put("statusCode", status);
            body.put("latency", latency);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity("https://api.observex.com/api/hit", entity, String.class);
        } catch (Exception e) {
            // Silently swallow errors to avoid blocking the main thread
        }
    }
}`
  },
  {
    icon: "🐳",
    name: "Docker",
    file: "docker-compose.yml",
    type: "yaml",
    description: "ObserveX Collector container configuration. Ideal for production environments where you run a local proxy collector to buffer logs.",
    code: `version: '3.8'

services:
  web-app:
    image: node:18-alpine
    ports:
      - "3000:3000"
    environment:
      - OBSERVEX_API_KEY=\${OBSERVEX_API_KEY}
    depends_on:
      - observex-collector

  observex-collector:
    image: observex/collector:latest
    restart: always
    ports:
      - "8080:8080"
    environment:
      - API_KEY=\${OBSERVEX_API_KEY}
      - FLUSH_INTERVAL_MS=2000
      - BUFFER_SIZE=500`
  }
];

function QuickStartPage() {
  const [selectedIntegration, setSelectedIntegration] = useState("Node.js");
  const currentIntegration = INTEGRATIONS.find(i => i.name === selectedIntegration) || INTEGRATIONS[0];

  const code = `curl -X POST https://api.observex.com/api/hit \\
                -H "x-api-key: apim_xxxxxxxxxxx" \\
                -H "Content-Type: application/json" \\
                -d '{
                "serviceName":"payment-service",
                "endpoint":"/api/payments",
                "method":"POST",
                "statusCode":200,
                "latency":145
                }'`;

  return (
    <>
      <div className={styles.pageIntro}>
        <Rocket size={16} />

        <span>Quick Start</span>

        <ChevronRight size={14} />

        <p>Start monitoring your APIs in under 5 minutes.</p>
      </div>

      <div className={styles.docCard}>
        <SectionHeader
          label="GETTING STARTED"
          title="Quick Start"
          description="Integrate ObserveX into your API in four simple steps."
        />

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <span>01</span>
            <h4>Create API Key</h4>
            <p>Generate a secure API key from your dashboard.</p>
          </div>

          <div className={styles.stepCard}>
            <span>02</span>
            <h4>Add Middleware</h4>
            <p>Track every incoming API request.</p>
          </div>

          <div className={styles.stepCard}>
            <span>03</span>
            <h4>Send Metrics</h4>
            <p>Push monitoring data over HTTPS.</p>
          </div>

          <div className={styles.stepCard}>
            <span>04</span>
            <h4>View Dashboard</h4>
            <p>Monitor traffic instantly.</p>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span>first-event.sh</span>

            <CopyButton text={code} />
          </div>

          <pre>{code}</pre>
        </div>
      </div>
      <div className={styles.integrationSection}>
        <div className={styles.integrationHeader}>
          <span className={styles.sectionLabel}>• EXAMPLES</span>

          <h3>Integrations</h3>

          <p>Drop-in snippets for the frameworks you already use.</p>
        </div>

        <div className={styles.tabsContainer}>
          {INTEGRATIONS.map((int) => (
            <button
              key={int.name}
              type="button"
              className={`${styles.tabButton} ${
                selectedIntegration === int.name ? styles.activeTab : ""
              }`}
              onClick={() => setSelectedIntegration(int.name)}
            >
              <span className={styles.tabIcon}>{int.icon}</span>
              <span className={styles.tabName}>{int.name}</span>
            </button>
          ))}
        </div>

        <p className={styles.setupDescription}>
          {currentIntegration.description}
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{currentIntegration.file}</span>

              <span className={styles.fileType}>{currentIntegration.type}</span>
            </div>

            <CopyButton text={currentIntegration.code} />
          </div>

          <pre>{currentIntegration.code}</pre>
        </div>
      </div>
    </>
  );
}

function ArchitecturePage() {
  return (
    <>
      <div className={styles.pageIntro}>
        <Boxes size={16} />

        <span>Architecture</span>

        <ChevronRight size={14} />

        <p>Understand how ObserveX processes API metrics.</p>
      </div>

      <div className={styles.docCard}>
        <SectionHeader
          label="CONCEPTS"
          title="Architecture"
          description="ObserveX collects API events from your application, processes them through a low latency pipeline and stores metrics for realtime analytics."
        />

        <div className={styles.architectureFlow}>
          <div className={styles.archCard}>
            <span>STEP 1</span>
            <Terminal size={18} />
            <h4>Your Application</h4>
            <p>SDK • Middleware • HTTP</p>
          </div>

          <div className={styles.archArrow} />

          <div className={styles.archCard}>
            <span>STEP 2</span>
            <Activity size={18} />
            <h4>Ingestion</h4>
            <p>Edge API • Auth</p>
          </div>

          <div className={styles.archArrow} />

          <div className={styles.archCard}>
            <span>STEP 3</span>
            <BarChart3 size={18} />
            <h4>Analytics Engine</h4>
            <p>Aggregate • Store</p>
          </div>

          <div className={styles.archArrow} />

          <div className={styles.archCard}>
            <span>STEP 4</span>
            <LayoutDashboard size={18} />
            <h4>Dashboard</h4>
            <p>Realtime UI</p>
          </div>
        </div>

        <div className={styles.infoCard}>
          <Info size={18} />

          <div>
            <h4>End-to-end latency</h4>

            <p>
              Events are typically visible within 2 seconds of being sent from
              your service.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function AuthenticationPage() {
  return (
    <>
      <div className={styles.pageIntro}>
        <Shield size={16} />

        <span>Authentication</span>

        <ChevronRight size={14} />

        <p>Secure communication using API keys.</p>
      </div>

      <div className={styles.docCard}>
        <SectionHeader
          label="SECURITY"
          title="Authentication"
          description="ObserveX uses API keys to authenticate every monitoring event sent from your application."
        />

        <div className={styles.warningCard}>
          <AlertTriangle size={18} />

          <div>
            <h4>Keep keys server-side</h4>

            <p>
              API keys should always remain on backend servers and never be
              exposed in frontend applications.
            </p>
          </div>
        </div>
        <div className={styles.authStepsGrid}>
          <div className={styles.authStep}>
            <span>01</span>
            <div>
              <h4>Open Dashboard</h4>
              <p>Login as Client Admin or Super Admin.</p>
            </div>
          </div>

          <div className={styles.authStep}>
            <span>02</span>
            <div>
              <h4>Navigate to API Keys</h4>
              <p>Open your client's API Keys section.</p>
            </div>
          </div>

          <div className={styles.authStep}>
            <span>03</span>
            <div>
              <h4>Create New Key</h4>
              <p>Select an environment and generate a key.</p>
            </div>
          </div>

          <div className={styles.authStep}>
            <span>04</span>
            <div>
              <h4>Store Securely</h4>
              <p>Save the key inside environment variables.</p>
            </div>
          </div>
        </div>

        <div className={styles.authCodeGrid}>
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span>Authorization Header</span>
              <CopyButton text="x-api-key: apim_xxxxxxxxxxx" />
            </div>

            <pre>
              {`x-api-key: apim_704cc048ced683634d7c9952398382287bf60157`}
            </pre>
          </div>

          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span>.env</span>
              <CopyButton text="OBSERVEX_API_KEY=apim_xxxxx" />
            </div>

            <pre>
              {`OBSERVEX_API_KEY=apim_704cc048ced683634d7c9952398382287bf60157`}
            </pre>
          </div>
        </div>

        <div className={styles.infoCard}>
          <Info size={18} />

          <div>
            <h4>Rotate regularly</h4>

            <p>You can revoke and regenerate keys anytime without downtime.</p>
          </div>
        </div>
      </div>
    </>
  );
}

function ApiReferencePage() {
  const requestBody = `{
  "serviceName": "payment-service",
  "endpoint": "/api/payments",
  "method": "POST",
  "statusCode": 200,
  "latency": 145
}`;

  return (
    <>
      <div className={styles.pageIntro}>
        <Code2 size={16} />

        <span>API Reference</span>

        <ChevronRight size={14} />

        <p>Send monitoring events directly using HTTP.</p>
      </div>

      <div className={styles.docCard}>
        <SectionHeader
          label="REFERENCE"
          title="API Reference"
          description="Submit monitoring events to ObserveX using a simple HTTPS endpoint."
        />

        <div className={styles.endpointCard}>
          <span className={styles.methodBadge}>POST</span>

          <code>https://api.observex.com/api/hit</code>
        </div>

        <h4 className={styles.blockTitle}>Headers</h4>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span>Required Headers</span>
            <CopyButton
              text={`x-api-key: apim_xxxxx\nContent-Type: application/json`}
            />
          </div>

          <pre>
            {`x-api-key: apim_xxxxxxxxxxx
            Content-Type: application/json`}
          </pre>
        </div>

        <h4 className={styles.blockTitle}>Request Body</h4>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span>event.json</span>
            <CopyButton text={requestBody} />
          </div>

          <pre>{requestBody}</pre>
        </div>

        <h4 className={styles.blockTitle}>Fields</h4>

        <table className={styles.fieldsTable}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>serviceName</td>
              <td>string</td>
              <td>Name of your service</td>
            </tr>

            <tr>
              <td>endpoint</td>
              <td>string</td>
              <td>API route being called</td>
            </tr>

            <tr>
              <td>method</td>
              <td>string</td>
              <td>GET, POST, PUT, DELETE</td>
            </tr>

            <tr>
              <td>statusCode</td>
              <td>number</td>
              <td>HTTP response status</td>
            </tr>

            <tr>
              <td>latency</td>
              <td>number</td>
              <td>Response time in ms</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.responseGrid}>
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span>200 Success</span>
            </div>

            <pre>
              {`{
                "success": true,
                "message": "Metric recorded successfully"
                }`}
            </pre>
          </div>

          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span>401 Unauthorized</span>
            </div>

            <pre>
              {`{
                "success": false,
                "message": "Invalid API Key"
                }`}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}

function DashboardPage() {
  const features = [
    "Traffic analytics",
    "Error monitoring",
    "Latency",
    "Health signals",
    "Endpoints",
    "Time ranges",
  ];

  return (
    <>
      <div className={styles.pageIntro}>
        <LayoutDashboard size={16} />

        <span>Dashboard</span>

        <ChevronRight size={14} />

        <p>Learn every dashboard feature.</p>
      </div>

      <div className={styles.docCard}>
        <SectionHeader
          label="PRODUCT"
          title="Dashboard"
          description="A minimal fast interface for understanding API behavior."
        />

        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div key={feature} className={styles.featureCard}>
              <LayoutDashboard size={18} />

              <h4>{feature}</h4>

              <p>Detailed insights and realtime monitoring.</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TroubleshootingPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const issues = [
    {
      question: "Metrics not showing up?",
      answer:
        "Verify your API key, ensure requests are reaching the /api/hit endpoint, and confirm the selected dashboard filters match your service.",
    },
    {
      question: "Getting 401 Unauthorized?",
      answer:
        "Make sure the x-api-key header is included in every request and that the API key is active and belongs to the correct client.",
    },
    {
      question: "High latency spikes?",
      answer:
        "Check downstream services, database queries, third-party APIs and infrastructure bottlenecks. ObserveX only reports latency measured by your application.",
    },
    {
      question: "Requests dropped during outages?",
      answer:
        "Verify network connectivity between your service and ObserveX. Consider implementing retries and buffering for critical environments.",
    },
  ];

  return (
    <>
      <div className={styles.pageIntro}>
        <Wrench size={16} />

        <span>Troubleshooting</span>

        <ChevronRight size={14} />

        <p>Common issues and fixes.</p>
      </div>

      <div className={styles.docCard}>
        <SectionHeader
          label="HELP"
          title="Troubleshooting"
          description="Quick fixes for the most common integration issues."
        />

        <div className={styles.accordionList}>
          {issues.map((issue, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={issue.question}
                className={`${styles.accordionItem} ${
                  isOpen ? styles.accordionOpen : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.accordionHeader}
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                >
                  <span>{issue.question}</span>

                  <ChevronRight
                    size={18}
                    className={
                      isOpen
                        ? styles.rotateIcon
                        : ""
                    }
                  />
                </button>

                {isOpen && (
                  <div className={styles.accordionContent}>
                    <p>{issue.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function FAQPage() {
  const faqs = [
    {
      q: "Does ObserveX store request bodies?",
      a: "No. ObserveX stores metadata and metrics only.",
    },
    {
      q: "Can I monitor multiple services?",
      a: "Yes. A single client can monitor many services.",
    },
    {
      q: "Can I create multiple API keys?",
      a: "Yes. Create separate keys per environment.",
    },
    {
      q: "How long is data retained?",
      a: "Raw events 30 days. Aggregated metrics 12 months.",
    },
  ];

  return (
    <>
      <div className={styles.pageIntro}>
        <HelpCircle size={16} />

        <span>FAQ</span>

        <ChevronRight size={14} />

        <p>Frequently asked questions.</p>
      </div>

      <div className={styles.docCard}>
        <SectionHeader
          label="HELP"
          title="Frequently asked questions"
          description="Short answers to the questions we get most often."
        />

        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <div key={faq.q} className={styles.faqCard}>
              <h4>{faq.q}</h4>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function DocumentationPage() {
  const [activePage, setActivePage] = useState("quick-start");

  const renderContent = () => {
    switch (activePage) {
      case "quick-start":
        return <QuickStartPage />;

      case "architecture":
        return <ArchitecturePage />;

      case "authentication":
        return <AuthenticationPage />;

      case "api-reference":
        return <ApiReferencePage />;

      case "dashboard":
        return <DashboardPage />;

      case "troubleshooting":
        return <TroubleshootingPage />;

      case "faq":
        return <FAQPage />;

      default:
        return <QuickStartPage />;
    }
  };

  return (
    <div className={styles.page}>
      <Hero />

      <div className={styles.docsGrid}>
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        <main className={styles.content}>{renderContent()}</main>
      </div>

      <div className={styles.footerBar}>
        <span>Last updated March 2026</span>
      </div>
    </div>
  );
}
