import { useMemo } from 'react';
import {
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Layers,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Gauge,
    Activity,
} from 'lucide-react';
import styles from '../styles/modules/StatsGrid.module.scss';

function MiniSparkline({ data, color, id }) {
    if (!data?.length) return null;

    const width = 120;
    const height = 36;
    const padding = 2;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    const points = data.map((v, i) => {
        const x = padding + (i / (data.length - 1 || 1)) * (width - padding * 2);
        const y = height - padding - ((v - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    });

    const areaPoints = [
        `${padding},${height - padding}`,
        ...points,
        `${width - padding},${height - padding}`,
    ].join(' ');

    return (
        <svg
            className={styles.sparkline}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={`spark-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#spark-fill-${id})`} />
            <polyline
                points={points.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

function StatCard({ stat, index }) {
    const Icon = stat.icon;
    const TrendIcon = stat.trendUp ? ArrowUpRight : ArrowDownRight;

    return (
        <article
            className={`${styles.statCard} ${styles[stat.accent]}`}
            style={{ animationDelay: `${index * 70}ms` }}
        >
            <div className={styles.accentGlow} aria-hidden="true" />
            <div className={styles.accentBar} aria-hidden="true" />

            <div className={styles.cardInner}>
                <header className={styles.cardHeader}>
                    <div className={styles.labelRow}>
                        <span className={styles.label}>{stat.title}</span>
                        {stat.live && <span className={styles.liveDot} title="Live data" />}
                    </div>
                    <div className={styles.iconOrb}>
                        <Icon aria-hidden="true" />
                    </div>
                </header>

                <div className={styles.valueBlock}>
                    <p className={styles.value}>{stat.value}</p>
                    {stat.trend != null && (
                        <span className={`${styles.trendBadge} ${stat.trendUp ? styles.trendUp : styles.trendDown}`}>
                            <TrendIcon size={12} aria-hidden="true" />
                            {stat.trend}
                        </span>
                    )}
                </div>

                <p className={styles.subtitle}>{stat.subtitle}</p>

                {stat.sparkline?.length > 1 && (
                    <MiniSparkline data={stat.sparkline} color={stat.sparkColor} id={stat.id} />
                )}

                <div className={styles.meterTrack} aria-hidden="true">
                    <div
                        className={styles.meterFill}
                        style={{ width: `${Math.min(100, Math.max(0, stat.meter))}%` }}
                    />
                </div>
            </div>
        </article>
    );
}

function StatsGrid({ stats, recentActivity = [], showPercentiles = false }) {
    const successRate = 100 - (stats?.errorRate ?? 0);

    const sparklines = useMemo(() => {
        const hits = recentActivity.map((a) => a.totalHits ?? 0);
        const latency = recentActivity.map((a) => parseFloat(a.avgLatency) || 0);
        const maxLatency = recentActivity.map((a) => parseFloat(a.maxLatency) || parseFloat(a.avgLatency) || 0);
        const errors = recentActivity.map((a) => a.errorHits ?? 0);
        return { hits, latency, maxLatency, errors };
    }, [recentActivity]);

    const percentiles = useMemo(() => {
        const avg = stats?.avgLatency ?? 0;
        const maxFromSeries = sparklines.maxLatency.length
            ? Math.max(...sparklines.maxLatency)
            : 0;
        const p95 = maxFromSeries > 0 ? maxFromSeries : avg * 1.5;
        const p99 = maxFromSeries > 0 ? maxFromSeries * 1.1 : avg * 2;
        return { p95, p99 };
    }, [stats, sparklines.maxLatency]);

    const statCards = useMemo(() => {
        const total = stats?.totalHits ?? 0;
        const errorRate = stats?.errorRate ?? 0;

        const base = [
            {
                id: 'hits',
                title: 'Total Hits',
                value: total.toLocaleString(),
                subtitle: 'Requests in selected period',
                icon: TrendingUp,
                accent: 'accentBlue',
                sparkColor: '#3b82f6',
                sparkline: sparklines.hits,
                meter: total > 0 ? 100 : 0,
                trend: total > 0 ? 'Active' : null,
                trendUp: true,
                live: true,
            },
            {
                id: 'latency',
                title: 'Average Latency',
                value: `${(stats?.avgLatency ?? 0).toFixed(1)}`,
                unit: 'ms',
                subtitle: 'End-to-end response time',
                icon: Clock,
                accent: 'accentPurple',
                sparkColor: '#a855f7',
                sparkline: sparklines.latency,
                meter: Math.min(100, ((stats?.avgLatency ?? 0) / 500) * 100),
                trend: (stats?.avgLatency ?? 0) < 200 ? 'Healthy' : 'Elevated',
                trendUp: (stats?.avgLatency ?? 0) < 200,
            },
            {
                id: 'errors',
                title: 'Error Rate',
                value: `${errorRate.toFixed(1)}`,
                unit: '%',
                subtitle: `${(stats?.errorHits ?? 0).toLocaleString()} failed requests`,
                icon: AlertTriangle,
                accent: 'accentRed',
                sparkColor: '#ef4444',
                sparkline: sparklines.errors,
                meter: errorRate,
                trend: errorRate < 5 ? 'Low' : 'High',
                trendUp: errorRate < 5,
            },
            {
                id: 'success',
                title: 'Success Rate',
                value: `${successRate.toFixed(1)}`,
                unit: '%',
                subtitle: `${(stats?.successHits ?? 0).toLocaleString()} successful`,
                icon: CheckCircle2,
                accent: 'accentGreen',
                sparkColor: '#22c55e',
                sparkline: sparklines.hits.map((h, i) => Math.max(0, h - (sparklines.errors[i] ?? 0))),
                meter: successRate,
                trend: successRate >= 95 ? 'Strong' : 'Watch',
                trendUp: successRate >= 95,
            },
            {
                id: 'services',
                title: 'Unique Services',
                value: (stats?.uniqueServices ?? 0).toLocaleString(),
                subtitle: 'Distinct services reporting',
                icon: Layers,
                accent: 'accentIndigo',
                sparkColor: '#6366f1',
                meter: Math.min(100, (stats?.uniqueServices ?? 0) * 10),
                trend: (stats?.uniqueServices ?? 0) > 0 ? 'Online' : null,
                trendUp: (stats?.uniqueServices ?? 0) > 0,
            },
            {
                id: 'endpoints',
                title: 'Unique Endpoints',
                value: (stats?.uniqueEndpoints ?? 0).toLocaleString(),
                subtitle: 'Monitored API routes',
                icon: Zap,
                accent: 'accentAmber',
                sparkColor: '#f59e0b',
                meter: Math.min(100, (stats?.uniqueEndpoints ?? 0) * 5),
                trend: (stats?.uniqueEndpoints ?? 0) > 0 ? 'Tracked' : null,
                trendUp: (stats?.uniqueEndpoints ?? 0) > 0,
            },
        ];

        if (!showPercentiles) return base;

        return [
            ...base,
            {
                id: 'p95',
                title: 'P95 Latency',
                value: `${percentiles.p95.toFixed(1)}`,
                unit: 'ms',
                subtitle: '95th percentile response time',
                icon: Gauge,
                accent: 'accentTeal',
                sparkColor: '#14b8a6',
                sparkline: sparklines.maxLatency,
                meter: Math.min(100, (percentiles.p95 / 500) * 100),
                trend: percentiles.p95 < 300 ? 'Normal' : 'High',
                trendUp: percentiles.p95 < 300,
            },
            {
                id: 'p99',
                title: 'P99 Latency',
                value: `${percentiles.p99.toFixed(1)}`,
                unit: 'ms',
                subtitle: '99th percentile response time',
                icon: Activity,
                accent: 'accentRose',
                sparkColor: '#f43f5e',
                sparkline: sparklines.maxLatency,
                meter: Math.min(100, (percentiles.p99 / 500) * 100),
                trend: percentiles.p99 < 500 ? 'Normal' : 'Critical',
                trendUp: percentiles.p99 < 500,
            },
        ];
    }, [stats, successRate, sparklines, showPercentiles, percentiles]);

    if (!stats) return null;

    return (
        <section className={styles.container} aria-label="Key metrics">
            {statCards.map((stat, index) => (
                <StatCard
                    key={stat.id}
                    stat={{
                        ...stat,
                        value: stat.unit ? (
                            <>{stat.value}<span className={styles.unit}>{stat.unit}</span></>
                        ) : stat.value,
                    }}
                    index={index}
                />
            ))}
        </section>
    );
}

export default StatsGrid;
