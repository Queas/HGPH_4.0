import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { libraryAPI, articlesAPI } from '../services/api';

function Professional() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [libraryItems, setLibraryItems] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    category: '',
    scientific: '',
    icon: '',
    uses: [],
    tags: [],
    region: ''
  });

  useEffect(() => {
    if (user?.role === 'professional' || user?.role === 'admin') {
      fetchContent();
    }
  }, [user, activeTab]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      if (activeTab === 'library') {
        const response = await libraryAPI.getAll({ limit: 100 });
        if (response.data.success) {
          setLibraryItems(response.data.data);
        }
      } else {
        const response = await articlesAPI.getAll({ limit: 100 });
        if (response.data.success) {
          setArticles(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'library') {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        fullDescription: item.fullDescription || '',
        category: item.category || '',
        scientific: item.scientific || '',
        icon: item.icon || '',
        uses: item.uses || [],
        tags: item.tags || [],
        region: item.region || ''
      });
    } else {
      setFormData({
        title: item.title || '',
        excerpt: item.excerpt || '',
        content: item.content || '',
        category: item.category || '',
        icon: item.icon || '',
        readTime: item.readTime || ''
      });
    }
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(activeTab === 'library' ? {
      title: '',
      description: '',
      fullDescription: '',
      category: '',
      scientific: '',
      icon: '',
      uses: [],
      tags: [],
      region: ''
    } : {
      title: '',
      excerpt: '',
      content: '',
      category: '',
      icon: '',
      readTime: ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update existing item
        if (activeTab === 'library') {
          await libraryAPI.update(editingItem._id, formData, token);
        } else {
          await articlesAPI.update(editingItem._id, formData, token);
        }
      } else {
        // Create new item
        if (activeTab === 'library') {
          await libraryAPI.create(formData, token);
        } else {
          await articlesAPI.create(formData, token);
        }
      }
      setShowForm(false);
      fetchContent();
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'library') {
        // Note: We might not have delete endpoint for library items
        console.log('Delete library item:', itemId);
      } else {
        // Note: We might not have delete endpoint for articles
        console.log('Delete article:', itemId);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  if (user?.role !== 'professional' && user?.role !== 'admin') {
    return (
      <div className="professional-access-denied">
        <div className="container">
          <div className="access-denied-content">
            <h2>Access Denied</h2>
            <p>You need professional or administrator privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="professional" className="section professional">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Professional</span>
          <h2 className="section-title">Content Management</h2>
          <p className="section-subtitle">
            Create and manage medical content for HalamangGaling PH
          </p>
        </div>

        <div className="professional-tabs">
          <button
            className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            Library Items
          </button>
          <button
            className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            Articles
          </button>
        </div>

        <div className="professional-actions">
          <button className="btn btn-primary" onClick={handleCreate}>
            Add New {activeTab === 'library' ? 'Library Item' : 'Article'}
          </button>
        </div>

        {showForm && (
          <div className="professional-form-modal">
            <div className="professional-form-content">
              <div className="form-header">
                <h3>{editingItem ? 'Edit' : 'Create'} {activeTab === 'library' ? 'Library Item' : 'Article'}</h3>
                <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="professional-form">
                {activeTab === 'library' ? (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Title *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Category *</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="plants">Medicinal Plants</option>
                          <option value="marine">Marine Resources</option>
                          <option value="practices">Healing Practices</option>
                          <option value="healers">Traditional Healers</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Full Description</label>
                      <textarea
                        value={formData.fullDescription}
                        onChange={(e) => setFormData({...formData, fullDescription: e.target.value})}
                        rows="5"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Scientific Name</label>
                        <input
                          type="text"
                          value={formData.scientific}
                          onChange={(e) => setFormData({...formData, scientific: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Icon (Emoji)</label>
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({...formData, icon: e.target.value})}
                          placeholder="🌿"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Region</label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        placeholder="Nationwide"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Title *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Category *</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Research">Research</option>
                          <option value="Health">Health</option>
                          <option value="Culture">Culture</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Excerpt *</label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        required
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Content *</label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        required
                        rows="10"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Icon (Emoji)</label>
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({...formData, icon: e.target.value})}
                          placeholder="🔬"
                        />
                      </div>
                      <div className="form-group">
                        <label>Read Time</label>
                        <input
                          type="text"
                          value={formData.readTime}
                          onChange={(e) => setFormData({...formData, readTime: e.target.value})}
                          placeholder="5 min read"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="professional-content">
          {loading ? (
            <div className="professional-loading">
              <div className="leaf-spinner"></div>
              <p>Loading content...</p>
            </div>
          ) : (
            <div className="professional-grid">
              {(activeTab === 'library' ? libraryItems : articles).map((item) => (
                <div key={item._id} className="professional-card">
                  <div className="card-header">
                    <span className="card-icon">{item.icon}</span>
                    <span className="card-category">{item.category}</span>
                  </div>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-description">
                    {activeTab === 'library' ? item.description : item.excerpt}
                  </p>
                  <div className="card-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Professional;