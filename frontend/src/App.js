import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Library from './components/Library';
import Articles from './components/Articles';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import Professional from './components/Professional';
import Toast from './components/Toast';
import Loader from './components/Loader';
import { AuthProvider } from './contexts/AuthContext';
import './styles/App.css';

// Back to Top Button Component
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.pageYOffset > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`back-to-top ${visible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m18 15-6-6-6 6"/>
      </svg>
    </button>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' or 'register'
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'admin', or 'professional'
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const openModal = (item) => {
    setModalData(item);
    document.body.classList.add('no-scroll');
  };

  const closeModal = () => {
    setModalData(null);
    document.body.classList.remove('no-scroll');
  };

  const showToast = (message, type = 'default') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAuthModal = (type) => {
    setAuthModal(type);
    document.body.classList.add('no-scroll');
  };

  const closeAuthModal = () => {
    setAuthModal(null);
    document.body.classList.remove('no-scroll');
  };

  const navigateToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthProvider>
      <div className="app">
        <Navbar onAuthClick={openAuthModal} onNavigate={navigateToPage} />
        
        {currentPage === 'home' && (
          <>
            <Hero />
            <About />
            <Library onItemClick={openModal} />
            <Articles onItemClick={openModal} />
            <Contact showToast={showToast} />
            <Footer />
          </>
        )}
        
        {currentPage === 'admin' && <AdminDashboard />}
        
        {currentPage === 'professional' && <Professional />}
        
        {modalData && (
          <Modal item={modalData} onClose={closeModal} />
        )}
        
        {authModal === 'login' && (
          <Login 
            onClose={closeAuthModal} 
            onSwitchToRegister={() => setAuthModal('register')} 
          />
        )}
        
        {authModal === 'register' && (
          <Register 
            onClose={closeAuthModal} 
            onSwitchToLogin={() => setAuthModal('login')} 
          />
        )}
        
        {toast && (
          <Toast message={toast.message} type={toast.type} />
        )}
        
        <BackToTop />
      </div>
    </AuthProvider>
  );
}

export default App;
