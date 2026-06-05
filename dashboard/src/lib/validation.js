export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getPasswordStrength(password) {
    if (!password) return { score: 0, label: 'Empty', color: 'muted' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'destructive' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'warning' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'primary' };
    return { score: 4, label: 'Strong', color: 'success' };
}

export function validatePassword(password) {
    if (!password || password.length < 6) {
        return 'Password must be at least 6 characters';
    }
    return null;
}
