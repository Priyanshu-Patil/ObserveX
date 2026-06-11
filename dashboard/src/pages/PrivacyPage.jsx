import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/modules/pages/LandingPage.module.scss";
import pageStyles from "../styles/modules/pages/CompanyPages.module.scss";
import { Footer } from "../components/layout";

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page} style={{ background: "var(--dark)", minHeight: "100vh" }}>
      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo} onClick={() => navigate("/")}>
          <img
            src="/Logo-Dark.png"
            alt="ObserveX"
            className={styles.logoText}
          />
        </div>

        <ul className={styles.navLinks}>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/#features">Features</Link>
          </li>
          <li>
            <Link to="/#integrations">Integrations</Link>
          </li>
          <li>
            <Link to="/#docs">Documentation</Link>
          </li>
        </ul>

        <div className={styles.navActions}>
          <button className={styles.navSignIn} onClick={() => navigate("/login")}>
            Login
          </button>
          <button className={styles.navRegister} onClick={() => navigate("/onboard-super-admin")}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div className={pageStyles.contentContainer}>
        <Link to="/" className={pageStyles.backButton}>
          ← Return to Homepage
        </Link>
        <h1 className={pageStyles.title}>
          Privacy Policy
        </h1>
        <p className={pageStyles.metaText}>
          Last updated: June 6, 2026
        </p>

        <div className={pageStyles.sectionsList}>
          <section>
            <h2 className={pageStyles.sectionHeader}>
              1. Information We Collect
            </h2>
            <p className={pageStyles.sectionBody}>
              We collect information that you provide directly to us when creating an account, setting up an organization, or communicating with support. This includes basic details such as your name, email address, organization name, and billing information.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              2. How We Use Your Data
            </h2>
            <p className={pageStyles.sectionBody}>
              ObserveX uses the collected data to provide, maintain, and improve our API monitoring services. This includes processing API request telemetry, calculating endpoint latencies, detecting error rates, sending alert notifications, and authenticating users. We do not sell your personal or request data to third parties.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              3. Telemetry and API Ingestion
            </h2>
            <p className={pageStyles.sectionBody}>
              When you integrate our SDKs or send metrics to our ingestion endpoint, we process metadata associated with your API requests (such as latencies, response status codes, HTTP methods, and pathnames). It is your responsibility to ensure that no personally identifiable information (PII) or sensitive customer data is transmitted in request paths or headers.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              4. Security Measures
            </h2>
            <p className={pageStyles.sectionBody}>
              We employ industry-standard administrative, technical, and physical security measures designed to protect your data from unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit (using TLS) and at rest.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              5. Contact Us
            </h2>
            <p className={pageStyles.sectionBody}>
              If you have any questions or concerns regarding this Privacy Policy, please reach out to us at privacy@observex.com.
            </p>
          </section>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

export default PrivacyPage;
