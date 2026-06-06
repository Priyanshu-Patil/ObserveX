import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/modules/pages/LandingPage.module.scss";

export function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ color: "var(--text-muted-dark)", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Last updated: June 6, 2026
        </p>

        <div style={{ color: "var(--text-light)", lineHeight: "1.8", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              1. Agreement to Terms
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              By accessing or using ObserveX's website and real-time monitoring dashboard, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              2. Use of Services
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              You may use our services only for lawful purposes in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials, API keys, and all activities that occur under your organization.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              3. Service Uptime and Support
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              While we strive to provide 99.99% uptime for our monitoring platform and metric ingestion endpoints, we do not warrant that our services will be uninterrupted or error-free. Support services are provided based on your subscription tier.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              4. Termination
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              We reserve the right to suspend or terminate your account or access to the services immediately, without notice or liability, for breach of these Terms, non-payment of fees, or actions that compromise our systems or other clients.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              5. Limitation of Liability
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              In no event shall ObserveX or its developers be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, or business disruption resulting from your use of the platform.
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

export default TermsPage;
