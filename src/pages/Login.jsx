import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const authenticatedUser = await login(formData.email, formData.password);
      const redirectPath = location.state?.from?.pathname || (authenticatedUser?.isAdmin ? '/admin/dashboard' : '/profile');
      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <motion.div className="page auth-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="content-container auth-shell">
        <motion.div className="auth-copy" variants={itemVariants}>
          <span className="auth-kicker">Welcome back</span>
          <h1>
            Login to <span className="highlight">ShopNest</span>
          </h1>
          <p className="lead auth-lead">
            Access your account to continue shopping, manage your details, and pick up where you left off.
          </p>
        </motion.div>

        <motion.div className="auth-card" variants={itemVariants}>
          <div className="auth-card-header">
            <div className="auth-card-icon">
              <LogIn size={20} />
            </div>
            <div>
              <h2>Sign in</h2>
              <p>Use your email and password to continue.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>

            {error ? <p className="form-message error">{error}</p> : null}

            <motion.button type="submit" className="btn primary-btn auth-submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              Login
            </motion.button>
          </form>

          <p className="auth-switch">
            New to ShopNest? <Link to="/signup">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
