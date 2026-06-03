import { ApiHitRepository } from "../repository/ApiHitRepository.js";
import { MetricsRepository } from "../repository/MetricsRepository.js";
import { ProcessorService } from "../service/ProcessorService.js";

import ApiHit from '../../../shared/models/ApiHits.js';
import postgres from '../../../shared/config/postgres.js';
import logger from '../../../shared/config/logger.js';
/**
 * Container class responsible for initializing and wiring dependencies
 * 
 * This acts as a simple Dependency Injection (DI) container that:
 * - Instantiates repositories with required models and configs
 * - Injects repositories into services
 * - Returns a fully wired dependency graph
 * 
 * Helps in:
 * - Decoupling components
 * - Easier testing and mocking
 * - Centralized dependency management
 */
class Container {
    /**
     * Initialize all repositories and services
     * 
     * @returns {Object}
     * @returns {Object} repositories - All repository instances
     * @returns {Object} services - All service instances
     */
    static init() {
        const repositories = {
            apiHitRepository: new ApiHitRepository({ model: ApiHit, logger }),
            metricsRepository: new MetricsRepository({ logger, postgres }),
        };

        const services = {
            processorService: new ProcessorService(repositories),
        };

        return { repositories, services }
    }
}

/**
 * Initialize container once and export ready-to-use dependencies
 */
const initialized = Container.init();
export { Container };
export default initialized;