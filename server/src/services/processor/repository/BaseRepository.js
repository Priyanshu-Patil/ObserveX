/**
 * BaseRepository class to define the interface for all repository implementations
 * 
 * This class acts as a database-agnostic contract. Concrete repositories (e.g., MongoDB, PostgreSQL)
 * should extend this class and implement database-specific logic for CRUD operations.
 * 
 * It also provides a shared logger instance for consistent logging across repositories.
 */
export class BaseRepository {
    constructor({ logger: l = console } = {}) {
        this.logger = l;
    }

    // Implementations should override these methods as appropriate.
    async save() {
        throw new Error('Method not implemented: save');
    }

    async find() {
        throw new Error('Method not implemented: find');
    }

    async count() {
        throw new Error('Method not implemented: count');
    }

    async deleteOldHits() {
        throw new Error('Method not implemented: deleteOldHits');
    }
}