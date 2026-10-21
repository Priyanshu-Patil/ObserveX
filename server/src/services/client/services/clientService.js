
import mongoose from 'mongoose';
import logger from "../../../shared/config/logger.js";
import config from "../../../shared/config/index.js";
import { APPLICATION_ROLES, isValidClientRole } from "../../../shared/constants/roles.js";
import AppError from "../../../shared/utils/AppError.js";
import { v4 as uudiv4 } from "uuid";
import crypto from 'crypto';
import SecurityUtils from "../../../shared/utils/SecurityUtils.js";
import defaultEmailService from "../../email/index.js";

/**
 * ClientService class to handle business logic related to clients
 * This class is responsible for creating clients, managing client users, and handling API keys for clients. It interacts with the client repository, API key repository, and user repository to perform these operations.
 */
export class ClientService {
    /**
     * Constructor for ClientService
     * @param {Object} dependencies - An object containing the required dependencies
     * @param {Object} dependencies.clientRepository - The client repository instance
     * @param {Object} dependencies.apiKeyRepository - The API key repository instance
     * @param {Object} dependencies.userRepository - The user repository instance
     * @param {Object} [dependencies.metricsRepository] - The PostgreSQL metrics repository instance
     * @param {Object} [dependencies.apiHitRepository] - The MongoDB API hit repository instance
     * @param {Object} [dependencies.emailService] - The email service instance
     * @throws Will throw an error if any of the required dependencies are missing
     */
    constructor(dependencies) {
        if (!dependencies) {
            throw new Error('Dependencies are required');
        };

        if (!dependencies.clientRepository) {
            throw new Error('ClientRepository is required');
        };

        if (!dependencies.apiKeyRepository) {
            throw new Error('ApiKeyRepository is required');
        }
        if (!dependencies.userRepository) {
            throw new Error('UserRepository is required');
        }

        // Assign dependencies to instance variables
        this.clientRepository = dependencies.clientRepository;
        this.apiKeyRepository = dependencies.apiKeyRepository;
        this.userRepository = dependencies.userRepository;
        this.metricsRepository = dependencies.metricsRepository || null;
        this.apiHitRepository = dependencies.apiHitRepository || null;
        this.emailService = dependencies.emailService || defaultEmailService;
        this._activeDeletions = new Set();
    };

    /**
     * Format client object for response by removing sensitive information
     * @param {Object} user - The client user object
     * @returns {Object} - The formatted client user object
     */
    formatClientForResponse(user) {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    };

