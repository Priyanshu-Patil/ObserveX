import winston from "winston";
import config from "./index.js"

/**
 * Winston logger configuration
 * Provides logging!
 */
const transports = [
    new winston.transports.Console({
        format: config.node_env === "production"
            ? winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                winston.format.json()
            )
            : winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
    })
];

// In non-production, also write to local log files
if (config.node_env !== "production") {
    transports.push(
        new winston.transports.File({ filename: 'logs/error.log', level: "error" }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    );
}

const logger = winston.createLogger({
    level: config.node_env === "production" ? 'info' : 'debug',
    defaultMeta: { service: "api-monitoring" },
    transports
});

export default logger