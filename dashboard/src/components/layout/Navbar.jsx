import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, Download } from "lucide-react";
import { usePwa } from "../../contexts/PwaContext";
import styles from "../../styles/modules/pages/LandingPage.module.scss";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isInstallable, isInstalled, installPwa } = usePwa();

  const isHomepage = location.pathname === "/";
  const isDocs = location.pathname.startsWith("/docs");
  const goOnboard = () => navigate("/onboard-super-admin", { viewTransition: true });

  return (
    <>
      <nav className={`${styles.nav} ${isDocs ? styles.navDocs : ""}`}>
        <div className={styles.navLogo} onClick={() => navigate("/", { viewTransition: true })}>
          <img
            src="/Logo-Dark.png"
            alt="ObserveX"
            className={styles.logoText}
          />
        </div>

        <ul className={styles.navLinks}>
          <li>
            {isHomepage ? (
              <a href="#homepage">Home</a>
            ) : (
              <Link to="/" viewTransition>Home</Link>
            )}
          </li>
          <li>
            {isHomepage ? (
              <a href="#features">Features</a>
            ) : (
              <Link to="/#features">Features</Link>
            )}
          </li>
          <li>
            {isHomepage ? (
              <a href="#integrations">Integrations</a>
            ) : (
              <Link to="/#integrations">Integrations</Link>
            )}
          </li>
          <li>
            {isHomepage ? (
              <a href="#faq">FAQ</a>
            ) : (
              <Link to="/#faq">FAQ</Link>
            )}
          </li>
          <li>
            <Link to="/docs" viewTransition>Documentation</Link>
          </li>
          <li className={styles.navDropdownContainer}>
            <button className={styles.navDropdownTrigger}>
              Explore <ChevronDown size={14} className={styles.dropdownChevron} />
            </button>
            <div className={styles.navDropdownMenu}>
              <Link to="/about" viewTransition>About Us</Link>
              <Link to="/privacy" viewTransition>Privacy Policy</Link>
              <Link to="/terms" viewTransition>Terms of Service</Link>
            </div>
          </li>
        </ul>

        <div className={styles.navActions}>
          {!isInstalled && (
            <button
              className={styles.navSignIn}
              onClick={installPwa}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              aria-label="Install ObserveX App"
            >
              <Download size={14} />
              <span>Install App</span>
            </button>
          )}
          <button className={styles.navSignIn} onClick={() => navigate("/login", { viewTransition: true })}>
            Login
          </button>
          <button className={styles.navRegister} onClick={goOnboard}>
            Get Started →
          </button>
        </div>

        <button 
          className={styles.mobileToggle} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ""} ${isDocs ? styles.mobileMenuDocs : ""}`}>
        <ul className={styles.mobileNavLinks}>
          <li>
            {isHomepage ? (
              <a href="#homepage" onClick={() => setMobileMenuOpen(false)}>Home</a>
            ) : (
              <Link to="/" viewTransition onClick={() => setMobileMenuOpen(false)}>Home</Link>
            )}
          </li>
          <li>
            {isHomepage ? (
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            ) : (
              <Link to="/#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            )}
          </li>
          <li>
            {isHomepage ? (
              <a href="#integrations" onClick={() => setMobileMenuOpen(false)}>Integrations</a>
            ) : (
              <Link to="/#integrations" onClick={() => setMobileMenuOpen(false)}>Integrations</Link>
            )}
          </li>
          <li>
            {isHomepage ? (
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            ) : (
              <Link to="/#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            )}
          </li>
          <li>
            <Link to="/docs" viewTransition onClick={() => setMobileMenuOpen(false)}>Documentation</Link>
          </li>
          <li>
            <span className={styles.mobileLabel}>Explore</span>
            <div className={styles.mobileExploreList}>
              <Link to="/about" viewTransition onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link to="/privacy" viewTransition onClick={() => setMobileMenuOpen(false)}>Privacy Policy</Link>
              <Link to="/terms" viewTransition onClick={() => setMobileMenuOpen(false)}>Terms of Service</Link>
            </div>
          </li>
        </ul>
        <div className={styles.mobileActions}>
          {!isInstalled && (
            <button
              className={styles.btnSignIn}
              onClick={() => {
                installPwa();
                setMobileMenuOpen(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              aria-label="Install ObserveX App"
            >
              <Download size={16} />
              <span>Install App</span>
            </button>
          )}
          <button className={styles.btnSignIn} onClick={() => { navigate("/login", { viewTransition: true }); setMobileMenuOpen(false); }}>
            Login
          </button>
          <button className={styles.btnRegister} onClick={() => { goOnboard(); setMobileMenuOpen(false); }}>
            Get Started →
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
