// HalamangGaling PH - Main Application
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  initLoader();
  initNavigation();
  initHeroAnimations();
  initLibrary();
  initArticles();
  initContactForm();
  initScrollEffects();
  initModal();
});

// ========================================
// Loader
// ========================================
function initLoader() {
  const loader = document.getElementById('loader');
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('no-scroll');
      
      // Trigger hero animations after loader
      animateHeroElements();
    }, 500);
  });
}

// ========================================
// Navigation
// ========================================
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Scroll effect for navbar
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
  
  // Hamburger menu toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
  
  // Close menu when clicking overlay
  mobileOverlay.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
  
  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  });
  
  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        // Close mobile menu if open
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        
        // Scroll to section
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ========================================
// Hero Animations
// ========================================
function initHeroAnimations() {
  // Set initial styles for hero content
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(30px)';
    heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
  }
  
  // Counter animation for stats
  const counters = document.querySelectorAll('.stat-number[data-count]');
  
  const animateCounter = (counter) => {
    const target = parseInt(counter.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };
    
    updateCounter();
  };
  
  // Intersection Observer for counters
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => counterObserver.observe(counter));
}

function animateHeroElements() {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '1';
    heroContent.style.transform = 'translateY(0)';
  }
}

// ========================================
// Library
// ========================================
function initLibrary() {
  const libraryGrid = document.getElementById('libraryGrid');
  const searchInput = document.getElementById('searchInput');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const libraryEmpty = document.getElementById('libraryEmpty');
  
  let currentFilter = 'all';
  let searchQuery = '';
  
  // Render library cards
  function renderLibrary() {
    const filteredData = libraryData.filter(item => {
      const matchesFilter = currentFilter === 'all' || item.category === currentFilter;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesFilter && matchesSearch;
    });
    
    if (filteredData.length === 0) {
      libraryGrid.innerHTML = '';
      libraryEmpty.style.display = 'block';
      return;
    }
    
    libraryEmpty.style.display = 'none';
    
    libraryGrid.innerHTML = filteredData.map((item, index) => `
      <div class=\"library-card animate-fade-in-up delay-${(index % 5) * 100}\" data-id=\"${item.id}\" onclick=\"openModal(${item.id})\">
        <div class=\"card-image\">${item.icon}</div>
        <div class=\"card-content\">
          <span class=\"card-category\">${getCategoryLabel(item.category)}</span>
          <h3 class=\"card-title\">${item.title}</h3>
          ${item.scientific ? `<p class=\"card-scientific\">${item.scientific}</p>` : ''}
          <p class=\"card-description\">${item.description}</p>
          <div class=\"card-tags\">
            ${item.tags.slice(0, 3).map(tag => `<span class=\"card-tag\">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Filter tabs click handler
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      renderLibrary();
    });
  });
  
  // Search input handler with debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      renderLibrary();
    }, 300);
  });
  
  // Initial render
  renderLibrary();
}

function getCategoryLabel(category) {
  const labels = {
    plants: 'Medicinal Plant',
    marine: 'Marine Animal',
    practices: 'Healing Practice',
    healers: 'Traditional Healer'
  };
  return labels[category] || category;
}

// ========================================
// Articles
// ========================================
function initArticles() {
  const articlesGrid = document.getElementById('articlesGrid');
  
  articlesGrid.innerHTML = articlesData.map((article, index) => `
    <article class=\"article-card animate-fade-in-up delay-${(index % 3) * 100}\">
      <div class=\"article-image\">${article.icon}</div>
      <div class=\"article-content\">
        <div class=\"article-meta\">
          <span class=\"article-category\">${article.category}</span>
          <span class=\"article-date\">📅 ${article.date}</span>
          <span>⏱️ ${article.readTime}</span>
        </div>
        <h3 class=\"article-title\">${article.title}</h3>
        <p class=\"article-excerpt\">${article.excerpt}</p>
        <a href=\"#\" class=\"article-link\">
          Read More
          <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">
            <path d=\"m9 18 6-6-6-6\"/>
          </svg>
        </a>
      </div>
    </article>
  `).join('');
}

// ========================================
// Contact Form
// ========================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Simulate form submission
    showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
    form.reset();
  });
}

// ========================================
// Scroll Effects
// ========================================
function initScrollEffects() {
  const backToTop = document.getElementById('backToTop');
  
  // Back to top button visibility
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
  
  // Back to top click
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // Animate elements on scroll
  const animateElements = document.querySelectorAll('.about-card, .library-card, .article-card');
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    scrollObserver.observe(el);
  });
}

// ========================================
// Modal
// ========================================
function initModal() {
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  
  // Close modal handlers
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(id) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const item = libraryData.find(i => i.id === id);
  
  if (!item) return;
  
  modalBody.innerHTML = `
    <div class=\"modal-header\">${item.icon}</div>
    <div class=\"modal-body-content\">
      <span class=\"modal-category\">${getCategoryLabel(item.category)}</span>
      <h2 class=\"modal-title\">${item.title}</h2>
      ${item.scientific ? `<p class=\"modal-scientific\">${item.scientific}</p>` : ''}
      <p class=\"modal-description\">${item.fullDescription || item.description}</p>
      
      ${item.uses ? `
        <div class=\"modal-section\">
          <h4>Common Uses</h4>
          <div class=\"modal-tags\">
            ${item.uses.map(use => `<span class=\"modal-tag\">${use}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${item.tags ? `
        <div class=\"modal-section\">
          <h4>Tags</h4>
          <div class=\"modal-tags\">
            ${item.tags.map(tag => `<span class=\"modal-tag\">${tag}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${item.region ? `
        <div class=\"modal-section\">
          <h4>Region</h4>
          <p style=\"color: var(--gray-600);\">📍 ${item.region}</p>
        </div>
      ` : ''}
    </div>
  `;
  
  modal.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

// Make openModal globally accessible
window.openModal = openModal;

// ========================================
// Toast Notifications
// ========================================
function showToast(message, type = 'default') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ========================================
// Login Button (Placeholder)
// ========================================
document.getElementById('loginBtn')?.addEventListener('click', () => {
  showToast('Login feature coming soon!', 'default');
});
