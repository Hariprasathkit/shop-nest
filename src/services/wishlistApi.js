import api from './api.js';

const normalizeWishlistItem = (item) => ({
  id: item.id,
  product: {
    _id: item.product._id,
    name: item.product.name,
    price: Number(item.product.price),
    image: item.product.image || '',
    description: item.product.description || '',
    category: item.product.category || '',
    stock: Number(item.product.stock ?? 0),
    rating: Number(item.product.rating ?? 0),
    reviews: Number(item.product.reviews ?? 0),
    badge: item.product.badge || '',
  },
  createdAt: item.createdAt,
});

export const getWishlistItems = async () => {
  const response = await api.get('/wishlist');
  return (response.data.items || []).map(normalizeWishlistItem);
};

export const addWishlistItem = async (productId) => {
  const response = await api.post('/wishlist', { productId });
  return normalizeWishlistItem(response.data.item);
};

export const removeWishlistItem = async (wishlistItemId) => {
  await api.delete(`/wishlist/${wishlistItemId}`);
};
