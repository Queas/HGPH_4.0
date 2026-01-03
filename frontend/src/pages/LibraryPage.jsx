import React from 'react';
import Library from '../components/Library';
import Footer from '../components/Footer';

function LibraryPage({ onItemClick }) {
  return (
    <>
      <Library onItemClick={onItemClick} />
      <Footer />
    </>
  );
}

export default LibraryPage;
