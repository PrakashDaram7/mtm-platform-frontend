import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onNavigate, onScrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleScroll = (sectionId) => {
    setIsMenuOpen(false);
    onScrollToSection(sectionId);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <a className="navbar-brand fw-bold" href="#" onClick={() => handleScroll('home')}>
          <span style={{ color: '#667eea' }}>MTM</span> <span className="text-muted small">Digital</span>
        </a>
        
        <button 
          className="navbar-toggler"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button 
                className="nav-link btn btn-link"
                onClick={() => handleScroll('home')}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link btn btn-link"
                onClick={() => handleScroll('about')}
              >
                About
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link btn btn-link"
                onClick={() => handleScroll('contact')}
              >
                Contact
              </button>
            </li>
          </ul>
          <button 
            className="btn btn-primary ms-3"
            onClick={() => handleNavigation('/auth/signin')}
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
