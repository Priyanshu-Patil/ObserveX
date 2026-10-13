import { useState, useMemo } from "react";
import {
  Zap,
  AlertTriangle,
  Activity,
  Server,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  Building2,
} from "lucide-react";

import { useDashboardQuery } from "../hooks/useDashboardQuery";
import { useAuth } from "../contexts/AuthContext";

import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { DataTable } from "../components/ui/DataTable";
import { Drawer } from "../components/ui/Drawer";
import { StatusBadge } from "../components/ui/StatusBadge";
import { PageStatus } from "../components/ui/PageStatus";

import { useDebounce } from "../hooks/useDebounce";
import { getMethodColor } from "../lib/utils";

import styles from "../styles/modules/pages/EndpointAnalytics.module.scss";
import MetaTags from "../components/MetaTags";

function MetricCard({ icon: Icon, title, value, unit, colorClass }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricHeader}>
        <span className={styles.metricLabel}>{title}</span>
        <div className={`${styles.metricIcon} ${colorClass}`}>
          <Icon size={14} />
        </div>
      </div>

      <div className={styles.metricBody}>
        <span className={styles.metricValue}>{value}</span>
        {unit && <span className={styles.metricUnit}>{unit}</span>}
      </div>
    </div>
  );
}

function InsightCard({ title, icon: Icon, items, type, onSelect }) {
  const maxVal = useMemo(() => {
    if (items.length === 0) return 1;
    if (type === "latency") {
      return Math.max(...items.map((i) => Number(i.avgLatency || 0)), 1);
    }
    return Math.max(...items.map((i) => Number(i.errorRate || 0)), 1);
  }, [items, type]);

  return (
    <div className={styles.insightCard}>
      <div className={styles.insightHeader}>
        <div className={styles.insightTitleRow}>
          <div className={styles.insightIconBadge}>
            <Icon size={16} />
          </div>
          <h3>{title}</h3>
        </div>
        <span className={styles.insightCountBadge}>Top {items.length}</span>
      </div>

      <div className={styles.insightBody}>
        {items.length === 0 ? (
          <div className={styles.emptyInsight}>No endpoint data available</div>
        ) : (
          items.map((endpoint, index) => {
            const methodStyle = getMethodColor(endpoint.method);
            const valNum =
              type === "latency"
                ? Number(endpoint.avgLatency || 0)
                : Number(endpoint.errorRate || 0);
            const percent =
              maxVal > 0 ? Math.min(100, Math.max(8, (valNum / maxVal) * 100)) : 10;

            return (
              <button
                type="button"
                key={`${endpoint.endpoint}-${endpoint.method}-${index}`}
                className={styles.insightItem}
                onClick={() => onSelect(endpoint)}
                title="Click to view details"
              >
                <div className={styles.insightLeft}>
                  <span className={styles.rankPill}>#{index + 1}</span>

                  <span
                    className={styles.methodBadge}
                    style={{
                      color: methodStyle.color,
                      background: methodStyle.background,
                      borderColor: methodStyle.borderColor,
                    }}
                  >
                    {endpoint.method}
                  </span>

                  <span className={styles.endpointPath}>{endpoint.endpoint}</span>
                </div>

                <div className={styles.insightRight}>
                  {type === "latency" ? (
                    <div className={styles.valWithBar}>
                      <strong>{endpoint.avgLatency}ms</strong>
                      <div className={styles.miniBar}>
                        <div
                          className={styles.miniBarFillLatency}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  ) : valNum === 0 ? (
                    <span className={styles.zeroErrorBadge}>
                      <CheckCircle2 size={12} /> 0.00%
                    </span>
                  ) : (
                    <div className={styles.valWithBar}>
                      <strong className={styles.hasErrorText}>
                        {endpoint.errorRate}%
                      </strong>
                      <div className={styles.miniBar}>
                        <div
                          className={styles.miniBarFillError}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <ArrowUpRight size={14} className={styles.hoverArrow} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function EndpointAnalyticsPage() {
  const { isSuperAdmin, clientId } = useAuth();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [copiedPath, setCopiedPath] = useState(false);

  const handleCopy = (path) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(path);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 1800);
    }
  };

  const debouncedSearch = useDebounce(search);

  const params = isSuperAdmin ? {} : { clientId };
  const { data, isPending, error, refetch } = useDashboardQuery(params);

  const endpoints = data?.data?.topEndpoints ?? [];

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();

    return endpoints.filter(
      (endpoint) =>
        !q ||
        endpoint.endpoint?.toLowerCase().includes(q) ||
        endpoint.serviceName?.toLowerCase().includes(q) ||
        endpoint.clientName?.toLowerCase().includes(q),
    );
  }, [endpoints, debouncedSearch]);

  const slowest = useMemo(() => {
    return [...endpoints]
      .sort((a, b) => (b.avgLatency ?? 0) - (a.avgLatency ?? 0))
      .slice(0, 5);
  }, [endpoints]);

  const worst = useMemo(() => {
    return [...endpoints]
      .sort((a, b) => (b.errorRate ?? 0) - (a.errorRate ?? 0))
      .slice(0, 5);
  }, [endpoints]);

  const totalRequests = useMemo(() => {
    return endpoints.reduce((acc, ep) => acc + (ep.totalHits || 0), 0);
  }, [endpoints]);

  const avgLatency = useMemo(() => {
    if (endpoints.length === 0) return 0;
    const sum = endpoints.reduce((acc, ep) => acc + Number(ep.avgLatency || 0), 0);
    return (sum / endpoints.length).toFixed(1);
  }, [endpoints]);

  const avgErrorRate = useMemo(() => {
    if (endpoints.length === 0) return 0;
    const sum = endpoints.reduce((acc, ep) => acc + Number(ep.errorRate || 0), 0);
    return (sum / endpoints.length).toFixed(2);
  }, [endpoints]);

  if (isPending || error) {
    return <PageStatus isLoading={isPending} error={error} onRetry={refetch} />;
  }

  const healthScore = Math.max(
    0,
    Math.min(100, 100 - avgErrorRate * 5 - avgLatency / 10),
  ).toFixed(0);

  const totalServices = new Set(
    endpoints.map((endpoint) => endpoint.serviceName),
  ).size;

  const columns = [
    {
      key: "endpoint",
      header: "Endpoint",
      render: (row) => {
        const methodStyle = getMethodColor(row.method);
        return (
          <button
            type="button"
            className={styles.endpointRowButton}
            onClick={() => setSelected(row)}
          >
            <span
              className={styles.methodBadge}
              style={{
                color: methodStyle.color,
                background: methodStyle.background,
                borderColor: methodStyle.borderColor,
              }}
            >
              {row.method}
            </span>

            <span className={styles.tableEndpointPath}>{row.endpoint}</span>
          </button>
        );
      },
    },
    {
      key: "clientName",
      header: "Client Name",
      render: (row) => {
        if (!row.clientName || row.clientName === "—") {
          return <span className={styles.emptyClient}>—</span>;
        }
        return (
          <div className={styles.clientCell}>
            <Building2 size={13} className={styles.clientIcon} />
            <span>{row.clientName}</span>
          </div>
        );
      },
    },
    {
      key: "serviceName",
      header: "Service",
    },
    {
      key: "totalHits",
      header: "Requests",
      render: (row) => Number(row.totalHits).toLocaleString(),
    },
    {
      key: "avgLatency",
      header: "Latency",
      render: (row) => (
        <span className={styles.latencyCell}>{row.avgLatency}ms</span>
      ),
    },
    {
      key: "errorRate",
      header: "Error Rate",
      render: (row) => (
        <StatusBadge status={Number(row.errorRate) > 5 ? "expired" : "active"}>
          {row.errorRate}%
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className={styles.analyticsPage}>
      <MetaTags
        title="Endpoint Analytics - ObserveX"
        description="Detailed endpoint analytics and performance metrics for all monitored API routes."
      />

      <PageHeader
        title="Endpoint Analytics"
        description="Understand endpoint performance, latency and failures across all services."
        breadcrumbs={[
          {
            label: "Home",
            href: "/client/dashboard",
          },
          {
            label: "Analytics",
          },
          {
            label: "Endpoints",
          },
        ]}
      />

      {/* 6 Top Metric Cards */}
      <div className={styles.metricsGrid}>
        <MetricCard
          icon={Layers}
          title="Endpoints"
          value={endpoints.length}
          colorClass={styles.iconBlue}
        />

        <MetricCard
          icon={Activity}
          title="Requests"
          value={Number(totalRequests).toLocaleString()}
          colorClass={styles.iconCyan}
        />

        <MetricCard
          icon={Clock}
          title="Avg Latency"
          value={avgLatency}
          unit="ms"
          colorClass={styles.iconViolet}
        />

        <MetricCard
          icon={AlertTriangle}
          title="Error Rate"
          value={`${avgErrorRate}%`}
          colorClass={Number(avgErrorRate) > 0 ? styles.iconRose : styles.iconEmerald}
        />

        <MetricCard
          icon={Zap}
          title="Health Score"
          value={healthScore}
          unit="/100"
          colorClass={healthScore >= 90 ? styles.iconAmber : styles.iconRose}
        />

        <MetricCard
          icon={Server}
          title="Services"
          value={totalServices}
          colorClass={styles.iconIndigo}
        />
      </div>

      {/* Clean, Simple Search Toolbar */}
      <div className={styles.toolbar}>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search endpoints, services, clients..."
          className={styles.searchBar}
        />
        {search.trim() && (
          <span className={styles.searchResultCount}>
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      {/* Clean Insight Cards: Slowest Endpoints & Error Hotspots */}
      <div className={styles.insightsGrid}>
        <InsightCard
          title="Slowest Endpoints"
          icon={Clock}
          items={slowest}
          type="latency"
          onSelect={setSelected}
        />

        <InsightCard
          title="Error Hotspots"
          icon={AlertTriangle}
          items={worst}
          type="error"
          onSelect={setSelected}
        />
      </div>

      {/* Endpoint Performance Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h3>Endpoint Performance</h3>
            <p>Detailed endpoint analytics and performance metrics</p>
          </div>

          <TrendingUp size={18} />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No endpoints found"
          emptyDescription="Traffic will appear here once requests are received."
        />
      </div>

      {/* Drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Endpoint Details">
        {selected && (() => {
          const methodStyle = getMethodColor(selected.method);
          const errorNum = Number(selected.errorRate || 0);
          const isWarning = errorNum > 5;
          const latencyNum = Number(selected.avgLatency || 0);

          return (
            <div className={styles.endpointDrawer}>
              {/* Hero Banner */}
              <div className={styles.drawerHero}>
                <div className={styles.drawerHeroTop}>
                  <div className={styles.drawerHeroBadges}>
                    <span
                      className={styles.methodBadge}
                      style={{
                        background: methodStyle.background,
                        color: methodStyle.color,
                        borderColor: methodStyle.borderColor,
                      }}
                    >
                      {selected.method}
                    </span>

                    {selected.clientName && selected.clientName !== "—" && (
                      <span className={styles.clientBadgePill}>
                        <Building2 size={12} />
                        {selected.clientName}
                      </span>
                    )}

                    {selected.serviceName && (
                      <span className={styles.serviceBadgePill}>
                        <Server size={12} />
                        {selected.serviceName}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={styles.drawerCopyBtn}
                    onClick={() => handleCopy(selected.endpoint)}
                    title="Copy endpoint path"
                    aria-label="Copy endpoint path"
                  >
                    {copiedPath ? (
                      <Check size={14} className={styles.copyCheckIcon} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <div className={styles.drawerPathDisplay}>
                  {selected.endpoint}
                </div>
              </div>

              {/* 2x2 Metrics Grid */}
              <div className={styles.drawerMetricsGrid}>
                <div className={styles.drawerMetricCard}>
                  <div className={styles.drawerMetricHeader}>
                    <span className={styles.drawerMetricLabel}>Total Requests</span>
                    <div className={`${styles.drawerMetricIconWrap} ${styles.iconBlue}`}>
                      <Activity size={13} />
                    </div>
                  </div>
                  <div className={styles.drawerMetricValueWrapper}>
                    <span className={styles.drawerMetricValue}>
                      {Number(selected.totalHits || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className={styles.drawerMetricCard}>
                  <div className={styles.drawerMetricHeader}>
                    <span className={styles.drawerMetricLabel}>Avg Latency</span>
                    <div className={`${styles.drawerMetricIconWrap} ${styles.iconViolet}`}>
                      <Clock size={13} />
                    </div>
                  </div>
                  <div className={styles.drawerMetricValueWrapper}>
                    <span className={styles.drawerMetricValue}>{selected.avgLatency}</span>
                    <span className={styles.drawerMetricUnit}>ms</span>
                  </div>
                </div>

                <div className={styles.drawerMetricCard}>
                  <div className={styles.drawerMetricHeader}>
                    <span className={styles.drawerMetricLabel}>Error Rate</span>
                    <div
                      className={`${styles.drawerMetricIconWrap} ${
                        errorNum > 0 ? styles.iconRose : styles.iconEmerald
                      }`}
                    >
                      <AlertTriangle size={13} />
                    </div>
                  </div>
                  <div className={styles.drawerMetricValueWrapper}>
                    <span className={styles.drawerMetricValue}>{selected.errorRate}%</span>
                  </div>
                </div>

                <div className={styles.drawerMetricCard}>
                  <div className={styles.drawerMetricHeader}>
                    <span className={styles.drawerMetricLabel}>Error Hits</span>
                    <div className={`${styles.drawerMetricIconWrap} ${styles.iconRose}`}>
                      <Zap size={13} />
                    </div>
                  </div>
                  <div className={styles.drawerMetricValueWrapper}>
                    <span className={styles.drawerMetricValue}>
                      {Number(selected.errorHits || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endpoint Information */}
              <div className={styles.drawerSectionCard}>
                <div className={styles.drawerSectionHeader}>
                  <h4>Endpoint Information</h4>
                </div>
                <div className={styles.infoList}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Service</span>
                    <span className={styles.infoValue}>
                      {selected.serviceName || "default-service"}
                    </span>
                  </div>

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Method</span>
                    <span
                      className={styles.methodBadge}
                      style={{
                        background: methodStyle.background,
                        color: methodStyle.color,
                        borderColor: methodStyle.borderColor,
                      }}
                    >
                      {selected.method}
                    </span>
                  </div>

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Path</span>
                    <code className={styles.infoCode}>{selected.endpoint}</code>
                  </div>
                </div>
              </div>

              {/* Performance Health */}
              <div className={styles.drawerSectionCard}>
                <div className={styles.drawerSectionHeader}>
                  <h4>Performance Health</h4>
                  <StatusBadge status={isWarning ? "expired" : "active"}>
                    {isWarning ? "Needs Attention" : "Healthy"}
                  </StatusBadge>
                </div>

                <div className={styles.healthStatsRow}>
                  <div className={styles.healthStat}>
                    <span className={styles.healthStatLabel}>Reliability Score</span>
                    <strong className={styles.healthStatValue}>
                      {Math.max(0, 100 - errorNum).toFixed(1)}%
                    </strong>
                  </div>
                  <div className={styles.healthStat}>
                    <span className={styles.healthStatLabel}>Latency Rating</span>
                    <strong className={styles.healthStatValue}>
                      {latencyNum < 100 ? "Optimal" : latencyNum < 300 ? "Normal" : "High"}
                    </strong>
                  </div>
                </div>

                <div className={styles.healthProgressTrack}>
                  <div
                    className={`${styles.healthProgressBar} ${
                      isWarning ? styles.healthProgressBarWarn : ""
                    }`}
                    style={{
                      width: `${Math.max(5, 100 - errorNum)}%`,
                    }}
                  />
                </div>

                <p className={styles.healthFootnote}>
                  {errorNum === 0
                    ? "Zero errors detected. All recent requests succeeded."
                    : `${selected.errorRate}% of requests resulted in HTTP 4xx/5xx responses.`}
                </p>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
}

export default EndpointAnalyticsPage;
