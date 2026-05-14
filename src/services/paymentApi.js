import api from './api.js';

export const createPaymentOrder = async (payload) => {
  const response = await api.post('/payment/create-order', payload);
  return response.data;
};

export const verifyPayment = async (payload) => {
  const response = await api.post('/payment/verify', payload);
  return response.data.order;
};
