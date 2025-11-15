import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="header-title">
          <i className="bi bi-images"></i>
          Smart Photo Album
        </h1>
        <p className="header-subtitle">Search your photos using natural language</p>
      </div>
      <div className="header-gradient"></div>
    </header>
  );
};

export default Header;

