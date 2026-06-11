import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Shield } from "lucide-react";

import { authApi } from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import { AuthLayout, AuthCard } from "../components/auth/AuthLayout";
import {
  getPasswordStrength,
  isValidEmail,
  validatePassword,
} from "../lib/validation";
import { useToast } from "../contexts/ToastContext";

import styles from "../styles/modules/Login.module.scss";
import MetaTags from "../components/MetaTags";


const ONBOARD_STEPS = [
  "Create Admin Account",
  "Secure Your Platform",
  "Start Observing",
];

export function OnboardSuperAdminPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const { refreshProfile } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(form.password);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        document.getElementById("onboard-form")?.requestSubmit();
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, []);

  const mutation = useMutation({
    mutationFn: () =>
      authApi.onboardSuperAdmin({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      }),

    onSuccess: async (data) => {
      if (!data.success) {
        toast(data.message || "Onboarding failed", "error");
        return;
      }

      try {
        await refreshProfile();

        toast("Super admin created successfully!", "success");

        navigate("/admin/clients", {
          replace: true,
        });
      } catch (error) {
        toast("Account created successfully", "success");

        navigate("/admin/clients", {
          replace: true,
        });
      }
    },

    onError: (err) => {
      toast(
        err.response?.data?.message || "Failed to create super admin",
        "error",
      );
    },
  });

  const validate = () => {
    const next = {};

    if (!form.username.trim()) {
      next.username = "Full name is required";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      next.email = "Enter a valid email address";
    }

    const passwordError = validatePassword(form.password);

    if (passwordError) {
      next.password = passwordError;
    }

    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      mutation.mutate();
    }
  };

  const update = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <AuthLayout steps={ONBOARD_STEPS} activeStep={0} compact>
      <MetaTags
        title="Onboard Super Admin - ObserveX"
        description="Configure the initial Super Admin account for your ObserveX private instance."
        keywords="setup super admin, onboarding observex, configure admin"
      />
      <AuthCard
        title="Create Super Admin"
        description="One-time setup for your platform administrator"
        footer={
          <p className={styles.footerText}>
            Already have an account?{" "}
            <Link to="/login" className={styles.footerLink}>
              Sign in
            </Link>
          </p>
        }
      >
        <form id="onboard-form" onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.roleBadge}>
            <Shield size={16} />

            <span>Super Administrator</span>

            <em>Assigned automatically</em>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Full Name
            </label>

            <div className={styles.inputContainer}>
              <User />

              <input
                id="username"
                type="text"
                value={form.username}
                onChange={update("username")}
                placeholder="Enter your full name"
                className={`${styles.input} ${
                  errors.username ? styles.inputError : ""
                }`}
                disabled={mutation.isPending}
                required
              />
            </div>

            {errors.username && (
              <p className={styles.fieldError}>{errors.username}</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>

            <div className={styles.inputContainer}>
              <Mail />

              <input
                id="email"
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@company.com"
                className={`${styles.input} ${
                  errors.email ? styles.inputError : ""
                }`}
                disabled={mutation.isPending}
                required
              />
            </div>

            {errors.email && (
              <p className={styles.fieldError}>{errors.email}</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>

            <div className={styles.inputContainer}>
              <Lock />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={update("password")}
                placeholder="Create a strong password"
                className={`${styles.input} ${styles.inputWithToggle}`}
                disabled={mutation.isPending}
                required
              />

              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {form.password && (
              <>
                <div className={styles.strengthBar}>
                  <div
                    className={`${styles.strengthFill} ${styles[`strength${strength.score}`]}`}
                    style={{
                      width: `${strength.score * 25}%`,
                    }}
                  />
                </div>

                <p className={styles.strengthLabel}>
                  Password strength: {strength.label}
                </p>
              </>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>

            <div className={styles.inputContainer}>
              <Lock />

              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                placeholder="Re-enter your password"
                className={`${styles.input} ${styles.inputWithToggle}`}
                disabled={mutation.isPending}
                required
              />

              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className={styles.fieldError}>{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className={styles.buttonContent}>
                <Loader2 className={styles.spinner} />
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          <p className={styles.hint}>Press ⌘+Enter to submit</p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
