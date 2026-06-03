import logger from '../../../shared/config/logger.js';

/**
 * ProcessorService class responsible for processing API hit events
 * 
 * This service acts as an orchestration layer between MongoDB (raw event storage)
 * and PostgreSQL (aggregated metrics storage).
 * 
 * Workflow:
 * 1. Save raw event to MongoDB (critical step)
 * 2. Update aggregated metrics in PostgreSQL (non-critical, fallback-safe)
 * 
 * Ensures data durability while allowing eventual consistency for metrics.
 */
export class ProcessorService {
    /**
     * Constructor for ProcessorService
     * @param {Object} dependencies
     * @param {Object} dependencies.apiHitRepository - Repository for raw API hits (MongoDB)
     * @param {Object} dependencies.metricsRepository - Repository for aggregated metrics (PostgreSQL)
     */
    constructor({ apiHitRepository, metricsRepository }) {
        if (!apiHitRepository || !metricsRepository) throw new Error('ProcessorService requires apiHitRepository and metricsRepository');
        this.apiHitRepository = apiHitRepository;
        this.metricsRepository = metricsRepository;
    };

    /**
     * Generate a normalized time bucket based on interval
     * 
     * Used for grouping metrics (e.g., hourly, daily aggregation)
     * 
     * @param {Date|string|number} timestamp - Event timestamp
     * @param {string} interval - Bucket interval ('minute' | 'hour' | 'day')
     * @returns {Date}
     */
    getTimeBucket(timestamp, interval = 'hour') {
        const date = new Date(timestamp);

        switch (interval) {
            case 'hour':
                date.setMinutes(0, 0, 0);
                break;
            case 'day':
                date.setHours(0, 0, 0, 0);
                break;
            case 'minute':
                date.setSeconds(0, 0);
                break;
            default:
                date.setMinutes(0, 0, 0);
        }

        return date;
    };

    /**
     * Process a single API hit event
     * 
     * Steps:
     * 1. Save raw event to MongoDB (critical)
     * 2. Update aggregated metrics in PostgreSQL (non-critical)
     * 
     * If MongoDB save fails → entire operation fails  
     * If metrics update fails → error is logged but not thrown
     * 
     * @param {Object} eventData - API hit event payload
     * @returns {Promise<void>}
     */
    async processEvent(eventData) {
        let rawEventSaved = false;

        try {
            logger.info('Processing event data:', {
                eventId: eventData.eventId,
                clientId: eventData.clientId,
                serviceName: eventData.serviceName,
                endpoint: eventData.endpoint,
                method: eventData.method,
            });

            // STEP 1: save data to MongoDB
            // Yeh succeed hoga ya fir pura operation fail hoga
            await this.apiHitRepository.save(eventData)
            rawEventSaved = true;

            logger.info('Raw event saved to MongoDB:', {
                eventId: eventData.eventId
            });

            // STEP 2: PG Main data upsert karege;
            // Agar ye fail ho gaya, to ham pure operation ko fail nhi karege!

            await this._updateMetricsWithFallback(eventData);

            logger.info('Event processed successfully:', {
                eventId: eventData.eventId
            });
        } catch (error) {
            if (!rawEventSaved) {
                logger.error('Critical: Failed to save raw event to MongoDB:', {
                    error: error.message,
                    eventId: eventData.eventId,
                });
                throw error;
            }

            logger.error('Non-critical: Raw event saved but metrics update failed:', {
                error: error.message,
                eventId: eventData.eventId,
            });
        }
    }

    /**
     * Update aggregated metrics with fallback handling
     * 
     * Prepares metrics data and performs UPSERT in PostgreSQL.
     * Any failure here should not affect the raw event storage.
     * 
     * @param {Object} eventData - API hit event payload
     * @returns {Promise<void>}
     */
    async _updateMetricsWithFallback(eventData) {
        try {
            // Calc. time bucket
            const timeBucket = this.getTimeBucket(eventData.timestamp, "hour") // [12:00-12:59] [1:00 - 1:59]

            // data prep. karege
            const metricsData = {
                clientId: eventData.clientId.toString(),
                serviceName: eventData.serviceName,
                endpoint: eventData.endpoint,
                method: eventData.method,
                totalHits: 1,
                errorHits: eventData.statusCode >= 400 ? 1 : 0,
                avgLatency: eventData.latencyMs,
                minLatency: eventData.latencyMs,
                maxLatency: eventData.latencyMs,
                timeBucket,
            };

            await this.metricsRepository.upsertEndpointMetrics(metricsData);

            logger.info('Metrics updated successfully', {
                eventId: eventData.eventId,
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cleanup old API hit events from MongoDB
     * 
     * Deletes records older than the specified number of days
     * to manage storage and improve performance.
     * 
     * @param {number} daysToKeep - Number of days to retain data
     * @returns {Promise<number>} - Number of deleted records
     */
    async cleanupOldEvents(daysToKeep = 30) {
        try {
            let cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const deletedCount = await this.apiHitRepository.deleteOldHits(cutoffDate)
            return deletedCount;
        } catch (error) {
            logger.error('Error during cleanup:', error);
            throw error;
        }
    }
}