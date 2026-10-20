import nodemailer from 'nodemailer';
import config from '../../shared/config/index.js';
import logger from '../../shared/config/logger.js';
import {
    superAdminCreatedTemplate,
    passwordResetTemplate,
    passwordChangedTemplate,
    successfulLoginTemplate,
    inactiveAccountAlertTemplate,
    clientCreatedTemplate,
    clientUserCreatedTemplate,
    apiKeyCreatedTemplate,
    apiKeyRotatedTemplate,
    apiKeyRevokedTemplate
} from './emailTemplates.js';

/**
 * Service to manage sending emails using Nodemailer and Brevo SMTP.
 */
export class EmailService {
    /**
     * @param {Object} [transporter] - Optional injected nodemailer transporter (for unit testing)
     */
    constructor(transporter = null) {
        this.transporter = transporter || nodemailer.createTransport({
            host: config.email?.smtp?.host || 'smtp-relay.brevo.com',
            port: config.email?.smtp?.port || 587,
            secure: config.email?.smtp?.secure || false,
            auth: {
                user: config.email?.smtp?.auth?.user,
                pass: config.email?.smtp?.auth?.pass,
            },
        });

        this.from = config.email?.from || 'ObserveX <observex@zohomail.in>';
        this.appUrl = process.env.APP_URL || config.email?.appUrl || config.appUrl || 'http://localhost:5173';
    }

