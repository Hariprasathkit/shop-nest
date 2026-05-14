import api, { getStoredToken } from './api.js';

const normalizeCartItem = (item) => ({
  id: item._id,
  productId: item.productId,
  name: item.name,
  category: item.category || '',
  price: Number(item.price),
  image: item.image || '',
  quantity: Number(item.quantity),
});

export const hasCartToken = () => Boolean(getStoredToken());

export const getCartItems = async () => {
  const response = await api.get('/cart');
  return response.data.items.map(normalizeCartItem);
};

export const addCartItem = async (product, quantity = 1) => {
  const response = await api.post('/cart', {
    productId: String(product._id),
    name: product.name,
    category: product.category || '',
    price: product.price,
    image: product.image || '',
    quantity,
  });

  return normalizeCartItem(response.data.item);
};

export const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.patch(`/cart/${cartItemId}`, { quantity });
  return normalizeCartItem(response.data.item);
};

export const removeCartItem = async (cartItemId) => {
  await api.delete(`/cart/${cartItemId}`);
};

export const clearCart = async () => {
  await api.delete('/cart');
};
