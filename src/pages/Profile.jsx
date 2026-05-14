import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Mail, UserRound, Lock, Package, Shield } from 'lucide-react';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyOrders } from '../services/orderApi.js';
import { formatCurrency } from '../utils/currency.js';

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

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    });
  }, [user]);

  useEffect(() => {
    const loadOrders = async () => {
      setOrdersLoading(true);

      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('New password and confirm password must match.');
      return;
    }

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setFormData((previous) => ({ ...previous, password: '', confirmPassword: '' }));
      setMessage('Profile updated successfully.');
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <motion.div className="page profile-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="content-container profile-shell profile-shell-extended">
        <motion.div className="profile-copy" variants={itemVariants}>
          <span className="auth-kicker">Your account</span>
          <h1>
            Welcome, <span className="highlight">{user?.name}</span>
          </h1>
          <p className="lead auth-lead">
            Update your details, review recent orders, and keep your ShopNest experience personalized.
          </p>
        </motion.div>

        <motion.div className="profile-card" variants={itemVariants}>
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2>{user?.name}</h2>
              <p>ShopNest member</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Name</span>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Email</span>
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

            <motion.button type="submit" className="btn primary-btn auth-submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              Save Changes
            </motion.button>
          </form>

          <div className="profile-details compact">
            {isAdmin ? (
              <button type="button" className="profile-detail-row profile-admin-link" onClick={() => navigate('/admin/dashboard')}>
                <div className="profile-detail-icon"><Shield size={18} /></div>
                <div><span>Admin</span><strong>Open dashboard</strong></div>
              </button>
            ) : null}
            <div className="profile-detail-row">
              <div className="profile-detail-icon"><UserRound size={18} /></div>
              <div><span>Name</span><strong>{user?.name}</strong></div>
            </div>
            <div className="profile-detail-row">
              <div className="profile-detail-icon"><Mail size={18} /></div>
              <div><span>Email</span><strong>{user?.email}</strong></div>
            </div>
            <div className="profile-detail-row">
              <div className="profile-detail-icon"><Lock size={18} /></div>
              <div><span>Security</span><strong>JWT protected account</strong></div>
            </div>
          </div>

          <motion.button type="button" className="btn secondary-btn profile-logout" onClick={handleLogout} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <LogOut size={18} />
            Logout
          </motion.button>
        </motion.div>

        <motion.div className="profile-orders-card" variants={itemVariants}>
          <div className="profile-header">
            <div className="profile-detail-icon"><Package size={18} /></div>
            <div>
              <h2>Recent Orders</h2>
              <p>Your latest checkout activity.</p>
            </div>
          </div>

          {ordersLoading ? (
            <p className="form-message">Loading your orders...</p>
          ) : orders.length ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card-row">
                  <div>
                    <strong>Order #{order.id.slice(-6).toUpperCase()}</strong>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                    {order.shippingAddress ? (
                      <p>
                        {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <span className={`stock-pill order-status status-${order.status}`}>{order.status}</span>
                    <strong>{formatCurrency(order.totalPrice)}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="form-message">You have not placed any orders yet.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
