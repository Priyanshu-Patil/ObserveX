import config from "../../../shared/config/index.js";
import AppError from "../../../shared/utils/AppError.js";
import jwt from "jsonwebtoken";
import logger from "../../../shared/config/logger.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";
import SecurityUtils from "../../../shared/utils/SecurityUtils.js";
import defaultEmailService from "../../email/index.js";

/**
 * AuthService handles user authentication, registration, login, password recovery, and email notifications.
 */
export class AuthService {
    constructor(userRepository, emailService = null) {
        if (!userRepository) {
            throw new Error("UserRepository is Required");
        }
        this.userRepository = userRepository;
        this.emailService = emailService || defaultEmailService;
    }

    /**
     * Generates a JWT token for the given user.
     * @param {Object} user - The user object for which the token is generated.
     * @returns {string} - The generated JWT token.
     */
    generateToken(user) {
        const { _id, email, username, role, clientId } = user;

        const payload = {
            userId: _id,
            username,
            email,
            role,
            clientId
        };

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn
        });
    }

    /**
     * Formats the user object for response by removing sensitive information.
     * @param {Object} user - The user object to be formatted.
     * @returns {Object} - The formatted user object.
     */
    formatUserForResponse(user) {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        delete userObj.passwordResetTokenHash;
        delete userObj.passwordResetExpiresAt;
        return userObj;
    }

    /**
     * Compares the user-entered password with the hashed password.
     * @param {string} userEnteredPassword - The password entered by the user.
     * @param {string} hashedPassword - The hashed password stored in the database.
     * @returns {Promise<boolean>} - Returns true if the passwords match, otherwise false.
     */
    async comparePassword(userEnteredPassword, hashedPassword) {
        return await bcrypt.compare(userEnteredPassword, hashedPassword);
    }

    /**
     * Onboards a new super admin user.
     * @param {Object} superAdminData - The data of the super admin to be onboarded.
     * @returns {Promise<Object>} - Returns an object containing the user and token.
     */
    async onboardSuperAdmin(superAdminData) {
        try {
            const username = superAdminData.username?.trim();
            const email = superAdminData.email?.trim().toLowerCase();
            const password = superAdminData.password;

            if (!username) {
                throw new AppError("Username is required", 400);
            }

            if (!email) {
                throw new AppError("Email is required", 400);
            }

            const existingUser = await this.userRepository.findByUsername(username);
            if (existingUser) {
                throw new AppError("Username already exists", 409);
            }

            const existingEmail = await this.userRepository.findByEmail(email);
            if (existingEmail) {
                throw new AppError("Email already exists", 409);
            }

            const passwordValidation = SecurityUtils.validatePassword(password);
            if (!passwordValidation.success) {
                throw new AppError(passwordValidation.errors.join(". "), 400);
            }

            const user = await this.userRepository.create({
                username,
                email,
                password,
                role: APPLICATION_ROLES.SUPER_ADMIN,
                isActive: true,
                permissions: {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true,
                }
            });

            const token = this.generateToken(user);

            // Send Super Admin account-created email
            try {
                const emailResult = await this.emailService.sendSuperAdminCreated({
                    to: user.email,
                    username: user.username,
                });
                if (emailResult && !emailResult.success) {
                    logger.error('[AuthService] Welcome email failed to send:', {
                        to: user.email,
                        error: emailResult.error
                    });
                } else {
                    logger.info('[AuthService] Super admin welcome email dispatched successfully', {
                        to: user.email,
                        messageId: emailResult?.messageId
                    });
                }
            } catch (emailErr) {
                logger.error('[AuthService] Failed to send super admin welcome email:', emailErr);
            }

            logger.info("Admin onboarded successfully", {
                username: user.username,
                userId: user._id
            });

            return {
                user: this.formatUserForResponse(user),
                token
            };
        } catch (error) {
            logger.error("Error in onboarding Super admin", error);
            throw error;
        }
    }

    /**
     * Registers a new user.
     * @param {Object} userData - The data of the user to be registered.
     * @returns {Promise<Object>} - Returns an object containing the user and token.
     */
    async register(userData) {
        try {
            const username = userData.username?.trim();
            const email = userData.email?.trim().toLowerCase();

            const existingUser = await this.userRepository.findByUsername(username);
            if (existingUser) {
                throw new AppError("Username already exists", 409);
            }

            const existingEmail = await this.userRepository.findByEmail(email);
            if (existingEmail) {
                throw new AppError("Email already exists", 409);
            }

            if (userData.password) {
                const passwordValidation = SecurityUtils.validatePassword(userData.password);
                if (!passwordValidation.success) {
                    throw new AppError(passwordValidation.errors.join(". "), 400);
                }
            }

            const user = await this.userRepository.create({
                ...userData,
                username,
                email
            });
            const token = this.generateToken(user);

            if (user.role === APPLICATION_ROLES.SUPER_ADMIN) {
                try {
                    const emailResult = await this.emailService.sendSuperAdminCreated({
                        to: user.email,
                        username: user.username,
                    });
                    if (emailResult && !emailResult.success) {
                        logger.error('[AuthService] Welcome email failed to send:', {
                            to: user.email,
                            error: emailResult.error
                        });
                    } else {
                        logger.info('[AuthService] Super admin welcome email dispatched successfully', {
                            to: user.email,
                            messageId: emailResult?.messageId
                        });
                    }
                } catch (emailErr) {
                    logger.error('[AuthService] Failed to send super admin welcome email:', emailErr);
                }
            }

            logger.info("User registered successfully", {
                username: user.username
            });

            return {
                user: this.formatUserForResponse(user),
                token
            };
        } catch (error) {
            logger.error("Error in Register service", error);
            throw error;
        }
    }

    /**
     * Logs in a user.
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @param {Object} [meta] - Request metadata { ipAddress, userAgent }
     * @returns {Promise<Object>} - Returns an object containing the user and token.
     */
    async login(username, password, meta = {}) {
        try {
            const user = await this.userRepository.findByUsername(username);

            if (!user) {
                throw new AppError("Invalid Credentials", 401);
            }

            const currentIp = meta.ipAddress || null;
            const userAgent = meta.userAgent || null;

            if (!user.isActive) {
                // Send Security alert for inactive-account login attempts
                this.emailService
                    .sendInactiveAccountAlert({
                        to: user.email,
                        username: user.username,
                        timestamp: new Date().toUTCString(),
                        ipAddress: currentIp,
                        userAgent,
                    })
                    .catch((err) => logger.warn('[AuthService] Failed to send inactive account alert email:', err));

                throw new AppError("Account is deactivated", 403);
            }

            const isPasswordValid = await this.comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new AppError("Invalid Credentials", 401);
            }

            const token = this.generateToken(user);

            // Update login tracking metadata
            user.lastLoginAt = new Date();
            if (currentIp) user.lastLoginIp = currentIp;
            await user.save();

            // Send Successful login notification
            this.emailService
                .sendSuccessfulLogin({
                    to: user.email,
                    username: user.username,
                    timestamp: new Date().toUTCString(),
                    ipAddress: currentIp,
                    userAgent,
                })
                .catch((err) => logger.warn('[AuthService] Failed to send login notification email:', err));

            logger.info("User loggedIn successfully", { username: user.username });

            return {
                user: this.formatUserForResponse(user),
                token
            };
        } catch (error) {
            logger.error("Error in Login service", error);
            throw error;
        }
    }

    /**
     * Password reset request (Forgot Password).
     * Sends password reset email with secure single-use token.
     * Returns a generic message to prevent account enumeration.
     *
     * @param {string} email
     * @param {Object} [meta] - { ipAddress, userAgent }
     */
    async forgotPassword(email, meta = {}) {
        const genericMessage = 'If an account with that email address exists, password reset instructions have been sent.';

        if (!email) return { message: genericMessage };

        try {
            const normalizedEmail = email.toLowerCase().trim();
            const user = await this.userRepository.findByEmail(normalizedEmail);

            if (!user) {
                logger.info('[AuthService] Forgot password request for non-existent email', { email: normalizedEmail });
                return { message: genericMessage };
            }

            // Cryptographically secure token
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

            // 1 hour expiration
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            user.passwordResetTokenHash = tokenHash;
            user.passwordResetExpiresAt = expiresAt;
            await user.save();

            const appUrl = process.env.APP_URL || config.appUrl || config.email?.appUrl || 'http://localhost:5173';
            const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

            await this.emailService.sendPasswordReset({
                to: user.email,
                username: user.username,
                resetUrl,
                expiresMinutes: 60,
            });

            logger.info('[AuthService] Password reset link sent to user', { username: user.username });
            return { message: genericMessage };
        } catch (error) {
            logger.error('[AuthService] Error in forgotPassword:', error);
            return { message: genericMessage };
        }
    }

    /**
     * Resets password using single-use reset token.
     *
     * @param {string} token - Raw reset token
     * @param {string} newPassword - New password
     * @param {Object} [meta] - { ipAddress, userAgent }
     */
    async resetPassword(token, newPassword, meta = {}) {
        if (!token || !newPassword) {
            throw new AppError('Token and new password are required', 400);
        }

        const passwordValidation = SecurityUtils.validatePassword(newPassword);
        if (!passwordValidation.success) {
            throw new AppError(passwordValidation.errors.join('. '), 400);
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await this.userRepository.findByPasswordResetToken(tokenHash);

        if (!user) {
            throw new AppError('Invalid or expired password reset token', 400);
        }

        user.password = newPassword;
        // Invalidate single-use token immediately
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpiresAt = undefined;
        await user.save();

        logger.info('[AuthService] Password successfully reset for user', { username: user.username });

        // Send confirmation email
        this.emailService
            .sendPasswordChanged({
                to: user.email,
                username: user.username,
                timestamp: new Date().toUTCString(),
                ipAddress: meta.ipAddress,
                userAgent: meta.userAgent,
            })
            .catch((err) => logger.warn('[AuthService] Password changed notification error:', err));

        return { message: 'Password has been successfully reset. You may now log in.' };
    }

    /**
     * Changes password for an authenticated user.
     * @param {string} userId - The ID of the authenticated user
     * @param {string} currentPassword - The current password
     * @param {string} newPassword - The new password
     * @param {Object} [meta] - Request metadata { ipAddress, userAgent }
     */
    async changePassword(userId, currentPassword, newPassword, meta = {}) {
        if (!userId) {
            throw new AppError('User ID is required', 400);
        }

        if (!currentPassword || !newPassword) {
            throw new AppError('Current password and new password are required', 400);
        }

        const passwordValidation = SecurityUtils.validatePassword(newPassword);
        if (!passwordValidation.success) {
            throw new AppError(passwordValidation.errors.join('. '), 400);
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const isCurrentValid = await this.comparePassword(currentPassword, user.password);
        if (!isCurrentValid) {
            throw new AppError('Current password is incorrect', 400);
        }

        user.password = newPassword;
        await user.save();

        logger.info('[AuthService] Password changed successfully from settings for user', { username: user.username, userId });

        // Send confirmation email
        this.emailService
            .sendPasswordChanged({
                to: user.email,
                username: user.username,
                timestamp: new Date().toUTCString(),
                ipAddress: meta.ipAddress,
                userAgent: meta.userAgent,
            })
            .catch((err) => logger.warn('[AuthService] Password changed notification error:', err));

        return { message: 'Password updated successfully' };
    }

    /**
     * Fetches the profile of a user by their ID.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Object>} - Returns the user's profile data.
     */
    async getProfile(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }
            return this.formatUserForResponse(user);
        } catch (error) {
            logger.error('Error getting user profile:', error);
            throw error;
        }
    }

    /**
     * Checks if user has Super Admin permissions.
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    async checkSuperAdminPermissions(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError("User not found", 404);
            }

            return user.role === APPLICATION_ROLES.SUPER_ADMIN;
        } catch (error) {
            logger.error("Error checking super admin permissions", error);
            return false;
        }
    }
}