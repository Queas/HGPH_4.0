import React from 'react';

const collaborators = [
  'University of the Philippines',
  'Department of Health',
  'DOST-PCHRD',
  'National Museum PH',
  'UPLB College of Forestry',
  'Philippine Institute of Traditional Medicine'
];

function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">About Us</span>
          <h2 className="section-title">Bridging Tradition & Technology</h2>
          <p className="section-subtitle">
            We're on a mission to preserve and share the rich heritage of Philippine traditional medicine
          </p>
        </div>
        
        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>
              To educate and preserve the knowledge of Philippine medicinal plants through 
              accessible digital platforms, ensuring this wisdom reaches future generations.
            </p>
          </div>
          <div className="about-card">
            <div className="about-icon">👁️</div>
            <h3>Our Vision</h3>
            <p>
              A world where traditional medicine is respected, researched, and integrated 
              alongside modern healthcare for holistic wellness.
            </p>
          </div>
          <div className="about-card">
            <div className="about-icon">🤝</div>
            <h3>Our Commitment</h3>
            <p>
              Working with researchers, healers, and communities to document, validate, 
              and share authentic traditional healing knowledge.
            </p>
          </div>
        </div>

        <div className="collaborators-section">
          <h3 className="collab-title">Trusted By Leading Institutions</h3>
          <div className="collab-slider">
            <div className="collab-track">
              {[...collaborators, ...collaborators].map((name, index) => (
                <div key={index} className="collab-item">{name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
