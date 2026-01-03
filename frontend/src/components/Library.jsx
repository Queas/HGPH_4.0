import React, { useState, useEffect } from 'react';
import libraryData from '../data/libraryData';

const categoryLabels = {
  plants: 'Medicinal Plant',
  marine: 'Marine Animal',
  practices: 'Healing Practice',
  healers: 'Traditional Healer'
};

function Library({ onItemClick }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load items from local data
  useEffect(() => {
    const loadItems = () => {
      setLoading(true);
      
      // Filter items based on current filter and search
      let filteredItems = libraryData.filter(item => {
        const matchesFilter = filter === 'all' || item.category === filter;
        const matchesSearch = search === '' || 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        
        return matchesFilter && matchesSearch;
      });
      
      setItems(filteredItems);
      setLoading(false);
    };
    
    // Debounce the filtering
    const timer = setTimeout(loadItems, 300);
    return () => clearTimeout(timer);
  }, [filter, debouncedSearch]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'plants', label: 'Plants' },
    { key: 'marine', label: 'Marine' },
    { key: 'practices', label: 'Practices' },
    { key: 'healers', label: 'Healers' }
  ];

  return (
    <section id="library" className="section library">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Library</span>
          <h2 className="section-title">Explore Our Collection</h2>
          <p className="section-subtitle">
            Discover the healing treasures of the Philippine archipelago
          </p>
        </div>

        {/* Search and Filter */}
        <div className="library-controls">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search plants, animals, practices..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {filters.map(f => (
              <button 
                key={f.key}
                className={`filter-tab ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Library Grid */}
        {loading ? (
          <div className="library-loading">
            <div className="leaf-spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="library-empty">
            <div className="empty-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="library-grid">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="library-card"
                onClick={() => onItemClick(item)}
                style={{ animationDelay: `${(index % 8) * 50}ms` }}
              >
                <div className="card-image">{item.icon}</div>
                <div className="card-content">
                  <span className="card-category">{categoryLabels[item.category]}</span>
                  <h3 className="card-title">{item.title}</h3>
                  {item.scientific && (
                    <p className="card-scientific">{item.scientific}</p>
                  )}
                  <p className="card-description">{item.description}</p>
                  <div className="card-tags">
                    {item.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="card-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Library;
