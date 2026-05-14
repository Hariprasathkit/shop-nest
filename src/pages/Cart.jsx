import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getStoredToken } from '../services/api.js';
import { formatCurrency } from '../utils/currency.js';
import './Cart.css';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } },
  exit: { opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }
};

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartLoading,
    cartError,
    updateQuantity,
    removeFromCart,
    cartTotal,
    clearCart,
    refreshCart,
  } = useCart();

  useEffect(() => {
    if (!getStoredToken()) {
      navigate('/login', { replace: true, state: { from: { pathname: '/cart' } } });
      return;
    }

    refreshCart();
  }, [navigate, refreshCart]);

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch {
      // Error is already managed in cart context state.
    }
  };

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    try {
      await updateQuantity(cartItemId, quantity);
    } catch {
      // Error is already managed in cart context state.
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
    } catch {
      // Error is already managed in cart context state.
    }
  };

  if (!getStoredToken()) {
    return null;
  }

  if (cartLoading) {
    return (
      <motion.div className="page cart-page empty-cart-container" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
        <ShoppingBag size={64} className="empty-cart-icon" />
        <h2>Loading your cart...</h2>
        <p>Please wait while we fetch your saved items.</p>
      </motion.div>
    );
  }

  if (cartError) {
    return (
      <motion.div className="page cart-page empty-cart-container" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
        <ShoppingBag size={64} className="empty-cart-icon" />
        <h2>Please login to view your cart</h2>
        <p>{cartError}</p>
        <Link to="/login" className="btn primary-btn mt-4">Login</Link>
      </motion.div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <motion.div className="page cart-page empty-cart-container" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
        <ShoppingBag size={64} className="empty-cart-icon" />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn primary-btn mt-4">Start Shopping</Link>
      </motion.div>
    );
  }

  return (
    <motion.div className="page cart-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit" style={{ animation: 'none' }}>
      <div className="content-container">
        <h1 className="page-title">Shopping <span className="highlight">Cart</span></h1>

        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <span>Product ({cartItems.length})</span>
              <button className="clear-cart-btn" onClick={handleClearCart}>Clear All</button>
            </div>

            <motion.div className="cart-items-list" layout>
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="cart-item"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    style={{ animation: 'none' }}
                  >
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <span className="cart-item-category">{item.category}</span>
                      <span className="cart-item-price-mobile">{formatCurrency(item.price)}</span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="cart-item-price desktop-only">
                        {formatCurrency(item.price * item.quantity)}
                      </div>

                      <button className="remove-item-btn" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div className="cart-summary-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="summary-card">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>

              <motion.button className="btn primary-btn checkout-btn" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/checkout')}>
                Proceed to Checkout
                <ArrowRight size={18} />
              </motion.button>

              <Link to="/products" className="continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
