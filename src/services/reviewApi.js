import api from './api.js';

const normalizeReview = (review) => ({
  id: review.id,
  rating: Number(review.rating),
  comment: review.comment,
  createdAt: review.createdAt,
  user: review.user
    ? {
        id: review.user.id,
        name: review.user.name,
      }
    : null,
});

export const getReviewsByProduct = async (productId) => {
  const response = await api.get(`/reviews/${productId}`);
  return (response.data.reviews || []).map(normalizeReview);
};

export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return normalizeReview(response.data.review);
};

export const updateReview = async (id, reviewData) => {
  const response = await api.put(`/reviews/${id}`, reviewData);
  return normalizeReview(response.data.review);
};

export const deleteReview = async (id) => {
  await api.delete(`/reviews/${id}`);
};
