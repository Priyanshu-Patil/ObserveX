import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { Breadcrumbs } from "../ui/Breadcrumbs";
import { Menu, X, Clock, RefreshCw, Sun, Moon } from "lucide-react";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useTheme } from "../../contexts/ThemeContext";
import { QUERY_KEYS } from "../../constants";
import { RegisterUserModal } from "../../pages/RegisterUserModal";
import styles from "../../styles/modules/layout/DashboardLayout.module.scss";

const ROUTE_LABELS = {
  "/client/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/analytics/endpoints": "Endpoint Analytics",
  "/admin/clients": "Clients",
  "/admin/clients/create": "Create Client",
  "/settings": "Settings",
  "/docs": "Documentation",
  "/activity": "Activity Logs",
};

function getBreadcrumbs(pathname) {
  const crumbs = [
    {
      label: "Home",
      href: "/client/dashboard",
    },
  ];

  if (
    pathname.startsWith("/admin/clients/") &&
    pathname !== "/admin/clients/create"
  ) {
    crumbs.push({
      label: "Clients",
      href: "/admin/clients",
    });

    const segments = pathname.split("/");

    if (segments[3]) {
      crumbs.push({
        label: "Client Details",
      });
    }

    if (segments[5] === "users") {
      crumbs.push({
        label: "Users",
      });
    }

    if (segments[5] === "api-keys") {
      crumbs.push({
        label: "API Keys",
      });
    }

    return crumbs;
  }

  const label = ROUTE_LABELS[pathname];

  if (label) {
    crumbs.push({ label });
  }

  return crumbs;
}

export function DashboardLayout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const { currentTheme, switchTheme } = useTheme();

  const queryClient = useQueryClient();

  const location = useLocation();

  const isFetching =
    useIsFetching({
      queryKey: QUERY_KEYS.DASHBOARD,
    }) > 0;

  const breadcrumbs = getBreadcrumbs(location.pathname);

  const pageTitle = useMemo(() => {
    return breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";
  }, [breadcrumbs]);

  const lastUpdated = new Date().toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.DASHBOARD,
    });

    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.STATS,
    });
  };

  const themeClass =
    currentTheme === "dark" ? styles.themeDark : styles.themeLight;

  return (
    <div className={`${styles.container} ${themeClass}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenRegisterModal={() => setShowRegisterModal(true)}
      />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            {/* TOP ROW */}
            <div className={styles.headerTop}>
              <button
                className={styles.mobileMenuButton}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                {sidebarOpen ? (
                  <X aria-hidden="true" />
                ) : (
                  <Menu aria-hidden="true" />
                )}
              </button>

              <div className={styles.pageTitle}>
                {/* Desktop Breadcrumbs */}
                <div className={styles.desktopBreadcrumbs}>
                  <Breadcrumbs items={breadcrumbs} />
                </div>

                {/* Mobile Title */}
                <h1 className={styles.mobileTitle}>{pageTitle}</h1>

                {/* Desktop Last Updated */}
                <div className={styles.desktopLastUpdated}>
                  <Clock aria-hidden="true" />

                  <span>Last updated: {lastUpdated}</span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={styles.toggleButton}
                  type="button"
                  onClick={() =>
                    switchTheme(currentTheme === "light" ? "dark" : "light")
                  }
                  aria-label={`Switch to ${
                    currentTheme === "light" ? "dark" : "light"
                  } theme`}
                >
                  {currentTheme === "light" ? (
                    <Moon aria-hidden="true" />
                  ) : (
                    <Sun aria-hidden="true" />
                  )}
                </button>

                <button
                  className={styles.refreshButton}
                  onClick={handleRefresh}
                  disabled={isFetching}
                  aria-label="Refresh data"
                >
                  <RefreshCw
                    className={isFetching ? styles.spinning : ""}
                    aria-hidden="true"
                  />

                  <span className={styles.hiddenText}>Refresh</span>
                </button>

                <NotificationsDropdown />

                <UserMenu onLogout={onLogout} />
              </div>
            </div>

            {/* MOBILE LAST UPDATED */}
            <div className={styles.headerBottom}>
              <Clock aria-hidden="true" />

              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        </header>

        <main className={styles.pageContent}>{children}</main>
      </div>

      <RegisterUserModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        />
    </div>
  );
}
