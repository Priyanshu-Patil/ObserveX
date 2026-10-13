import logger from "../../../shared/config/logger.js";
import AppError from "../../../shared/utils/AppError.js";

/**
 * AnalyticsService class responsible for handling analytics business logic
 * 
 * This service:
 * - Fetches aggregated metrics from MetricsRepository
 * - Transforms raw database data into API-friendly responses
 * - Applies time filtering and calculations (error rate, success hits, etc.)
 * 
 * Acts as a bridge between repository layer and controller layer.
 */
export class AnalyticsService {
    /**
     * Constructor for AnalyticsService
     * 
     * @param {Object} metricsRepo - Metrics repository instance (PostgreSQL)
     * @param {Object} [clientRepo] - Client repository instance (MongoDB)
     */
    constructor(metricsRepo, clientRepo = null) {
        if (!metricsRepo) throw new Error("Analytics requires a metricRepository")
        this.metricsRepository = metricsRepo
        this.clientRepository = clientRepo
    }

    /**
     * Get overall aggregated statistics
     * 
     * Calculates:
     * - Total hits
     * - Error hits
     * - Success hits
     * - Error rate
     * - Average latency
     * - Unique services & endpoints
     * 
     * @param {string} clientId
     * @param {Object} filters - { startTime, endTime }
     * @returns {Promise<Object>}
     */
    async getOverallStats(clientId, filters = {}) {
        try {
            const { startTime, endTime } = this.parseTimeFilters(filters);
            const { serviceName } = filters;

            const stats = await this.metricsRepository.getOverallStats(
                clientId,
                startTime,
                endTime,
                serviceName
            );

            const totalHits = parseInt(stats.total_hits) || 0;
            const errorHits = parseInt(stats.error_hits) || 0;
            const errorRate = totalHits > 0 ? (errorHits / totalHits) * 100 : 0;

            return {
                totalHits,
                errorHits,
                successHits: totalHits - errorHits,
                errorRate: parseFloat(errorRate.toFixed(2)),
                avgLatency: parseFloat(stats.avg_latency) || 0,
                uniqueServices: parseInt(stats.unique_services) || 0,
                uniqueEndpoints: parseInt(stats.unique_endpoints) || 0,
                timeRange: {
                    start: startTime,
                    end: endTime,
                },
            };
        } catch (error) {
            logger.error("Error getting overall stats", error);
            throw error;
        }
    }

    /**
     * Get distinct services
     * 
     * @param {string|null} clientId
     * @returns {Promise<Array<string>>}
     */
    async getServices(clientId = null) {
        try {
            return await this.metricsRepository.getServices(clientId);
        } catch (error) {
            logger.error("Error getting services in AnalyticsService", error);
            throw error;
        }
    }

    /**
     * Parse and normalize time filters
     * 
     * Default behavior:
     * - If startTime is not provided → last 24 hours
     * - If endTime is not provided → current time
     * 
     * @param {Object} filters
     * @returns {{ startTime: Date, endTime: Date }}
     */
    parseTimeFilters(filters = {}) {
        let { startTime, endTime, allTime } = filters;

        if (allTime) {
            return { startTime: null, endTime: null };
        }

        if (!startTime) {
            startTime = new Date();
            startTime.setHours(startTime.getHours() - 24);
        } else {
            startTime = new Date(startTime);
        }

        if (!endTime) {
            endTime = new Date();
        } else {
            endTime = new Date(endTime);
        }

        return { startTime, endTime };
    }

    /**
     * Get top endpoints based on traffic
     * 
     * Returns endpoints sorted by total hits with calculated error rate and latency
     * 
     * @param {string} clientId
     * @param {Object} options - { startTime, endTime, limit, serviceName, allTime }
     * @returns {Promise<Array>}
     */
    async getTopEndpoints(clientId, options = {}) {
        try {
            const { startTime, endTime, limit = 10, serviceName, allTime } = options;
            const parsedStartTime = allTime ? null : (startTime ? new Date(startTime) : null);
            const parsedEndTime = allTime ? null : (endTime ? new Date(endTime) : null);

            const endpoints = await this.metricsRepository.getTopEndpoints(clientId, limit, parsedStartTime, parsedEndTime, serviceName);

            const clientMap = new Map();
            if (this.clientRepository) {
                const uniqueClientIds = [
                    ...new Set(
                        endpoints
                            .map((endpoint) => endpoint.client_id)
                            .filter(Boolean)
                    ),
                ];

                if (uniqueClientIds.length > 0) {
                    try {
                        const clients = await this.clientRepository.find(
                            { _id: { $in: uniqueClientIds } },
                            { limit: uniqueClientIds.length + 10 }
                        );
                        for (const client of clients) {
                            clientMap.set(client._id.toString(), client.name);
                        }
                    } catch (clientErr) {
                        logger.warn("Failed to fetch client names for top endpoints", clientErr);
                    }
                }
            }

            return endpoints.map((endpoint) => {
                const epClientId = endpoint.client_id ? endpoint.client_id.toString() : null;
                const clientName = epClientId ? clientMap.get(epClientId) : null;

                return {
                    clientId: epClientId,
                    clientName: clientName || "—",
                    serviceName: endpoint.service_name,
                    endpoint: endpoint.endpoint,
                    method: endpoint.method,
                    totalHits: parseInt(endpoint.total_hits),
                    avgLatency: parseFloat(endpoint.avg_latency).toFixed(2),
                    errorHits: parseInt(endpoint.error_hits),
                    errorRate: parseFloat(
                        (parseInt(endpoint.error_hits) / parseInt(endpoint.total_hits)) * 100
                    ).toFixed(2),
                };
            });
        } catch (error) {
            logger.error("Error getting top endpoints", error);
            throw error;
        }
    }

    /**
     * Get time-series metrics for visualization (charts, graphs)
     * 
     * Returns bucketed data including:
     * - Hits
     * - Errors
     * - Latency (avg, min, max)
     * 
     * @param {string} clientId
     * @param {Object} filters - { serviceName, endpoint, startTime, endTime, limit }
     * @returns {Promise<Array>}
     */
    async getTimeSeries(clientId, filters = {}) {
        try {
            const { serviceName, endpoint, startTime, endTime, limit = 100 } = filters;

            const { startTime: start_time , endTime: end_time } = this.parseTimeFilters({ startTime, endTime });

            const metrics = await this.metricsRepository.getTimeSeries({ clientId, serviceName, endpoint, startTime: start_time, endTime: end_time, limit });

            return metrics.map(metric => ({
                serviceName: metric.service_name,
                endpoint: metric.endpoint,
                method: metric.method,
                totalHits: parseInt(metric.total_hits),
                errorHits: parseInt(metric.error_hits),
                avgLatency: parseFloat(metric.avg_latency).toFixed(2),
                minLatency: parseFloat(metric.min_latency).toFixed(2),
                maxLatency: parseFloat(metric.max_latency).toFixed(2),
                timeBucket: metric.time_bucket,
            }));
        } catch (error) {
            logger.error("Error getting time series data", error);
            throw error;
        }
    }
}