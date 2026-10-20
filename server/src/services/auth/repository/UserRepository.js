import BaseRepository from "./BaseRepository.js";
import User from "../../../shared/models/User.js"
import logger from "../../../shared/config/logger.js"
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";

/**
 * MongoDB implementation of the UserRepository.
 * This class provides methods to interact with the User collection in MongoDB.
 */
class MongoUserRepository extends BaseRepository {
    constructor() {
        super(User)
    }


    /**
     * Creates a new user in the database.
     * @param {Object} userData - The data of the user to be created.
     * @returns {Promise<Object>} - Returns the created user object.
     */
    async create(userData) {
        try {
            let data = { ...userData }
            if (data.role === APPLICATION_ROLES.SUPER_ADMIN && !data.permissions) {
                data.permissions = {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true,
                }
            }

            const user = new this.model(data);
            await user.save();

            logger.info("User created", { username: user.username });
            return user
        } catch (error) {
            logger.error("Error creating user", error)
            throw error;
        }
    }

    /**
     * Finds a user by their ID.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Object>} - Returns the user object if found.
     */
    async findById(userId) {
        try {
            const user = await this.model.findById(userId)
            return user
        } catch (error) {
            logger.error("Error finding user by id", error)
            throw error;
        }
    }

    /**
     * Finds a user by their username (case-insensitive exact match).
     * @param {string} username - The username of the user.
     * @returns {Promise<Object>} - Returns the user object if found.
     */
    async findByUsername(username) {
        try {
            if (!username) return null;
            const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const user = await this.model.findOne({
                username: { $regex: new RegExp(`^${escaped}$`, 'i') }
            });
            return user;
        } catch (error) {
            logger.error("Error finding user by username", error)
            throw error;
        }
    }

    /**
     * Finds a user by their email (case-insensitive exact match).
     * @param {string} email - The email of the user.
     * @returns {Promise<Object>} - Returns the user object if found.
     */
    async findByEmail(email) {
        try {
            if (!email) return null;
            const normalizedEmail = email.trim().toLowerCase();
            const user = await this.model.findOne({
                email: normalizedEmail
            });
            return user;
        } catch (error) {
            logger.error("Error finding user by email", error)
            throw error;
        }
    }

    /**
     * Finds all active users.
     * @returns {Promise<Array>} - Returns an array of active user objects.
     */
    async findAll() {
        try {
            const user = await this.model.find({ isActive: true }).select("-password")
            return user
        } catch (error) {
            logger.error("Error finding user by email", error)
            throw error;
        }
    }

    async findByClientId(clientId) {
        return await this.model
            .find({ clientId })
            .select('-password')
            .sort({ createdAt: -1 });
    }

    /**
     * Finds a user with a valid, non-expired password reset token.
     * @param {string} tokenHash - SHA-256 hash of the token.
     * @returns {Promise<Object|null>}
     */
    async findByPasswordResetToken(tokenHash) {
        try {
            if (!tokenHash) return null;
            const user = await this.model.findOne({
                passwordResetTokenHash: tokenHash,
                passwordResetExpiresAt: { $gt: new Date() }
            }).select('+passwordResetTokenHash +passwordResetExpiresAt');
            return user;
        } catch (error) {
            logger.error("Error finding user by password reset token", error);
            throw error;
        }
    }

}

export default new MongoUserRepository()