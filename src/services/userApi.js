import api from './api.js';

export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data.user;
};
