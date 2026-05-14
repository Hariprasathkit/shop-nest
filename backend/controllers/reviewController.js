import Product from '../models/Product.js';
import Review from '../models/Review.js';

const normalizeReview = (review) => ({
  id: review._id.toString(),
  rating: Number(review.rating),
  comment: review.comment,
  createdAt: review.createdAt,
  user: review.user
    ? {
        id: review.user._id?.toString?.() || review.user.id,
        name: review.user.name,
      }
    : null,
});

const syncProductReviewStats = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviewCount
    : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: Number(averageRating.toFixed(1)),
    reviews: reviewCount,
  });
};

const validateReviewInput = ({ rating, comment }) => {
  const numericRating = Number(rating);

  if (!comment?.trim()) {
    return 'Rating and comment are required.';
  }

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }

  return null;
};

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!productId) {
      return res.status(400).json({ message: 'Product, rating, and comment are required.' });
    }

    const validationError = validateReviewInput({ rating, comment });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating: numericRating,
      comment: comment.trim(),
    });

    const populatedReview = await review.populate('user', 'name');
    await syncProductReviewStats(productId);

    return res.status(201).json({
      message: 'Review submitted successfully.',
      review: normalizeReview(populatedReview),
    });
  } catch (error) {
    console.error('Create review error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    return res.status(500).json({ message: 'Unable to submit review.' });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('user', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (req.user.id !== review.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const validationError = validateReviewInput(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    review.rating = Number(req.body.rating);
    review.comment = req.body.comment.trim();
    await review.save();
    await syncProductReviewStats(review.product);

    return res.status(200).json({
      message: 'Review updated successfully.',
      review: normalizeReview(review),
    });
  } catch (error) {
    console.error('Update review error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Review not found.' });
    }

    return res.status(500).json({ message: 'Unable to update review.' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('user', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const isOwner = req.user.id === review.user._id.toString();

    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const productId = review.product;
    await review.deleteOne();
    await syncProductReviewStats(productId);

    return res.status(200).json({
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    console.error('Delete review error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Review not found.' });
    }

    return res.status(500).json({ message: 'Unable to delete review.' });
  }
};

export const getReviewsByProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      reviews: reviews.map(normalizeReview),
    });
  } catch (error) {
    console.error('Get reviews error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(500).json({ message: 'Unable to load reviews.' });
  }
};
