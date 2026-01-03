import React from 'react';

function Footer() {
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="nav-logo" onClick={(e) => scrollToSection(e, 'home')}>
              <span className="logo-icon">🌿</span>
              <span className="logo-text">HalamangGaling<span className="logo-accent">PH</span></span>
            </a>
            <p>Preserving Philippine traditional medicine through digital innovation.</p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="Twitter">🐦</a>
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
              <a href="#" className="social-link" aria-label="YouTube">▶️</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home" onClick={(e) => scrollToSection(e, 'home')}>Home</a></li>
              <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About Us</a></li>
              <li><a href="#library" onClick={(e) => scrollToSection(e, 'library')}>Library</a></li>
              <li><a href="#articles" onClick={(e) => scrollToSection(e, 'articles')}>Articles</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Categories</h4>
            <ul>
              <li><a href="#library">Medicinal Plants</a></li>
              <li><a href="#library">Marine Animals</a></li>
              <li><a href="#library">Healing Practices</a></li>
              <li><a href="#library">Traditional Healers</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Contact Us</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 HalamangGaling PH. All rights reserved.</p>
          <p>Made with 💚 in the Philippines</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