    /**
     * Verifies the SMTP connection.
     * @returns {Promise<boolean>}
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger.info('[EmailService] SMTP connection verified successfully');
            return true;
        } catch (error) {
            logger.error('[EmailService] SMTP connection verification failed:', error);
            return false;
        }
    }

    /**
     * Low-level method to send an email.
     * @param {Object} options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.html - HTML body
     * @param {string} [options.text] - Plain text body
     * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
     */
    async sendEmail({ to, subject, html, text }) {
        try {
            if (!to) {
                throw new Error('Recipient email (to) is required');
            }

            const mailOptions = {
                from: this.from,
                to,
                subject,
                html,
                text,
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info('[EmailService] Email sent successfully', {
                to,
                subject,
                messageId: info.messageId,
            });

            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error(`[EmailService] Failed to send email to ${to}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 1. Send Super Admin account-created email
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.username
     * @param {string} [params.loginUrl]
     */
    async sendSuperAdminCreated({ to, username, loginUrl }) {
        const url = loginUrl || `${this.appUrl}/login`;
        const template = superAdminCreatedTemplate({
            username,
            email: to,
            loginUrl: url,
        });

        return this.sendEmail({ to, ...template });
    }

    /**
     * 2. Send Forgot password / password reset email
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.username
     * @param {string} params.resetUrl
     * @param {number} [params.expiresMinutes]
     */
    async sendPasswordReset({ to, username, resetUrl, expiresMinutes = 60 }) {
        const template = passwordResetTemplate({
            username,
            email: to,
            resetUrl,
            expiresMinutes,
        });

        return this.sendEmail({ to, ...template });
    }

    /**
     * 3. Send Password-changed confirmation
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.username
     * @param {string} [params.timestamp]
     * @param {string} [params.ipAddress]
     * @param {string} [params.userAgent]
     */
    async sendPasswordChanged({ to, username, timestamp, ipAddress, userAgent }) {
        const template = passwordChangedTemplate({
            username,
            email: to,
            timestamp,
            ipAddress,
            userAgent,
        });

        return this.sendEmail({ to, ...template });
    }

    /**
     * 4. Send Successful login notification
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.username
     * @param {string} [params.timestamp]
     * @param {string} [params.ipAddress]
     * @param {string} [params.userAgent]
     */
    async sendSuccessfulLogin({ to, username, timestamp, ipAddress, userAgent }) {
        const template = successfulLoginTemplate({
            username,
            email: to,
            timestamp,
            ipAddress,
            userAgent,
            appUrl: this.appUrl,
        });

        return this.sendEmail({ to, ...template });
    }

    /**
     * 5. Send Security alert for inactive-account login attempts
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.username
     * @param {string} [params.timestamp]
     * @param {string} [params.ipAddress]
     * @param {string} [params.userAgent]
     */
    async sendInactiveAccountAlert({ to, username, timestamp, ipAddress, userAgent }) {
        const template = inactiveAccountAlertTemplate({
            username,
            email: to,
            timestamp,
            ipAddress,
            userAgent,
        });

        return this.sendEmail({ to, ...template });
    }

    /**
     * 6. Send Client workspace created email
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.clientName
     * @param {string} params.slug
     * @param {string} [params.website]
     * @param {string} [params.description]
     * @param {string} [params.createdByUsername]
     * @param {string} [params.dashboardUrl]
     */
    async sendClientCreated({ to, clientName, slug, website, description, createdByUsername, dashboardUrl }) {
        const url = dashboardUrl || `${this.appUrl}/admin/clients`;
        const template = clientCreatedTemplate({
            clientName,
            slug,
            email: to,
            website,
            description,
            createdByUsername,
            dashboardUrl: url,
        });

        return this.sendEmail({ to, ...template });
    }

    /**
     * 7. Send Client user / team member added email
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.username
     * @param {string} [params.role]
     * @param {string} [params.clientName]
     * @param {string} [params.loginUrl]
     */
    async sendClientUserCreated({ to, username, role, clientName, loginUrl }) {
        const url = loginUrl || `${this.appUrl}/login`;
        const template = clientUserCreatedTemplate({
            username,
            email: to,
            role,
            clientName,
            loginUrl: url,
        });

        return this.sendEmail({ to, ...template });
    }

    /**
     * 8. Send API key created notification
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.keyName
     * @param {string} [params.keyPrefix]
     * @param {string} [params.environment]
     * @param {string} [params.clientName]
     * @param {string} [params.createdByUsername]
     * @param {string} [params.timestamp]
     * @param {string} [params.dashboardUrl]
     */
    async sendApiKeyCreated({ to, keyName, keyPrefix, environment, clientName, createdByUsername, timestamp, dashboardUrl }) {
        const url = dashboardUrl || `${this.appUrl}/admin/clients`;
        const template = apiKeyCreatedTemplate({
            keyName,
            keyPrefix,
            environment,
            clientName,
            createdByUsername,
            timestamp,
            dashboardUrl: url,
        });

        return this.sendEmail({ to, ...template });
    }

    /**
     * 9. Send API key rotated / regenerated security notification
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.keyName
     * @param {string} [params.keyPrefix]
     * @param {string} [params.environment]
     * @param {string} [params.clientName]
     * @param {string} [params.rotatedByUsername]
     * @param {string} [params.timestamp]
     * @param {string} [params.dashboardUrl]
     */
    async sendApiKeyRotated({ to, keyName, keyPrefix, environment, clientName, rotatedByUsername, timestamp, dashboardUrl }) {
        const url = dashboardUrl || `${this.appUrl}/admin/clients`;
        const template = apiKeyRotatedTemplate({
            keyName,
            keyPrefix,
            environment,
            clientName,
            rotatedByUsername,
            timestamp,
            dashboardUrl: url,
        });

        return this.sendEmail({ to, ...template });
    }

    /**
     * 10. Send API key revoked security notification
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.keyName
     * @param {string} [params.environment]
     * @param {string} [params.clientName]
     * @param {string} [params.revokedByUsername]
     * @param {string} [params.timestamp]
     * @param {string} [params.dashboardUrl]
     */
    async sendApiKeyRevoked({ to, keyName, environment, clientName, revokedByUsername, timestamp, dashboardUrl }) {
        const url = dashboardUrl || `${this.appUrl}/admin/clients`;
        const template = apiKeyRevokedTemplate({
            keyName,
            environment,
            clientName,
            revokedByUsername,
            timestamp,
            dashboardUrl: url,
        });

        return this.sendEmail({ to, ...template });
    }
}

export default new EmailService();
