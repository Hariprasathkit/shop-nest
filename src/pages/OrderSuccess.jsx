import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency.js';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <motion.div className="page cart-page empty-cart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <CheckCircle2 size={68} className="empty-cart-icon" style={{ color: 'var(--success)' }} />
      <h2>Payment successful</h2>
      <p>
        {order
          ? `Your payment for ${formatCurrency(order.totalPrice)} was verified and the order is currently ${order.status}.`
          : 'Your payment has been verified successfully.'}
      </p>
      <div className="hero-actions mt-4">
        <Link to="/profile" className="btn secondary-btn">View Orders</Link>
        <Link to="/products" className="btn primary-btn">Continue Shopping</Link>
      </div>
    </motion.div>
  );
};

export default OrderSuccess;
