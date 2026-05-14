import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 110, damping: 14 },
  },
};

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await signup(formData);
      navigate('/login', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <motion.div className="page auth-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="content-container auth-shell">
        <motion.div className="auth-copy" variants={itemVariants}>
          <span className="auth-kicker">Create an account</span>
          <h1>
            Join <span className="highlight">ShopNest</span>
          </h1>
          <p className="lead auth-lead">
            Save your details locally, access your profile anytime, and keep the storefront experience consistent.
          </p>
        </motion.div>

        <motion.div className="auth-card" variants={itemVariants}>
          <div className="auth-card-header">
            <div className="auth-card-icon">
              <UserPlus size={20} />
            </div>
            <div>
              <h2>Sign up</h2>
              <p>Set up your account in just a moment.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>Password</span>
              <PasswordInput
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>

            {error ? <p className="form-message error">{error}</p> : null}

            <motion.button type="submit" className="btn primary-btn auth-submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              Create Account
            </motion.button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Signup;
