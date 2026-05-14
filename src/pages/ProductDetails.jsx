import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ChevronLeft, Truck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext.jsx';
import { getProductById } from '../services/productApi.js';
import {
  createReview,
  deleteReview as deleteReviewRequest,
  getReviewsByProduct,
  updateReview as updateReviewRequest,
} from '../services/reviewApi.js';
import { formatCurrency } from '../utils/currency.js';
import './ProductDetails.css';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const ratingOptions = [1, 2, 3, 4, 5];

const calculateReviewStats = (reviewItems) => {
  const reviewCount = reviewItems.length;
  const averageRating = reviewCount
    ? reviewItems.reduce((sum, review) => sum + Number(review.rating), 0) / reviewCount
    : 0;

  return {
    reviews: reviewCount,
    rating: Number(averageRating.toFixed(1)),
  };
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemByProductId } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });
  const [editingReviewId, setEditingReviewId] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDeletingId, setReviewDeletingId] = useState('');

  const inWishlist = product ? isInWishlist(product._id) : false;
  const hasReviewed = reviews.some((review) => review.user?.id === user?.id);
  const canWriteNewReview = isAuthenticated && !hasReviewed && !editingReviewId;

  useEffect(() => {
    setQuantity(1);
    setIsAdded(false);
    setReviewForm({ rating: '5', comment: '' });
    setEditingReviewId('');
    setReviewMessage('');
  }, [id]);

  useEffect(() => {
    const loadProduct = async () => {
      setProductLoading(true);
      setProductError('');

      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        setProductError(error.response?.data?.message || error.message || 'Unable to load product.');
        setProduct(null);
      } finally {
        setProductLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError('');

      try {
        const data = await getReviewsByProduct(id);
        setReviews(data);
      } catch (error) {
        setReviewsError(error.response?.data?.message || error.message || 'Unable to load reviews.');
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [id]);

  const syncProductStatsFromReviews = (nextReviews) => {
    const stats = calculateReviewStats(nextReviews);
    setProduct((previous) => (previous ? { ...previous, ...stats } : previous));
  };

  const resetReviewForm = () => {
    setReviewForm({ rating: '5', comment: '' });
    setEditingReviewId('');
  };

  const handleAddToCart = async () => {
    if (!product || product.stock < 1) {
      return;
    }

    try {
      await addToCart(product, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      if (error.message === 'Please login to add items to your cart.') {
        navigate('/login', { replace: true, state: { from: location } });
      }
    }
  };

  const handleWishlist = async () => {
    if (!product) {
      return;
    }

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

  const handleReviewChange = (event) => {
    const { name, value } = event.target;
    setReviewForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleEditReview = (review) => {
    setReviewMessage('');
    setReviewsError('');
    setEditingReviewId(review.id);
    setReviewForm({
      rating: String(review.rating),
      comment: review.comment,
    });
  };

  const handleDeleteReview = async (reviewId) => {
    const shouldDelete = window.confirm('Delete this review?');

    if (!shouldDelete) {
      return;
    }

    setReviewDeletingId(reviewId);
    setReviewMessage('');
    setReviewsError('');

    try {
      await deleteReviewRequest(reviewId);
      const nextReviews = reviews.filter((review) => review.id !== reviewId);
      setReviews(nextReviews);
      syncProductStatsFromReviews(nextReviews);

      if (editingReviewId === reviewId) {
        resetReviewForm();
      }

      setReviewMessage('Review deleted successfully.');
    } catch (error) {
      setReviewsError(error.response?.data?.message || error.message || 'Unable to delete review.');
    } finally {
      setReviewDeletingId('');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewSubmitting(true);
    setReviewMessage('');
    setReviewsError('');

    try {
      if (editingReviewId) {
        const updatedReview = await updateReviewRequest(editingReviewId, {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        });
        const nextReviews = reviews.map((review) => (review.id === editingReviewId ? updatedReview : review));
        setReviews(nextReviews);
        syncProductStatsFromReviews(nextReviews);
        resetReviewForm();
        setReviewMessage('Review updated successfully.');
      } else {
        const review = await createReview({
          productId: id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        });
        const nextReviews = [review, ...reviews];
        setReviews(nextReviews);
        syncProductStatsFromReviews(nextReviews);
        resetReviewForm();
        setReviewMessage('Review submitted successfully.');
      }
    } catch (error) {
      setReviewsError(error.response?.data?.message || error.message || 'Unable to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (productLoading) {
    return (
      <div className="page product-not-found">
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page product-not-found">
        <h2>{productError || 'Product not found'}</h2>
        <button className="btn primary-btn mt-4" onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="page product-details-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ animation: 'none' }}
    >
      <div className="content-container">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
          Back
        </button>

        <div className="product-details-grid">
          <motion.div className="product-gallery" variants={slideUp}>
            <div className="main-image-wrapper">
              {product.badge && (
                <span className={`detail-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                  {product.badge}
                </span>
              )}
              <motion.img
                src={product.image}
                alt={product.name}
                className="main-image"
                whileHover={{ scale: 1.05 }}
              />
            </div>
          </motion.div>

          <motion.div className="product-info-panel" variants={slideUp}>
            <div className="breadcrumbs">
              <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.category}</span>
            </div>

            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-meta">
              <div className="detail-rating">
                <Star size={16} className="star-icon filled" />
                <span className="rating-value">{product.rating}</span>
                <span className="review-count">({product.reviews} reviews)</span>
              </div>
              <span className={`stock-pill ${product.stock < 1 ? 'sold-out' : ''}`}>
                {product.stock < 1 ? 'Out of stock' : `${product.stock} in stock`}
              </span>
            </div>

            <div className="detail-price">{formatCurrency(product.price)}</div>

            <div className="detail-description">
              <p>{product.description}</p>
            </div>

            <div className="purchase-actions">
              <div className="qty-selector">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1}
                >-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((value) => value + 1)} disabled={quantity >= product.stock || product.stock < 1}>+</button>
              </div>

              <motion.button
                className={`btn primary-btn add-to-cart-large ${isAdded ? 'added' : ''}`}
                onClick={handleAddToCart}
                whileTap={{ scale: 0.95 }}
                disabled={product.stock < 1}
              >
                <ShoppingCart size={20} />
                {product.stock < 1 ? 'Out of Stock' : isAdded ? 'Added to Cart' : 'Add to Cart'}
              </motion.button>

              <button type="button" className={`btn secondary-btn wishlist-detail-btn ${inWishlist ? 'active' : ''}`} onClick={handleWishlist}>
                <Heart size={18} />
                {inWishlist ? 'Saved' : 'Add to Wishlist'}
              </button>
            </div>

            <div className="product-features">
              <div className="feature">
                <Truck size={24} className="feature-icon" />
                <div>
                  <h4>Free Shipping</h4>
                  <p>On all orders over {formatCurrency(50)}</p>
                </div>
              </div>
              <div className="feature">
                <Shield size={24} className="feature-icon" />
                <div>
                  <h4>Secure Checkout</h4>
                  <p>100% encrypted payment</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="reviews-section" variants={slideUp}>
          <div className="reviews-header">
            <div>
              <span className="auth-kicker">Customer Reviews</span>
              <h2>What shoppers are saying</h2>
            </div>
          </div>

          <div className="reviews-layout">
            <div className="reviews-list-card">
              {reviewsLoading ? (
                <p className="form-message">Loading reviews...</p>
              ) : reviewsError ? (
                <p className="form-message error">{reviewsError}</p>
              ) : reviews.length ? (
                <div className="reviews-list">
                  {reviews.map((review) => {
                    const isOwner = review.user?.id === user?.id;

                    return (
                      <div key={review.id} className="review-card">
                        <div className="review-topline">
                          <strong>{review.user?.name || 'ShopNest User'}</strong>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="review-stars-row">
                          <div className="review-stars" aria-label={`Rated ${review.rating} out of 5`}>
                            {ratingOptions.map((value) => (
                              <Star key={`${review.id}-${value}`} size={16} className={value <= review.rating ? 'star-icon filled' : 'star-icon'} />
                            ))}
                          </div>
                          {isOwner ? (
                            <div className="review-actions">
                              <button type="button" className="review-action-btn" onClick={() => handleEditReview(review)}>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="review-action-btn danger"
                                onClick={() => handleDeleteReview(review.id)}
                                disabled={reviewDeletingId === review.id}
                              >
                                {reviewDeletingId === review.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          ) : null}
                        </div>
                        <p>{review.comment}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="form-message">No reviews yet. Be the first to review this product.</p>
              )}
            </div>

            <div className="reviews-form-card">
              <h3>{editingReviewId ? 'Edit your review' : 'Write a review'}</h3>
              {!isAuthenticated ? (
                <p className="form-message">
                  <Link to="/login" state={{ from: location }}>Login</Link> to rate and review this product.
                </p>
              ) : canWriteNewReview || editingReviewId ? (
                <form className="auth-form" onSubmit={handleReviewSubmit}>
                  <label className="form-field">
                    <span>Rating</span>
                    <select name="rating" value={reviewForm.rating} onChange={handleReviewChange} required>
                      {ratingOptions.map((value) => (
                        <option key={value} value={value}>{value} Star{value > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Comment</span>
                    <textarea
                      name="comment"
                      rows="5"
                      value={reviewForm.comment}
                      onChange={handleReviewChange}
                      placeholder="Share what you liked, how it fits, or how it performs..."
                      required
                    />
                  </label>
                  {reviewMessage ? <p className="form-message success">{reviewMessage}</p> : null}
                  {editingReviewId ? (
                    <button type="button" className="btn secondary-btn review-cancel-btn" onClick={resetReviewForm}>
                      Cancel Edit
                    </button>
                  ) : null}
                  <motion.button type="submit" className="btn primary-btn" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={reviewSubmitting}>
                    {reviewSubmitting ? 'Saving...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                  </motion.button>
                </form>
              ) : (
                <p className="form-message">You have already reviewed this product.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
