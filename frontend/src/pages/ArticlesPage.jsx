import React from 'react';
import Articles from '../components/Articles';
import Footer from '../components/Footer';

function ArticlesPage({ onItemClick }) {
  return (
    <>
      <Articles onItemClick={onItemClick} />
      <Footer />
    </>
  );
}

export default ArticlesPage;
