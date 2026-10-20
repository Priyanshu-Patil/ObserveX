import config from "../../../shared/config/index.js";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";
import ResponseFormatter from "../../../shared/utils/responseFormatter.js";

/**
 * @description AuthController handles user authentication and authorization related operations such as onboarding super admin, user registration, login, fetching user profile, password recovery, and logout.
 * It interacts with the AuthService to perform these operations and formats the responses using ResponseFormatter.
 */
export class AuthController {
    constructor(authService) {
        if (!authService) {
            throw new Error("authService is Required");
        }

        this.authService = authService;
    }

    /**
     * Onboards a new super admin user.
     * @param {Request} req - The request object containing user details.
     * @param {Response} res - The response object used to send the response.
     * @param {Function} next - The next middleware function in the request-response cycle.
     */
    async onboardSuperAdmin(req, res, next) {
        try {
            const { username, email, password } = req.body;

            const superAdminData = {
                username, email, password, role: APPLICATION_ROLES.SUPER_ADMIN
            };

            const { token, user } = await this.authService.onboardSuperAdmin(superAdminData);

            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                sameSite: config.cookie.sameSite,
                maxAge: config.cookie.expiresIn
            });

            res.status(201).json(ResponseFormatter.success({
                ...user,
                user,
                token
            }, "Super admin created successfully", 201));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Registers a new user.
     * @param {Request} req - The request object containing user details.
     * @param {Response} res - The response object used to send the response.
     * @param {Function} next - The next middleware function in the request-response cycle.
     */
    async register(req, res, next) {
        try {
            const { username, email, password, role } = req.body;
            const userData = {
                username, email, password, role: role || APPLICATION_ROLES.CLIENT_VIEWER
            };

            const { token, user } = await this.authService.register(userData);

            res.status(201).json(ResponseFormatter.success({
                ...user,
                user,
                token
            }, "User created successfully", 201));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logs in a user.
     * @param {Request} req - The request object containing user credentials.
     * @param {Response} res - The response object used to send the response.
     * @param {Function} next - The next middleware function in the request-response cycle.
     */
    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const meta = {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            };
            const { user, token } = await this.authService.login(username, password, meta);

            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                sameSite: config.cookie.sameSite,
                maxAge: config.cookie.expiresIn
            });

            res.status(200).json(ResponseFormatter.success({
                ...user,
                user,
                token
            }, "User LoggedIn successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles forgot password request.
     * @param {Request} req
     * @param {Response} res
     * @param {Function} next
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const meta = {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            };
            const result = await this.authService.forgotPassword(email, meta);
            res.status(200).json(ResponseFormatter.success({}, result.message, 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles single-use password reset.
     * @param {Request} req
     * @param {Response} res
     * @param {Function} next
     */
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            const meta = {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            };
            const result = await this.authService.resetPassword(token, password, meta);
            res.status(200).json(ResponseFormatter.success({}, result.message, 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles changing password for the authenticated user.
     * @param {Request} req
     * @param {Response} res
     * @param {Function} next
     */
    async changePassword(req, res, next) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;
            const meta = {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            };
            const result = await this.authService.changePassword(userId, currentPassword, newPassword, meta);
            res.status(200).json(ResponseFormatter.success({}, result.message, 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Fetches the profile of the logged-in user.
     * @param {Request} req - The request object containing user details.
     * @param {Response} res - The response object used to send the response.
     * @param {Function} next - The next middleware function in the request-response cycle.
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await this.authService.getProfile(userId);

            res.status(200).json(ResponseFormatter.success(result, "Profile fetched successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logs out the currently logged-in user.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object used to send the response.
     * @param {Function} next - The next middleware function in the request-response cycle.
     */
    async logout(req, res, next) {
        try {
            res.clearCookie("authToken", {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                sameSite: config.cookie.sameSite
            });
            res.status(200).json(ResponseFormatter.success({}, "Logout successful", 200));
        } catch (error) {
            next(error);
        }
    }
}