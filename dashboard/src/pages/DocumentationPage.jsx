// DocumentationPage.jsx - ObserveX Professional Developer Documentation Portal

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Rocket,
  Shield,
  Code2,
  LayoutDashboard,
  Wrench,
  HelpCircle,
  Boxes,
  Copy,
  Check,
  AlertTriangle,
  AlertOctagon,
  Info,
  Terminal,
  Activity,
  BarChart3,
  LineChart,
  Globe,
  FileCode,
  Network,
  FileText,
  Building2,
  Key,
  Clock,
  Sliders,
  Lock,
  Cpu,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  Server,
  Zap,
  Layers,
} from "lucide-react";

import styles from "../styles/modules/pages/DocsPage.module.scss";
import MetaTags from "../components/MetaTags";
import {
  DOCS_CATEGORIES,
  ALL_DOC_PAGES,
  QUICKSTART_STEPS,
  ARCHITECTURE_PIPELINE,
  API_FIELDS,
  API_RESPONSE_CODES,
  FAQ_ITEMS,
  TROUBLESHOOTING_ITEMS,
} from "../lib/docsData";
import { CODE_SNIPPETS } from "../lib/docsContent";

// Icon mapping helper
const ICON_MAP = {
  BookOpen: FileText,
  Rocket,
  Boxes,
  Server,
  Code2,
  Zap,
  Layers,
  Globe,
  Terminal,
  FileCode,
  Network,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Key,
  BarChart3,
  LineChart,
  AlertOctagon,
  Clock,
  Sliders,
  Lock,
  Cpu,
  ShieldCheck,
  Activity,
  RefreshCw,
  Wrench,
  HelpCircle,
};

function renderPageIcon(iconName, size = 16) {
  const IconComponent = ICON_MAP[iconName] || FileText;
  return <IconComponent size={size} />;
}

// ─── Copy Button Component ───────────────────────────────────────────────────
function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy to clipboard:", err);
    }
  }, [text]);

  return (
    <button
      type="button"
      className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "Copied!" : label}</span>
    </button>
  );
}

