import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Terminal,
  Zap,
  ShieldCheck,
  Layers,
  Copy,
  Check,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Sparkles,
  Code2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import styles from "../styles/modules/pages/LandingPage.module.scss";
import { Footer, Navbar } from "../components/layout";
import MetaTags from "../components/MetaTags";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockFooter,
} from "../components/ui/code-block";

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 28, transition: { duration: 0.35, ease: "easeOut" } },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0, transition: { duration: 0.25 } },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardScale = {
  hidden: { opacity: 0, scale: 0.95, y: 18, transition: { duration: 0.3, ease: "easeOut" } },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -30, transition: { duration: 0.35, ease: "easeOut" } },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 30, transition: { duration: 0.35, ease: "easeOut" } },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── FAQ DATA ────────────────────────────────────────────────────────────────

const faqs = [
  {
    id: "q1",
    question: "How long does it take to integrate ObserveX into an existing service?",
    answer:
      "Most engineering teams are up and running in under 3 minutes. With zero external SDK dependencies, all you need is a standard HTTP POST request to /api/hit with your x-api-key header, or by dropping a lightweight middleware snippet into Express, FastAPI, Next.js, or Go.",
  },
  {
    id: "q2",
    question: "How does ObserveX monitor APIs without adding latency to requests?",
    answer:
      "ObserveX uses non-blocking asynchronous telemetry dispatching. Telemetry collection runs completely out-of-band and fails open, meaning your application requests are never delayed or blocked even during high traffic or network interruptions.",
  },
  {
    id: "q3",
    question: "Does ObserveX store sensitive payload data, tokens, or PII?",
    answer:
      "No. ObserveX is engineered specifically for performance and observability metadata: HTTP methods, route paths, status codes, roundtrip latency, and system timestamps. Request and response bodies are never ingested or stored unless explicitly configured with customized scrubbing filters.",
  },
  {
    id: "q4",
    question: "Can I use ObserveX across multiple environments and teams?",
    answer:
      "Yes. ObserveX features native multi-tenant architecture. You can generate separate scoped API keys, custom alert thresholds, and segregated telemetry views for development, staging, and production environments, as well as distinct client organizations.",
  },
  {
    id: "q5",
    question: "How does real-time error detection and latency spike alerting work?",
    answer:
      "ObserveX constantly computes sliding-window aggregates for error spikes (e.g. >1% 5xx statuses) and latency anomalies (p95 / p99 degradation). Instant notifications can be dispatched to Webhooks, email, and native mobile/desktop PWA push notifications.",
  },
  {
    id: "q6",
    question: "What frameworks and backend runtimes are supported?",
    answer:
      "Because ObserveX uses a standard, zero-dependency REST Ingestion API (POST /api/hit), it works natively with any language or runtime — Node.js, Express, Next.js, Python (FastAPI, Flask), Go, Spring Boot, Ruby, PHP, and serverless edge functions. If your service can make an HTTP request, it is fully supported.",
  },
  {
    id: "q7",
    question: "Can ObserveX handle sudden traffic spikes and high-throughput workloads?",
    answer:
      "Yes. Our ingestion infrastructure is built to scale horizontally and processes millions of incoming request metrics per second using high-performance queue buffers and distributed timeseries storage.",
  },
];

// ─── DATA ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: "📡",
    title: "Real-Time Monitoring",
    desc: "Track requests, latency, traffic spikes, and failures as they happen.",
  },
  {
    icon: "🚨",
    title: "Error Detection",
    desc: "Instantly identify failing endpoints and investigate issues before customers are affected.",
  },
  {
    icon: "📈",
    title: "Endpoint Analytics",
    desc: "Analyze endpoint performance trends, response times, and request volume.",
  },
  {
    icon: "🔑",
    title: "API Key Management",
    desc: "Generate, manage, and rotate monitoring keys securely across environments.",
  },
  {
    icon: "🏢",
    title: "Multi-Tenant Architecture",
    desc: "Manage multiple organizations, services, and environments from one platform.",
  },
  {
    icon: "📊",
    title: "Observability Dashboard",
    desc: "Get a complete picture of system health with powerful visual analytics.",
  },
];

// Live endpoints table (replaces "currencies")
const endpoints = [
  { method: "GET", path: "/api/users", latency: "82ms", status: 200 },
  { method: "POST", path: "/api/auth/login", latency: "145ms", status: 200 },
  { method: "GET", path: "/api/analytics", latency: "98ms", status: 200 },
  { method: "POST", path: "/api/payments", latency: "210ms", status: 201 },
  { method: "GET", path: "/api/reports", latency: "76ms", status: 200 },
];

// 4-step monitoring workflow
const workflow = [
  {
    step: "01",
    title: "Create API Key",
    desc: "Generate a secure monitoring key from ObserveX.",
  },
  {
    step: "02",
    title: "Integrate Middleware",
    desc: "Add monitoring to your application with a few lines of code.",
  },
  {
    step: "03",
    title: "Send Metrics",
    desc: "ObserveX collects request data automatically.",
  },
  {
    step: "04",
    title: "Analyze Performance",
    desc: "View latency, uptime, errors and endpoint insights instantly.",
  },
];

