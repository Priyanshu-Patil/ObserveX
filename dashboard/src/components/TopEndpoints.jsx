import { useState } from "react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui";
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertCircle,
  Activity,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import styles from "../styles/modules/TopEndpoints.module.scss";

function TopEndpoints({ endpoints = [], limit = 7 }) {
  const [copiedPath, setCopiedPath] = useState(null);

  const displayedEndpoints = limit ? endpoints.slice(0, limit) : endpoints;

  const handleCopy = (path) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 1800);
    }
  };

  const getMethodColor = (method) => {
    switch (method?.toUpperCase()) {
      case "GET":
        return styles.methodGet;
      case "POST":
        return styles.methodPost;
      case "PUT":
        return styles.methodPut;
      case "PATCH":
        return styles.methodPatch;
      case "DELETE":
        return styles.methodDelete;
      default:
        return styles.methodDefault;
    }
  };

  const getRankColor = (index) => {
    if (index === 0) return styles.rank1;
    if (index === 1) return styles.rank2;
    if (index === 2) return styles.rank3;
    return styles.rankOther;
  };

  if (!displayedEndpoints || displayedEndpoints.length === 0) {
    return (
      <Card className={styles.container}>
        <CardHeader className={styles.cardHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.iconContainer}>
              <BarChart3 className={styles.icon} />
            </div>
            <div>
              <CardTitle>Top Endpoints</CardTitle>
              <CardDescription>Most active API endpoints by traffic volume</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.noDataContainer}>
            <div className={styles.noDataIcon}>
              <Activity className={styles.noDataIconSvg} />
            </div>
            <p className={styles.noDataText}>No endpoint traffic recorded yet</p>
            <p className={styles.noDataSubtext}>
              Real-time metrics will appear here as your services process incoming API hits
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={styles.container}>
      <CardHeader className={styles.cardHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerInfo}>
            <div className={styles.iconContainer}>
              <BarChart3 className={styles.icon} />
            </div>
            <div>
              <CardTitle>Top Endpoints</CardTitle>
              <CardDescription>
                Most active API endpoints ranked by traffic volume and response latency
              </CardDescription>
            </div>
          </div>
          <div className={styles.headerBadge}>
            <TrendingUp className={styles.badgeIcon} />
            <span>Top {displayedEndpoints.length} Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className={styles.cardContent}>
        <div className={styles.endpointsList}>
          {displayedEndpoints.map((endpoint, index) => {
            const errorRateNum = parseFloat(endpoint.errorRate || 0);
            const isHealthy = errorRateNum === 0;
            const isWarning = errorRateNum > 0 && errorRateNum < 5;

            return (
              <div
                key={`${endpoint.endpoint}-${endpoint.method}-${index}`}
                className={styles.endpointCard}
              >
                {/* Header Row: Rank, Method, Path, Service, Health */}
                <div className={styles.cardTopRow}>
                  <div className={styles.endpointIdent}>
                    <span className={`${styles.rankBadge} ${getRankColor(index)}`}>
                      #{index + 1}
                    </span>

                    <span
                      className={`${styles.methodBadge} ${getMethodColor(endpoint.method)}`}
                    >
                      {endpoint.method}
                    </span>

                    <div className={styles.pathWrapper}>
                      <code className={styles.endpointPath}>{endpoint.endpoint}</code>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => handleCopy(endpoint.endpoint)}
                        title="Copy endpoint path"
                        aria-label="Copy endpoint path"
                      >
                        {copiedPath === endpoint.endpoint ? (
                          <Check size={13} className={styles.copyCheck} />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={styles.metaBadges}>
                    {endpoint.serviceName && (
                      <span className={styles.serviceBadge}>
                        <Activity size={12} className={styles.serviceIcon} />
                        {endpoint.serviceName}
                      </span>
                    )}

                    <span
                      className={`${styles.healthBadge} ${
                        isHealthy
                          ? styles.healthGood
                          : isWarning
                          ? styles.healthWarn
                          : styles.healthError
                      }`}
                    >
                      <span className={styles.healthDot} />
                      {isHealthy ? "Healthy" : isWarning ? "Degraded" : "High Error Rate"}
                    </span>
                  </div>
                </div>

                {/* Metrics Row: 3 Responsive Stat Cards */}
                <div className={styles.metricsGrid}>
                  {/* Total Requests */}
                  <div className={styles.metricItem}>
                    <div className={`${styles.metricIconWrap} ${styles.iconBlue}`}>
                      <TrendingUp size={16} />
                    </div>
                    <div className={styles.metricDetails}>
                      <span className={styles.metricLabel}>Total Requests</span>
                      <span className={styles.metricValue}>
                        {parseInt(endpoint.totalHits || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Avg Latency */}
                  <div className={styles.metricItem}>
                    <div className={`${styles.metricIconWrap} ${styles.iconPurple}`}>
                      <Clock size={16} />
                    </div>
                    <div className={styles.metricDetails}>
                      <span className={styles.metricLabel}>Avg Latency</span>
                      <span className={styles.metricValue}>
                        {endpoint.avgLatency}
                        <span className={styles.metricUnit}>ms</span>
                      </span>
                    </div>
                  </div>

                  {/* Error Rate */}
                  <div className={styles.metricItem}>
                    <div
                      className={`${styles.metricIconWrap} ${
                        isHealthy ? styles.iconGreen : styles.iconRed
                      }`}
                    >
                      {isHealthy ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                    </div>
                    <div className={styles.metricDetails}>
                      <span className={styles.metricLabel}>Error Rate</span>
                      <span
                        className={`${styles.metricValue} ${
                          isHealthy ? styles.metricGreen : styles.metricRed
                        }`}
                      >
                        {endpoint.errorRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default TopEndpoints;
