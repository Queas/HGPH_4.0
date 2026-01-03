import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Navbar({ onAuthClick, onNavigate }) {
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

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    closeMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#home" className="nav-logo" onClick={(e) => scrollToSection(e, 'home')}>
            <span className="logo-icon">🌿</span>
            <span className="logo-text">HalamangGaling<span className="logo-accent">PH</span></span>
          </a>
          
          <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
            <li><a href="#home" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); scrollToSection(e, 'home'); }}>Home</a></li>
            <li><a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); scrollToSection(e, 'about'); }}>About</a></li>
            <li><a href="#library" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); scrollToSection(e, 'library'); }}>Library</a></li>
            <li><a href="#articles" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); scrollToSection(e, 'articles'); }}>Articles</a></li>
            <li><a href="#contact" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); scrollToSection(e, 'contact'); }}>Contact</a></li>
            {isAuthenticated() && (user?.role === 'professional' || user?.role === 'admin') && (
              <li><a href="#professional" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('professional'); }}>Professional</a></li>
            )}
            {isAuthenticated() && user?.role === 'admin' && (
              <li><a href="#admin" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('admin'); }}>Admin</a></li>
            )}
          </ul>

          <div className="nav-actions">
            {isAuthenticated() ? (
              <div className="user-menu">
                <span className="user-greeting">Hello, {user.username}!</span>
                <button className="btn btn-outline" onClick={logout}>Logout</button>
              </div>
            ) : (
              <button className="btn btn-outline" onClick={() => onAuthClick && onAuthClick('login')}>Login</button>
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
