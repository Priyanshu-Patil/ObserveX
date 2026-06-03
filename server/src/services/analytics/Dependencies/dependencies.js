import clientRepository from "../../client/repository/ClientRepository.js";
import processorContainer from "../../processor/Dependencies/dependencies.js";
import authContainer from "../../auth/Dependencies/dependencies.js";

import { AnalyticsService } from "../services/analyticsService.js";
import { AnalyticsController } from "../controller/analyticsController.js";

/**
 * Container class responsible for initializing Analytics module dependencies
 * 
 * This container composes dependencies from multiple modules:
 * - Client module (clientRepository)
 * - Processor module (metricsRepository)
 * - Auth module (authService)
 * 
 * It wires together:
 * - Repositories → Services → Controllers
 * 
 * Ensures clean separation of concerns and centralized dependency management.
 */
class Container {
    /**
     * Initialize repositories, services, and controllers for Analytics module
     * 
     * @returns {Object}
     * @returns {Object} repositories - Data access layer dependencies
     * @returns {Object} services - Business logic layer
     * @returns {Object} controllers - HTTP/controller layer
     */
    static init() {
        const repositories = {
            clientRepository,
            metricsRepository: processorContainer.repositories.metricsRepository,
        };

        const analyticsService = new AnalyticsService(repositories.metricsRepository);

        const services = {
            analyticsService,
            authService: authContainer.services && authContainer.services.authService,
        };

        const analyticsController = new AnalyticsController({
            analyticsService: services.analyticsService,
            authService: services.authService,
            clientRepository: repositories.clientRepository,
        });

        const controllers = {
            analyticsController,
        };

        return { repositories, services, controllers };
    }
}

const initialized = Container.init();
export { Container };
export default initialized;