import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <Header onNavigate={navigate} onScrollToSection={scrollToSection} />

      {/* Hero Section */}
      <section id="home" className="py-5" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', minHeight: '600px' }}>
        <div className="container">
          <div className="row align-items-center" style={{ minHeight: '500px' }}>
            <div className="col-lg-6 text-white mb-4 mb-lg-0">
              <div style={{ display: 'inline-block', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 30, padding: '5px 16px', marginBottom: 16, fontSize: '0.82rem', color: '#a78bfa', fontWeight: 600 }}>
                🕉️ Mauritius Telugu Mahasabha
              </div>
              <h1 className="display-4 fw-bold mb-4">
                Your Community,<br />Digitally Connected
              </h1>
              <p className="lead mb-4" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                Join MTM's digital platform — manage your membership, register for events,
                connect with the Telugu community in Mauritius, and access exclusive member benefits.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-lg"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 12, padding: '0.75rem 1.8rem' }}
                  onClick={() => navigate('/membership/apply')}
                >
                  🎫 Apply for Membership
                </button>
                <button
                  className="btn btn-lg"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '0.75rem 1.8rem' }}
                  onClick={() => navigate('/auth/signin')}
                >
                  Sign In
                </button>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div style={{ fontSize: '160px', filter: 'drop-shadow(0 0 40px rgba(167,139,250,0.3))' }}>🕉️</div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: -8 }}>Mauritius Telugu Mahasabha</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">About MTM Platform</h2>
            <p className="lead text-muted">Empowering businesses with cutting-edge solutions</p>
          </div>

          {/* Features Grid */}
          <div className="row g-4 mb-5">
            {[
              { icon: '🚀', title: 'Lightning Fast', desc: 'Experience blazing-fast performance with our optimized infrastructure and modern technology stack.' },
              { icon: '🔒', title: 'Secure & Safe', desc: 'Enterprise-grade security with end-to-end encryption and compliance with international standards.' },
              { icon: '📊', title: 'Data Analytics', desc: 'Real-time insights and comprehensive analytics to help you make informed business decisions.' },
              { icon: '👥', title: 'User Friendly', desc: 'Intuitive interface designed with user experience in mind for seamless interaction.' },
              { icon: '🌐', title: 'Global Reach', desc: 'Access your platform from anywhere in the world with our cloud-based infrastructure.' },
              { icon: '⚙️', title: '24/7 Support', desc: 'Round-the-clock customer support to assist you whenever you need help.' }
            ].map((feature, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body text-center">
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feature.icon}</div>
                    <h5 className="card-title fw-bold">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Why Choose Us Section */}
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <h3 className="fw-bold mb-3">Why Choose Us?</h3>
              <p className="text-muted mb-4">
                MTM Digital Platform is built on years of expertise and industry best practices.
                We combine cutting-edge technology with user-centric design to deliver solutions
                that truly make a difference.
              </p>
              <ul className="list-unstyled">
                <li className="mb-2"><span className="text-success fw-bold">✓</span> Proven track record with 1000+ satisfied customers</li>
                <li className="mb-2"><span className="text-success fw-bold">✓</span> Industry-leading uptime of 99.9%</li>
                <li className="mb-2"><span className="text-success fw-bold">✓</span> Continuous innovation and regular updates</li>
                <li className="mb-2"><span className="text-success fw-bold">✓</span> Flexible pricing plans for all business sizes</li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="row g-3 text-center">
                {[
                  { num: '1000+', label: 'Active Users' },
                  { num: '99.9%', label: 'Uptime' },
                  { num: '50+', label: 'Countries' },
                  { num: '24/7', label: 'Support' }
                ].map((stat, idx) => (
                  <div key={idx} className="col-6">
                    <div className="p-4 bg-light rounded">
                      <h4 className="fw-bold text-primary mb-2">{stat.num}</h4>
                      <p className="text-muted mb-0">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Get In Touch</h2>
            <p className="lead text-muted">We'd love to hear from you. Send us a message!</p>
          </div>

          <div className="row g-4">
            {/* Contact Info */}
            <div className="col-lg-5">
              <div className="mb-4">
                <h5 className="fw-bold">📍 Address</h5>
                <p className="text-muted">123 Innovation Street<br />Tech City, TC 12345<br />United States</p>
              </div>

              <div className="mb-4">
                <h5 className="fw-bold">📞 Phone</h5>
                <p className="text-muted">+1 (555) 123-4567<br />+1 (555) 987-6543</p>
              </div>

              <div className="mb-4">
                <h5 className="fw-bold">📧 Email</h5>
                <p className="text-muted">support@mtmplatform.com<br />hello@mtmplatform.com</p>
              </div>

              <div>
                <h5 className="fw-bold">🕒 Business Hours</h5>
                <p className="text-muted">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday - Sunday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-7">
              <form className="bg-white p-4 rounded shadow-sm">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Your Name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    id="message"
                    placeholder="Your message here..."
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer onScrollToSection={scrollToSection} />
    </div>
  );
};

export default LandingPage;
