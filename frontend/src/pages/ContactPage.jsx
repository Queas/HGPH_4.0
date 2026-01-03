import React from 'react';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

function ContactPage({ showToast }) {
  return (
    <>
      <Contact showToast={showToast} />
      <Footer />
    </>
  );
}

export default ContactPage;