    /**
     * Generate unique slug from name
     * @param {String} name - The name to generate the slug from
     * @returns {String} - The generated slug
     */
    generateSlug(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    /**
     * Create a new client within a Super Admin's workspace
     * @param {Object} clientData - The client data
     * @param {Object} adminUser - The admin user creating the client
     * @returns {Object} - The created client
     */
    async createClient(clientData, adminUser) {
        try {
            if (!adminUser || adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
                throw new AppError("Access denied - Only super admin can create clients", 403);
            }

            const { name, email, description, website } = clientData;

            let slug = this.generateSlug(name);
            if (!slug) {
                slug = `client-${Date.now().toString(36)}`;
            }

            const existingClient = await this.clientRepository.findBySlug(slug);

            if (existingClient) {
                const randomSuffix = crypto.randomBytes(3).toString('hex');
                slug = `${slug}-${randomSuffix}`;
            }

            const client = await this.clientRepository.create({
                name,
                slug,
                email,
                description,
                website,
                createdBy: adminUser.userId
            });

            // Send workspace created email notification
            if (client.email) {
                try {
                    const dashboardUrl = `${process.env.APP_URL || config.appUrl || config.email?.appUrl || 'http://localhost:5173'}/admin/clients/${client._id}`;
                    await this.emailService.sendClientCreated({
                        to: client.email,
                        clientName: client.name,
                        slug: client.slug,
                        website: client.website,
                        description: client.description,
                        createdByUsername: adminUser?.username || 'Super Admin',
                        dashboardUrl
                    });
                } catch (emailErr) {
                    logger.error('[ClientService] Failed to send client created email:', emailErr);
                }
            }

            return client;
        } catch (error) {
            logger.error('Error creating client:', error);
            throw error;
        }
    };

    /**
     * Check if a specific client is owned by or accessible to a super admin
     * @param {Object} client - The client document or object
     * @param {Object|String|ObjectId} userOrUserId - The user object or user ID
     * @returns {Promise<Boolean>}
     */
    async isClientAccessibleBySuperAdmin(client, userOrUserId) {
        if (!client || !userOrUserId) return false;

        const userIdStr = (userOrUserId.userId || userOrUserId._id || userOrUserId).toString();

        if (client.createdBy && client.createdBy.toString() === userIdStr) {
            return true;
        }

        return false;
    }

    /**
     * Check if a user has access to a specific client
     * @param {Object} user - The user object
     * @param {String|Object} clientOrClientId - The client ID or client document
     * @returns {Promise<Boolean>} - True if the user has access, false otherwise
     */
    async canUserAccessClient(user, clientOrClientId) {
        if (!user) return false;

        let client = clientOrClientId;
        if (typeof clientOrClientId === 'string' || (clientOrClientId && clientOrClientId._bsontype === 'ObjectID') || (clientOrClientId && !clientOrClientId.createdBy && !clientOrClientId._id && !clientOrClientId.slug)) {
            client = await this.clientRepository.findById(clientOrClientId.toString());
        }

        if (!client) {
            return false;
        }

        if (user.role === APPLICATION_ROLES.SUPER_ADMIN) {
            return await this.isClientAccessibleBySuperAdmin(client, user);
        }

        const clientIdStr = client._id ? client._id.toString() : client.toString();
        return !!(user.clientId && user.clientId.toString() === clientIdStr);
    }

    /**
     * Create a new client user for a specific client
     * @param {String} clientId - The client ID
     * @param {Object} userData - The user data
     * @param {Object} adminUser - The admin user creating the client user
     * @returns {Object} - The created client user
     */
    async createClientUser(clientId, userData, adminUser) {
        try {
            const client = await this.clientRepository.findById(clientId);
            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const canAccess = await this.canUserAccessClient(adminUser, client);
            if (!canAccess) {
                throw new AppError("Access denied", 403);
            }

            const canManage = adminUser.role === APPLICATION_ROLES.SUPER_ADMIN ||
                adminUser.role === APPLICATION_ROLES.CLIENT_ADMIN ||
                adminUser.permissions?.canManageUsers;

            if (!canManage) {
                throw new AppError("Access denied - Insufficient permissions to create users", 403);
            }

            const { username, email, password, role = APPLICATION_ROLES.CLIENT_VIEWER } = userData;

            if (!isValidClientRole(role)) {
                throw new AppError("Invalid role for client user", 400);
            }

            const existingUser = await this.userRepository.findByUsername(username?.trim());
            if (existingUser) {
                throw new AppError("Username already exists", 409);
            }

            const existingEmail = await this.userRepository.findByEmail(email?.trim().toLowerCase());
            if (existingEmail) {
                throw new AppError("Email already exists", 409);
            }

            const passwordValidation = SecurityUtils.validatePassword(password);
            if (!passwordValidation.success) {
                throw new AppError(passwordValidation.errors.join(". "), 400);
            }

            // Set permissions based on role
            let permissions = {
                canCreateApiKeys: false,
                canManageUsers: false,
                canViewAnalytics: true,
                canExportData: false,
            };

            // If the role is client admin, update permissions accordingly
            if (role === APPLICATION_ROLES.CLIENT_ADMIN) {
                permissions = {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true,
                };
            }

            const user = await this.userRepository.create({
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password,
                role,
                clientId: client._id,
                permissions
            });

            // Send client team member welcome email notification
            if (user.email) {
                try {
                    const loginUrl = `${process.env.APP_URL || config.appUrl || config.email?.appUrl || 'http://localhost:5173'}/login`;
                    await this.emailService.sendClientUserCreated({
                        to: user.email,
                        username: user.username,
                        role: user.role,
                        clientName: client.name,
                        loginUrl
                    });
                } catch (emailErr) {
                    logger.error('[ClientService] Failed to send client user welcome email:', emailErr);
                }
            }

            logger.info("Client user created", {
                clientId: client._id,
                userId: user._id,
                role
            });

            return this.formatClientForResponse(user);
        } catch (error) {
            logger.error("Error creating client user", error);
            throw error;
        }
    };

    /**
     * Generate a new API key
     * @returns {String} - The generated API key
     */
    generateApiKey() {
        const prefix = "apim";
        const randomBytes = crypto.randomBytes(20).toString("hex");
        return `${prefix}_${randomBytes}`
    }

    /**
     * Create a new API key for a specific client
     * @param {String} clientId - The client ID
     * @param {Object} keyData - The API key data
     * @param {Object} user - The user creating the API key
     * @returns {Object} - The created API key
     */
    async createApiKey(clientId, keyData, user) {
        try {
            const client = await this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const canAccess = await this.canUserAccessClient(user, client);
            if (!canAccess) {
                throw new AppError("Access denied", 403);
            }

            const canManage = user.role === APPLICATION_ROLES.SUPER_ADMIN ||
                user.role === APPLICATION_ROLES.CLIENT_ADMIN ||
                user.permissions?.canCreateApiKeys;

            if (!canManage) {
                throw new AppError("Access denied - Only Super Admin, Client Admin, or authorized users can create API keys", 403);
            }

            const { name, description, environment = "production" } = keyData;

            const keyId = uudiv4();
            const keyValue = this.generateApiKey();

            const apiKey = await this.apiKeyRepository.create({
                keyId,
                keyValue,
                clientId: client._id,
                name,
                description,
                environment,
                createdBy: user.userId
            });

            // Send API key created security notification
            const creatorEmail = user.email || (await this.userRepository.findById(user.userId || user._id))?.email;
            if (creatorEmail) {
                try {
                    const dashboardUrl = `${process.env.APP_URL || config.appUrl || config.email?.appUrl || 'http://localhost:5173'}/admin/clients/${client._id}/keys`;
                    const keyPrefix = keyValue ? keyValue.substring(0, 10) : 'apim_';
                    await this.emailService.sendApiKeyCreated({
                        to: creatorEmail,
                        keyName: apiKey.name || 'New API Key',
                        keyPrefix,
                        environment: apiKey.environment || 'production',
                        clientName: client.name,
                        createdByUsername: user.username || 'Authorized User',
                        timestamp: new Date().toUTCString(),
                        dashboardUrl
                    });
                } catch (emailErr) {
                    logger.error('[ClientService] Failed to send API key created email:', emailErr);
                }
            }

            return apiKey;
        } catch (error) {
            logger.error("Error creating API key", error);
            throw error;
        }
    };


    /**
     * Get all API keys for a specific client
     * @param {String} clientId - The client ID
     * @param {Object} user - The user requesting the API keys
     * @returns {Array} - The list of API keys
     */
    async getClientApiKeys(clientId, user) {
        try {
            const client = await this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const canAccess = await this.canUserAccessClient(user, client);
            if (!canAccess) {
                throw new AppError('Access denied', 403);
            }

            const apiKeys = await this.apiKeyRepository.findByClientId(clientId);

            const formattedResponse = apiKeys.map(key => {
                const keyObj = key.toObject ? key.toObject() : key;
                delete keyObj.keyValue;
                keyObj.isRevoked = !keyObj.isActive;
                keyObj.status = keyObj.isActive ? 'active' : 'revoked';
                return keyObj;
            });

            return formattedResponse;

        } catch (error) {
            logger.error('Error getting client API keys:', error);
            throw error;
        }
    };

    /**
     * Regenerate an existing API key for a client
     * @param {String} clientId - The client ID
     * @param {String} keyId - The API key ID or _id
     * @param {Object} user - The user requesting regeneration
     * @returns {Object} - The regenerated API key with new plain text keyValue
     */
    async regenerateApiKey(clientId, keyId, user) {
        try {
            const client = await this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const canAccess = await this.canUserAccessClient(user, client);
            if (!canAccess) {
                throw new AppError("Access denied", 403);
            }

            const canManage = user.role === APPLICATION_ROLES.SUPER_ADMIN ||
                user.role === APPLICATION_ROLES.CLIENT_ADMIN ||
                user.permissions?.canCreateApiKeys;

            if (!canManage) {
                throw new AppError("Access denied - Only Super Admin, Client Admin, or authorized users can regenerate API keys", 403);
            }

            const apiKey = await this.apiKeyRepository.findById(keyId);

            if (!apiKey) {
                throw new AppError("API key not found", 404);
            }

            if (apiKey.clientId.toString() !== client._id.toString()) {
                throw new AppError("API key does not belong to this client", 400);
            }

            const newKeyValue = this.generateApiKey();
            apiKey.keyValue = newKeyValue;
            apiKey.isActive = true;
            if (!apiKey.security) {
                apiKey.security = {};
            }
            apiKey.security.lastRotated = new Date();

            await apiKey.save();

            // Send API key rotated security notification
            const actorEmail = user.email || (await this.userRepository.findById(user.userId || user._id))?.email;
            if (actorEmail) {
                try {
                    const dashboardUrl = `${process.env.APP_URL || config.appUrl || config.email?.appUrl || 'http://localhost:5173'}/admin/clients/${client._id}/keys`;
                    const keyPrefix = newKeyValue ? newKeyValue.substring(0, 10) : 'apim_';
                    await this.emailService.sendApiKeyRotated({
                        to: actorEmail,
                        keyName: apiKey.name || 'API Key',
                        keyPrefix,
                        environment: apiKey.environment || 'production',
                        clientName: client.name,
                        rotatedByUsername: user.username || 'Authorized User',
                        timestamp: new Date().toUTCString(),
                        dashboardUrl
                    });
                } catch (emailErr) {
                    logger.error('[ClientService] Failed to send API key rotated email:', emailErr);
                }
            }

            logger.info("API key regenerated", { keyId: apiKey.keyId, clientId: client._id });
            return apiKey;
        } catch (error) {
            logger.error("Error regenerating API key:", error);
            throw error;
        }
    }

    /**
     * Revoke an existing API key for a client
     * @param {String} clientId - The client ID
     * @param {String} keyId - The API key ID or _id
     * @param {Object} user - The user requesting revocation
     * @returns {Object} - The revoked API key object without plain text keyValue
     */
    async revokeApiKey(clientId, keyId, user) {
        try {
            const client = await this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const canAccess = await this.canUserAccessClient(user, client);
            if (!canAccess) {
                throw new AppError("Access denied", 403);
            }

            const canManage = user.role === APPLICATION_ROLES.SUPER_ADMIN ||
                user.role === APPLICATION_ROLES.CLIENT_ADMIN ||
                user.permissions?.canCreateApiKeys;

            if (!canManage) {
                throw new AppError("Access denied - Only Super Admin, Client Admin, or authorized users can revoke API keys", 403);
            }

            const apiKey = await this.apiKeyRepository.findById(keyId);

            if (!apiKey) {
                throw new AppError("API key not found", 404);
            }

            if (apiKey.clientId.toString() !== client._id.toString()) {
                throw new AppError("API key does not belong to this client", 400);
            }

            apiKey.isActive = false;
            await apiKey.save();

            // Send API key revoked security notification
            const actorEmail = user.email || (await this.userRepository.findById(user.userId || user._id))?.email;
            if (actorEmail) {
                try {
                    const dashboardUrl = `${process.env.APP_URL || config.appUrl || config.email?.appUrl || 'http://localhost:5173'}/admin/clients/${client._id}/keys`;
                    await this.emailService.sendApiKeyRevoked({
                        to: actorEmail,
                        keyName: apiKey.name || 'API Key',
                        environment: apiKey.environment || 'production',
                        clientName: client.name,
                        revokedByUsername: user.username || 'Authorized User',
                        timestamp: new Date().toUTCString(),
                        dashboardUrl
                    });
                } catch (emailErr) {
                    logger.error('[ClientService] Failed to send API key revoked email:', emailErr);
                }
            }

            logger.info("API key revoked", { keyId: apiKey.keyId, clientId: client._id });
            const keyObj = apiKey.toObject ? apiKey.toObject() : apiKey;
            delete keyObj.keyValue;
            keyObj.isRevoked = true;
            keyObj.status = 'revoked';
            return keyObj;
        } catch (error) {
            logger.error("Error revoking API key:", error);
            throw error;
        }
    }

    async getClientByApiKey(apiKey) {
        try {
            const key = await this.apiKeyRepository.findByKeyValue(apiKey);

            if (!key) {
                return null;
            }

            if (key.isExpired()) {
                return null;
            }

            // Get the populated client from the key
            const client = key.clientId;

            return {
                client,
                apiKey: key,
            };
        } catch (error) {
            logger.error('Error finding client by API key:', error);
            throw error;
        }
    }

    async getClients(user) {
        try {
            if (user.role !== APPLICATION_ROLES.SUPER_ADMIN) {
                throw new AppError('Access denied', 403);
            }

            return await this.clientRepository.findByOwner(user.userId);
        } catch (error) {
            logger.error('Error getting clients', error);
            throw error;
        }
    }

    async getClient(clientId, user) {
        try {
            const client = await this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const canAccess = await this.canUserAccessClient(user, client);
            if (!canAccess) {
                throw new AppError("Access denied", 403);
            }

            return client;
        } catch (error) {
            logger.error("Error getting client", error);
            throw error;
        }
    }

    async getClientUsers(clientId, user) {
        try {
            const client = await this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const canAccess = await this.canUserAccessClient(user, client);
            if (!canAccess) {
                throw new AppError("Access denied", 403);
            }

            const users = await this.userRepository.findByClientId(clientId);

            return users.map((u) => this.formatClientForResponse(u));
        } catch (error) {
            logger.error("Error getting client users", error);
            throw error;
        }
    }

    /**
     * Permanently delete a client and all associated data across MongoDB and PostgreSQL
     * Enforces strict workspace boundaries: only the owning Super Admin can delete their client.
     * 
     * Cleanup order:
     * 1. Validate permissions and ownership
     * 2. Lock client deletion to prevent concurrent duplicate deletions
     * 3. Deactivate client and API keys to prevent incoming hits/logins
     * 4. Delete PostgreSQL aggregated metrics (endpoint_metrics)
     * 5. Delete MongoDB raw API hits (api_hits)
     * 6. Delete MongoDB API keys (api_keys)
     * 7. Delete MongoDB client users (users)
     * 8. Delete MongoDB client document (clients)
     * 9. Record sanitized audit log
     * 
     * @param {string} clientId - The ID of the client to delete
     * @param {Object} adminUser - The Super Admin user initiating deletion
     * @returns {Promise<Object>} - Cleanup execution summary
     */
    async deleteClient(clientId, adminUser) {
        // 1. Role Authorization
        if (!adminUser || adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
            throw new AppError("Access denied - Only super admin can delete clients", 403);
        }

        // 2. Validate client identifier format
        if (!clientId || typeof clientId !== 'string' || !mongoose.Types.ObjectId.isValid(clientId)) {
            throw new AppError("Invalid client ID format", 400);
        }

        // 3. Verify target client existence
        const client = await this.clientRepository.findById(clientId);
        if (!client) {
            throw new AppError("Client not found", 404);
        }

        // 4. Strict workspace & tenant boundaries: Only owning Super Admin can delete
        const canAccess = await this.isClientAccessibleBySuperAdmin(client, adminUser);
        if (!canAccess) {
            throw new AppError("Access denied - You do not have permission to delete this client", 403);
        }

        const clientIdStr = client._id.toString();

        // 5. Concurrency lock to prevent simultaneous deletion requests
        if (this._activeDeletions.has(clientIdStr)) {
            throw new AppError("Client deletion is already in progress for this client", 409);
        }

        this._activeDeletions.add(clientIdStr);

        try {
            logger.info('[ClientService] Initiating permanent client deletion', {
                clientId: clientIdStr,
                clientName: client.name,
                adminId: adminUser.userId || adminUser._id,
            });

            // Step A: Immediately deactivate client and its API keys to reject any new inbound traffic
            try {
                client.isActive = false;
                await client.save();
                if (this.apiKeyRepository?.model) {
                    await this.apiKeyRepository.model.updateMany(
                        { clientId: client._id },
                        { $set: { isActive: false } }
                    );
                }
            } catch (deactivateErr) {
                logger.warn('[ClientService] Warning during client deactivation step:', deactivateErr);
            }

            // Step B: Clean up PostgreSQL aggregated metrics
            let pgMetricsDeleted = 0;
            if (this.metricsRepository && typeof this.metricsRepository.deleteByClientId === 'function') {
                try {
                    pgMetricsDeleted = await this.metricsRepository.deleteByClientId(clientIdStr);
                } catch (pgErr) {
                    logger.error('[ClientService] Failed to clean up PostgreSQL metrics:', pgErr);
                    throw new AppError(
                        `Partial cleanup failure: Unable to delete PostgreSQL metrics (${pgErr.message}). Client is deactivated. Please retry deletion to complete cleanup.`,
                        500
                    );
                }
            }

            // Step C: Clean up MongoDB raw API hits
            let apiHitsDeleted = 0;
            if (this.apiHitRepository && typeof this.apiHitRepository.deleteByClientId === 'function') {
                try {
                    apiHitsDeleted = await this.apiHitRepository.deleteByClientId(client._id);
                } catch (hitsErr) {
                    logger.error('[ClientService] Failed to clean up MongoDB API hits:', hitsErr);
                    throw new AppError(
                        `Partial cleanup failure: Unable to delete raw API hits (${hitsErr.message}). Please retry deletion to complete cleanup.`,
                        500
                    );
                }
            }

            // Step D: Clean up MongoDB API keys
            let apiKeysDeleted = 0;
            if (this.apiKeyRepository && typeof this.apiKeyRepository.deleteByClientId === 'function') {
                try {
                    apiKeysDeleted = await this.apiKeyRepository.deleteByClientId(client._id);
                } catch (keysErr) {
                    logger.error('[ClientService] Failed to clean up MongoDB API keys:', keysErr);
                    throw new AppError(
                        `Partial cleanup failure: Unable to delete API keys (${keysErr.message}). Please retry deletion to complete cleanup.`,
                        500
                    );
                }
            }

            // Step E: Clean up MongoDB client users
            let usersDeleted = 0;
            if (this.userRepository && typeof this.userRepository.deleteByClientId === 'function') {
                try {
                    usersDeleted = await this.userRepository.deleteByClientId(client._id);
                } catch (usersErr) {
                    logger.error('[ClientService] Failed to clean up MongoDB client users:', usersErr);
                    throw new AppError(
                        `Partial cleanup failure: Unable to delete client users (${usersErr.message}). Please retry deletion to complete cleanup.`,
                        500
                    );
                }
            }

            // Step F: Permanently delete the client document
            let clientDeleted = false;
            try {
                clientDeleted = await this.clientRepository.deleteById(client._id);
            } catch (clientErr) {
                logger.error('[ClientService] Failed to delete client document from MongoDB:', clientErr);
                throw new AppError(
                    `Partial cleanup failure: Unable to delete client record (${clientErr.message}). Please retry deletion to complete cleanup.`,
                    500
                );
            }

            // Step G: Record Audit Log (minimal sanitized data, no secrets)
            logger.info('[AUDIT] Permanent client deletion completed successfully', {
                action: 'PERMANENT_CLIENT_DELETION',
                admin: {
                    userId: (adminUser.userId || adminUser._id).toString(),
                    username: adminUser.username || 'unknown',
                    role: adminUser.role,
                },
                targetClient: {
                    clientId: clientIdStr,
                    clientName: client.name,
                    slug: client.slug,
                },
                timestamp: new Date().toISOString(),
                outcome: 'SUCCESS',
                cleanupSummary: {
                    postgresMetricsDeleted: pgMetricsDeleted,
                    rawHitsDeleted: apiHitsDeleted,
                    apiKeysDeleted: apiKeysDeleted,
                    usersDeleted: usersDeleted,
                    clientRecordDeleted: clientDeleted,
                }
            });

            return {
                clientId: clientIdStr,
                clientName: client.name,
                slug: client.slug,
                deletedAt: new Date().toISOString(),
                deletedBy: {
                    userId: (adminUser.userId || adminUser._id).toString(),
                    username: adminUser.username,
                },
                cleanupSummary: {
                    postgresMetrics: pgMetricsDeleted,
                    apiHits: apiHitsDeleted,
                    apiKeys: apiKeysDeleted,
                    clientUsers: usersDeleted,
                    clientRecord: clientDeleted ? 1 : 0,
                }
            };
        } finally {
            this._activeDeletions.delete(clientIdStr);
        }
    }
}