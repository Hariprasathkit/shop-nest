import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/currency.js';

const Wishlist = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlistItems, wishlistLoading, wishlistError, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
    } catch (error) {
      if (error.message === 'Please login to add items to your cart.') {
        navigate('/login', { replace: true, state: { from: location } });
      }
    }
  };

  const handleRemove = async (wishlistItemId) => {
    try {
      await removeFromWishlist(wishlistItemId);
    } catch {
      // Context already stores the error state.
    }
  };

  if (wishlistLoading) {
    return (
      <div className="page cart-page empty-cart-container">
        <Heart size={64} className="empty-cart-icon" />
        <h2>Loading your wishlist...</h2>
      </div>
    );
  }

  if (wishlistError) {
    return (
      <div className="page cart-page empty-cart-container">
        <Heart size={64} className="empty-cart-icon" />
        <h2>Unable to load wishlist</h2>
        <p>{wishlistError}</p>
      </div>
    );
  }

  if (!wishlistItems.length) {
    return (
      <div className="page cart-page empty-cart-container">
        <Heart size={64} className="empty-cart-icon" />
        <h2>Your wishlist is empty</h2>
        <p>Save products you love and come back to them anytime.</p>
        <Link to="/products" className="btn primary-btn mt-4">Discover Products</Link>
      </div>
    );
  }

  return (
    <motion.div className="page wishlist-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="content-container">
        <h1 className="page-title">Your <span className="highlight">Wishlist</span></h1>
        <p className="page-subtitle">Products you've saved for later.</p>

        <div className="wishlist-grid mt-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist-card">
              <Link to={`/products/${item.product._id}`} className="wishlist-card-link">
                <img src={item.product.image} alt={item.product.name} className="wishlist-card-image" />
              </Link>
              <div className="wishlist-card-body">
                <span className="product-category">{item.product.category}</span>
                <Link to={`/products/${item.product._id}`} className="product-name" style={{ textDecoration: 'none' }}>
                  <h3>{item.product.name}</h3>
                </Link>
                <p className="page-subtitle wishlist-card-description">{item.product.description}</p>
                <div className="wishlist-card-footer">
                  <strong className="product-price">{formatCurrency(item.product.price)}</strong>
                  <div className="wishlist-card-actions">
                    <button className="btn secondary-btn wishlist-remove-btn" onClick={() => handleRemove(item.id)}>
                      <Trash2 size={16} />
                    </button>
                    <button className="btn primary-btn wishlist-add-btn" onClick={() => handleAddToCart(item.product)}>
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Wishlist;
