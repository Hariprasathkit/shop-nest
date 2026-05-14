import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
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

const AdminSettings = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('New password and confirm password must match.');
      setSaving(false);
      return;
    }

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setFormData((previous) => ({ ...previous, password: '', confirmPassword: '' }));
      setMessage('Admin login details updated successfully.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="page admin-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="content-container admin-shell admin-two-column">
        <motion.div className="admin-hero" variants={itemVariants}>
          <span className="auth-kicker">Admin Settings</span>
          <h1>Update admin access</h1>
          <p className="lead auth-lead">
            Change the email used to sign in to the admin workspace and rotate the password when needed.
          </p>
        </motion.div>

        <motion.div className="admin-card" variants={itemVariants}>
          <div className="admin-section-header">
            <div className="admin-stat-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2>Login Details</h2>
              <p className="form-message">These changes apply to the currently logged-in admin account.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Name</span>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </label>

            <label className="form-field">
              <span>Admin Email</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </label>

            <label className="form-field">
              <span>New Password</span>
              <PasswordInput
                name="password"
                placeholder="Leave blank to keep current password"
                value={formData.password}
                onChange={handleChange}
              />
            </label>

            <label className="form-field">
              <span>Confirm Password</span>
              <PasswordInput
                name="confirmPassword"
                placeholder="Re-enter your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </label>

            {message ? <p className="form-message success">{message}</p> : null}
            {error ? <p className="form-message error">{error}</p> : null}

            <motion.button type="submit" className="btn primary-btn auth-submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Admin Details'}
            </motion.button>
          </form>
        </motion.div>

        <motion.div className="admin-card" variants={itemVariants}>
          <div className="profile-details compact">
            <div className="profile-detail-row">
              <div className="profile-detail-icon"><UserRound size={18} /></div>
              <div><span>Current Admin</span><strong>{user?.name}</strong></div>
            </div>
            <div className="profile-detail-row">
              <div className="profile-detail-icon"><Mail size={18} /></div>
              <div><span>Current Email</span><strong>{user?.email}</strong></div>
            </div>
            <div className="profile-detail-row">
              <div className="profile-detail-icon"><ShieldCheck size={18} /></div>
              <div><span>Access Level</span><strong>Administrator</strong></div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;
