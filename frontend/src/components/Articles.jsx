import React from 'react';
import articlesData from '../data/articlesData';

function Articles({ onItemClick }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section id="articles" className="section articles">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Articles</span>
          <h2 className="section-title">Latest Research & Insights</h2>
          <p className="section-subtitle">
            Stay updated with the latest in Philippine herbal medicine research
          </p>
        </div>

        <div className="articles-grid">
          {articlesData.map((article, index) => (
            <article
              key={index}
              className="article-card"
              style={{ animationDelay: `${(index % 6) * 100}ms` }}
              onClick={() => onItemClick && onItemClick(article)}
            >
              <div className="article-image">{article.icon}</div>
              <div className="article-content">
                <div className="article-meta">
                  <span className="article-category">{article.category}</span>
                  <span className="article-date">📅 {formatDate(new Date())}</span>
                  <span>⏱️ {article.readTime}</span>
                </div>
                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.excerpt}</p>
                <a href="#" className="article-link" onClick={(e) => e.preventDefault()}>
                  Read More
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Articles;
