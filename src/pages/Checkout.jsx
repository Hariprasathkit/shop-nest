import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, ArrowRight, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { createPaymentOrder, verifyPayment } from '../services/paymentApi.js';
import { formatCurrency } from '../utils/currency.js';
import './Cart.css';

const defaultAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

const isPaymentGatewayEnabled = false;

const loadRazorpayScript = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
  document.body.appendChild(script);
});

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, refreshCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState(defaultAddress);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentSession, setPaymentSession] = useState(null);

  useEffect(() => {
    setShippingAddress((previous) => ({
      ...previous,
      fullName: previous.fullName || user?.name || '',
    }));
  }, [user]);

  const openRazorpay = (paymentOrder) => {
    const razorpay = new window.Razorpay({
      key: paymentOrder.key,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: 'ShopNest',
      description: 'Test mode payment',
      order_id: paymentOrder.orderId,
      handler: async (response) => {
        try {
          const verifiedOrder = await verifyPayment({
            shopOrderId: paymentOrder.shopOrderId,
            ...response,
          });
          setPaymentSession(null);
          await refreshCart();
          navigate('/order-success', { replace: true, state: { order: verifiedOrder } });
        } catch (verifyError) {
          setError(verifyError.response?.data?.message || verifyError.message || 'Unable to verify payment.');
        } finally {
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => {
          setError('Payment cancelled. You can retry the same order.');
          setSubmitting(false);
        },
      },
      prefill: {
        name: shippingAddress.fullName || user?.name || '',
        email: user?.email || '',
        contact: shippingAddress.phone || '',
      },
      theme: {
        color: '#0f766e',
      },
    });

    razorpay.on('payment.failed', (event) => {
      setError(event.error?.description || 'Payment failed. You can retry the same order.');
      setSubmitting(false);
    });

    razorpay.open();
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setShippingAddress((previous) => ({ ...previous, [name]: value }));
    setPaymentSession(null);
  };

  const validateAddress = () => {
    if (
      !shippingAddress.fullName.trim()
      || !shippingAddress.phone.trim()
      || !shippingAddress.addressLine1.trim()
      || !shippingAddress.city.trim()
      || !shippingAddress.state.trim()
      || !shippingAddress.postalCode.trim()
      || !shippingAddress.country.trim()
    ) {
      return 'Please fill in all required delivery address fields.';
    }

    return '';
  };

  const handlePayNow = async () => {
    const addressError = validateAddress();

    if (addressError) {
      setError(addressError);
      return;
    }

    if (!isPaymentGatewayEnabled) {
      window.alert('Payment will be updated soon.');
      setError('');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await loadRazorpayScript();
      const nextPaymentSession = paymentSession || await createPaymentOrder({ shippingAddress });
      setPaymentSession(nextPaymentSession);
      openRazorpay(nextPaymentSession);
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || 'Unable to start payment.');
      setSubmitting(false);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="page cart-page empty-cart-container">
        <CreditCard size={64} className="empty-cart-icon" />
        <h2>Your cart is empty</h2>
        <p>Add a few items before heading to checkout.</p>
        <Link to="/products" className="btn primary-btn mt-4">Browse Products</Link>
      </div>
    );
  }

  return (
    <motion.div className="page checkout-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="content-container checkout-shell">
        <div>
          <span className="auth-kicker">Secure checkout</span>
          <h1 className="page-title">Review <span className="highlight">Your Order</span></h1>
          <p className="page-subtitle">Add your delivery details, confirm your cart, and complete payment when you're ready.</p>
        </div>

        <div className="checkout-layout">
          <div className="checkout-content">
            <div className="checkout-address-card">
              <div className="checkout-section-heading">
                <div>
                  <span className="auth-kicker">Delivery details</span>
                  <h2>Shipping address</h2>
                </div>
                <MapPin size={20} />
              </div>

              <div className="checkout-address-grid">
                <label className="form-field">
                  <span>Full Name</span>
                  <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange} required />
                </label>
                <label className="form-field">
                  <span>Phone</span>
                  <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} required />
                </label>
                <label className="form-field checkout-grid-span-2">
                  <span>Address Line 1</span>
                  <input type="text" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleAddressChange} required />
                </label>
                <label className="form-field checkout-grid-span-2">
                  <span>Address Line 2</span>
                  <input type="text" name="addressLine2" value={shippingAddress.addressLine2} onChange={handleAddressChange} placeholder="Apartment, suite, landmark (optional)" />
                </label>
                <label className="form-field">
                  <span>City</span>
                  <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} required />
                </label>
                <label className="form-field">
                  <span>State</span>
                  <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} required />
                </label>
                <label className="form-field">
                  <span>Postal Code</span>
                  <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleAddressChange} required />
                </label>
                <label className="form-field">
                  <span>Country</span>
                  <input type="text" name="country" value={shippingAddress.country} onChange={handleAddressChange} required />
                </label>
              </div>
            </div>

            <div className="checkout-items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <img src={item.image} alt={item.name} className="checkout-item-image" />
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.category}</p>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-card checkout-summary-card">
            <h3>Payment Summary</h3>

            <div className="checkout-address-preview">
              <div className="checkout-address-preview-title">
                <Phone size={16} />
                <strong>Deliver to</strong>
              </div>
              <p>{shippingAddress.fullName || 'Add your full name'}</p>
              <p>{shippingAddress.addressLine1 || 'Add your delivery address'}</p>
              <p>{shippingAddress.addressLine2 || 'Optional address details can go here'}</p>
              <p>{[shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(', ') || 'Add city, state, and postal code'}</p>
              <p>{shippingAddress.country || 'Add your country'}</p>
              <p>{shippingAddress.phone || 'Add a contact phone number'}</p>
            </div>

            <div className="summary-row"><span>Items</span><span>{cartItems.length}</span></div>
            <div className="summary-row"><span>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>Free</span></div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row"><span>Total</span><span>{formatCurrency(cartTotal)}</span></div>
            {error ? <p className="form-message error">{error}</p> : null}
            {paymentSession ? <p className="form-message">Your pending payment is ready to retry.</p> : null}
            <button className="btn primary-btn checkout-btn" onClick={handlePayNow} disabled={submitting}>
              <ArrowRight size={18} />
              {submitting ? 'Opening Payment...' : paymentSession ? 'Retry Payment' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
