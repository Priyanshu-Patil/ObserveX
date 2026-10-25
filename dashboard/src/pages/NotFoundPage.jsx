import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import MetaTags from "../components/MetaTags";
import styles from "../styles/modules/pages/NotFoundPage.module.scss";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.container}>
      <MetaTags
        title="404 - Page Not Found"
        description="The page you are looking for does not exist."
        robots="noindex, nofollow"
      />

      <div className={styles.card}>
        <Link to={isAuthenticated ? "/client/dashboard" : "/"}>
          <img src="/Logo-Dark.png" alt="ObserveX" className={styles.logo} />
        </Link>

        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className={styles.actions}>
          <Link
            to={isAuthenticated ? "/client/dashboard" : "/"}
            className={styles.btnPrimary}
            id="btn-404-home"
          >
            <Home size={16} />
            <span>{isAuthenticated ? "Back to Dashboard" : "Back to Home"}</span>
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className={styles.btnSecondary}
            id="btn-404-back"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
