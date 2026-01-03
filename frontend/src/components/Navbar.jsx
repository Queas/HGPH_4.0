import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

function Navbar({ onAuthClick, onNavigate, currentPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.classList.toggle('no-scroll');
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove('no-scroll');
  };

  const navigateTo = (page) => {
    closeMenu();
    if (onNavigate) {
      onNavigate(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a 
            href="#home" 
            className="nav-logo" 
            onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
          >
            <img 
              src={logo}
              alt="HalamangGaling PH Logo" 
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline-block';
              }}
            />
            <span className="logo-icon" style={{display: 'none'}}>🌿</span>
            <span className="logo-text">HalamangGaling<span className="logo-accent">PH</span></span>
          </a>
          
          <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
            <li>
              <a 
                href="#home" 
                className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigateTo('about'); }}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#library" 
                className={`nav-link ${currentPage === 'library' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigateTo('library'); }}
              >
                Library
              </a>
            </li>
            <li>
              <a 
                href="#articles" 
                className={`nav-link ${currentPage === 'articles' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigateTo('articles'); }}
              >
                Articles
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}
              >
                Contact
              </a>
            </li>
            {isAuthenticated() && (user?.role === 'professional' || user?.role === 'admin') && (
              <li>
                <a 
                  href="#professional" 
                  className={`nav-link nav-link-special ${currentPage === 'professional' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); navigateTo('professional'); }}
                >
                  Professional
                </a>
              </li>
            )}
            {isAuthenticated() && user?.role === 'admin' && (
              <li>
                <a 
                  href="#admin" 
                  className={`nav-link nav-link-admin ${currentPage === 'admin' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); navigateTo('admin'); }}
                >
                  Admin
                </a>
              </li>
            )}
          </ul>

          <div className="nav-actions">
            {isAuthenticated() ? (
              <div className="user-menu">
                <span className="user-greeting">
                  <span className="user-role-badge">{user.role}</span>
                  {user.username}
                </span>
                <button className="btn btn-outline" onClick={logout}>Logout</button>
              </div>
            ) : (
              <>
                <button 
                  className="btn btn-outline" 
                  onClick={() => onAuthClick && onAuthClick('login')}
                >
                  Login
                </button>
                <button 
                  className="btn btn-primary btn-signup" 
                  onClick={() => onAuthClick && onAuthClick('register')}
                >
                  Sign Up
                </button>
              </>
            )}
            <button 
              className={`hamburger ${menuOpen ? 'active' : ''}`} 
              onClick={toggleMenu}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
      
      <div 
        className={`mobile-overlay ${menuOpen ? 'active' : ''}`} 
        onClick={closeMenu}
      ></div>
    </>
  );
}

export default Navbar;
