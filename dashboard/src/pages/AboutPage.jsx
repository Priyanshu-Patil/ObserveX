import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/modules/pages/LandingPage.module.scss";
import pageStyles from "../styles/modules/pages/CompanyPages.module.scss";
import { Footer } from "../components/layout";

export function AboutPage() {
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
          About ObserveX
        </h1>
        <p className={pageStyles.introText}>
          ObserveX is built for modern engineering teams who value speed, reliability, and complete visibility. We think API monitoring shouldn't require complex configurations or massive performance overhead. 
        </p>

        <div className={pageStyles.sectionsList}>
          <section>
            <h2 className={pageStyles.sectionHeader}>
              Our Mission
            </h2>
            <p className={pageStyles.sectionBody}>
              To empower software developers, platform engineers, and SREs with clean, real-time insights into system health. We strive to create the absolute best developer experience by shipping high-performance ingestion engines, intuitive dashboards, and lightweight official SDKs.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              Our Story
            </h2>
            <p className={pageStyles.sectionBody}>
              Started in 2026, ObserveX emerged out of a frustration with traditional, slow APM tooling. The dashboard compiles aggregated telemetry and streams request statuses within milliseconds, giving developers the absolute fastest feedback loop to spot bottlenecks and catch production regressions instantly.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              Core Values
            </h2>
            <ul className={pageStyles.listGroup}>
              <li><strong>Speed First:</strong> Fast ingestion, millisecond latency calculations, and instantaneous updates.</li>
              <li><strong>Simplicity:</strong> Simple pricing, drop-in SDK integration, and single-click metrics overview.</li>
              <li><strong>Security:</strong> Complete environment separation, rotating API access tokens, and TLS encryption.</li>
            </ul>
          </section>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

export default AboutPage;
