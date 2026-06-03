import { BaseRepository } from "./BaseRepository.js";

const MAX_LIMIT = 1000;
const QUERY_TIMEOUT_MS = 30000;

/**
 * MetricsRepository class to handle PostgreSQL operations for API metrics
 * 
 * This repository is responsible for aggregating, storing, and querying
 * endpoint-level metrics such as hits, latency, and error rates.
 * It uses raw SQL queries with PostgreSQL.
 */
export class MetricsRepository extends BaseRepository {
    /**
     * Constructor for MetricsRepository
     * @param {Object} options
     * 
     * @param {Object} options.logger - Logger instance
     * @param {Object} options.postgres - PostgreSQL client
     */
    constructor({ logger: l, postgres: pg } = {}) {
        super({ logger: l })
        this.postgres = pg;
    }

    /**
     * Insert or update endpoint metrics (UPSERT)
     * Aggregates metrics if a conflict occurs on unique constraint
     * 
     * @param {Object} metricsData - Metrics payload
     * @returns {Promise<void>}
     */
    async upsertEndpointMetrics(metricsData) {
        try {
            const {
                clientId,
                serviceName,
                endpoint,
                method,
                totalHits,
                errorHits,
                avgLatency,
                minLatency,
                maxLatency,
                timeBucket,
            } = metricsData;

            const query = `
            INSERT INTO endpoint_metrics (
            client_id, service_name, endpoint, method, total_hits, error_hits,
            avg_latency, min_latency, max_latency, time_bucket
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (client_id, service_name, endpoint, method, time_bucket)
            DO UPDATE SET
               total_hits = endpoint_metrics.total_hits + EXCLUDED.total_hits,
               error_hits = endpoint_metrics.error_hits + EXCLUDED.error_hits,
               avg_latency = (
                    (endpoint_metrics.avg_latency * endpoint_metrics.total_hits) +
                    (EXCLUDED.avg_latency * EXCLUDED.total_hits)
                ) / (endpoint_metrics.total_hits + EXCLUDED.total_hits),
                min_latency = LEAST(endpoint_metrics.min_latency, EXCLUDED.min_latency),
                max_latency = GREATEST(endpoint_metrics.max_latency, EXCLUDED.max_latency),
                updated_at = CURRENT_TIMESTAMP
            `

            await this._query(query, [
                clientId,
                serviceName,
                endpoint,
                method,
                totalHits,
                errorHits,
                avgLatency,
                minLatency,
                maxLatency,
                timeBucket,
            ])
        } catch (error) {
            this.logger.error('Error upserting endpoint metrics:', error);
            throw error;
        }
    };

    /**
     * Fetch aggregated metrics with filtering and pagination
     * 
     * @param {Object} filter - Query filters
     * @returns {Promise<Array>}
     */
    async getMetrics(filter = {}) {
        try {
            const { clientId, serviceName, endpoint, startTime, endTime, limit = 100, offset = 0 } = filter;
            const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
            const safeOffset = Math.max(0, offset);

            const query = `
            SELECT
                service_name,
                endpoint,
                method,
                SUM(total_hits) as total_hits,
                SUM(error_hits) as error_hits,
                SUM(avg_latency * total_hits) / NULLIF(SUM(total_hits), 0) as avg_latency,
                MIN(min_latency) as min_latency,
                MAX(max_latency) as max_latency,
                time_bucket
            FROM endpoint_metrics
            `

            const params = [];
            const paramIndex = 1;
            let whereConditions = [];

            if (clientId != null) {
                whereConditions.push(`client_id = $${paramIndex}`);
                params.push(clientId);
                paramIndex++;
            }

            if (serviceName) {
                whereConditions.push(`service_name = $${paramIndex}`);
                params.push(serviceName);
                paramIndex++;
            }

            if (endpoint) {
                whereConditions.push(`endpoint = $${paramIndex}`);
                params.push(endpoint);
                paramIndex++;
            }

            if (startTime) {
                whereConditions.push(`time_bucket >= $${paramIndex}`);
                params.push(startTime);
                paramIndex++;
            }

            if (endTime) {
                whereConditions.push(`time_bucket <= $${paramIndex}`);
                params.push(endTime);
                paramIndex++;
            }

            if (whereConditions.length > 0) {
                query += ` WHERE ${whereConditions.join(' AND ')}`;
            }

            query += `
                GROUP BY service_name, endpoint, method, time_bucket
                ORDER BY time_bucket DESC
                LIMIT $${paramIndex}
                OFFSET $${paramIndex + 1}
            `;

            params.push(safeLimit, safeOffset);

            const result = await this._query(query, params);
            return result.rows;
        } catch (error) {
            this.logger.error('Error getting endpoint metrics:', error);
            throw error;
        }
    }

