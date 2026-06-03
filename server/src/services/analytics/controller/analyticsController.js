import AppError from "../../../shared/utils/AppError.js";
import ResponseFormatter from "../../../shared/utils/responseFormatter.js"

/**
 * AnalyticsController class responsible for handling analytics HTTP requests
 * 
 * This controller:
 * - Validates incoming requests
 * - Handles authentication & authorization
 * - Resolves client context (admin vs normal user)
 * - Delegates business logic to AnalyticsService
 * - Formats API responses
 */
export class AnalyticsController {
    /**
     * Constructor for AnalyticsController
     * 
     * @param {Object} dependencies
     * @param {Object} dependencies.analyticsService - Service for analytics logic
     * @param {Object} dependencies.authService - Service for authentication & permissions
     * @param {Object} dependencies.clientRepository - Repository for client validation
     */
    constructor({ analyticsService: analyticsSvc, authService: authSvc, clientRepository: clientRepo} = {}) {
        if (!analyticsSvc || !authSvc || !clientRepo) {
            throw new Error("AnalyticsController requires analyticsService, authService and clientRepository");
        }

        this.analyticsService = analyticsSvc;
        this.authService = authSvc;
        this.clientRepository = clientRepo;
    }

    /**
     * GET /stats
     * 
     * Fetch overall analytics statistics
     * 
     * Flow:
     * - Validate permissions
     * - Resolve clientId (admin vs user)
     * - Validate time range
     * - Fetch stats from service
     * 
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async getStats(req, res, next) {
        try {
            const { startTime, endTime } = req.query;
            const clientId = req.user.clientId;

            const isAdmin = await this.ensureCanViewAnalytics(req);
            const finalClientId = await this.resolveFinalClientId(req, isAdmin);
            const timeRange = await this.validateTimeRange(startTime, endTime);

            const stats = await this.analyticsService.getOverallStats(finalClientId, timeRange)

            res.status(200).json(
                ResponseFormatter.success(stats, "Statistics retrived successfully", 200)
            )
        } catch (error) {
            next(error)
        }
    }

    /**
     * Validate and normalize time range
     * 
     * Supports:
     * - Timestamp (number)
     * - ISO date string
     * 
     * @param {string|number} startTime
     * @param {string|number} endTime
     * @returns {{ startTime: number|null, endTime: number|null }}
     */
    validateTimeRange(startTime, endTime) {
        const parseValue = v => {
            if (v === undefined || v === null || v === '') return null;
            if (/^\d+$/.test(String(v))) return Number(v);
            const parsed = Date.parse(String(v));
            return Number.isNaN(parsed) ? NaN : parsed;
        };

        const start = parseValue(startTime);
        const end = parseValue(endTime);

        if ((startTime && Number.isNaN(start)) || (endTime && Number.isNaN(end))) {
            throw new AppError('Invalid time format', 400);
        }

        if (start !== null && end !== null && start > end) {
            throw new AppError('Invalid time range: start > end', 400);
        }

        return { startTime: start, endTime: end };
    }

    /**
     * Ensure user has permission to view analytics
     * 
     * - Super admin → full access
     * - Normal user → requires canViewAnalytics permission
     * 
     * @param {Object} req
     * @returns {Promise<boolean>} - true if admin, false otherwise
     */
    async ensureCanViewAnalytics(req) {
        if (!req.user || !req.user.userId) {
            throw new AppError("Authentication Required", 401);
        }

        const isSuperAdmin = await this.authService.checkSuperAdminPermissions(req.user.userId);
        if (isSuperAdmin) return true;

        const profile = await this.authService.getProfile(req.user.userId);

        if (!profile || !profile.permissions || !profile.permissions.canViewAnalytics) {
            throw new AppError("Insufficient permissions to view analytics", 403);
        }

        return false;
    }

    /**
     * Resolve final clientId based on user role
     * 
     * - Admin → can query any client (via query param)
     * - User → restricted to their own clientId
     * 
     * @param {Object} req
     * @param {boolean} isAdmin
     * @returns {Promise<string|null>}
     */
    async resolveFinalClientId(req, isAdmin) {
        const queryClientId = req.query.clientId;
        const userClientId = req.user?.clientId;

        if (isAdmin) {
            if (queryClientId) {
                if (!this.isValidObjectId(queryClientId)) {
                    throw new AppError('Invalid clientId format', 400);
                }

                const clientId = await this.clientRepository.findById(queryClientId);

                if (!clientId) throw new AppError('Client not found', 404);

                return queryClientId;
            }

            return null;
        }

        if (!userClientId) {
            throw new AppError('Access denied - no client association', 403); 
        }

        if (!this.isValidObjectId(userClientId)) {
            throw new AppError('Invalid client association', 400 )
        }

        const client = await this.clientRepository.findById(userClientId);
        
        if (!client) throw new AppError('Client not found', 404);

        return userClientId;
    }

    /**
     * Validate MongoDB ObjectId format
     * 
     * @param {string} id
     * @returns {boolean}
     */
    isValidObjectId(id) {
        return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
    }

    /**
     * GET /dashboard
     * 
     * Fetch dashboard data including:
     * - Overall stats
     * - Top endpoints
     * - Time-series data
     * 
     * Uses Promise.allSettled for partial failure tolerance
     * 
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async getDashboard(req, res, next) {
        try {
            const { startTime, endTime } = req.query;
            const clientId = req.user.clientId;

            const isAdmin = await this.ensureCanViewAnalytics(req);
            const finalClientId = await this.resolveFinalClientId(req, isAdmin);
            const timeRange = await this.validateTimeRange(startTime, endTime);

            const result = await Promise.allSettled([
                this.analyticsService.getOverallStats(finalClientId, timeRange),
                this.analyticsService.getTopEndpoints(finalClientId, { limit: 5, startTime: timeRange.startTime, endTime: timeRange.endTime }),
                this.analyticsService.getTimeSeries(finalClientId, { ...timeRange, limit: 24 })
            ]);

            const [stats, topEndpoints, recentTimeSeries] = result.map(item => item.status === 'fulfilled' ? item.value : []);

            const dashboard = {
                stats,
                topEndpoints,
                recentActivity: recentTimeSeries
            }

            res.status(200).json(
                ResponseFormatter.success(dashboard, "Dashboard data retrived successfully", 200)
            )
        } catch (error) {
            next(error);
        }
    }
}