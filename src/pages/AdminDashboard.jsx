import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes, ClipboardList, LifeBuoy, PackageCheck, Settings, ShieldCheck } from 'lucide-react';
import { getAllOrders } from '../services/orderApi.js';
import { getAdminProducts } from '../services/productApi.js';
import { getSupportTickets } from '../services/supportApi.js';

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

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, delivered: 0, pending: 0, tickets: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [products, orders, tickets] = await Promise.all([getAdminProducts(), getAllOrders(), getSupportTickets()]);
        setStats({
          products: products.length,
          orders: orders.length,
          delivered: orders.filter((order) => order.status === 'delivered').length,
          pending: orders.filter((order) => order.status === 'pending').length,
          tickets: tickets.length,
        });
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load admin dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const cards = [
    { label: 'Products', value: stats.products, icon: Boxes },
    { label: 'Orders', value: stats.orders, icon: ClipboardList },
    { label: 'Delivered', value: stats.delivered, icon: PackageCheck },
    { label: 'Pending', value: stats.pending, icon: ShieldCheck },
    { label: 'Support', value: stats.tickets, icon: LifeBuoy },
  ];

  return (
    <motion.div className="page admin-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="content-container admin-shell">
        <motion.div className="admin-hero" variants={itemVariants}>
          <span className="auth-kicker">Admin Panel</span>
          <h1>Manage ShopNest with confidence</h1>
          <p className="lead auth-lead">
            Keep products current, monitor every order, review support requests, and control storefront operations from one secure workspace.
          </p>
        </motion.div>

        {error ? <motion.p className="form-message error" variants={itemVariants}>{error}</motion.p> : null}

        <motion.div className="admin-stats-grid" variants={itemVariants}>
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.label} className="admin-stat-card">
                <div className="admin-stat-icon">
                  <Icon size={20} />
                </div>
                <div>
                  <span>{card.label}</span>
                  <strong>{loading ? '...' : card.value}</strong>
                </div>
              </div>
            );
          })}
        </motion.div>

        <motion.div className="admin-links-grid" variants={itemVariants}>
          <Link to="/admin/products" className="admin-link-card">
            <h2>Product Management</h2>
            <p>Create listings, update inventory, and remove products that are no longer for sale.</p>
          </Link>
          <Link to="/admin/orders" className="admin-link-card">
            <h2>Order Management</h2>
            <p>Review all customer orders and move them from pending to paid or delivered.</p>
          </Link>
          <Link to="/admin/support" className="admin-link-card">
            <h2>Support Inbox</h2>
            <p>Read customer support messages and keep track of incoming requests.</p>
          </Link>
          <Link to="/admin/settings" className="admin-link-card">
            <Settings size={22} />
            <h2>Admin Settings</h2>
            <p>Change the admin login email and update the password for this account.</p>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
