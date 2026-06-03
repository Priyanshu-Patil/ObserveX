import { BaseRepository } from "./BaseRepository.js";

/**
 * ApiHitRepository class to handle MongoDB operations for API hit events
 * 
 * This repository is responsible for storing, retrieving, counting, and cleaning up API hit data.
 * It extends BaseRepository and uses a Mongoose model for database interaction.
 */
export class ApiHitRepository extends BaseRepository {
    /**
     * Constructor for ApiHitRepository
     * @param {Object} options
     * @param {Object} options.model - Mongoose model for API hits
     * @param {Object} options.logger - Logger instance
     */
    constructor({ model, logger: l } = {}) {
        super({ logger: l })
        if (!model) {
            throw new Error("ApiHitRepository required mongoose model");
        }
        this.model = model;
    }

    /**
     * Save an API hit event to MongoDB
     * Handles duplicate event IDs gracefully
     * 
     * @param {Object} eventData - API hit event data
     * @returns {Promise<Object|null>} - Saved document or null if duplicate
     */
    async save(eventData) {
        try {
            const doc = new this.model(eventData);
            await doc.save();

            this.logger.info("API hit saved to MongoDB", { eventId: eventData.eventId })

            return doc;
        } catch (error) {
            if (error && error.code === 11000) {
                this.logger.warn('Duplicate event ID, skipping save', { eventId: eventData.eventId });
                return null;
            }
            this.logger.error('Error saving API hit:', error);
            throw error;
        }
    }

    /**
     * Find API hits with filtering and pagination
     * 
     * @param {Object} filter - Query filters
     * @param {Object} options - Query options (limit, skip, sort)
     * @returns {Promise<Array>}
     */
    async find(filter = {}, options = {}) {
        try {
            const { limit = 100, skip = 0, sort = { timestamp: -1 } } = options;
            const hits = await this.model.find(filter).sort(sort).limit(limit).skip(skip).lean();

            return hits;
        } catch (error) {
            this.logger.error('Error finding API hits:', error);
            throw error;
        }
    }

    /**
     * Count API hits based on filters
     * 
     * @param {Object} filters - Query filters
     * @returns {Promise<number>}
     */
    async count(filters = {}) {
        try {
            const count = await this.model.count(filters);
            return count;
        } catch (error) {
            this.logger.error('Error counting API hits:', error);
            throw error;
        }
    }

    /**
     * Delete API hits older than a given timestamp
     * 
     * @param {Date} beforeDate - Threshold date
     * @returns {Promise<number>} - Number of deleted records
     */
    async deleteOldHits(beforeData) {
        try {
            const result = await this.model.deleteMany({ timestamp: { $lt: beforeData }});
            this.logger.info('Deleted old API hits', { count: result.deletedCount });

            return result.deletedCount;
        } catch (error) {
            this.logger.error('Error deleting old API hits:', error);
            throw error;
        }
    }
}