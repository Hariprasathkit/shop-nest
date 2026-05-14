import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../services/orderApi.js';
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

const orderStatuses = ['pending', 'paid', 'delivered'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    setError('');

    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders((previous) => previous.map((order) => (order.id === orderId ? updatedOrder : order)));
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'Unable to update order status.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <motion.div className="page admin-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="content-container admin-shell">
        <motion.div className="admin-card" variants={itemVariants}>
          <div className="admin-section-header">
            <div>
              <span className="auth-kicker">Admin Orders</span>
              <h1>Track and update every order</h1>
            </div>
            <button type="button" className="btn secondary-btn" onClick={loadOrders}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>

          {error ? <p className="form-message error">{error}</p> : null}

          {loading ? (
            <p className="form-message">Loading orders...</p>
          ) : orders.length ? (
            <div className="admin-orders-list">
              {orders.map((order) => (
                <div key={order.id} className="admin-order-card">
                  <div className="admin-order-top">
                    <div>
                      <strong>Order #{order.id.slice(-6).toUpperCase()}</strong>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <strong>{formatCurrency(order.totalPrice)}</strong>
                  </div>

                  <div className="admin-order-meta">
                    <span>Customer: {order.user?.name || 'Unknown user'}</span>
                    <span>{order.user?.email || 'No email available'}</span>
                  </div>

                  <div className="admin-order-items">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.productId}`} className="admin-order-item-row">
                        <span>{item.name}</span>
                        <span>{item.quantity} x {formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="admin-order-actions">
                    <span className={`stock-pill order-status status-${order.status}`}>{order.status}</span>
                    <select
                      className="form-control admin-status-select"
                      value={order.status}
                      onChange={(event) => handleStatusChange(order.id, event.target.value)}
                      disabled={updatingId === order.id}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="form-message">No orders found.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminOrders;
