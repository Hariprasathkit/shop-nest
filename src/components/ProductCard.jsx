import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext.jsx';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/currency.js';
import './ProductCard.css';

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemByProductId } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = async () => {
    try {
      await addToCart(product);
    } catch (error) {
      if (error.message === 'Please login to add items to your cart.') {
        navigate('/login', { replace: true, state: { from: location } });
      }
    }
  };

  const handleWishlist = async () => {
    try {
      if (inWishlist) {
        const item = getWishlistItemByProductId(product._id);
        if (item) {
          await removeFromWishlist(item.id);
        }
        return;
      }

      await addToWishlist(product._id);
    } catch (error) {
      if (error.message === 'Please login to add items to your wishlist.') {
        navigate('/login', { replace: true, state: { from: location } });
      }
    }
  };

  return (
    <motion.article
      className="product-card"
      variants={itemVariants}
      whileHover={{
        y: -8,
        borderColor: 'rgba(99, 102, 241, 0.4)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.15)'
      }}
      style={{ animation: 'none', opacity: 1, transform: 'none' }}
    >
      <div className="product-image-container">
        {product.badge && (
          <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
            {product.badge}
          </span>
        )}
        <button
          type="button"
          className={`wishlist-icon-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} />
        </button>
        <Link to={`/products/${product._id}`} className="product-image-link" aria-label={product.name}>
          <motion.img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6 }}
          />
        </Link>
        <div className="product-actions-overlay">
          <motion.button
            type="button"
            className="quick-add-btn"
            onClick={handleAddToCart}
            whileHover={{ scale: 1.05, backgroundColor: 'var(--primary-hover)' }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart size={18} />
            Add to Cart
          </motion.button>
        </div>
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link to={`/products/${product._id}`} className="product-name" title={product.name} style={{ textDecoration: 'none' }}>
          <h3>{product.name}</h3>
        </Link>

        <div className="product-meta">
          <div className="product-rating">
            <Star size={14} className="star-icon filled" />
            <span className="rating-value">{product.rating}</span>
            <span className="review-count">({product.reviews})</span>
          </div>
          <span className="product-price">{formatCurrency(product.price)}</span>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
