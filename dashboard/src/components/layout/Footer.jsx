import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/modules/pages/LandingPage.module.scss";

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const hero = document.getElementById("homepage");
      if (hero) {
        hero.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const hero = document.getElementById("homepage");
        if (hero) {
          hero.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link to="/" onClick={handleLogoClick} style={{ display: "inline-block" }}>
              <img
                src="/Logo-Dark.png"
                alt="ObserveX"
                className={styles.footerLogo}
                style={{ height: "fit-content", width: "200px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <p>
              Real-time API monitoring and observability for modern engineering
              teams. Track every request, every endpoint, every millisecond.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h4>Product</h4>
            <a href="/#homepage">Home</a>
            <a href="/#features">Features</a>
            <a href="/#integrations">Integrations</a>
            <a href="/#docs">Documentation</a>
          </div>

          <div className={styles.footerCol}>
            <h4>Explore</h4>
            <Link to="/about">About</Link>
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
  );
}

export default Footer;
