import { useState, useMemo } from "react";
import {
  Search,
  Zap,
  AlertTriangle,
  Activity,
  Server,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Layers,
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

import uiStyles from "../styles/modules/ui/SharedUi.module.scss";
import styles from "../styles/modules/pages/EndpointAnalytics.module.scss";

function MetricCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon}>
        <Icon size={20} />
      </div>

      <div>
        <p className={styles.metricLabel}>{title}</p>

        <h3 className={styles.metricValue}>{value}</h3>

        <span className={styles.metricSubtitle}>{subtitle}</span>
      </div>
    </div>
  );
}

function InsightCard({ title, icon: Icon, items, type }) {
  return (
    <div className={styles.insightCard}>
      <div className={styles.insightHeader}>
        <div>
          <Icon size={18} />
          <h3>{title}</h3>
        </div>
      </div>

      <div className={styles.insightBody}>
        {items.length === 0 ? (
          <div className={styles.emptyInsight}>No data available</div>
        ) : (
          items.map((endpoint, index) => (
            <div
              key={`${endpoint.endpoint}-${index}`}
              className={styles.insightItem}
            >
              <div>
                <span
                  className={styles.methodBadge}
                  style={{
                    color: getMethodColor(endpoint.method),
                  }}
                >
                  {endpoint.method}
                </span>

                <span className={styles.endpointPath}>{endpoint.endpoint}</span>
              </div>

              <strong>
                {type === "latency"
                  ? `${endpoint.avgLatency}ms`
                  : `${endpoint.errorRate}%`}
              </strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function EndpointAnalyticsPage() {
  const { isSuperAdmin, clientId } = useAuth();

  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);

  const debouncedSearch = useDebounce(search);

  const params = isSuperAdmin ? {} : { clientId };

  const { data, isPending, error, refetch } = useDashboardQuery(params);

  const endpoints = data?.data?.topEndpoints ?? [];

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    return endpoints.filter(
      (endpoint) =>
        !q ||
        endpoint.endpoint?.toLowerCase().includes(q) ||
        endpoint.serviceName?.toLowerCase().includes(q),
    );
  }, [endpoints, debouncedSearch]);

  const slowest = [...endpoints]
    .sort((a, b) => (b.avgLatency ?? 0) - (a.avgLatency ?? 0))
    .slice(0, 5);

  const worst = [...endpoints]
    .sort((a, b) => (b.errorRate ?? 0) - (a.errorRate ?? 0))
    .slice(0, 5);

  const totalRequests = endpoints.reduce(
    (acc, endpoint) => acc + (endpoint.totalHits || 0),
    0,
  );

  const avgLatency =
    endpoints.length > 0
      ? (
          endpoints.reduce(
            (acc, endpoint) => acc + Number(endpoint.avgLatency || 0),
            0,
          ) / endpoints.length
        ).toFixed(1)
      : 0;

  const avgErrorRate =
    endpoints.length > 0
      ? (
          endpoints.reduce(
            (acc, endpoint) => acc + Number(endpoint.errorRate || 0),
            0,
          ) / endpoints.length
        ).toFixed(2)
      : 0;

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
      render: (row) => (
        <button
          type="button"
          className={styles.endpointButton}
          onClick={() => setSelected(row)}
        >
          <span
            className={styles.methodBadge}
            style={{
              color: getMethodColor(row.method),
            }}
          >
            {row.method}
          </span>

          <span>{row.endpoint}</span>
        </button>
      ),
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

      <div className={styles.metricsGrid}>
        <MetricCard
          icon={Layers}
          title="Endpoints"
          value={endpoints.length}
          subtitle="Tracked endpoints"
        />

        <MetricCard
          icon={Activity}
          title="Requests"
          value={Number(totalRequests).toLocaleString()}
          subtitle="Total traffic"
        />

        <MetricCard
          icon={Clock}
          title="Avg Latency"
          value={`${avgLatency}ms`}
          subtitle="Across all endpoints"
        />

        <MetricCard
          icon={AlertTriangle}
          title="Error Rate"
          value={`${avgErrorRate}%`}
          subtitle="System wide"
        />

        <MetricCard
          icon={Zap}
          title="Health Score"
          value={`${healthScore}/100`}
          subtitle="Overall reliability"
        />

        <MetricCard
          icon={Server}
          title="Services"
          value={totalServices}
          subtitle="Connected services"
        />
      </div>

      <div className={styles.toolbar}>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search endpoints, services..."
        />
      </div>

      <div className={styles.insightsGrid}>
        <InsightCard
          title="Slowest Endpoints"
          icon={Clock}
          items={slowest}
          type="latency"
        />

        <InsightCard
          title="Error Hotspots"
          icon={AlertTriangle}
          items={worst}
          type="error"
        />
      </div>

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

      <Drawer
    open={!!selected}
    onClose={() => setSelected(null)}
    title=""
>
    {selected && (
        <div className={styles.endpointDrawer}>
            <div className={styles.endpointHero}>
                <div>
                    <div
                        className={styles.methodBadge}
                        style={{
                            background: `${getMethodColor(
                                selected.method
                            )}15`,
                            color: getMethodColor(
                                selected.method
                            ),
                        }}
                    >
                        {selected.method}
                    </div>

                    <h2>
                        {selected.endpoint}
                    </h2>

                    <p>
                        {selected.serviceName}
                    </p>
                </div>
            </div>

            <div className={styles.metricGrid}>
                <div className={styles.metricCard}>
                    <span>Total Requests</span>

                    <strong>
                        {Number(
                            selected.totalHits
                        ).toLocaleString()}
                    </strong>
                </div>

                <div className={styles.metricCard}>
                    <span>Avg Latency</span>

                    <strong>
                        {selected.avgLatency}
                        ms
                    </strong>
                </div>

                <div className={styles.metricCard}>
                    <span>Error Rate</span>

                    <strong>
                        {selected.errorRate}%
                    </strong>
                </div>

                <div className={styles.metricCard}>
                    <span>Error Hits</span>

                    <strong>
                        {Number(
                            selected.errorHits
                        ).toLocaleString()}
                    </strong>
                </div>
            </div>

            <div className={styles.infoCard}>
                <h3>
                    Endpoint Information
                </h3>

                <div
                    className={
                        styles.infoRows
                    }
                >
                    <div>
                        <span>
                            Service
                        </span>

                        <strong>
                            {
                                selected.serviceName
                            }
                        </strong>
                    </div>

                    <div>
                        <span>
                            Method
                        </span>

                        <strong>
                            {
                                selected.method
                            }
                        </strong>
                    </div>

                    <div>
                        <span>
                            Path
                        </span>

                        <strong>
                            {
                                selected.endpoint
                            }
                        </strong>
                    </div>
                </div>
            </div>

            <div className={styles.healthCard}>
                <h3>
                    Performance Health
                </h3>

                <div
                    className={
                        styles.healthRow
                    }
                >
                    <span>
                        Endpoint Status
                    </span>

                    <StatusBadge
                        status={
                            Number(
                                selected.errorRate
                            ) > 5
                                ? 'expired'
                                : 'active'
                        }
                    >
                        {Number(
                            selected.errorRate
                        ) > 5
                            ? 'Needs Attention'
                            : 'Healthy'}
                    </StatusBadge>
                </div>

                <div
                    className={
                        styles.healthProgress
                    }
                >
                    <div
                        style={{
                            width: `${Math.max(
                                5,
                                100 -
                                    Number(
                                        selected.errorRate
                                    )
                            )}%`,
                        }}
                    />
                </div>
            </div>
        </div>
    )}
</Drawer>
    </div>
  );
}
