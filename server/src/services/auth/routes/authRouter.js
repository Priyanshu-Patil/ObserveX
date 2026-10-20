import express from "express";
import dependencies from "../Dependencies/dependencies.js";
import authorize from "../../../shared/middlewares/authorize.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import validate from "../../../shared/middlewares/validate.js";
import requestLogger from "../../../shared/middlewares/requestLogger.js";
import {
    onboardSuperAdminSchema,
    loginSchema,
    registrationSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} from "../validation/authSchema.js";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";

import rateLimit from "express-rate-limit";

const router = express.Router();
const { controller } = dependencies;
const authController = controller.authController;

const onboardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many password reset requests, please try again later',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
});

router.post("/onboard-super-admin",
    requestLogger,
    onboardLimiter,
    validate(onboardSuperAdminSchema),
    (req, res, next) => authController.onboardSuperAdmin(req, res, next)
);

router.post("/register",
    requestLogger,
    authenticate,
    authorize([APPLICATION_ROLES.SUPER_ADMIN]),
    validate(registrationSchema),
    (req, res, next) => authController.register(req, res, next)
);

router.post("/login",
    requestLogger,
    validate(loginSchema),
    (req, res, next) => authController.login(req, res, next)
);

router.post("/forgot-password",
    requestLogger,
    passwordResetLimiter,
    validate(forgotPasswordSchema),
    (req, res, next) => authController.forgotPassword(req, res, next)
);

router.post("/reset-password",
    requestLogger,
    passwordResetLimiter,
    validate(resetPasswordSchema),
    (req, res, next) => authController.resetPassword(req, res, next)
);

router.post("/change-password",
    requestLogger,
    authenticate,
    validate(changePasswordSchema),
    (req, res, next) => authController.changePassword(req, res, next)
);

router.get("/profile",
    requestLogger,
    authenticate,
    (req, res, next) => authController.getProfile(req, res, next)
);

router.get("/logout",
    requestLogger,
    (req, res, next) => authController.logout(req, res, next)
);

export default router;