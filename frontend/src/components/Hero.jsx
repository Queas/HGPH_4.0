import React, { useState, useEffect } from 'react';
import { libraryAPI } from '../services/api';

function Hero() {
  const [stats, setStats] = useState({
    plants: 0,
    marine: 0,
    practices: 0,
    healers: 0
  });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await libraryAPI.getStats();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use fallback data
        setStats({ plants: 10, marine: 6, practices: 6, healers: 6 });
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero">
      <div className="hero-bg"></div>
      <div className="container hero-content">
        <div className="hero-badge">🇵🇭 Proudly Filipino</div>
        <h1 className="hero-title">
          Science-Based<br />
          <span className="text-gradient">Philippine Herbal</span><br />
          Knowledge
        </h1>
        <p className="hero-subtitle">
          Preserving centuries of traditional medicine through modern digital learning. 
          Discover the healing power of Philippine flora and fauna.
        </p>
        <div className="hero-actions">
          <a href="#library" className="btn btn-primary btn-lg" onClick={(e) => scrollToSection(e, 'library')}>Explore Library</a>
          <a href="#about" className="btn btn-ghost btn-lg" onClick={(e) => scrollToSection(e, 'about')}>Learn More</a>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">
              {animated ? stats.plants : 0}+
            </span>
            <span className="stat-label">Medicinal Plants</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {animated ? stats.marine : 0}+
            </span>
            <span className="stat-label">Marine Species</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {animated ? (stats.practices + stats.healers) : 0}+
            </span>
            <span className="stat-label">Healing Practices</span>
          </div>
        </div>
      </div>
      <div className="scroll-indicator">
        <span>Scroll to explore</span>
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
}

export default Hero;
