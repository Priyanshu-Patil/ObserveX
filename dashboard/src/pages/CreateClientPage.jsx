import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { clientApi } from "../api/api";
import { QUERY_KEYS } from "../constants";

import { PageHeader } from "../components/ui/PageHeader";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

import { isValidEmail } from "../lib/validation";
import { useToast } from "../contexts/ToastContext";

import styles from "../styles/modules/pages/PageComponents.module.scss";

const DRAFT_KEY = "observex_client_draft";

function getDefaultForm() {
  return {
    name: "",
    email: "",
    website: "",
    description: "",
  };
}

export function CreateClientPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [form, setForm] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(DRAFT_KEY)) ?? getDefaultForm();
    } catch {
      return getDefaultForm();
    }
  });

  const [errors, setErrors] = useState({});

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isDirty) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }
  }, [form, isDirty]);

  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const mutation = useMutation({
    mutationFn: () =>
      clientApi.onboardClient({
        name: form.name.trim(),
        email: form.email.trim(),
        website: form.website.trim() || undefined,
        description: form.description.trim() || undefined,
      }),

    onSuccess: (data) => {
      if (!data.success) {
        toast(data.message || "Failed to create client", "error");
        return;
      }

      localStorage.removeItem(DRAFT_KEY);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CLIENTS ?? ["clients"],
      });

      toast("Client created successfully", "success");

      navigate(`/admin/clients/${data.data._id}`);
    },

    onError: (error) => {
      toast(
        error?.response?.data?.message || "Failed to create client",
        "error",
      );
    },
  });

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Company name is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = "Enter a valid email";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      mutation.mutate();
    }
  };

  const update = (field) => (e) => {
    setIsDirty(true);

    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <div className={styles.pageContainer}>
      <PageHeader
        title="Create Client"
        description="Onboard a new organization"
        breadcrumbs={[
          {
            label: "Home",
            href: "/client/dashboard",
          },
          {
            label: "Clients",
            href: "/admin/clients",
          },
          {
            label: "Create",
          },
        ]}
      />

      <Card className={styles.sectionCard}>
        <CardContent className={styles.cardContent}>
          <form onSubmit={handleSubmit} className={styles.formStack}>
            <div className={styles.gridTwoCols}>
              <FormField
                label="Company Name"
                name="name"
                value={form.name}
                onChange={update("name")}
                error={errors.name}
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

              <FormField
                label="Website"
                name="website"
                value={form.website}
                onChange={update("website")}
              />
            </div>

            <FormField label="Description" name="description">
              <textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={update("description")}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  resize: "vertical",
                }}
              />
            </FormField>

            <div className={styles.actionRow}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/clients")}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2
                      className={styles.iconSm}
                      style={{
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Creating...
                  </>
                ) : (
                  "Create Client"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