    /**
     * Get top endpoints based on total hits
     * 
     * @param {string} clientId - Client ID
     * @param {number} limit - Number of results
     * @param {Date|null} startTime - Optional start time filter
     * @returns {Promise<Array>}
     */
    async getTopEndpoints(clientId, limit = 10, startTime = null, endTime = null) {
        try {
            const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);

            let query = `
                SELECT
                service_name,
                endpoint,
                method,
                SUM(total_hits) as total_hits,
                SUM(avg_latency * total_hits) / NULLIF(SUM(total_hits), 0) as avg_latency,
                SUM(error_hits) as error_hits
                FROM endpoint_metrics
            `;

            const params = [];
            let paramIndex = 1;

            // Add client filter only if clientId is provided
            if (clientId != null) {
                query += ` WHERE client_id = $${paramIndex}`;
                params.push(clientId);
                paramIndex++;
            }

            if (startTime) {
                query += clientId != null ? ` AND` : ` WHERE`;
                query += ` time_bucket >= $${paramIndex}`;
                params.push(startTime);
                paramIndex++;
            }

            if (endTime) {
                query += (clientId != null || startTime) ? ` AND` : ` WHERE`;
                query += ` time_bucket <= $${paramIndex}`;
                params.push(endTime);
                paramIndex++;
            }

            query += `
                GROUP BY service_name, endpoint, method
                ORDER BY total_hits DESC
                LIMIT $${paramIndex}
            `;
            params.push(safeLimit);

            const result = await this._query(query, params);
            return result.rows;
        } catch (error) {
            this.logger.error('Error getting top endpoints:', error);
            throw error;
        }
    }

    /**
     * Get overall aggregated statistics across endpoints
     * 
     * @param {string} clientId - Client ID
     * @param {Date|null} startTime - Start time filter
     * @param {Date|null} endTime - End time filter
     * @returns {Promise<Object>}
     */
    async getOverallStats(clientId, startTime = null, endTime = null) {
        try {
            let query = `
                SELECT
                SUM(total_hits) as total_hits,
                SUM(error_hits) as error_hits,
                SUM(avg_latency * total_hits) / NULLIF(SUM(total_hits), 0) as avg_latency,
                COUNT(DISTINCT service_name) as unique_services,
                COUNT(DISTINCT endpoint) as unique_endpoints
                FROM endpoint_metrics
            `;

            const params = [];
            let paramIndex = 1;

            // Add client filter only if clientId is provided
            if (clientId != null) {
                query += ` WHERE client_id = $${paramIndex}`;
                params.push(clientId);
                paramIndex++;
            }

            if (startTime) {
                query += clientId != null ? ` AND` : ` WHERE`;
                query += ` time_bucket >= $${paramIndex}`;
                params.push(startTime);
                paramIndex++;
            }

            if (endTime) {
                query += (clientId != null || startTime) ? ` AND` : ` WHERE`;
                query += ` time_bucket <= $${paramIndex}`;
                params.push(endTime);
                paramIndex++;
            }

            const result = await this._query(query, params);
            return result.rows[0] || {};
        } catch (error) {
            this.logger.error('Error getting overall stats:', error);
            throw error;
        }
    }

    /**
     * Fetch time-series metrics for a client
     * 
     * Supports filtering by:
     * - serviceName
     * - endpoint
     * - time range (startTime, endTime)
     * 
     * Returns ordered time-bucketed data for visualization (charts, graphs)
     * 
     * @param {Object} params
     * @param {string} params.clientId - Client ID (required)
     * @param {string} [params.serviceName] - Optional service filter
     * @param {string} [params.endpoint] - Optional endpoint filter
     * @param {Date} [params.startTime] - Start of time range
     * @param {Date} [params.endTime] - End of time range
     * @param {number} [params.limit=100] - Max number of records
     * @returns {Promise<Array>}
     */
    async getTimeSeries({ clientId, serviceName, endpoint, startTime, endTime, limit = 100 }) {
        try {
            let query = `
                SELECT
                    service_name,
                    endpoint,
                    method,
                    total_hits,
                    error_hits,
                    avg_latency,
                    min_latency,
                    max_latency,
                    time_bucket
                FROM endpoint_metrics
                WHERE client_id = $1
            `;

            const params = [clientId];
            let paramIndex = 2;

            if (serviceName) {
                query += ` AND service_name = $${paramIndex}`;
                params.push(serviceName);
                paramIndex++;
            }

            if (endpoint) {
                query += ` AND endpoint = $${paramIndex}`;
                params.push(endpoint);
                paramIndex++;
            }

            if (startTime) {
                query += ` AND time_bucket >= $${paramIndex}`;
                params.push(startTime);
                paramIndex++;
            }

            if (endTime) {
                query += ` AND time_bucket <= $${paramIndex}`;
                params.push(endTime);
                paramIndex++;
            }

            query += `
                ORDER BY time_bucket DESC
                LIMIT $${paramIndex}
            `;

            params.push(limit);

            const result = await this._query(query, params);
            return result.rows;
        } catch (error) {
            this.logger.error("Error getting time series:", error);
            throw error;
        }
    }

    /**
     * Internal helper to execute PostgreSQL queries
     * 
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @param {Object} client - Optional DB client override
     * @returns {Promise<Object>}
     */
    _query(sql, params = [], client = this.postgres) {
        const target = client || this.postgres;

        if (!target || typeof target.query !== 'function') {
            const err = new Error('Postgres client not configured on MetricsRepository');
            this.logger.error('DB query error: Postgres client not configured');
            throw err;
        }

        return target.query({ text: sql, values: params, statement_timeout: QUERY_TIMEOUT_MS })
    }
}