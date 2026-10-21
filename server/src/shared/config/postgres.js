import pg from "pg"
import config from "./index.js"
import logger from "./logger.js"

const { Pool } = pg;

class PostgresConnection {
    constructor() {
        this.pool = null;
    }

    getPool() {
        if (!this.pool) {
            const isNeon = (config.postgres.host && config.postgres.host.includes('neon.tech')) ||
                           (config.postgres.url && config.postgres.url.includes('neon.tech'));
            const useSsl = config.postgres.ssl || isNeon;

            const poolConfig = {
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000,
            };

            if (config.postgres.url) {
                poolConfig.connectionString = config.postgres.url;
            } else {
                poolConfig.host = config.postgres.host;
                poolConfig.port = config.postgres.port;
                poolConfig.database = config.postgres.database;
                poolConfig.user = config.postgres.user;
                poolConfig.password = config.postgres.password;
            }

            if (useSsl) {
                poolConfig.ssl = { rejectUnauthorized: false };
            }

            this.pool = new Pool(poolConfig);

            this.pool.on("connect", client => {
                client.query("SET search_path TO public");
            });

            this.pool.on("error", err => {
                logger.error("Unexpected error on idle PG client", err);
            });

            logger.info("PG Pool Created");
        }
        return this.pool;
    }

    async getClient() {
        const pool = this.getPool();
        return await pool.connect();
    }

    async testConnection() {
        try {
            const pool = this.getPool();
            const client = await pool.connect();
            const result = await client.query("SELECT NOW()")
            client.release();

            logger.info(`PG connected successfully at ${result.rows[0].now}`)
        } catch (error) {
            logger.error("Failed to connect to PG", error)
            throw error
        }
    }

    async query(text, params) {
        const pool = this.getPool()
        const start = Date.now();
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start
            logger.debug('Executed query', { text, duration, rows: result.rowCount });
            return result;
        }
        catch (error) {
            logger.error('Query error:', { text, error: error.message });
            throw error;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            logger.info("PG pool closed!")
        }
    }
}

export default new PostgresConnection()