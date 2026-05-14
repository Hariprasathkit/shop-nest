import api from './api.js';

const normalizeOrder = (order) => ({
  id: order.id,
  user: order.user
    ? {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      }
    : null,
  items: (order.items || []).map((item) => ({
    productId: item.productId,
    name: item.name,
    image: item.image || '',
    category: item.category || '',
    price: Number(item.price),
    quantity: Number(item.quantity),
  })),
  totalPrice: Number(order.totalPrice),
  shippingAddress: order.shippingAddress
    ? {
        fullName: order.shippingAddress.fullName || '',
        phone: order.shippingAddress.phone || '',
        addressLine1: order.shippingAddress.addressLine1 || '',
        addressLine2: order.shippingAddress.addressLine2 || '',
        city: order.shippingAddress.city || '',
        state: order.shippingAddress.state || '',
        postalCode: order.shippingAddress.postalCode || '',
        country: order.shippingAddress.country || '',
      }
    : null,
  status: order.status,
  isPaid: Boolean(order.isPaid),
  paidAt: order.paidAt,
  paymentMethod: order.paymentMethod || '',
  razorpayOrderId: order.razorpayOrderId || '',
  razorpayPaymentId: order.razorpayPaymentId || '',
  createdAt: order.createdAt,
});

export const createOrder = async (payload) => {
  const response = await api.post('/orders', payload);
  return normalizeOrder(response.data.order);
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my');
  return (response.data.orders || []).map(normalizeOrder);
};

export const getAllOrders = async () => {
  const response = await api.get('/orders');
  return (response.data.orders || []).map(normalizeOrder);
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return normalizeOrder(response.data.order);
};
