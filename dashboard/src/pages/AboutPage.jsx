import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/modules/pages/LandingPage.module.scss";

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
          About ObserveX
        </h1>
        <p style={{ color: "var(--text-muted-dark)", fontSize: "1.05rem", lineHeight: "1.8", marginBottom: "2rem" }}>
          ObserveX is built for modern engineering teams who value speed, reliability, and complete visibility. We think API monitoring shouldn't require complex configurations or massive performance overhead. 
        </p>

        <div style={{ color: "var(--text-light)", lineHeight: "1.8", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              Our Mission
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              To empower software developers, platform engineers, and SREs with clean, real-time insights into system health. We strive to create the absolute best developer experience by shipping high-performance ingestion engines, intuitive dashboards, and lightweight official SDKs.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              Our Story
            </h2>
            <p style={{ color: "var(--text-muted-dark)" }}>
              Started in 2026, ObserveX emerged out of a frustration with traditional, slow APM tooling. The dashboard compiles aggregated telemetry and streams request statuses within milliseconds, giving developers the absolute fastest feedback loop to spot bottlenecks and catch production regressions instantly.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--purple-light)", background: "rgba(157, 78, 221, 0.1)", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "1.2rem", marginBottom: "1rem" }}>
              Core Values
            </h2>
            <ul style={{ color: "var(--text-muted-dark)", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li><strong>Speed First:</strong> Fast ingestion, millisecond latency calculations, and instantaneous updates.</li>
              <li><strong>Simplicity:</strong> Simple pricing, drop-in SDK integration, and single-click metrics overview.</li>
              <li><strong>Security:</strong> Complete environment separation, rotating API access tokens, and TLS encryption.</li>
            </ul>
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

export default AboutPage;