// Architecture flow nodes
const architecture = [
  "Application",
  "ObserveX Ingestion API",
  "Analytics Engine",
  "Real-Time Dashboard",
];

// ─── INTEGRATIONS ECOSYSTEM DATA ─────────────────────────────────────────────

const ICONS_MAP = {
  express: { src: "/icons/express.png", invert: true, alt: "Express.js" },
  nextjs: { src: "/icons/nextjs.png", invert: false, isNext: true, alt: "Next.js" },
  fastapi: { src: "/icons/FastAPI.png", invert: false, alt: "FastAPI" },
  nestjs: { src: "/icons/nestjs.png", invert: false, alt: "NestJS" },
  springboot: { src: "/icons/springboot.png", invert: false, alt: "Spring Boot" },
  golang: { src: "/icons/golang.png", invert: false, alt: "Go (Gin)" },
  curl: { src: "/icons/curl.png", invert: true, alt: "cURL / Ingestion API" },
};

const renderTechIcon = (id, extraClass = "") => {
  const meta = ICONS_MAP[id] || { src: `/icons/${id}.png`, invert: false, alt: `${id} icon` };
  const classNames = [
    styles.techIconImg,
    meta.invert ? styles.techIconInvert : "",
    meta.isNext ? styles.techIconNext : "",
    extraClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      src={meta.src}
      alt={meta.alt}
      className={classNames}
      loading="lazy"
    />
  );
};

const INTEGRATIONS_DATA = [
  {
    id: "express",
    name: "Express.js",
    tag: "Node.js",
    install: "Native fetch or npm install axios",
    lang: "javascript",
    icon: "/icons/express.png",
    code: `// Express.js middleware sending telemetry to ObserveX /api/hit
import express from 'express';

const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    fetch('https://api.observex.dev/api/hit', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.OBSERVEX_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceName: 'user-auth-service',
        endpoint: req.route?.path || req.path,
        method: req.method,
        statusCode: res.statusCode,
        latencyMs: Math.max(0, Date.now() - start),
      }),
    }).catch(() => {}); // Non-blocking fail-open
  });
  next();
});`,
    desc: "Captures request latency, response codes, and uncaught error spikes with zero external package dependencies.",
    accent: "#68a063",
  },
  {
    id: "nextjs",
    name: "Next.js",
    tag: "Edge / Vercel",
    install: "Native Edge Runtime fetch (Zero Dependencies)",
    lang: "typescript",
    icon: "/icons/nextjs.png",
    code: `// middleware.ts (Next.js Edge & Serverless Runtime)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();

  fetch('https://api.observex.dev/api/hit', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.OBSERVEX_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      serviceName: 'next-web-app',
      endpoint: request.nextUrl.pathname,
      method: request.method,
      statusCode: response.status,
      latencyMs: Date.now() - start,
    }),
  }).catch(() => {});

  return response;
}

export const config = { matcher: '/api/:path*' };`,
    desc: "Seamless edge and serverless observability logging API routes directly to ObserveX /api/hit.",
    accent: "#ffffff",
  },
  {
    id: "fastapi",
    name: "FastAPI",
    tag: "Python ASGI",
    install: "pip install httpx",
    lang: "python",
    icon: "/icons/FastAPI.png",
    code: `# FastAPI ASGI middleware dispatching to ObserveX /api/hit
import time, httpx
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def observex_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    latency_ms = int((time.time() - start) * 1000)

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.observex.dev/api/hit",
            headers={"x-api-key": "ox_live_key"},
            json={
                "serviceName": "payment-gateway",
                "endpoint": request.url.path,
                "method": request.method,
                "statusCode": response.status_code,
                "latencyMs": latency_ms,
            },
            timeout=2.0
        )
    return response`,
    desc: "Asynchronous telemetry collection engineered specifically for high-throughput ASGI event loops.",
    accent: "#009688",
  },
  {
    id: "nestjs",
    name: "NestJS",
    tag: "TypeScript",
    install: "npm install axios",
    lang: "typescript",
    icon: "/icons/nestjs.png",
    code: `// observex.interceptor.ts - NestJS Global Interceptor
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import axios from 'axios';

@Injectable()
export class ObservexInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        axios.post('https://api.observex.dev/api/hit', {
          serviceName: 'nest-gateway',
          endpoint: req.route?.path || req.url,
          method: req.method,
          statusCode: res.statusCode,
          latencyMs: Date.now() - start,
        }, {
          headers: { 'x-api-key': process.env.OBSERVEX_API_KEY },
          timeout: 2000,
        }).catch(() => {});
      })
    );
  }
}`,
    desc: "Lightweight interceptor piping request telemetry directly to /api/hit out-of-band.",
    accent: "#e0234e",
  },
  {
    id: "springboot",
    name: "Spring Boot",
    tag: "Java / JVM",
    install: "implementation 'org.springframework.boot:spring-boot-starter-webflux'",
    lang: "java",
    icon: "/icons/springboot.png",
    code: `// WebFilter logging requests to ObserveX /api/hit
@Component
public class ObserveXFilter implements WebFilter {
    private final WebClient client = WebClient.create("https://api.observex.dev");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        long start = System.currentTimeMillis();
        return chain.filter(exchange).doFinally(signal -> {
            long latency = System.currentTimeMillis() - start;
            client.post().uri("/api/hit")
                .header("x-api-key", System.getenv("OBSERVEX_KEY"))
                .bodyValue(Map.of(
                    "serviceName", "catalog-service",
                    "endpoint", exchange.getRequest().getPath().value(),
                    "method", exchange.getRequest().getMethod().name(),
                    "statusCode", exchange.getResponse().getStatusCode().value(),
                    "latencyMs", latency
                )).retrieve().bodyToMono(Void.class).subscribe();
        });
    }
}`,
    desc: "Non-blocking WebFilter integration dispatching Spring Boot telemetry to ObserveX /api/hit.",
    accent: "#6db33f",
  },
  {
    id: "golang",
    name: "Go (Gin)",
    tag: "Golang",
    install: "Standard net/http (Zero Dependencies)",
    lang: "go",
    icon: "/icons/golang.png",
    code: `package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "time"
    "github.com/gin-gonic/gin"
)

func ObserveX() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()

        go func(latency int64, status int, path, method string) {
            body, _ := json.Marshal(map[string]interface{}{
                "serviceName": "order-service",
                "endpoint":    path,
                "method":      method,
                "statusCode":  status,
                "latencyMs":   latency,
            })
            req, _ := http.NewRequest("POST", "https://api.observex.dev/api/hit", bytes.NewBuffer(body))
            req.Header.Set("x-api-key", "ox_live_key")
            req.Header.Set("Content-Type", "application/json")
            http.DefaultClient.Do(req)
        }(time.Since(start).Milliseconds(), c.Writer.Status(), c.FullPath(), c.Request.Method)
    }
}`,
    desc: "Ultra-low allocation telemetry dispatcher crafted for maximum Go runtime concurrency.",
    accent: "#00add8",
  },
  {
    id: "curl",
    name: "cURL / HTTP",
    tag: "Universal REST",
    install: "cURL, fetch, requests, or any HTTP client",
    lang: "bash",
    icon: "/icons/curl.png",
    code: `curl -X POST https://api.observex.dev/api/hit \\
  -H "x-api-key: ox_live_a89f217c4e..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceName": "auth-service",
    "endpoint": "/api/v1/oauth/token",
    "method": "POST",
    "statusCode": 200,
    "latencyMs": 38
  }'`,
    desc: "Universal RFC 7231 REST telemetry ingestion endpoint for any language, CLI, or edge worker.",
    accent: "#a855f7",
  },
];

