import React from 'react';

const Footer = ({ onScrollToSection }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Company Info */}
          <div className="col-md-6 col-lg-3">
            <h5 className="fw-bold mb-3">MTM Digital</h5>
            <p className="text-muted">
              Transforming businesses with innovative digital solutions and cutting-edge technology.
            </p>
            <div className="pt-3">
              <a href="#" className="text-white me-3">f</a>
              <a href="#" className="text-white me-3">𝕏</a>
              <a href="#" className="text-white me-3">in</a>
              <a href="#" className="text-white">📷</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-md-6 col-lg-3">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><button onClick={() => onScrollToSection('home')} className="btn btn-link btn-sm text-white p-0">Home</button></li>
              <li className="mb-2"><button onClick={() => onScrollToSection('about')} className="btn btn-link btn-sm text-white p-0">About Us</button></li>
              <li className="mb-2"><button onClick={() => onScrollToSection('contact')} className="btn btn-link btn-sm text-white p-0">Contact</button></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">FAQ</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-md-6 col-lg-2">
            <h5 className="fw-bold mb-3">Company</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">About</a></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Blog</a></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Careers</a></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-md-6 col-lg-2">
            <h5 className="fw-bold mb-3">Legal</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Terms of Service</a></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Cookie Policy</a></li>
              <li className="mb-2"><a href="#" className="text-white text-decoration-none">Disclaimer</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-md-6 col-lg-2">
            <h5 className="fw-bold mb-3">Newsletter</h5>
            <p className="text-muted text-sm">Subscribe for updates</p>
            <form>
              <div className="input-group input-group-sm">
                <input 
                  type="email" 
                  className="form-control"
                  placeholder="Your email"
                  required
                />
                <button className="btn btn-primary btn-sm" type="submit">Go</button>
              </div>
            </form>
          </div>
        </div>

        <hr className="bg-secondary" />

        {/* Footer Bottom */}
        <div className="text-center text-muted">
          <p className="mb-1">&copy; {currentYear} MTM Digital Platform. All rights reserved.</p>
          <p className="mb-0">Crafted with ❤️ for businesses worldwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
