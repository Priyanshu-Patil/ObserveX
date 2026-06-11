import { ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/modules/pages/LandingPage.module.scss";
import { Footer } from "../components/layout";

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

// Integrations
const integrations = [
  { icon: "⬢", name: "Node.js" },
  { icon: "🚂", name: "Express" },
  { icon: "⚛", name: "React" },
  { icon: "▲", name: "Next.js" },
  { icon: "🐈", name: "NestJS" },
  { icon: "🌱", name: "Spring Boot" },
  { icon: "🐳", name: "Docker" },
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

// Code snippet for the Developer Friendly section
const codeSnippet = `const axios = require('axios');

await axios.post(
  'https://api.observex.com/api/hit',
  {
    serviceName: 'payment-service',
    endpoint: '/api/payments',
    method: 'POST',
    statusCode: 200,
    latency: 145
  },
  {
    headers: {
      'x-api-key': process.env.OBSERVEX_API_KEY
    }
  }
);`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate();

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
      {/* ── NAV ── */}
      <nav className={styles.nav}>
      <div className={styles.navLogo}>
        <img
            src="/Logo-Dark.png"
            alt="ObserveX"
            className={styles.logoText}
        />
        </div>

        <ul className={styles.navLinks}>
          <li>
            <a href="#homepage">Home</a>
          </li>
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#integrations">Integrations</a>
          </li>
          <li>
            <a href="#docs">Documentation</a>
          </li>
        </ul>

        <div className={styles.navActions}>
          <button className={styles.navSignIn} onClick={() => navigate("/login")}>
            Login
          </button>
          <button className={styles.navRegister} onClick={goOnboard}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="homepage" className={styles.hero}>
        <div className={styles.heroBadge}>Real-Time API Monitoring Platform</div>

        <h1 className={styles.heroTitle}>
          Monitor Every API.<br />
          <em>Detect Problems Before Users Notice.</em>
        </h1>

        <p className={styles.heroDesc}>
          Track latency, uptime, traffic, failures, and endpoint health across your
          entire infrastructure from a single dashboard.
        </p>

        <div className={styles.heroActions}>
          <button className={styles.btnPrimary} onClick={goOnboard}>
            Get Started Free
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Dashboard preview cards */}
        <div className={styles.heroMockup}>
          <div className={styles.mockupCard}>
            <div className={styles.cardLabel}>TOTAL REQUESTS</div>
            <div className={styles.cardValue}>2.4M</div>
            <div className={`${styles.cardBadge} ${styles.up}`}>↑ +12.5% this week</div>
          </div>

          <div className={styles.mockupCard}>
            <div className={styles.cardLabel}>AVERAGE LATENCY</div>
            <div className={styles.cardValue}>142ms</div>
            <div className={`${styles.cardBadge} ${styles.up}`}>● Healthy Performance</div>
          </div>

          <div className={styles.mockupCard}>
            <div className={styles.cardLabel}>ERROR RATE</div>
            <div className={styles.cardValue}>0.7%</div>
            <div className={`${styles.cardBadge} ${styles.neutral}`}>● Within Threshold</div>
          </div>

          <div className={styles.mockupCard}>
            <div className={styles.cardLabel}>UPTIME</div>
            <div className={styles.cardValue}>99.99%</div>
            <div className={`${styles.cardBadge} ${styles.up}`}>↑ Last 30 Days</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresSectionInner}>
          <div className={styles.featuresHeader}>
            <div className={styles.sectionLabel}>FEATURES</div>
            <h2 className={styles.sectionTitle}>
              Everything You Need To<br />Monitor APIs
            </h2>
            <p className={styles.sectionSub}>
              Built for engineering teams that need complete visibility into API
              performance and reliability.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE ENDPOINTS (was currencies) ── */}
      <section className={styles.currenciesSection}>
        <div className={styles.currenciesInner}>
          <div className={styles.currenciesContent}>
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

            <button
              className={styles.btnPrimary}
              onClick={goOnboard}
              style={{ display: "inline-flex" }}
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          <div className={styles.currencyPanel}>
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
          </div>
        </div>
      </section>

      {/* ── MONITORING WORKFLOW ── */}
      <section className={styles.workflowSection}>
        <div className={styles.workflowInner}>
          <div className={styles.workflowHeader}>
            <div className={styles.sectionLabel}>WORKFLOW</div>
            <h2 className={styles.sectionTitle}>Monitor APIs In Minutes</h2>
            <p className={styles.sectionSub} style={{ margin: "0 auto" }}>
              A simple four-step workflow to bring full observability to every
              service in your stack.
            </p>
          </div>

          <div className={styles.workflowGrid}>
            {workflow.map((w, i) => (
              <div key={w.step} className={styles.workflowCard}>
                <div className={styles.workflowStep}>{w.step}</div>
                <h3 className={styles.workflowTitle}>{w.title}</h3>
                <p className={styles.workflowDesc}>{w.desc}</p>
                {i < workflow.length - 1 && (
                  <div className={styles.workflowConnector}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE / BUILT FOR SCALE (was phone mockup) ── */}
      <section className={styles.phoneMockupSection}>
        <div className={styles.phoneMockupInner}>
          <div className={styles.architectureVisual}>
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
          </div>

          <div className={styles.phoneMockupContent}>
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

            <button
              className={styles.btnPrimary}
              style={{ marginTop: "1.5rem", display: "inline-flex" }}
              onClick={goOnboard}
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section id="integrations" className={styles.integrationsSection}>
        <div className={styles.integrationsInner}>
          <div className={styles.integrationsHeader}>
            <div className={styles.sectionLabel}>INTEGRATIONS</div>
            <h2 className={styles.sectionTitle}>Works With Your Existing Stack</h2>
            <p className={styles.sectionSub} style={{ margin: "0 auto" }}>
              Integrate ObserveX into the frameworks and infrastructure you already use.
            </p>
          </div>

          <div className={styles.integrationsGrid}>
            {integrations.map((i) => (
              <div key={i.name} className={styles.integrationCard}>
                <div className={styles.integrationIcon}>{i.icon}</div>
                <div className={styles.integrationName}>{i.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className={styles.statsBar}>
        <div className={styles.statsBarInner}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <div className={styles.statVal}>
                {s.val}
                <sup>{s.sup}</sup>
              </div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DEVELOPER FRIENDLY (was Smart Banking) ── */}
      <section id="docs" className={styles.smartSection}>
        <div className={styles.smartInner}>
          <div className={styles.codeVisual}>
            <div className={styles.codeHeader}>
              <div className={styles.codeDots}>
                <span /> <span /> <span />
              </div>
              <span className={styles.codeFile}>monitor.js</span>
            </div>
            <pre className={styles.codeBlock}>
              <code>{codeSnippet}</code>
            </pre>
            <div className={styles.codeFooter}>
              <span className={styles.codePill}>POST /api/hit</span>
              <span className={styles.codeStatus}>200 OK · 142ms</span>
            </div>
          </div>

          <div>
            <div className={styles.sectionLabel}>DEVELOPER FRIENDLY</div>
            <h2
              className={styles.sectionTitle}
              style={{ marginTop: "0.5rem", marginBottom: "1rem" }}
            >
              Drop-In SDK.<br />
              Production-Ready Insights.
            </h2>
            <p className={styles.sectionSub}>
              Get started in minutes with simple integration guides and API
              references. A few lines of code is all it takes to start streaming
              metrics into ObserveX.
            </p>

            <div className={styles.smartFeaturesList}>
              {[
                {
                  icon: "📦",
                  title: "Official SDKs",
                  desc: "Drop-in libraries for Node.js, Python, Go, Java, and more.",
                },
                {
                  icon: "📘",
                  title: "Clear Documentation",
                  desc: "Comprehensive guides, examples, and API references.",
                },
                {
                  icon: "🛡",
                  title: "Secure By Default",
                  desc: "API keys, scoped tokens, and per-environment isolation.",
                },
              ].map((sf) => (
                <div key={sf.title} className={styles.smartFeatureItem}>
                  <div className={styles.featureIcon}>{sf.icon}</div>
                  <div className={styles.featureText}>
                    <h4>{sf.title}</h4>
                    <p>{sf.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsInner}>
          <div className={styles.testimonialHeader}>
            <div className={styles.sectionLabel}>TESTIMONIALS</div>
            <h2 className={styles.sectionTitle}>
              Loved By<br />Developers
            </h2>
            <p className={styles.sectionSub} style={{ margin: "0 auto" }}>
              Engineering teams use ObserveX to ship more reliable APIs every day.
            </p>
          </div>

          <div className={styles.testimonialGrid}>
            {testimonials.map((t) => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.starsRow}>★★★★★</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{initials(t.name)}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
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
            <button
              className={styles.btnPrimary}
              onClick={goOnboard}
            >
              Get Started Free <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

export default LandingPage;
