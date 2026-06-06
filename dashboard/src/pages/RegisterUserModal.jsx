import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  ShieldCheck,
  X,
} from "lucide-react";

import { authApi } from "../api/api";
import {
  getPasswordStrength,
  isValidEmail,
  validatePassword,
} from "../lib/validation";
import { useToast } from "../contexts/ToastContext";

import styles from "../styles/modules/Login.module.scss";

const ROLE_OPTIONS = [
  {
    value: "super_admin",
    label: "Super Admin",
    description: "Full platform access",
  },
  {
    value: "client_admin",
    label: "Client Admin",
    description: "Manage client users and API keys",
  },
  {
    value: "client_viewer",
    label: "Client Viewer",
    description: "Read only analytics access",
  },
];

export function RegisterUserModal({ open, onClose }) {
  const toast = useToast();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client_viewer",
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(form.password);

  const selectedRole = ROLE_OPTIONS.find((role) => role.value === form.role);

  const mutation = useMutation({
    mutationFn: () =>
      authApi.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      }),

    onSuccess: (data) => {
      if (data.success) {
        setSuccess(true);

        toast("User registered successfully", "success");

        setTimeout(() => {
          onClose?.();
        }, 1500);
      }
    },

    onError: (err) => {
      toast(err.response?.data?.message || "Registration failed", "error");
    },
  });

  const validate = () => {
    const next = {};

    if (!form.username.trim()) {
      next.username = "Username is required";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      next.email = "Enter valid email";
    }

    const passwordError = validatePassword(form.password);

    if (passwordError) {
      next.password = passwordError;
    }

    if (form.password !== form.confirmPassword) {
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

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "540px",
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,.45)",
        }}
      >
        <div
          style={{
            padding: "1.5rem 1.5rem 1rem",
            borderBottom: "1px solid hsl(var(--border) / .5)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 700,
              }}
            >
              Register User
            </h2>

            <p
              style={{
                marginTop: "0.35rem",
                color: "hsl(var(--muted-foreground))",
                fontSize: ".9rem",
              }}
            >
              Create a new platform user
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "white"
            }}
          >
            <X />
          </button>
        </div>

        {success ? (
          <div className={styles.successState}>
            <CheckCircle className={styles.successIcon} />

            <p>User created successfully</p>
          </div>
        ) : (
            <div
  style={{
    padding: '1.5rem',
  }}
>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Username</label>

              <div className={styles.inputContainer}>
                <User />

                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>

              <div className={styles.inputContainer}>
                <Mail />

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Role</label>

              <div className={styles.inputContainer}>
                <ShieldCheck />

                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className={styles.select}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className={styles.roleHint}>{selectedRole?.description}</p>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>

              <div className={styles.inputContainer}>
                <Lock />

                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className={styles.input}
                />

                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>

              <div className={styles.inputContainer}>
                <Lock />

                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className={styles.input}
                />
              </div>
            </div>

            {form.password && (
              <div className={styles.strengthBar}>
              <div
                className={`${styles.strengthFill} ${styles[`strength${strength.score}`]}`}
                style={{
                  width: `${strength.score * 25}%`,
                }}
              />
            </div>
            )}

            <button
            type="submit"
            className={styles.submitButton}
            disabled={mutation.isPending}
            style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                background:
                'linear-gradient(135deg,#2563eb,#3b82f6)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '.95rem',
                cursor: 'pointer',
                marginTop: '1rem',
            }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </button>
          </form>
          </div>
        )}
      </div>
    </div>
  );
}
