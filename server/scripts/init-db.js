import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from '../src/shared/config/postgres.js';
import logger from '../src/shared/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
    try {
        logger.info('Connecting to PostgreSQL to run initialization script...');
        await postgres.testConnection();

        const sqlFilePath = path.join(__dirname, 'init-postgres.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        logger.info('Running init-postgres.sql...');
        await postgres.query(sql);

        logger.info('Database schema initialized successfully!');
        await postgres.close();
        process.exit(0);
    } catch (error) {
        logger.error('Failed to initialize database schema:', error);
        await postgres.close();
        process.exit(1);
    }
}

initDatabase();
