import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/modules/pages/LandingPage.module.scss";
import pageStyles from "../styles/modules/pages/CompanyPages.module.scss";
import { Footer, Navbar } from "../components/layout";
import MetaTags from "../components/MetaTags";



export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page} style={{ background: "var(--dark)", minHeight: "100vh" }}>
      <MetaTags
        title="Terms of Service - ObserveX"
        description="Terms of service governing the usage of ObserveX's real-time API monitoring dashboard and collector endpoints."
        keywords="terms of service, terms, observex terms, api monitoring terms"
      />
      {/* ── NAV ── */}
      <Navbar />

      {/* ── CONTENT ── */}
      <div className={pageStyles.contentContainer}>
        <Link to="/" className={pageStyles.backButton}>
          ← Return to Homepage
        </Link>
        <h1 className={pageStyles.title}>
          Terms of Service
        </h1>
        <p className={pageStyles.metaText}>
          Last updated: June 6, 2026
        </p>

        <div className={pageStyles.sectionsList}>
          <section>
            <h2 className={pageStyles.sectionHeader}>
              1. Agreement to Terms
            </h2>
            <p className={pageStyles.sectionBody}>
              By accessing or using ObserveX's website and real-time monitoring dashboard, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              2. Use of Services
            </h2>
            <p className={pageStyles.sectionBody}>
              You may use our services only for lawful purposes in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials, API keys, and all activities that occur under your organization.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              3. Service Uptime and Support
            </h2>
            <p className={pageStyles.sectionBody}>
              While we strive to provide 99.99% uptime for our monitoring platform and metric ingestion endpoints, we do not warrant that our services will be uninterrupted or error-free. Support services are provided based on your subscription tier.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              4. Termination
            </h2>
            <p className={pageStyles.sectionBody}>
              We reserve the right to suspend or terminate your account or access to the services immediately, without notice or liability, for breach of these Terms, non-payment of fees, or actions that compromise our systems or other clients.
            </p>
          </section>

          <section>
            <h2 className={pageStyles.sectionHeader}>
              5. Limitation of Liability
            </h2>
            <p className={pageStyles.sectionBody}>
              In no event shall ObserveX or its developers be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, or business disruption resulting from your use of the platform.
            </p>
          </section>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

export default TermsPage;
