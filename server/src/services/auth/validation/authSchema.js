import { isValidRole } from "../../../shared/constants/roles.js";
import SecurityUtils from "../../../shared/utils/SecurityUtils.js";

/**
 * Validation schemas for the Auth module.
 */
export const onboardSuperAdminSchema = {
    username: {
        required: true,
        minLength: 3,
        custom: (val) => {
            if (!val || typeof val !== 'string' || !val.trim()) {
                return 'Username is required';
            }
            if (val.trim().length < 3) {
                return 'Username must be at least 3 characters';
            }
            if (!/^[a-zA-Z0-9_.-]+$/.test(val.trim())) {
                return 'Username must contain only letters, numbers, underscores, dots, or dashes';
            }
            return null;
        }
    },
    email: {
        required: true,
        custom: (val) => {
            if (!val || typeof val !== 'string' || !val.trim()) {
                return 'Email is required';
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
                return 'Please enter a valid email';
            }
            return null;
        }
    },
    password: {
        required: true,
        minLength: 6,
        custom: (val) => {
            if (!val) return 'Password is required';
            const validation = SecurityUtils.validatePassword(val);
            if (!validation.success) {
                return validation.errors.join('. ');
            }
            return null;
        }
    }
}

/**
 * Validation schema for user registration.
 */
export const registrationSchema = {
    username: {
        required: true,
    },
    email: {
        required: true,
    },
    password: {
        required: true,
        minLength: 6
    },
    role: {
        required: false,
        custom: (value) => {
            if (!value) return null;
            return isValidRole(value) ? null : 'Invalid role';
        }
    },
}

/**
 * Validation schema for user login.
 */
export const loginSchema = {
    username: { required: true },
    password: { required: true },
};

/**
 * Validation schema for forgot password request.
 */
export const forgotPasswordSchema = {
    email: {
        required: true,
        custom: (val) => {
            if (!val || typeof val !== 'string' || !val.trim()) {
                return 'Email is required';
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
                return 'Please enter a valid email';
            }
            return null;
        }
    }
};

/**
 * Validation schema for authenticated change password request.
 */
export const changePasswordSchema = {
    currentPassword: {
        required: true,
        custom: (val) => {
            if (!val || typeof val !== 'string') return 'Current password is required';
            return null;
        }
    },
    newPassword: {
        required: true,
        minLength: 6,
        custom: (val) => {
            if (!val) return 'New password is required';
            const validation = SecurityUtils.validatePassword(val);
            if (!validation.success) {
                return validation.errors.join('. ');
            }
            return null;
        }
    }
};

/**
 * Validation schema for reset password request.
 */
export const resetPasswordSchema = {
    token: {
        required: true,
        custom: (val) => {
            if (!val || typeof val !== 'string' || !val.trim()) {
                return 'Reset token is required';
            }
            return null;
        }
    },
    password: {
        required: true,
        minLength: 6,
        custom: (val) => {
            if (!val) return 'Password is required';
            const validation = SecurityUtils.validatePassword(val);
            if (!validation.success) {
                return validation.errors.join('. ');
            }
            return null;
        }
    }
};