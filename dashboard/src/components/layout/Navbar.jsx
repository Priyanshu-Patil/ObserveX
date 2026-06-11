import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import styles from "../../styles/modules/pages/LandingPage.module.scss";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomepage = location.pathname === "/";
  const goOnboard = () => navigate("/onboard-super-admin");

  return (
    <>
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
            {isHomepage ? (
              <a href="#homepage">Home</a>
            ) : (
              <Link to="/">Home</Link>
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
              <a href="#docs">Documentation</a>
            ) : (
              <Link to="/#docs">Documentation</Link>
            )}
          </li>
          <li className={styles.navDropdownContainer}>
            <button className={styles.navDropdownTrigger}>
              Explore <ChevronDown size={14} className={styles.dropdownChevron} />
            </button>
            <div className={styles.navDropdownMenu}>
              <Link to="/about">About Us</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </li>
        </ul>

        <div className={styles.navActions}>
          <button className={styles.navSignIn} onClick={() => navigate("/login")}>
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
          {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </nav>

      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ""}`}>
        <ul className={styles.mobileNavLinks}>
          <li>
            {isHomepage ? (
              <a href="#homepage" onClick={() => setMobileMenuOpen(false)}>Home</a>
            ) : (
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
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
              <a href="#docs" onClick={() => setMobileMenuOpen(false)}>Documentation</a>
            ) : (
              <Link to="/#docs" onClick={() => setMobileMenuOpen(false)}>Documentation</Link>
            )}
          </li>
          <li>
            <span className={styles.mobileLabel}>Explore</span>
            <div className={styles.mobileExploreList}>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link to="/privacy" onClick={() => setMobileMenuOpen(false)}>Privacy Policy</Link>
              <Link to="/terms" onClick={() => setMobileMenuOpen(false)}>Terms of Service</Link>
            </div>
          </li>
        </ul>
        <div className={styles.mobileActions}>
          <button className={styles.btnSignIn} onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>
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
