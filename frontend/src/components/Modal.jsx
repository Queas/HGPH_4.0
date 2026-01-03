import React from 'react';
import Comments from './Comments';

const categoryLabels = {
  plants: 'Medicinal Plant',
  marine: 'Marine Animal',
  practices: 'Healing Practice',
  healers: 'Traditional Healer'
};

function Modal({ item, onClose }) {
  if (!item) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Check if this is an article (has excerpt and readTime)
  const isArticle = item.excerpt && item.readTime;

  return (
    <div className="modal active" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-body">
          <div className="modal-header">{item.icon}</div>
          <div className="modal-body-content">
            {isArticle ? (
              // Article modal
              <>
                <span className="modal-category">{item.category}</span>
                <h2 className="modal-title">{item.title}</h2>
                <p className="modal-description">{item.excerpt}</p>
                
                <div className="modal-section">
                  <h4>Article Details</h4>
                  <p style={{ color: 'var(--gray-600)' }}>📅 {item.date}</p>
                  <p style={{ color: 'var(--gray-600)' }}>⏱️ {item.readTime}</p>
                </div>
              </>
            ) : (
              // Library item modal
              <>
                <span className="modal-category">{categoryLabels[item.category]}</span>
                <h2 className="modal-title">{item.title}</h2>
                {item.scientific && (
                  <p className="modal-scientific">{item.scientific}</p>
                )}
                <p className="modal-description">
                  {item.fullDescription || item.description}
                </p>
                
                {item.uses && item.uses.length > 0 && (
                  <div className="modal-section">
                    <h4>Common Uses</h4>
                    <div className="modal-tags">
                      {item.uses.map((use, i) => (
                        <span key={i} className="modal-tag">{use}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.tags && item.tags.length > 0 && (
                  <div className="modal-section">
                    <h4>Tags</h4>
                    <div className="modal-tags">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="modal-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.region && (
                  <div className="modal-section">
                    <h4>Region</h4>
                    <p style={{ color: 'var(--gray-600)' }}>📍 {item.region}</p>
                  </div>
                )}
              </>
            )}

            {/* Comments Section */}
            <Comments 
              itemId={item.id || item.title} 
              itemType={isArticle ? 'article' : 'library'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
