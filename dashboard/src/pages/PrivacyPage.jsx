import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/modules/pages/LandingPage.module.scss";

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
      <div style={{ padding: "9rem 6% 6rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--text-light)", fontSize: "2.5rem", marginBottom: "1.5rem" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--text-muted-dark)", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Last updated: June 6, 2026
        </p>

        <div style={{ color: "var(--text-light)", lineHeight: "1.8", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              1. Information We Collect
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              We collect information that you provide directly to us when creating an account, setting up an organization, or communicating with support. This includes basic details such as your name, email address, organization name, and billing information.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              2. How We Use Your Data
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              ObserveX uses the collected data to provide, maintain, and improve our API monitoring services. This includes processing API request telemetry, calculating endpoint latencies, detecting error rates, sending alert notifications, and authenticating users. We do not sell your personal or request data to third parties.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              3. Telemetry and API Ingestion
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              When you integrate our SDKs or send metrics to our ingestion endpoint, we process metadata associated with your API requests (such as latencies, response status codes, HTTP methods, and pathnames). It is your responsibility to ensure that no personally identifiable information (PII) or sensitive customer data is transmitted in request paths or headers.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              4. Security Measures
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              We employ industry-standard administrative, technical, and physical security measures designed to protect your data from unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit (using TLS) and at rest.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              5. Contact Us
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              If you have any questions or concerns regarding this Privacy Policy, please reach out to us at privacy@observex.com.
            </p>
          </section>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <img
                src="/Logo-Dark.png"
                alt="ObserveX"
                className={styles.footerLogo}
              />
              <p>
                Real-time API monitoring and observability for modern engineering
                teams. Track every request, every endpoint, every millisecond.
              </p>
            </div>

            <div className={styles.footerCol}>
              <h4>Product</h4>
              <a href="/#features">Features</a>
              <a href="/#integrations">Integrations</a>
              <a href="/#docs">Documentation</a>
            </div>

            <div className={styles.footerCol}>
              <h4>Resources</h4>
              <a href="#">API Reference</a>
              <a href="#">Guides</a>
              <a href="#">Support</a>
              <a href="#">Status</a>
            </div>

            <div className={styles.footerCol}>
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>
              © 2026 ObserveX. All rights reserved.
            </p>
            <span className={styles.footerTagline}>
              Built for engineers who ship.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PrivacyPage;