// ─── Code Block Component ───────────────────────────────────────────────────
function CodeBlock({ code, title, language = "javascript" }) {
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <div className={styles.codeFileTitle}>
          <FileCode size={14} />
          <span>{title || `${language} snippet`}</span>
        </div>
        <div className={styles.codeMeta}>
          <span className={styles.codeLanguage}>{language}</span>
          <CopyButton text={code} />
        </div>
      </div>
      <pre className={styles.codePre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Callout Component ───────────────────────────────────────────────────────
function Callout({ type = "info", title, children }) {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={18} />;
      case "security":
        return <Lock size={18} />;
      case "tip":
        return <CheckCircle2 size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={`${styles.callout} ${styles[type] || styles.info}`}>
      <div className={styles.calloutIcon}>{getIcon()}</div>
      <div className={styles.calloutBody}>
        {title && <h4>{title}</h4>}
        {children}
      </div>
    </div>
  );
}

// ─── Left Sidebar Navigation ─────────────────────────────────────────────────
function Sidebar({
  categories,
  activePageId,
  onSelectPage,
  collapsedCategories,
  onToggleCategory,
  mobileOpen,
  onCloseMobile,
  searchQuery,
  onSearchChange,
  onClearSearch,
  searchResults,
}) {
  return (
    <>
      <div
        className={`${styles.sidebarBackdrop} ${mobileOpen ? styles.mobileOpen : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ""}`}>
        <div className={styles.sidebarMobileHeader}>
          <span>ObserveX Documentation</span>
          <button type="button" onClick={onCloseMobile} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        {/* Quickstart Action Button */}
        <button
          type="button"
          className={styles.sidebarQuickstartBtn}
          onClick={() => {
            onSelectPage("quickstart");
            onCloseMobile();
          }}
        >
          <div className={styles.qsLeft}>
            <Rocket size={16} />
            <span>Quickstart Guide</span>
          </div>
          <span className={styles.qsBadge}>5 min</span>
        </button>

        {/* Search Input */}
        <div className={styles.sidebarSearch}>
          <Search size={15} />
          <input
            type="text"
            placeholder="Search docs or APIs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClearBtn}
              onClick={onClearSearch}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Overlay */}
        {searchQuery.trim().length > 0 && (
          <div className={styles.searchResultsBox}>
            <span className={styles.resultsHeader}>
              {searchResults.length} Match{searchResults.length === 1 ? "" : "es"}
            </span>
            {searchResults.length === 0 ? (
              <div className={styles.noResults}>No documentation matches for "{searchQuery}"</div>
            ) : (
              <div className={styles.resultsList}>
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.resultItem}
                    onClick={() => {
                      onSelectPage(item.id);
                      onClearSearch();
                      onCloseMobile();
                    }}
                  >
                    <span className={styles.resultTitle}>{item.title}</span>
                    <span className={styles.resultCategory}>{item.categoryTitle}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Navigation Tree */}
        <nav className={styles.sidebarNav}>
          {categories.map((category) => {
            const isCollapsed = collapsedCategories.has(category.id);

            return (
              <div key={category.id} className={styles.sidebarGroup}>
                <button
                  type="button"
                  className={`${styles.groupHeader} ${isCollapsed ? styles.groupCollapsed : ""}`}
                  onClick={() => onToggleCategory(category.id)}
                >
                  <span>{category.title}</span>
                  <ChevronDown size={13} />
                </button>

                {!isCollapsed && (
                  <div className={styles.groupItems}>
                    {category.pages.map((page) => {
                      const isActive = activePageId === page.id;

                      return (
                        <button
                          key={page.id}
                          type="button"
                          className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                          onClick={() => {
                            onSelectPage(page.id);
                            onCloseMobile();
                          }}
                        >
                          <div className={styles.itemLabel}>
                            {renderPageIcon(page.icon, 14)}
                            <span>{page.title}</span>
                          </div>
                          {page.badge && <span className={styles.navItemBadge}>{page.badge}</span>}
                          {page.method && <span className={styles.methodTag}>{page.method}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

// ─── Table of Contents (Right Column) ─────────────────────────────────────────
function TableOfContents({ items, activeHeadingId, onScrollTo }) {
  if (!items || items.length === 0) return null;

  return (
    <aside className={styles.tocSidebar}>
      <div className={styles.tocHeader}>
        <FileText size={13} />
        <span>On this page</span>
      </div>
      <nav className={styles.tocList}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.tocLink} ${activeHeadingId === item.id ? styles.tocActive : ""}`}
            onClick={() => onScrollTo(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ─── Documentation Page Main Component ───────────────────────────────────────
export function DocumentationPage() {
  const [activePageId, setActivePageId] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return ALL_DOC_PAGES.some((p) => p.id === hash) ? hash : "overview";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [activeTocHeading, setActiveTocHeading] = useState("");
  const [checklistCompleted, setChecklistCompleted] = useState(new Set(["step-client"]));
  const [manualHttpTab, setManualHttpTab] = useState("curl");
  const [reactTab, setReactTab] = useState("frontend");

  // Sync hash with active page
  useEffect(() => {
    window.location.hash = activePageId;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activePageId]);

  // Listen to external hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && ALL_DOC_PAGES.some((p) => p.id === hash)) {
        setActivePageId(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const toggleCategory = useCallback((catId) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }, []);

  const toggleChecklistStep = useCallback((stepId) => {
    setChecklistCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }, []);

  const scrollToHeading = useCallback((headingId) => {
    setActiveTocHeading(headingId);
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_DOC_PAGES.filter(
      (page) =>
        page.title.toLowerCase().includes(q) ||
        page.categoryTitle.toLowerCase().includes(q) ||
        page.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Current page details
  const currentPage = useMemo(() => {
    return ALL_DOC_PAGES.find((p) => p.id === activePageId) || ALL_DOC_PAGES[0];
  }, [activePageId]);

  // Previous and next page calculation
  const { prevPage, nextPage } = useMemo(() => {
    const currentIndex = ALL_DOC_PAGES.findIndex((p) => p.id === activePageId);
    return {
      prevPage: currentIndex > 0 ? ALL_DOC_PAGES[currentIndex - 1] : null,
      nextPage: currentIndex < ALL_DOC_PAGES.length - 1 ? ALL_DOC_PAGES[currentIndex + 1] : null,
    };
  }, [activePageId]);

  // Headings for Table of Contents
  const tocHeadings = useMemo(() => {
    switch (activePageId) {
      case "overview":
        return [
          { id: "what-is-observex", label: "What is ObserveX?" },
          { id: "core-capabilities", label: "Core Capabilities" },
          { id: "design-principles", label: "Design Principles" },
          { id: "getting-started-links", label: "Next Steps" },
        ];
      case "quickstart":
        return [
          { id: "qs-overview", label: "7-Step Workflow" },
          { id: "qs-architecture", label: "Architecture Diagram" },
          { id: "qs-code", label: "Integration Code" },
          { id: "qs-test", label: "Test Request" },
        ];
      case "how-observex-works":
        return [
          { id: "pipeline-stages", label: "Pipeline Stages" },
          { id: "dual-database", label: "Dual Database Strategy" },
          { id: "fault-tolerance", label: "Fault Tolerance" },
        ];
      case "create-first-service":
        return [
          { id: "service-concepts", label: "Service Concepts" },
          { id: "naming-conventions", label: "Naming Conventions" },
          { id: "multi-service", label: "Multi-Service Architecture" },
        ];
      case "integration-node":
        return [
          { id: "node-prereqs", label: "Prerequisites" },
          { id: "node-code", label: "Integration Module" },
          { id: "node-verify", label: "Verification" },
        ];
      case "integration-express":
        return [
          { id: "express-prereqs", label: "Prerequisites" },
          { id: "express-middleware", label: "Middleware Module" },
          { id: "express-mounting", label: "Mounting Middleware" },
          { id: "express-test", label: "Testing & Verification" },
        ];
      case "integration-react":
        return [
          { id: "react-security", label: "Security Imperative" },
          { id: "react-proxy", label: "Server-Side Proxy Pattern" },
          { id: "react-client", label: "Frontend Interceptor" },
          { id: "react-server", label: "Backend Proxy Handler" },
        ];
      case "integration-nextjs":
        return [
          { id: "next-arch", label: "Next.js Architecture" },
          { id: "next-app-router", label: "App Router Wrapper" },
          { id: "next-env", label: "Environment Variables" },
        ];
      case "integration-nestjs":
        return [
          { id: "nest-interceptor", label: "NestJS Interceptor" },
          { id: "nest-registration", label: "Global Registration" },
          { id: "nest-status", label: "Verification Status" },
        ];
      case "integration-manual-http":
        return [
          { id: "manual-specs", label: "Endpoint Contract" },
          { id: "manual-examples", label: "Code Examples" },
          { id: "manual-response", label: "Expected Response" },
        ];
      case "api-ingestion":
        return [
          { id: "ingest-endpoint", label: "POST /api/hit" },
          { id: "ingest-headers", label: "Required Headers" },
          { id: "ingest-rate-limit", label: "Rate Limiting" },
        ];
      case "api-authentication":
        return [
          { id: "auth-header", label: "x-api-key Header" },
          { id: "auth-query-rule", label: "Query Parameter Ban" },
          { id: "auth-permissions", label: "Key Permissions" },
        ];
      case "api-request-schema":
        return [
          { id: "schema-fields", label: "Payload Fields" },
          { id: "schema-example", label: "JSON Example" },
        ];
      case "api-response-codes":
        return [
          { id: "status-summary", label: "Status Summary" },
          { id: "status-samples", label: "Sample Responses" },
        ];
      case "api-error-handling":
        return [
          { id: "error-format", label: "Error Response Format" },
          { id: "error-fail-open", label: "Fail-Open Telemetry" },
          { id: "error-breaker", label: "Circuit Breaker Handling" },
        ];
      case "dashboard-clients-services":
        return [
          { id: "dash-clients", label: "Client Tenants" },
          { id: "dash-roles", label: "Role Permissions" },
          { id: "dash-services", label: "Service Discovery" },
        ];
      case "dashboard-api-keys":
        return [
          { id: "key-environments", label: "Key Environments" },
          { id: "key-reveal", label: "One-Time Reveal Dialog" },
          { id: "key-rotation", label: "Regenerate & Revoke" },
        ];
      case "dashboard-traffic-analytics":
        return [
          { id: "traffic-metrics", label: "Core Metrics" },
          { id: "traffic-timeseries", label: "Time-Series Visualization" },
        ];
      case "dashboard-endpoint-analytics":
        return [
          { id: "endpoint-table", label: "Endpoints Table" },
          { id: "endpoint-slowest", label: "Slowest Routes" },
          { id: "endpoint-drawer", label: "Endpoint Detail Drawer" },
        ];
      case "dashboard-error-monitoring":
        return [
          { id: "error-rate", label: "Error Rate Calculation" },
          { id: "error-codes", label: "Status Code Distribution" },
        ];
      case "dashboard-latency-analytics":
        return [
          { id: "latency-avg", label: "Average Latency" },
          { id: "latency-percentiles", label: "Percentile Estimations" },
        ];
      case "dashboard-filters":
        return [
          { id: "filters-timeranges", label: "Time Ranges" },
          { id: "filters-services", label: "Service Filtering" },
          { id: "filters-export", label: "JSON Export" },
        ];
      case "security-api-keys":
        return [
          { id: "sec-storage", label: "Server-Side Storage" },
          { id: "sec-rotation", label: "Rotation Without Downtime" },
        ];
      case "security-env-vars":
        return [
          { id: "sec-env-names", label: "Standard Variable Names" },
          { id: "sec-env-leakage", label: "Preventing Leaks" },
        ];
      case "security-sensitive-data":
        return [
          { id: "sec-zero-pii", label: "Zero-PII Architecture" },
          { id: "sec-parameterize", label: "Path Parameterization" },
        ];
      case "security-non-blocking":
        return [
          { id: "sec-finish-event", label: "res.on('finish') Event" },
          { id: "sec-detached", label: "Detached Async Execution" },
        ];
      case "security-retries-buffering":
        return [
          { id: "sec-backoff", label: "Exponential Backoff" },
          { id: "sec-loops", label: "Loop Prevention" },
        ];
      case "troubleshooting":
        return [
          { id: "tb-guide", label: "Common Resolutions" },
        ];
      case "faq":
        return [
          { id: "faq-list", label: "Frequently Asked Questions" },
        ];
      default:
        return [];
    }
  }, [activePageId]);

  // ─── Render Page Content Switch ───────────────────────────────────────────
  const renderArticleContent = () => {
    switch (activePageId) {
      // ────────────────────────────────────────────────────────────────────────
      // GET STARTED: OVERVIEW
      // ────────────────────────────────────────────────────────────────────────
      case "overview":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="what-is-observex">What is ObserveX?</h2>
              <p>
                <strong>ObserveX</strong> is a high-throughput, multi-tenant API telemetry and observability platform built for modern distributed web services. It empowers engineering teams to track incoming HTTP traffic, analyze endpoint response times, monitor status code distributions, and pinpoint slow or failing routes in real time.
              </p>
              <p>
                Unlike generic log dumps or heavy APM agents that introduce performance penalties and complex installation scripts, ObserveX uses a lightweight, non-blocking HTTP ingestion contract (<code>POST /api/hit</code>). Monitored applications simply emit a lightweight event after completing each response.
              </p>

              <Callout type="tip" title="Fail-Open by Design">
                <p>
                  ObserveX telemetry is designed to never block, delay, or disrupt your primary user traffic. If ObserveX is temporarily unreachable, your application continues running normally without throwing errors.
                </p>
              </Callout>
            </div>

            <div className={styles.docSection}>
              <h2 id="core-capabilities">Core Capabilities</h2>
              <ul>
                <li><strong>⚡ Asynchronous Telemetry Ingestion:</strong> Ingests telemetry in &lt;15ms via RabbitMQ queueing with publisher confirms and HTTP <code>202 Accepted</code> responses.</li>
                <li><strong>📊 Endpoint-Level Analytics:</strong> Tracks average latency, p95/p99 estimations, error rates, and hit counts aggregated per route pattern.</li>
                <li><strong>🛡️ Dual-Database Storage Architecture:</strong> Stores transactional raw hits in MongoDB Atlas (with automatic 30-day TTL expiration) and high-speed aggregated rollups in PostgreSQL.</li>
                <li><strong>🔑 Granular API Key Management:</strong> Multi-tenant authentication with environment tags (Production, Staging, Dev, Testing) and one-time secret reveals.</li>
                <li><strong>⏱️ Circuit Breaker & Resiliency:</strong> Employs exponential backoff and circuit breaking to survive high-throughput traffic spikes and downstream maintenance.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="design-principles">Design Principles</h2>
              <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}><ShieldCheck size={18} /></div>
                  <h4>Zero-PII Policy</h4>
                  <p>ObserveX only ingests operational telemetry (status codes, routes, latencies). Request bodies, authorization headers, passwords, and user details are never stored.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}><Activity size={18} /></div>
                  <h4>Non-Blocking Overhead</h4>
                  <p>Telemetry dispatches after the client response has already finished sending over the wire, adding effectively 0ms to user-perceived latency.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}><Boxes size={18} /></div>
                  <h4>Standard HTTP Protocol</h4>
                  <p>No proprietary binaries or daemon sidecars required. Integrates seamlessly using native HTTP fetch, axios, or standard language libraries.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}><Sliders size={18} /></div>
                  <h4>Multi-Service Scoping</h4>
                  <p>A single client organization can report multiple microservices (e.g. auth-service, billing-api) under one unified dashboard.</p>
                </div>
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 id="getting-started-links">Next Steps</h2>
              <p>Ready to start monitoring your APIs? Follow our interactive guides:</p>
              <ul>
                <li><button type="button" className={styles.tocLink} style={{ color: '#a855f7', fontWeight: 600 }} onClick={() => setActivePageId('quickstart')}>Quickstart Guide (5-10 min)</button> — Step-by-step setup walkthrough.</li>
                <li><button type="button" className={styles.tocLink} style={{ color: '#a855f7', fontWeight: 600 }} onClick={() => setActivePageId('integration-express')}>Express.js Integration</button> — Production middleware example.</li>
                <li><button type="button" className={styles.tocLink} style={{ color: '#a855f7', fontWeight: 600 }} onClick={() => setActivePageId('api-ingestion')}>Ingestion API Reference</button> — Technical payload specifications.</li>
              </ul>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // GET STARTED: QUICKSTART
      // ────────────────────────────────────────────────────────────────────────
      case "quickstart":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="qs-overview">7-Step Integration Workflow</h2>
              <p>
                Integrate ObserveX into an existing Node.js or Express service in under ten minutes. Follow this numbered checklist to track your progress:
              </p>

              {/* Interactive checklist progress */}
              <div className={styles.quickstartProgress}>
                <div className={styles.progressHeader}>
                  <span>Quickstart Completion</span>
                  <span className={styles.progressFraction}>
                    {checklistCompleted.size} of {QUICKSTART_STEPS.length} Completed
                  </span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${(checklistCompleted.size / QUICKSTART_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className={styles.stepsList}>
                {QUICKSTART_STEPS.map((step) => {
                  const isDone = checklistCompleted.has(step.id);

                  return (
                    <div key={step.id} className={`${styles.stepCard} ${isDone ? styles.stepDone : ""}`}>
                      <div className={styles.stepLeft}>
                        <button
                          type="button"
                          className={styles.stepCheckBtn}
                          onClick={() => toggleChecklistStep(step.id)}
                          title={isDone ? "Mark incomplete" : "Mark completed"}
                        >
                          <div className={styles.stepCheckCircle}>
                            {isDone ? <Check size={14} /> : step.step}
                          </div>
                        </button>
                      </div>
                      <div className={styles.stepRight}>
                        <div className={styles.stepHeaderRow}>
                          <h4 className={styles.stepTitle}>
                            Step {step.step}: {step.title}
                          </h4>
                          <span className={styles.stepBadge}>{step.badge}</span>
                        </div>
                        <p className={styles.stepDesc}>{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 id="qs-architecture">Architecture & Data Flow</h2>
              <p>
                ObserveX follows an asynchronous, event-driven architecture to guarantee high throughput and zero latency overhead on monitored applications:
              </p>

              <div className={styles.architectureFlow}>
                {ARCHITECTURE_PIPELINE.map((stage) => (
                  <div key={stage.id} className={styles.archNode}>
                    <div className={styles.archStepHeader}>
                      <span className={styles.archStepNumber}>STAGE {stage.step}</span>
                      <div className={styles.archIconBadge}>
                        {stage.id === "app" && <Server size={16} />}
                        {stage.id === "middleware" && <Zap size={16} />}
                        {stage.id === "ingest" && <Network size={16} />}
                        {stage.id === "processor" && <Cpu size={16} />}
                        {stage.id === "storage" && <Boxes size={16} />}
                        {stage.id === "dashboard" && <BarChart3 size={16} />}
                      </div>
                    </div>
                    <h4>{stage.title}</h4>
                    <span className={styles.archSubtitle}>{stage.subtitle}</span>
                    <p>{stage.description}</p>
                    <span className={styles.archTech}>{stage.tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 id="qs-code">Quickstart Express Middleware Code</h2>
              <p>
                Save this reusable middleware in your backend project under <code>middleware/observex.js</code>:
              </p>
              <CodeBlock
                code={CODE_SNIPPETS.expressMiddleware}
                title="middleware/observex.js"
                language="javascript"
              />

              <p>Then mount it in your primary application entrypoint (e.g. <code>app.js</code> or <code>server.js</code>):</p>
              <CodeBlock
                code={CODE_SNIPPETS.expressAppUsage}
                title="app.js"
                language="javascript"
              />
            </div>

            <div className={styles.docSection}>
              <h2 id="qs-test">Send a Test Request</h2>
              <p>
                Verify connectivity immediately from your terminal by executing this cURL command against the ObserveX ingestion API. Replace <code>apim_your_api_key_here</code> with your real API key:
              </p>
              <CodeBlock
                code={CODE_SNIPPETS.curlRequest}
                title="Terminal Test"
                language="bash"
              />

              <Callout type="tip" title="Expected Success Output">
                <p>
                  ObserveX will respond immediately with HTTP <code>202 Accepted</code>:
                </p>
                <code>{`{"success":true,"message":"API hit queued for processing","data":{"eventId":"...","status":"queued"}}`}</code>
              </Callout>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // GET STARTED: HOW OBSERVE-X WORKS
      // ────────────────────────────────────────────────────────────────────────
      case "how-observex-works":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="pipeline-stages">End-to-End Ingestion Pipeline</h2>
              <p>
                ObserveX separates transactional writes from heavy analytical aggregations. When your API finishes serving a client request, it emits an HTTP POST event to ObserveX. The system handles this event through six decoupled stages:
              </p>
              <ol>
                <li>
                  <strong>1. Capture on Finish:</strong> Your application middleware records the start timestamp. When the HTTP response finishes (via <code>res.on('finish')</code>), it calculates <code>latencyMs = Date.now() - startTime</code>.
                </li>
                <li>
                  <strong>2. Asynchronous Dispatch:</strong> The middleware sends a non-blocking payload to <code>POST /api/hit</code> with the secret <code>x-api-key</code> header.
                </li>
                <li>
                  <strong>3. Ingestion & Validation:</strong> The ObserveX Ingest Service authenticates the key against MongoDB, validates required fields (<code>serviceName</code>, <code>endpoint</code>, <code>method</code>, <code>statusCode</code>, <code>latencyMs</code>), and pushes the event to RabbitMQ. It returns HTTP <code>202 Accepted</code> in under 15ms.
                </li>
                <li>
                  <strong>4. RabbitMQ Event Broker:</strong> The <code>api_hits</code> queue acts as a shock absorber during traffic spikes, ensuring that database loads do not cascade to ingestion.
                </li>
                <li>
                  <strong>5. Consumer Processing:</strong> A dedicated consumer daemon consumes messages, saves the raw event to MongoDB, and upserts hourly metric rollups into PostgreSQL.
                </li>
                <li>
                  <strong>6. Real-Time Visualization:</strong> The dashboard queries the pre-aggregated PostgreSQL tables, delivering instant charts without slow table scans.
                </li>
              </ol>
            </div>

            <div className={styles.docSection}>
              <h2 id="dual-database">Dual-Database Strategy</h2>
              <p>ObserveX employs a polyglot persistence architecture designed for distinct data access patterns:</p>
              <div className={styles.tableContainer}>
                <table className={styles.docTable}>
                  <thead>
                    <tr>
                      <th>Database</th>
                      <th>Primary Purpose</th>
                      <th>Retention Policy</th>
                      <th>Write Pattern</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>MongoDB Atlas</strong></td>
                      <td>Raw individual hit records (<code>api_hits</code> collection), tenant organizations, users, and API key policies.</td>
                      <td>Automatic 30-Day TTL index (<code>expireAfterSeconds: 2592000</code>).</td>
                      <td>High-throughput append-only document writes.</td>
                    </tr>
                    <tr>
                      <td><strong>Neon PostgreSQL</strong></td>
                      <td>Pre-aggregated analytical metrics (<code>api_hit_metrics</code>), hourly buckets, success/error rates, min/max/average latencies.</td>
                      <td>Permanent / long-term historical reporting.</td>
                      <td>Atomic upsert operations (<code>ON CONFLICT ... DO UPDATE</code>).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 id="fault-tolerance">Fault Tolerance & Circuit Breaking</h2>
              <p>
                To maintain high availability during broker downtime or maintenance, ObserveX implements circuit breakers on both producer and consumer sides:
              </p>
              <ul>
                <li><strong>Ingestion Circuit Breaker:</strong> If RabbitMQ encounters connection failures, the publisher trips and returns HTTP <code>503 Service Unavailable</code> with <code>retryAfter: '30 seconds'</code>.</li>
                <li><strong>Fallback Metric Aggregation:</strong> In <code>ProcessorService.js</code>, saving raw events to MongoDB is critical, while PostgreSQL metric updates are wrapped with fallback protection. If PostgreSQL is temporarily congested, raw data is preserved and can be backfilled.</li>
                <li><strong>Client Fail-Open:</strong> Applications logging to ObserveX never throw uncaught exceptions if telemetry fails.</li>
              </ul>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // GET STARTED: CREATE FIRST SERVICE
      // ────────────────────────────────────────────────────────────────────────
      case "create-first-service":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="service-concepts">Service Concepts in ObserveX</h2>
              <p>
                In ObserveX, your account is organized into two primary hierarchical concepts:
              </p>
              <ul>
                <li><strong>Client (Organization):</strong> The top-level tenant entity (e.g., "Acme Corp"). API keys, team members, and overall billing/data retention settings belong to the Client.</li>
                <li><strong>Service (Application):</strong> A logical microservice, application, or worker reporting under that client (e.g., <code>auth-service</code>, <code>orders-api</code>, <code>notification-worker</code>).</li>
              </ul>
              <Callout type="info" title="Automatic Service Discovery">
                <p>
                  You do not need to register a service in advance! The moment your application sends a hit event containing a new <code>serviceName</code>, ObserveX dynamically indexes and adds it to your service filter dropdown.
                </p>
              </Callout>
            </div>

            <div className={styles.docSection}>
              <h2 id="naming-conventions">Recommended Naming Conventions</h2>
              <p>To keep your dashboard clean and readable across teams, adopt consistent service naming:</p>
              <ul>
                <li>Use lowercase kebab-case (e.g., <code>payment-gateway</code>, <code>user-management-api</code>).</li>
                <li>Avoid environment suffixes in the service name (e.g., prefer <code>billing-service</code> over <code>billing-service-prod</code>). Use API key environment tags (<code>production</code>, <code>staging</code>) to distinguish deployment stages instead.</li>
                <li>Keep names between 2 and 50 characters.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="multi-service">Multi-Service Architecture Example</h2>
              <p>
                A single client can have 20+ microservices reporting with the same API key. In the dashboard, you can filter by <strong>All Services</strong> to get an organization-wide view, or select an individual service to isolate its specific latency and endpoint health.
              </p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // INTEGRATIONS: NODE.JS
      // ────────────────────────────────────────────────────────────────────────
      case "integration-node":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="node-prereqs">Prerequisites & Environment</h2>
              <p>
                This generic Node.js integration works with any Node.js runtime (v18.0.0 or higher) using the native <code>fetch</code> API. No external dependencies are required.
              </p>
              <CodeBlock code={CODE_SNIPPETS.envSample} title=".env" language="bash" />
            </div>

            <div className={styles.docSection}>
              <h2 id="node-code">Integration Helper Module</h2>
              <p>Create <code>lib/observex.js</code> in your project:</p>
              <CodeBlock code={CODE_SNIPPETS.nodeVanilla} title="lib/observex.js" language="javascript" />
            </div>

            <div className={styles.docSection}>
              <h2 id="node-verify">Verification</h2>
              <p>
                Call <code>reportApiHit</code> inside your HTTP request handler or worker. ObserveX will record the metric and display it in your dashboard under the designated <code>serviceName</code>.
              </p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // INTEGRATIONS: EXPRESS.JS
      // ────────────────────────────────────────────────────────────────────────
      case "integration-express":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="express-prereqs">Prerequisites & Placement</h2>
              <p>
                The Express integration requires an HTTP client such as <code>axios</code> (or native Node 18+ <code>fetch</code>). Install axios if you do not already have it:
              </p>
              <CodeBlock code="npm install axios" title="Terminal" language="bash" />
              <p>Configure your server environment variables:</p>
              <CodeBlock code={CODE_SNIPPETS.envSample} title=".env" language="bash" />
            </div>

            <div className={styles.docSection}>
              <h2 id="express-middleware">Complete Middleware Code</h2>
              <p>Create a dedicated file at <code>middleware/observex.js</code>:</p>
              <CodeBlock code={CODE_SNIPPETS.expressMiddleware} title="middleware/observex.js" language="javascript" />

              <Callout type="tip" title="Path Normalization">
                <p>
                  Notice how <code>req.route?.path</code> is used. This automatically turns <code>/api/users/98214</code> into <code>/api/users/:id</code>. Parameterization prevents millions of unique database entries and maintains high dashboard aggregation performance.
                </p>
              </Callout>
            </div>

            <div className={styles.docSection}>
              <h2 id="express-mounting">Mounting the Middleware</h2>
              <p>
                Register the middleware near the top of your Express app, before your application route handlers:
              </p>
              <CodeBlock code={CODE_SNIPPETS.expressAppUsage} title="app.js" language="javascript" />
            </div>

            <div className={styles.docSection}>
              <h2 id="express-test">Testing & Verification</h2>
              <ol>
                <li>Start your Express application (e.g., <code>node app.js</code>).</li>
                <li>Make a request to any route: <code>curl http://localhost:8080/api/users/123</code>.</li>
                <li>Open the ObserveX dashboard (<code>/client/dashboard</code>) and verify that the request count incremented and <code>user-service</code> is listed in the services filter.</li>
              </ol>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // INTEGRATIONS: REACT APPLICATIONS
      // ────────────────────────────────────────────────────────────────────────
      case "integration-react":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="react-security">Security Imperative: Never Expose API Keys in Browser Bundles</h2>
              <Callout type="security" title="CRITICAL SECURITY WARNING">
                <p>
                  <strong>Secret ObserveX API keys must NEVER be placed in client-side code</strong>, bundled into Vite variables (e.g. <code>VITE_OBSERVEX_API_KEY</code>), or sent directly from browser JavaScript!
                </p>
                <p>
                  Client-side JavaScript code can be inspected by anyone using browser developer tools. Exposing your API key allows unauthorized third parties to flood your account with fake traffic or deplete your rate limits.
                </p>
              </Callout>
            </div>

            <div className={styles.docSection}>
              <h2 id="react-proxy">The Authenticated Server-Side Proxy Pattern</h2>
              <p>
                To measure real client-perceived network latency from React, use an authenticated server-side proxy route:
              </p>
              <ol>
                <li>Your React frontend measures round-trip API time using an Axios or Fetch response interceptor.</li>
                <li>The frontend sends telemetry metrics to a lightweight route on <em>your own backend</em> (e.g., <code>POST /api/telemetry-proxy</code>).</li>
                <li>Your backend server attaches the private <code>OBSERVEX_API_KEY</code> from its environment variables and forwards the hit to ObserveX.</li>
              </ol>

              <div className={styles.tabbedCode}>
                <div className={styles.tabsBar}>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${reactTab === "frontend" ? styles.activeTab : ""}`}
                    onClick={() => setReactTab("frontend")}
                  >
                    1. React Client Interceptor
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${reactTab === "backend" ? styles.activeTab : ""}`}
                    onClick={() => setReactTab("backend")}
                  >
                    2. Backend Proxy Handler
                  </button>
                </div>

                {reactTab === "frontend" ? (
                  <CodeBlock
                    code={CODE_SNIPPETS.reactClientInterceptor}
                    title="src/lib/apiClient.js (Frontend)"
                    language="javascript"
                  />
                ) : (
                  <CodeBlock
                    code={CODE_SNIPPETS.reactBackendProxy}
                    title="server/routes/telemetryProxy.js (Backend)"
                    language="javascript"
                  />
                )}
              </div>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // INTEGRATIONS: NEXT.JS
      // ────────────────────────────────────────────────────────────────────────
      case "integration-nextjs":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="next-arch">Next.js Architecture Considerations</h2>
              <p>
                Next.js combines server-rendered React, edge middleware, and backend API routes. Always monitor API routes on the server side:
              </p>
              <ul>
                <li>Keep <code>OBSERVEX_API_KEY</code> server-only (do NOT prefix with <code>NEXT_PUBLIC_</code>).</li>
                <li>Wrap Route Handlers in App Router (<code>app/api/.../route.js</code>) or API Handlers in Pages Router (<code>pages/api/...</code>).</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="next-app-router">App Router Route Handler Wrapper</h2>
              <p>Create a higher-order wrapper <code>lib/observex-next.js</code>:</p>
              <CodeBlock code={CODE_SNIPPETS.nextjsAppRouter} title="lib/observex-next.js" language="javascript" />
            </div>

            <div className={styles.docSection}>
              <h2 id="next-env">Environment Variables in Next.js</h2>
              <p>Add to your <code>.env.local</code> file:</p>
              <CodeBlock
                code={`OBSERVEX_API_KEY=apim_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nOBSERVEX_BASE_URL=https://api.observex.com`}
                title=".env.local"
                language="bash"
              />
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // INTEGRATIONS: NESTJS
      // ────────────────────────────────────────────────────────────────────────
      case "integration-nestjs":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="nest-interceptor">NestJS Interceptor Pattern</h2>
              <p>
                NestJS uses Interceptors to inspect incoming execution contexts and handle asynchronous observables. Create <code>src/common/interceptors/observex.interceptor.ts</code>:
              </p>
              <CodeBlock code={CODE_SNIPPETS.nestjsInterceptor} title="src/common/interceptors/observex.interceptor.ts" language="typescript" />
            </div>

            <div className={styles.docSection}>
              <h2 id="nest-registration">Global Registration</h2>
              <p>Register the interceptor globally in your <code>main.ts</code>:</p>
              <CodeBlock
                code={`import { NestFactory } from '@nestjs/core';\nimport { AppModule } from './app.module';\nimport { ObservexInterceptor } from './common/interceptors/observex.interceptor';\n\nasync function bootstrap() {\n  const app = await NestFactory.create(AppModule);\n  app.useGlobalInterceptors(new ObservexInterceptor());\n  await app.listen(3000);\n}\nbootstrap();`}
                title="src/main.ts"
                language="typescript"
              />
            </div>

            <div className={styles.docSection}>
              <h2 id="nest-status">Verification Status</h2>
              <Callout type="info" title="Ingestion Contract Verified">
                <p>
                  This NestJS Interceptor adheres strictly to the verified ObserveX ingestion contract (<code>POST /api/hit</code> with <code>x-api-key</code> and <code>latencyMs</code>). It operates asynchronously without affecting controller return values.
                </p>
              </Callout>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // INTEGRATIONS: MANUAL HTTP
      // ────────────────────────────────────────────────────────────────────────
      case "integration-manual-http":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="manual-specs">Manual HTTP Ingestion Contract</h2>
              <p>
                Any programming language capable of sending HTTPS POST requests can report directly to ObserveX. There are no proprietary protocol buffers or binary formats.
              </p>

              <div className={styles.endpointBanner}>
                <span className={styles.endpointMethod}>POST</span>
                <span className={styles.endpointPath}>https://api.observex.com/api/hit</span>
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 id="manual-examples">Code Examples by Language</h2>
              <div className={styles.tabbedCode}>
                <div className={styles.tabsBar}>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${manualHttpTab === "curl" ? styles.activeTab : ""}`}
                    onClick={() => setManualHttpTab("curl")}
                  >
                    cURL
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${manualHttpTab === "python" ? styles.activeTab : ""}`}
                    onClick={() => setManualHttpTab("python")}
                  >
                    Python
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${manualHttpTab === "go" ? styles.activeTab : ""}`}
                    onClick={() => setManualHttpTab("go")}
                  >
                    Go
                  </button>
                </div>

                {manualHttpTab === "curl" && (
                  <CodeBlock code={CODE_SNIPPETS.curlRequest} title="cURL" language="bash" />
                )}
                {manualHttpTab === "python" && (
                  <CodeBlock code={CODE_SNIPPETS.pythonSnippet} title="Python 3" language="python" />
                )}
                {manualHttpTab === "go" && (
                  <CodeBlock code={CODE_SNIPPETS.goSnippet} title="Go" language="go" />
                )}
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 id="manual-response">Expected Response (HTTP 202 Accepted)</h2>
              <CodeBlock
                code={API_RESPONSE_CODES[0].sample}
                title="Response 202 Accepted"
                language="json"
              />
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // API REFERENCE: INGESTION API
      // ────────────────────────────────────────────────────────────────────────
      case "api-ingestion":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="ingest-endpoint">Ingestion Endpoint: POST /api/hit</h2>
              <p>
                The primary telemetry endpoint for all monitored services. It accepts JSON-encoded API hit metrics and asynchronously queues them into the RabbitMQ processing pipeline.
              </p>

              <div className={styles.endpointBanner}>
                <span className={styles.endpointMethod}>POST</span>
                <span className={styles.endpointPath}>/api/hit</span>
              </div>

              <p><strong>Base URLs:</strong></p>
              <ul>
                <li><strong>Local Development:</strong> <code>http://localhost:3000</code></li>
                <li><strong>Production:</strong> Configured via your custom domain or deployment URL (e.g., <code>https://api.observex.com</code>)</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="ingest-headers">Required Request Headers</h2>
              <div className={styles.tableContainer}>
                <table className={styles.docTable}>
                  <thead>
                    <tr>
                      <th>Header</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>x-api-key</code></td>
                      <td>String</td>
                      <td><span className={styles.fieldRequired}>Required</span></td>
                      <td>Your client organization's secret ingestion key (e.g. <code>apim_xxxxxxxx...</code>).</td>
                    </tr>
                    <tr>
                      <td><code>Content-Type</code></td>
                      <td>String</td>
                      <td><span className={styles.fieldRequired}>Required</span></td>
                      <td>Must be set to <code>application/json</code>.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 id="ingest-rate-limit">Rate Limiting</h2>
              <p>
                The ingestion route is protected by standard rate limiters to ensure fair usage:
              </p>
              <ul>
                <li><strong>Production Limit:</strong> 100 requests / minute per client IP.</li>
                <li><strong>Development Default:</strong> 1,000 requests / 15 minutes per IP.</li>
                <li><strong>Headers Returned:</strong> Standard <code>RateLimit-Limit</code>, <code>RateLimit-Remaining</code>, and <code>RateLimit-Reset</code> headers.</li>
              </ul>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // API REFERENCE: AUTHENTICATION
      // ────────────────────────────────────────────────────────────────────────
      case "api-authentication":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="auth-header">x-api-key Authentication Header</h2>
              <p>
                ObserveX uses cryptographically random API keys prefixed with <code>apim_</code> followed by 40 hexadecimal characters (e.g. <code>apim_7b19d5c8...</code>).
              </p>
              <CodeBlock
                code="x-api-key: apim_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                title="HTTP Header Format"
                language="http"
              />
            </div>

            <div className={styles.docSection}>
              <h2 id="auth-query-rule">Query Parameter Confidentiality Enforcement</h2>
              <Callout type="warning" title="Strict Confidentiality Violation Check">
                <p>
                  ObserveX strictly forbids passing API keys in URL query strings (e.g. <code>?apiKey=...</code>, <code>?api_key=...</code>, or <code>?key=...</code>).
                </p>
                <p>
                  If an API key is detected in the URL, the server rejects the request immediately with HTTP 400 Bad Request:
                </p>
                <code>"Confidentiality violation: API keys must NOT be exposed in URL query parameters. Pass your API key via the x-api-key HTTP header."</code>
              </Callout>
            </div>

            <div className={styles.docSection}>
              <h2 id="auth-permissions">API Key Permissions & Verification</h2>
              <p>When an API key is received on <code>/api/hit</code>, ObserveX validates:</p>
              <ol>
                <li>The key exists in the database.</li>
                <li>The associated client organization has <code>isActive: true</code>.</li>
                <li>The API key has <code>permissions.canIngest: true</code>.</li>
              </ol>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // API REFERENCE: REQUEST SCHEMA
      // ────────────────────────────────────────────────────────────────────────
      case "api-request-schema":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="schema-fields">Supported Request Payload Fields</h2>
              <p>
                The following JSON payload fields are verified from <code>server/src/services/ingest/services/ingestServices.js</code>:
              </p>

              <div className={styles.tableContainer}>
                <table className={styles.docTable}>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Type</th>
                      <th>Requirement</th>
                      <th>Constraints</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {API_FIELDS.map((f) => (
                      <tr key={f.field}>
                        <td><code>{f.field}</code></td>
                        <td>{f.type}</td>
                        <td>
                          {f.required ? (
                            <span className={styles.fieldRequired}>Required</span>
                          ) : (
                            <span className={styles.fieldOptional}>Optional</span>
                          )}
                        </td>
                        <td>{f.constraints}</td>
                        <td>{f.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 id="schema-example">Complete Request JSON Example</h2>
              <CodeBlock
                code={`{\n  "serviceName": "auth-service",\n  "endpoint": "/api/v1/users/login",\n  "method": "POST",\n  "statusCode": 200,\n  "latencyMs": 138.4,\n  "ip": "203.0.113.195",\n  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"\n}`}
                title="event.json"
                language="json"
              />
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // API REFERENCE: RESPONSE CODES
      // ────────────────────────────────────────────────────────────────────────
      case "api-response-codes":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="status-summary">HTTP Response Status Codes Summary</h2>
              <p>
                ObserveX returns standardized responses formatted via <code>ResponseFormatter.js</code>:
              </p>

              <div className={styles.tableContainer}>
                <table className={styles.docTable}>
                  <thead>
                    <tr>
                      <th>Status Code</th>
                      <th>Name</th>
                      <th>Status Category</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {API_RESPONSE_CODES.map((r) => (
                      <tr key={r.code}>
                        <td><code>{r.code}</code></td>
                        <td><strong>{r.name}</strong></td>
                        <td>{r.status}</td>
                        <td>{r.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 id="status-samples">Verified Response JSON Samples</h2>
              {API_RESPONSE_CODES.map((r) => (
                <div key={r.code} style={{ marginBottom: "1.5rem" }}>
                  <h3>HTTP {r.code} {r.name}</h3>
                  <p>{r.meaning}</p>
                  <CodeBlock code={r.sample} title={`HTTP ${r.code} Response`} language="json" />
                </div>
              ))}
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // API REFERENCE: ERROR HANDLING
      // ────────────────────────────────────────────────────────────────────────
      case "api-error-handling":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="error-format">Standard Error Response Format</h2>
              <p>
                All error responses adhere to the standard envelope format:
              </p>
              <CodeBlock
                code={`{\n  "success": false,\n  "message": "Descriptive error message",\n  "error": null,\n  "statusCode": 400,\n  "timestamp": "2026-10-16T14:48:00.000Z"\n}`}
                title="Error Envelope"
                language="json"
              />
            </div>

            <div className={styles.docSection}>
              <h2 id="error-fail-open">Fail-Open Telemetry Standard</h2>
              <p>
                Monitoring should never break the monitored service. If an error occurs when sending telemetry (such as a timeout or 503 response), client middleware should swallow or log a debug warning without failing the user's API call.
              </p>
            </div>

            <div className={styles.docSection}>
              <h2 id="error-breaker">Handling 503 Service Unavailable (Circuit Breaker)</h2>
              <p>
                When ObserveX downstream queues are congested, the server responds with 503 and a retry recommendation:
              </p>
              <CodeBlock
                code={API_RESPONSE_CODES[5].sample}
                title="503 Circuit Breaker Response"
                language="json"
              />
              <p>Integrations should pause telemetry dispatch for 30 seconds before resuming.</p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // DASHBOARD GUIDE: CLIENTS AND SERVICES
      // ────────────────────────────────────────────────────────────────────────
      case "dashboard-clients-services":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="dash-clients">Client Tenants</h2>
              <p>
                ObserveX is multi-tenant. Each monitored company or organization is registered as a <strong>Client</strong>.
              </p>
              <ul>
                <li>Super Admins view and manage all clients at <code>/admin/clients</code>.</li>
                <li>New clients can be onboarded with a name, slug, email, and retention settings.</li>
                <li>Client Admins manage their own client's users and API keys.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="dash-roles">Role-Based Access Control</h2>
              <ul>
                <li><strong>Super Admin (<code>super_admin</code>):</strong> Full platform access, client onboarding, global key oversight.</li>
                <li><strong>Client Admin (<code>client_admin</code>):</strong> Can manage their organization's API keys, create client users, and view analytics.</li>
                <li><strong>Client Viewer (<code>client_viewer</code>):</strong> Read-only access to dashboard charts and endpoint analytics.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="dash-services">Service Discovery</h2>
              <p>
                Services appear dynamically as telemetry arrives. You can filter the dashboard by any reporting service name or view an aggregated overview across all services.
              </p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // DASHBOARD GUIDE: API KEY MANAGEMENT
      // ────────────────────────────────────────────────────────────────────────
      case "dashboard-api-keys":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="key-environments">Managing API Keys by Environment</h2>
              <p>
                Navigate to <strong>API Keys</strong> in your dashboard sidebar (or <code>/admin/clients/:id/api-keys</code>). ObserveX supports 4 distinct environment tags:
              </p>
              <ul>
                <li><strong>Production:</strong> Primary production backend services.</li>
                <li><strong>Staging:</strong> Pre-release verification and staging environments.</li>
                <li><strong>Development:</strong> Local engineer machines and sandbox clusters.</li>
                <li><strong>Testing:</strong> Automated CI/CD integration and regression pipelines.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="key-reveal">One-Time Reveal Security Dialog</h2>
              <Callout type="security" title="Zero-Knowledge Secret Storage">
                <p>
                  When you create or regenerate an API key, the raw key (<code>apim_...</code>) is displayed <strong>exactly once</strong> in a secure reveal modal.
                </p>
                <p>
                  For security, the raw key is never stored in plaintext in the database and automatically clears from browser memory after 60 seconds. Copy and store it immediately in your server's secret manager or <code>.env</code> file.
                </p>
              </Callout>
            </div>

            <div className={styles.docSection}>
              <h2 id="key-rotation">Regeneration & Revocation</h2>
              <ul>
                <li><strong>Regenerate Key:</strong> Click "Regenerate" to create a fresh secret token. The previous key is immediately deactivated to minimize downtime during key rotation.</li>
                <li><strong>Revoke Key:</strong> Click "Revoke" on any compromised or obsolete key to permanently deactivate it. All incoming requests using revoked keys return HTTP 403 Forbidden.</li>
              </ul>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // DASHBOARD GUIDE: TRAFFIC ANALYTICS
      // ────────────────────────────────────────────────────────────────────────
      case "dashboard-traffic-analytics":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="traffic-metrics">Core Traffic Metrics</h2>
              <p>The Overview Dashboard (<code>/client/dashboard</code>) displays top-level telemetry signals:</p>
              <ul>
                <li><strong>Total Hits:</strong> Aggregate volume of all incoming API requests processed during the selected time period.</li>
                <li><strong>Average Latency:</strong> Mean end-to-end server execution time (in milliseconds) across all reporting endpoints.</li>
                <li><strong>Success Rate:</strong> Percentage of requests completing with 2xx or 3xx status codes.</li>
                <li><strong>Error Rate:</strong> Percentage of requests completing with 4xx or 5xx status codes.</li>
                <li><strong>Unique Services & Endpoints:</strong> Count of distinct services and route patterns reporting telemetry.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="traffic-timeseries">Time-Series Visualization</h2>
              <p>
                Interactive charts powered by ApexCharts show API hit volumes across time buckets. You can toggle between 24 Hours, 7 Days, 30 Days, or All Time to analyze traffic trends.
              </p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // DASHBOARD GUIDE: ENDPOINT ANALYTICS
      // ────────────────────────────────────────────────────────────────────────
      case "dashboard-endpoint-analytics":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="endpoint-table">The Endpoints Table</h2>
              <p>
                Navigate to <strong>Endpoint Analytics</strong> (<code>/analytics/endpoints</code>) for deep route-level insights:
              </p>
              <ul>
                <li><strong>Endpoint Route:</strong> Parameterized path (e.g. <code>/api/orders/:id</code>).</li>
                <li><strong>HTTP Verb:</strong> Method badge (GET, POST, PUT, DELETE).</li>
                <li><strong>Hits:</strong> Total request count for that specific route.</li>
                <li><strong>Average Latency:</strong> Average duration for that specific endpoint.</li>
                <li><strong>Error Rate:</strong> Failure percentage.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="endpoint-slowest">Top Slowest & Error-Prone Endpoints</h2>
              <p>
                Insight cards at the top highlight your top 5 slowest routes and top 5 error-prone endpoints so you can prioritize optimization.
              </p>
            </div>

            <div className={styles.docSection}>
              <h2 id="endpoint-drawer">Endpoint Detail Drawer</h2>
              <p>
                Click any endpoint row in the table to slide open the Endpoint Detail Drawer. It reveals detailed status breakdowns, latency percentiles, and a copyable cURL snippet for manual testing.
              </p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // DASHBOARD GUIDE: ERROR MONITORING
      // ────────────────────────────────────────────────────────────────────────
      case "dashboard-error-monitoring":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="error-rate">Error Rate Calculation</h2>
              <p>ObserveX computes error rate using the formula:</p>
              <code>Error Rate (%) = (errorHits / totalHits) * 100</code>
              <p>Where <code>errorHits</code> includes all status codes &gt;= 400.</p>
            </div>

            <div className={styles.docSection}>
              <h2 id="error-codes">Status Code Distribution</h2>
              <p>
                The Analytics page visualizes HTTP status categories (2xx, 3xx, 4xx, 5xx) in a distribution chart so you can immediately see whether failures are client validation errors (4xx) or server-side exceptions (5xx).
              </p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // DASHBOARD GUIDE: LATENCY ANALYTICS
      // ────────────────────────────────────────────────────────────────────────
      case "dashboard-latency-analytics":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="latency-avg">Average Latency & Health Thresholds</h2>
              <p>
                ObserveX classifies endpoint health based on average latency:
              </p>
              <ul>
                <li><strong>Fast (&lt;100ms):</strong> Optimal response performance.</li>
                <li><strong>Moderate (100ms - 300ms):</strong> Normal for typical database lookups.</li>
                <li><strong>Elevated (&gt;300ms):</strong> Candidates for caching or query optimization.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="latency-percentiles">Percentile Estimations (p95 & p99)</h2>
              <p>
                Average latency can conceal spikes. The latency charts calculate estimated p95 and p99 percentiles from hourly buckets to reveal the experience of your slowest 5% and 1% of users.
              </p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // DASHBOARD GUIDE: FILTERS AND TIME RANGES
      // ────────────────────────────────────────────────────────────────────────
      case "dashboard-filters":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="filters-timeranges">Supported Time Ranges</h2>
              <p>The dashboard filter panel supports 4 standard time windows:</p>
              <ul>
                <li><strong>Last 24 Hours (<code>24h</code>):</strong> Default window for day-to-day operations.</li>
                <li><strong>Last 7 Days (<code>7d</code>):</strong> Medium-term weekly performance tracking.</li>
                <li><strong>Last 30 Days (<code>30d</code>):</strong> Monthly SLA and capacity reviews.</li>
                <li><strong>All Time (<code>all</code>):</strong> Comprehensive historical audit data.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="filters-services">Service Filtering</h2>
              <p>
                Use the Service dropdown to focus on a single microservice (e.g. <code>payment-service</code>) or select <strong>All Services</strong> for cross-system aggregation.
              </p>
            </div>

            <div className={styles.docSection}>
              <h2 id="filters-export">JSON Export</h2>
              <p>
                Click <strong>Export</strong> in the Analytics Overview header to download the current stats and time-series data as a structured JSON file for reporting or offline analysis.
              </p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // SECURITY & BEST PRACTICES: API KEYS
      // ────────────────────────────────────────────────────────────────────────
      case "security-api-keys":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="sec-storage">Server-Side Secret Storage</h2>
              <p>
                API keys grant ingestion access to your ObserveX account. Adhere strictly to these security protocols:
              </p>
              <ul>
                <li>Always store keys in environment variables (e.g. <code>OBSERVEX_API_KEY</code>).</li>
                <li>Ensure <code>.env</code> is included in your <code>.gitignore</code> file.</li>
                <li>Never hardcode keys into JavaScript source files or push them to public Git repositories.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="sec-rotation">Rotation Without Downtime</h2>
              <p>When rotating an API key:</p>
              <ol>
                <li>Generate a new API key in the ObserveX dashboard tagged for the same environment.</li>
                <li>Deploy the new key to your application servers.</li>
                <li>Verify that metrics continue arriving under the new key.</li>
                <li>Revoke the old key from the dashboard.</li>
              </ol>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // SECURITY & BEST PRACTICES: ENV VARS
      // ────────────────────────────────────────────────────────────────────────
      case "security-env-vars":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="sec-env-names">Standard Environment Variable Names</h2>
              <p>Use these uniform names across your services:</p>
              <CodeBlock code={CODE_SNIPPETS.envSample} title=".env.example" language="bash" />
            </div>

            <div className={styles.docSection}>
              <h2 id="sec-env-leakage">Preventing Client-Side Leakage</h2>
              <p>
                Modern frontend frameworks automatically bundle environment variables matching certain prefixes (e.g. <code>VITE_</code> in Vite, <code>NEXT_PUBLIC_</code> in Next.js).
              </p>
              <Callout type="security" title="Prefix Rule">
                <p>
                  Never prefix your ObserveX API key with <code>VITE_</code>, <code>NEXT_PUBLIC_</code>, or <code>REACT_APP_</code>. This ensures build tools never bake your secret key into client-side JS bundles.
                </p>
              </Callout>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // SECURITY & BEST PRACTICES: SENSITIVE DATA
      // ────────────────────────────────────────────────────────────────────────
      case "security-sensitive-data":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="sec-zero-pii">Zero-PII Telemetry Architecture</h2>
              <p>
                ObserveX is strictly an operational telemetry collector. We enforce a zero-PII (Personally Identifiable Information) policy by design:
              </p>
              <ul>
                <li>Do NOT send request or response bodies.</li>
                <li>Do NOT send <code>Authorization</code> headers, Bearer tokens, API secrets, or cookies.</li>
                <li>Do NOT send query parameters containing sensitive values.</li>
              </ul>
            </div>

            <div className={styles.docSection}>
              <h2 id="sec-parameterize">Path Parameterization</h2>
              <p>
                Ensure dynamic URLs like <code>/users/john.doe@example.com/orders/5512</code> are normalized to route patterns like <code>/users/:id/orders/:orderId</code>. This eliminates personal data from URLs and keeps your metrics clean.
              </p>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // SECURITY & BEST PRACTICES: NON-BLOCKING TELEMETRY
      // ────────────────────────────────────────────────────────────────────────
      case "security-non-blocking":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="sec-finish-event">The res.on('finish') Event</h2>
              <p>
                In Node.js Express applications, HTTP responses stream asynchronously. By listening to the <code>res.on('finish')</code> event, your application waits until all response bytes have been transmitted to the client before preparing and emitting telemetry.
              </p>
            </div>

            <div className={styles.docSection}>
              <h2 id="sec-detached">Detached Async Execution</h2>
              <p>
                Always catch asynchronous promises silently:
              </p>
              <CodeBlock
                code={`axios.post(url, payload, { headers, timeout: 3000 })\n  .catch(err => {\n    // Log quietly in dev, never rethrow to user\n  });`}
                title="Detached Async Pattern"
                language="javascript"
              />
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // SECURITY & BEST PRACTICES: RETRIES & BUFFERING
      // ────────────────────────────────────────────────────────────────────────
      case "security-retries-buffering":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="sec-backoff">Bounded Retries & Exponential Backoff</h2>
              <p>
                Avoid aggressive retry loops on telemetry calls. If the ingestion endpoint returns HTTP 429 or 503, wait according to the <code>RateLimit-Reset</code> or <code>retryAfter</code> response before retrying.
              </p>
            </div>

            <div className={styles.docSection}>
              <h2 id="sec-loops">Preventing Recursive Telemetry Loops</h2>
              <Callout type="warning" title="Loop Prevention Rule">
                <p>
                  Ensure your middleware ignores ObserveX's own endpoints (e.g. <code>/api/hit</code>) and health check endpoints. Monitoring telemetry calls would trigger an infinite recursion loop!
                </p>
              </Callout>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // HELP: TROUBLESHOOTING
      // ────────────────────────────────────────────────────────────────────────
      case "troubleshooting":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="tb-guide">Common Issues & Resolutions</h2>
              <p>
                Quick solutions for verified ingestion errors and configuration mismatches:
              </p>

              <div className={styles.accordionList}>
                {TROUBLESHOOTING_ITEMS.map((item) => (
                  <div key={item.id} className={styles.accordionItem}>
                    <div className={styles.accordionHeader} style={{ cursor: "default" }}>
                      <span>{item.title}</span>
                    </div>
                    <div className={styles.accordionContent}>
                      <h5>Common Causes:</h5>
                      <ul>
                        {item.causes.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                      <h5>Recommended Solutions:</h5>
                      <ul>
                        {item.solutions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      // ────────────────────────────────────────────────────────────────────────
      // HELP: FAQ
      // ────────────────────────────────────────────────────────────────────────
      case "faq":
        return (
          <>
            <div className={styles.docSection}>
              <h2 id="faq-list">Frequently Asked Questions</h2>
              <div className={styles.faqGrid}>
                {FAQ_ITEMS.map((item, index) => (
                  <div key={index} className={styles.faqCard}>
                    <h4>{item.q}</h4>
                    <p>{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title={`${currentPage.title} - ObserveX Developer Documentation`}
        description="Complete, verified developer documentation for ObserveX API hit tracking, real-time analytics, and endpoint monitoring."
        keywords="observex, api monitoring, developer docs, express middleware, nodejs integration, latency tracking"
      />

      {/* Dynamic Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button type="button" onClick={() => setActivePageId("overview")}>
          Documentation
        </button>
        <ChevronRight size={13} />
        <span>{currentPage.categoryTitle}</span>
        <ChevronRight size={13} />
        <span className={styles.breadcrumbCurrent}>{currentPage.title}</span>
      </div>

      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={16} />
          <span>Docs Menu</span>
        </button>
        <span className={styles.mobileCurrentTitle}>{currentPage.title}</span>
      </div>

      {/* Three-Column Grid */}
      <div className={styles.docsGrid}>
        {/* Left Sidebar */}
        <Sidebar
          categories={DOCS_CATEGORIES}
          activePageId={activePageId}
          onSelectPage={setActivePageId}
          collapsedCategories={collapsedCategories}
          onToggleCategory={toggleCategory}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          searchResults={searchResults}
        />

        {/* Center Main Article Content */}
        <main className={styles.contentArea}>
          <article className={styles.articleCard}>
            <header className={styles.articleHeader}>
              <div className={styles.headerMeta}>
                <span className={styles.categoryBadge}>{currentPage.categoryTitle}</span>
                {currentPage.badge && <span className={styles.statusBadge}>{currentPage.badge}</span>}
                {currentPage.method && <span className={styles.statusBadge}>{currentPage.method} /api/hit</span>}
              </div>
              <h1>{currentPage.title}</h1>
              {currentPage.description && (
                <p className={styles.headerDescription}>{currentPage.description}</p>
              )}
            </header>

            {renderArticleContent()}

            {/* Previous / Next Navigation Buttons */}
            <nav className={styles.navPaging}>
              {prevPage ? (
                <button
                  type="button"
                  className={styles.pagingBtn}
                  onClick={() => setActivePageId(prevPage.id)}
                >
                  <span className={styles.pagingDir}>
                    <ArrowLeft size={12} /> Previous
                  </span>
                  <span className={styles.pagingTitle}>{prevPage.title}</span>
                </button>
              ) : (
                <div />
              )}

              {nextPage ? (
                <button
                  type="button"
                  className={`${styles.pagingBtn} ${styles.nextBtn}`}
                  onClick={() => setActivePageId(nextPage.id)}
                >
                  <span className={styles.pagingDir}>
                    Next <ArrowRight size={12} />
                  </span>
                  <span className={styles.pagingTitle}>{nextPage.title}</span>
                </button>
              ) : (
                <div />
              )}
            </nav>
          </article>
        </main>

        {/* Right Sidebar: Table of Contents */}
        <TableOfContents
          items={tocHeadings}
          activeHeadingId={activeTocHeading}
          onScrollTo={scrollToHeading}
        />
      </div>
    </div>
  );
}

export default DocumentationPage;
