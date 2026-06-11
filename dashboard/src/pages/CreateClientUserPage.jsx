import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2 } from "lucide-react";
import { clientApi } from "../api/api";
import { PageHeader } from "../components/ui/PageHeader";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { isValidEmail, validatePassword } from "../lib/validation";
import { useToast } from "../contexts/ToastContext";
import styles from "../styles/modules/pages/PageComponents.module.scss";
import MetaTags from "../components/MetaTags";


const PERMISSIONS = [
  { key: "canCreateApiKeys", label: "Create API Keys" },
  { key: "canManageUsers", label: "Manage Users" },
  { key: "canViewAnalytics", label: "View Analytics" },
  { key: "canExportData", label: "Export Data" },
];

const ROLE_PERMISSIONS = {
  client_admin: {
    canCreateApiKeys: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canExportData: true,
  },
  client_viewer: {
    canCreateApiKeys: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canExportData: false,
  },
};

export function CreateClientUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: clientResponse, isLoading: clientLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => clientApi.getClient(id),
    enabled: !!id,
  });

  const client = clientResponse?.data;
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "client_viewer",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      clientApi.createClientUser(id, {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      }),
    onSuccess: (data) => {
      if (data.success) {
        setSuccess(true);
        toast("User invited successfully", "success");
      } else {
        toast(data.message, "error");
      }
    },
    onError: (err) =>
      toast(err.response?.data?.message || "Failed to create user", "error"),
  });

  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email";
    const pwErr = validatePassword(form.password);
    if (pwErr) next.password = pwErr;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const perms = ROLE_PERMISSIONS[form.role] ?? {};

  if (clientLoading) {
    return (
      <div className={styles.pageContainer}>
        <Card className={styles.sectionCard}>
          <CardContent
            style={{
              padding: "2rem",
              textAlign: "center",
            }}
          >
            Loading client...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.pageContainer}>
        <Card className={styles.sectionCard}>
          <CardContent style={{ textAlign: "center", padding: "3rem" }}>
            <CheckCircle
              size={48}
              style={{ color: "#22c55e", marginBottom: "1rem" }}
            />
            <h2>User Invited</h2>
            <p style={{ color: "hsl(var(--muted-foreground))" }}>
              {form.username} has been added to {client?.name ?? "the client"}.
            </p>
            <Button
              style={{ marginTop: "1.5rem" }}
              onClick={() => navigate(`/admin/clients/${id}`)}
            >
              Back to Client
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <MetaTags
        title="Add User - ObserveX"
        description="Invite and configure permissions for a new client user under your organization."
      />
      <PageHeader
        title="Invite User"
        description={`Add a user to ${client?.name ?? "client"}`}
        breadcrumbs={[
          { label: "Home", href: "/client/dashboard" },
          { label: "Clients", href: "/admin/clients" },
          { label: client?.name ?? "Client", href: `/admin/clients/${id}` },
          { label: "Invite User" },
        ]}
      />
      <Card className={styles.sectionCard}>
        <CardContent className={styles.cardContent}>
          <form onSubmit={handleSubmit} className={styles.formStack}>
            <FormField
              label="Name"
              name="username"
              value={form.username}
              onChange={update("username")}
              error={errors.username}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
              required
            />
            <FormField label="Role" name="role">
              <select
                id="role"
                value={form.role}
                onChange={update("role")}
                style={{
                  padding: "0.5rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid hsl(var(--border))",
                  width: "100%",
                }}
              >
                <option value="client_admin">Client Admin</option>
                <option value="client_viewer">Client Viewer</option>
              </select>
            </FormField>
            <FormField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={update("password")}
              error={errors.password}
              required
            />
            <div>
              <div className={styles.permissionsSection}>
                <div className={styles.permissionsHeader}>
                  <h4>Role Permissions</h4>

                  <span className={styles.roleBadge}>
                    {form.role === "client_admin"
                      ? "Client Admin"
                      : "Client Viewer"}
                  </span>
                </div>

                <div className={styles.permissionsGrid}>
                  {PERMISSIONS.map((permission) => (
                    <div
                      key={permission.key}
                      className={`${styles.permissionCard} ${
                        perms[permission.key]
                          ? styles.permissionActive
                          : styles.permissionInactive
                      }`}
                    >
                      <span className={styles.permissionDot} />

                      <span>{permission.label}</span>
                    </div>
                  ))}
                </div>

                <p className={styles.permissionHint}>
                  Permissions are automatically assigned based on the selected
                  role.
                </p>
              </div>
            </div>
            <div className={styles.actionRow}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/clients/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2
                      size={16}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Inviting...
                  </>
                ) : (
                  "Invite User"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