const stats = [
  { val: "10", sup: "M+", label: "Requests Monitored" },
  { val: "99.99", sup: "%", label: "Platform Uptime" },
  { val: "500", sup: "+", label: "Endpoints Tracked" },
  { val: "50", sup: "+", label: "Organizations" },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Senior Backend Engineer",
    text: "ObserveX helped us identify API bottlenecks within days of deployment.",
  },
  {
    name: "Priya Mehta",
    role: "Engineering Manager",
    text: "The endpoint analytics dashboard gives us visibility we never had before.",
  },
  {
    name: "Arjun Patel",
    role: "CTO",
    text: "Simple setup, powerful insights, and a clean user experience.",
  },
  {
    name: "Sara Lin",
    role: "Site Reliability Engineer",
    text: "We caught a regression in production minutes after deploy. Game changer for our on-call rotation.",
  },
  {
    name: "Marcus Reid",
    role: "Platform Engineer",
    text: "Multi-tenant support let us roll ObserveX out across every team without spinning up extra infra.",
  },
  {
    name: "Aiko Tanaka",
    role: "Full-Stack Developer",
    text: "Integration took under five minutes. The latency breakdowns by endpoint are incredibly clear.",
  },
];

// Real HTTP ingestion examples sending directly to ObserveX /api/hit
const CODE_EXAMPLES = {
  express: {
    label: "Express.js",
    file: "server.js",
    pill: "POST /api/hit",
    status: "200 OK · Ingested",
    icon: "/icons/express.png",
    invert: true,
    code: `const express = require('express');
const axios = require('axios');

const app = express();

// Non-blocking telemetry middleware sending to ObserveX /api/hit
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    axios.post('https://api.observex.dev/api/hit', {
      serviceName: 'payments-api',
      endpoint: req.route?.path || req.path,
      method: req.method,
      statusCode: res.statusCode,
      latencyMs: Date.now() - start,
    }, {
      headers: { 'x-api-key': process.env.OBSERVEX_API_KEY },
      timeout: 2000,
    }).catch(() => {}); // Fails open without interrupting requests
  });
  next();
});

app.get('/api/v1/checkout', (req, res) => {
  res.json({ success: true, processedAt: Date.now() });
});

app.listen(3000);`,
  },
  python: {
    label: "FastAPI / Python",
    file: "main.py",
    pill: "POST /api/hit",
    status: "200 OK · Ingested",
    icon: "/icons/FastAPI.png",
    invert: false,
    code: `import time, httpx
from fastapi import FastAPI, Request

app = FastAPI(title="Billing Service")

# Asynchronous telemetry dispatch to ObserveX /api/hit
@app.middleware("http")
async def observex_telemetry(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    latency_ms = int((time.time() - start) * 1000)

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.observex.dev/api/hit",
            headers={"x-api-key": "ox_live_key"},
            json={
                "serviceName": "billing-api",
                "endpoint": request.url.path,
                "method": request.method,
                "statusCode": response.status_code,
                "latencyMs": latency_ms,
            },
            timeout=2.0
        )
    return response

@app.get("/api/v1/subscriptions")
async def get_subscriptions():
    return {"status": "active", "tier": "enterprise"}`,
  },
  curl: {
    label: "cURL / Ingestion",
    file: "ingest.sh",
    pill: "POST /api/hit",
    status: "201 Queued",
    icon: "/icons/curl.png",
    invert: true,
    code: `curl -X POST https://api.observex.dev/api/hit \\
  -H "x-api-key: ox_live_a89f217c4e..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceName": "auth-service",
    "endpoint": "/api/v1/oauth/token",
    "method": "POST",
    "statusCode": 200,
    "latencyMs": 38
  }'`,
  },
  node: {
    label: "Node.js (Fetch)",
    file: "tracker.ts",
    pill: "fetch('/api/hit')",
    status: "200 OK · Ingested",
    icon: "/icons/express.png",
    invert: true,
    code: `// Native Node.js 18+ fetch — Zero external dependencies
const start = Date.now();

const response = await fetch('https://api.observex.dev/api/hit', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.OBSERVEX_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    serviceName: 'orders-worker',
    endpoint: '/workers/invoice-generate',
    method: 'POST',
    statusCode: 200,
    latencyMs: 84,
  }),
});`,
  },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("express");
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaqId, setOpenFaqId] = useState("q1");
  const [selectedIntegrationId, setSelectedIntegrationId] = useState("express");
  const [copiedInstallCmd, setCopiedInstallCmd] = useState(false);

  const selectedIntegration =
    INTEGRATIONS_DATA.find((item) => item.id === selectedIntegrationId) ||
    INTEGRATIONS_DATA[0];

  const handleCopyInstallCmd = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedInstallCmd(true);
    setTimeout(() => setCopiedInstallCmd(false), 2000);
  };

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeTab].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      autoRaf: true,
    });

    window.__lenis = lenis;

    return () => {
      lenis.destroy();
      if (window.__lenis === lenis) {
        window.__lenis = null;
      }
    };
  }, []);

  const initials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const goOnboard = () => navigate("/onboard-super-admin");

  return (
    <div className={styles.page}>
      <MetaTags
        title="ObserveX - Real-Time API Monitoring & Observability Platform"
        description="Monitor every API and detect latency, failures, and endpoint performance spikes before users notice. Complete visibility in under 5 minutes."
        keywords="api monitoring, api observability, real-time analytics, latency tracker, error detection, developer tools, system health, uptime monitoring"
        canonical="/"
        ogImage="/1.png"
        robots="index, follow"
      />
      {/* ── NAV ── */}
      <Navbar />


      {/* ── HERO ── */}
      <section id="homepage" className={styles.hero}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <motion.div variants={fadeInUp} className={styles.heroBadge}>
            Real-Time API Monitoring Platform
          </motion.div>

          <motion.h1 variants={fadeInUp} className={styles.heroTitle}>
            Monitor Every API.<br />
            <em>Detect Problems Before Users Notice.</em>
          </motion.h1>

          <motion.p variants={fadeInUp} className={styles.heroDesc}>
            Track latency, uptime, traffic, failures, and endpoint health across your
            entire infrastructure from a single dashboard.
          </motion.p>

          <motion.div variants={fadeInUp} className={styles.heroActions}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={styles.btnPrimary}
              onClick={goOnboard}
            >
              Get Started Free
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          {/* Dashboard preview cards */}
          <motion.div variants={staggerContainer} className={styles.heroMockup}>
            <motion.div variants={cardScale} whileHover={{ y: -6, scale: 1.02 }} className={styles.mockupCard}>
              <div className={styles.cardLabel}>TOTAL REQUESTS</div>
              <div className={styles.cardValue}>2.4M</div>
              <div className={`${styles.cardBadge} ${styles.up}`}>↑ +12.5% this week</div>
            </motion.div>

            <motion.div variants={cardScale} whileHover={{ y: -6, scale: 1.02 }} className={styles.mockupCard}>
              <div className={styles.cardLabel}>AVERAGE LATENCY</div>
              <div className={styles.cardValue}>142ms</div>
              <div className={`${styles.cardBadge} ${styles.up}`}>● Healthy Performance</div>
            </motion.div>

            <motion.div variants={cardScale} whileHover={{ y: -6, scale: 1.02 }} className={styles.mockupCard}>
              <div className={styles.cardLabel}>ERROR RATE</div>
              <div className={styles.cardValue}>0.7%</div>
              <div className={`${styles.cardBadge} ${styles.neutral}`}>● Within Threshold</div>
            </motion.div>

            <motion.div variants={cardScale} whileHover={{ y: -6, scale: 1.02 }} className={styles.mockupCard}>
              <div className={styles.cardLabel}>UPTIME</div>
              <div className={styles.cardValue}>99.99%</div>
              <div className={`${styles.cardBadge} ${styles.up}`}>↑ Last 30 Days</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresSectionInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
            className={styles.featuresHeader}
          >
            <div className={styles.sectionLabel}>FEATURES</div>
            <h2 className={styles.sectionTitle}>
              Everything You Need To<br />Monitor APIs
            </h2>
            <p className={styles.sectionSub}>
              Built for engineering teams that need complete visibility into API
              performance and reliability.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={staggerContainer}
            className={styles.featuresGrid}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={cardScale}
                whileHover={{ y: -8, scale: 1.02 }}
                className={styles.featureCard}
              >
                <div className={styles.featureIconWrap}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── LIVE ENDPOINTS (was currencies) ── */}
      <section className={styles.currenciesSection}>
        <div className={styles.currenciesInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={slideFromLeft}
            className={styles.currenciesContent}
          >
            <div className={styles.sectionLabel}>LIVE ENDPOINTS</div>
            <h2 className={styles.sectionTitle}>
              Every request,<br />every endpoint,<br />in real time.
            </h2>
            <p className={styles.sectionSub}>
              ObserveX streams live request telemetry from every service so you can
              see latency, throughput, and errors across your APIs the moment they
              happen.
            </p>

            <div className={styles.benefitsList}>
              {[
                "Inspect endpoint latency and status codes live",
                "Filter traffic by service, method, or environment",
                "Trace failing requests back to the source instantly",
              ].map((b) => (
                <div key={b} className={styles.benefitItem}>
                  <span className={styles.check}>✓</span>
                  {b}
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={styles.btnPrimary}
              onClick={goOnboard}
              style={{ display: "inline-flex" }}
            >
              Get Started <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={slideFromRight}
            whileHover={{ scale: 1.01 }}
            className={styles.currencyPanel}
          >
            <div className={styles.currencyPanelHeader}>
              <span>Live Endpoints · Streaming</span>
              <span className={styles.livePulse}>● LIVE</span>
            </div>
            {endpoints.map((e) => (
              <div key={e.path} className={styles.currencyRow}>
                <div
                  className={`${styles.methodBadge} ${styles[`method${e.method}`]}`}
                >
                  {e.method}
                </div>
                <div className={styles.currencyInfo}>
                  <div className={styles.currencyCode}>{e.path}</div>
                  <div className={styles.currencyName}>
                    Status {e.status} · healthy
                  </div>
                </div>
                <div>
                  <div className={styles.currencyAmount}>{e.latency}</div>
                  <div className={styles.currencyRate}>p95 latency</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MONITORING WORKFLOW ── */}
      <section className={styles.workflowSection}>
        <div className={styles.workflowInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
            className={styles.workflowHeader}
          >
            <div className={styles.sectionLabel}>WORKFLOW</div>
            <h2 className={styles.sectionTitle}>Monitor APIs In Minutes</h2>
            <p className={styles.sectionSub} style={{ margin: "0 auto" }}>
              A simple four-step workflow to bring full observability to every
              service in your stack.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={staggerContainer}
            className={styles.workflowGrid}
          >
            {workflow.map((w, i) => (
              <motion.div
                key={w.step}
                variants={cardScale}
                whileHover={{ y: -6, scale: 1.02 }}
                className={styles.workflowCard}
              >
                <div className={styles.workflowStep}>{w.step}</div>
                <h3 className={styles.workflowTitle}>{w.title}</h3>
                <p className={styles.workflowDesc}>{w.desc}</p>
                {i < workflow.length - 1 && (
                  <div className={styles.workflowConnector}>→</div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ARCHITECTURE / BUILT FOR SCALE (was phone mockup) ── */}
      <section className={styles.phoneMockupSection}>
        <div className={styles.phoneMockupInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={slideFromLeft}
            className={styles.architectureVisual}
          >
            <div className={styles.architectureHeader}>
              <div className={styles.archDot} />
              <span>Data Pipeline</span>
            </div>
            <div className={styles.architectureFlow}>
              {architecture.map((node, i) => (
                <div key={node} className={styles.archNodeWrap}>
                  <div
                    className={`${styles.archNode} ${
                      i === architecture.length - 1 ? styles.archNodeFinal : ""
                    }`}
                  >
                    <div className={styles.archNodeIcon}>
                      {i === 0 ? "🖥" : i === 1 ? "⇄" : i === 2 ? "⚙" : "📊"}
                    </div>
                    <div className={styles.archNodeLabel}>{node}</div>
                  </div>
                  {i < architecture.length - 1 && (
                    <div className={styles.archArrow}>↓</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={slideFromRight}
            className={styles.phoneMockupContent}
          >
            <div className={styles.sectionLabel}>ARCHITECTURE</div>
            <h2 className={styles.sectionTitle}>
              Built For Scale.<br />Engineered For Reliability.
            </h2>
            <p className={styles.sectionSub}>
              ObserveX processes millions of API events and transforms them into
              actionable insights in real time. From ingestion to dashboard, every
              layer is built to scale with your traffic.
            </p>

            <div className={styles.benefitsList} style={{ marginTop: "1.5rem" }}>
              {[
                "High-throughput ingestion handles millions of events",
                "Analytics engine aggregates metrics in milliseconds",
                "Real-time dashboards update without page refresh",
              ].map((b) => (
                <div key={b} className={styles.benefitItem}>
                  <span className={styles.check}>✓</span>
                  {b}
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={styles.btnPrimary}
              style={{ marginTop: "1.5rem", display: "inline-flex" }}
              onClick={goOnboard}
            >
              Get Started <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section id="integrations" className={styles.integrationsSection}>
        <div className={styles.integrationsGlowAmbient} aria-hidden="true" />
        <div className={styles.integrationsInner}>
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
            className={styles.integrationsHeader}
          >
            <div className={styles.sectionLabel}>
              ECOSYSTEM & INTEGRATIONS
            </div>
            <h2 className={styles.sectionTitle}>
              Connect Your Entire Stack <br />
              <span className={styles.integrationsTitleGradient}>In Under 3 Minutes</span>
            </h2>
            <p className={styles.sectionSub} style={{ margin: "0 auto" }}>
              Native drop-in middlewares.
              Zero blocking threads. Zero infrastructure overhaul.
            </p>

          </motion.div>

          {/* Interactive 2-Column Hub */}
          <div className={styles.integrationsHubGrid}>
            {/* Left: Technology Cards Grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              variants={staggerContainer}
              className={styles.integrationCardsCol}
            >
              <div className={styles.integrationCardsGrid}>
                {INTEGRATIONS_DATA.map((item) => {
                  const isSelected = item.id === selectedIntegration.id;
                  return (
                    <motion.div
                      key={item.id}
                      variants={cardScale}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedIntegrationId(item.id)}
                      className={`${styles.integrationCard} ${
                        isSelected ? styles.integrationCardSelected : ""
                      }`}
                      style={{
                        "--tech-accent": item.accent,
                      }}
                    >
                      <div className={styles.cardTopRow}>
                        <div className={styles.cardLogoWrapper}>
                          {renderTechIcon(item.id)}
                        </div>
                        <div className={styles.cardTagBadge}>{item.tag}</div>
                      </div>

                      <div className={styles.cardBottomRow}>
                        <div className={styles.cardName}>{item.name}</div>
                      </div>

                      {isSelected && (
                        <div className={styles.selectedGlowBorder} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right: Live Interactive Terminal & Ingestion API Inspector */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={slideFromRight}
              className={styles.inspectorTerminalWrapper}
            >
              <CodeBlock className={styles.integrationCodeBlock} dots={false}>
                {/* Terminal Window Header */}
                <CodeBlockHeader className={styles.terminalHeader}>
                  <div className={styles.terminalWindowControls}>
                    <span className={`${styles.controlDot} ${styles.redDot}`} />
                    <span className={`${styles.controlDot} ${styles.yellowDot}`} />
                    <span className={`${styles.controlDot} ${styles.greenDot}`} />
                  </div>
                  <div className={styles.terminalTitle}>
                    <span className={styles.terminalLogoMini}>
                      {renderTechIcon(selectedIntegration.id)}
                    </span>
                    <span className={styles.terminalFrameworkName}>
                      {selectedIntegration.name}
                    </span>
                    <span className={styles.terminalLivePill}>POST /api/hit</span>
                  </div>
                  <CodeBlockActions style={{ flexShrink: 0, marginLeft: "auto" }}>
                    <CodeBlockCopyButton
                      value={selectedIntegration.code}
                      className={styles.integrationCopyBtn}
                    />
                  </CodeBlockActions>
                </CodeBlockHeader>

                {/* Package Install Bar */}
                <div className={styles.terminalInstallBar}>
                  <div className={styles.installPrompt}>
                    <Terminal size={14} className={styles.terminalPromptIcon} />
                    <code>{selectedIntegration.install}</code>
                  </div>
                  <button
                    type="button"
                    className={styles.copyInstallBtn}
                    onClick={() => handleCopyInstallCmd(selectedIntegration.install)}
                    title="Copy install command"
                    aria-label="Copy install command"
                  >
                    {copiedInstallCmd ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>

                {/* Code Body with Syntax Tokenization and Line Numbers */}
                <CodeBlockContent
                  lineNumbers
                  language={selectedIntegration.lang || "javascript"}
                  className={styles.integrationCodeContent}
                >
                  {selectedIntegration.code}
                </CodeBlockContent>

                {/* Integration Metadata Card */}
                <CodeBlockFooter className={styles.terminalMetaFooter}>
                  <p className={styles.metaDescription}>
                    {selectedIntegration.desc}
                  </p>
                  <div className={styles.telemetryStatsRow}>
                    <div className={styles.statMetricItem}>
                      <span className={styles.statMetricLabel}>INGESTION ENDPOINT</span>
                      <span className={styles.statMetricValueHighlight}>POST /api/hit</span>
                    </div>
                    <div className={styles.statMetricItem}>
                      <span className={styles.statMetricLabel}>DISPATCH QUEUE</span>
                      <span className={styles.statMetricValue}>Async Non-Blocking</span>
                    </div>
                    <div className={styles.statMetricItem}>
                      <span className={styles.statMetricLabel}>FAIL MODE</span>
                      <span className={styles.statMetricValue}>Fails Open</span>
                    </div>
                  </div>
                </CodeBlockFooter>
              </CodeBlock>
            </motion.div>
          </div>

          {/* Bottom Trust Architecture Pillars */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
            className={styles.architecturePillars}
          >
            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon}>
                <Zap size={20} />
              </div>
              <div className={styles.pillarContent}>
                <h4>Asynchronous Ingestion</h4>
                <p>Telemetry collection is offloaded via RabbitMQ message queues. Zero CPU blocking or thread stalls.</p>
              </div>
            </div>

            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon}>
                <ShieldCheck size={20} />
              </div>
              <div className={styles.pillarContent}>
                <h4>Zero PII Ingestion</h4>
                <p>Strict client-side header scrubbing. Authentication tokens and request bodies stay in your VPC.</p>
              </div>
            </div>

            <div className={styles.pillarCard}>
              <div className={styles.pillarIcon}>
                <Code2 size={20} />
              </div>
              <div className={styles.pillarContent}>
                <h4>Universal Ingestion API</h4>
                <p>Any language, Lambda, CLI tool, or edge worker can stream telemetry via raw RFC 7231 HTTP POST.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className={styles.statsBar}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={staggerContainer}
          className={styles.statsBarInner}
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeInUp} className={styles.statItem}>
              <div className={styles.statVal}>
                {s.val}
                <sup>{s.sup}</sup>
              </div>
              <div className={styles.statLabel}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── DEVELOPER FRIENDLY ── */}
      <section id="docs" className={styles.smartSection}>
        <div className={styles.smartSectionInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
            className={styles.smartHeader}
          >
            <div className={styles.sectionLabel}>UNIVERSAL INGESTION API</div>
            <h2 className={styles.sectionTitle}>
              Zero Dependency Monitoring.<br />
              Production Ready Insights.
            </h2>
            <p className={styles.sectionSub}>
              No proprietary SDK required. Stream API hit metrics directly to the high-throughput{" "}
              <code>/api/hit</code> ingestion endpoint using native HTTP requests, axios, or minimal middleware wrappers.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
            className={styles.smartCodeWrapper}
          >
            <div className={styles.codeGlow} />
            <CodeBlock className={styles.codeVisual} dots={false}>
              <CodeBlockHeader className={styles.codeHeader}>
                <div className={styles.codeDots} aria-hidden="true">
                  <span /> <span /> <span />
                </div>
                <div className={styles.codeTabs}>
                  {Object.entries(CODE_EXAMPLES).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.codeTab} ${activeTab === key ? styles.codeTabActive : ""}`}
                      onClick={() => setActiveTab(key)}
                    >
                      {item.icon && (
                        <img
                          src={item.icon}
                          alt=""
                          className={`${styles.codeTabIcon} ${item.invert ? styles.techIconInvert : ""}`}
                        />
                      )}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
                <CodeBlockActions style={{ flexShrink: 0, marginLeft: "auto" }}>
                  <CodeBlockCopyButton
                    value={CODE_EXAMPLES[activeTab].code}
                    className={styles.codeCopyBtn}
                  />
                </CodeBlockActions>
              </CodeBlockHeader>

              <div className={styles.codeSubBar}>
                <span className={styles.codeFileIndicator}>
                  {CODE_EXAMPLES[activeTab].icon ? (
                    <img
                      src={CODE_EXAMPLES[activeTab].icon}
                      alt=""
                      className={`${styles.codeFileMiniIcon} ${
                        CODE_EXAMPLES[activeTab].invert ? styles.techIconInvert : ""
                      }`}
                    />
                  ) : (
                    <Terminal size={12} className={styles.fileIcon} />
                  )}
                  {CODE_EXAMPLES[activeTab].file}
                </span>
                <span className={styles.codeLangPill}>{CODE_EXAMPLES[activeTab].label}</span>
              </div>

              <CodeBlockContent
                lineNumbers
                language={CODE_EXAMPLES[activeTab].label.toLowerCase()}
                className={styles.landingCodeBlockContent}
              >
                {CODE_EXAMPLES[activeTab].code}
              </CodeBlockContent>

              <CodeBlockFooter className={styles.codeFooter}>
                <div className={styles.codePillGroup}>
                  <span className={styles.livePulseDot} />
                  <span className={styles.codePill}>{CODE_EXAMPLES[activeTab].pill}</span>
                </div>
                <div className={styles.codeStatusGroup}>
                  <span className={styles.codeStatusBadge}>
                    {CODE_EXAMPLES[activeTab].status}
                  </span>
                </div>
              </CodeBlockFooter>
            </CodeBlock>
          </motion.div>

          {/* Responsive 3-Column Card Grid (arranged like the Features screenshot!) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={staggerContainer}
            className={styles.smartGrid}
          >
            {[
              {
                icon: <Zap size={20} />,
                title: "Asynchronous Queue Pipeline",
                desc: "Ingested hits are offloaded directly to RabbitMQ message queues with publisher confirms, eliminating database write latency on your server.",
              },
              {
                icon: <Layers size={20} />,
                title: "Dual Store Persistence",
                desc: "Raw transaction records are stored in MongoDB while PostgreSQL maintains hourly time-bucketed aggregates for millisecond dashboard reads.",
              },
              {
                icon: <ShieldCheck size={20} />,
                title: "Scoped API Key Security",
                desc: "Generate granular keys with allowed service names, IP/origin restrictions, and isolated development, staging, or production environments.",
              },
            ].map((sf) => (
              <motion.div
                key={sf.title}
                variants={cardScale}
                whileHover={{ y: -6, scale: 1.02 }}
                className={styles.smartGridCard}
              >
                <div className={styles.smartCardIconWrap}>{sf.icon}</div>
                <h3>{sf.title}</h3>
                <p>{sf.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className={styles.docsActionRowCentered}>
            <Link to="/docs" className={styles.readDocsBtn}>
              <BookOpen size={16} />
              <span>Read Full Documentation</span>
              <ArrowRight size={16} className={styles.readDocsArrow} />
            </Link>
            <Link to="/docs#quickstart" className={styles.quickstartBtn}>
              <span>Quickstart Guide</span>
              <span className={styles.quickstartPill}>5 min</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
            className={styles.testimonialHeader}
          >
            <div className={styles.sectionLabel}>TESTIMONIALS</div>
            <h2 className={styles.sectionTitle}>
              Loved By<br />Developers
            </h2>
            <p className={styles.sectionSub} style={{ margin: "0 auto" }}>
              Engineering teams use ObserveX to ship more reliable APIs every day.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={staggerContainer}
            className={styles.testimonialGrid}
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={cardScale}
                whileHover={{ y: -6, scale: 1.02 }}
                className={styles.testimonialCard}
              >
                <div className={styles.starsRow}>★★★★★</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{initials(t.name)}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.faqInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
            className={styles.faqHeader}
          >
            <div className={styles.sectionLabel}>FAQ</div>
            <h2 className={styles.sectionTitle}>
              Frequently Asked Questions
            </h2>
            <p className={styles.sectionSub}>
              Everything you need to know about ObserveX architecture, REST API ingestion, and telemetry security.
            </p>
          </motion.div>

          {/* FAQ Accordion List */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={staggerContainer}
            className={styles.faqList}
          >
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  variants={cardScale}
                  layout
                  className={`${styles.faqCard} ${isOpen ? styles.faqCardOpen : ""}`}
                >
                  <button
                    type="button"
                    className={styles.faqTrigger}
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <span className={styles.faqQuestionText}>{faq.question}</span>
                    <div
                      className={`${styles.faqChevron} ${
                        isOpen ? styles.faqChevronOpen : ""
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className={styles.faqAnswer}>{faq.answer}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* FAQ Footer Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
            className={styles.faqFooterCard}
          >
            <div className={styles.faqFooterText}>
              <h4>Still have questions?</h4>
              <p>
                Can't find the answer you're looking for? Reach out to our engineering team or explore the docs.
              </p>
            </div>
            <div className={styles.faqFooterActions}>
              <Link to="/docs" className={styles.btnPrimary} style={{ display: "inline-flex" }}>
                <BookOpen size={16} />
                <span>Documentation</span>
              </Link>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={goOnboard}
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeInUp}
          className={styles.ctaInner}
        >
          <div className={styles.sectionLabel} style={{ color: "#6ee7a0" }}>
            GET STARTED
          </div>
          <h2 className={styles.ctaTitle}>
            Start Monitoring Your<br />APIs Today
          </h2>
          <p className={styles.ctaSub}>
            Join teams using ObserveX to improve reliability, detect failures
            faster, and gain complete visibility into API performance.
          </p>
          <div className={styles.ctaActions}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={styles.btnPrimary}
              onClick={goOnboard}
            >
              Get Started Free <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

export default LandingPage;
