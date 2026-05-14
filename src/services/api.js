import axios from 'axios';

const TOKEN_KEY = 'shopnest_token';
let unauthorizedHandler = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const getTokenStorage = () => window.sessionStorage;

export const getStoredToken = () => {
  window.localStorage.removeItem(TOKEN_KEY);
  return getTokenStorage().getItem(TOKEN_KEY);
};

export const setStoredToken = (token) => {
  window.localStorage.removeItem(TOKEN_KEY);

  if (token) {
    getTokenStorage().setItem(TOKEN_KEY, token);
    return;
  }

  getTokenStorage().removeItem(TOKEN_KEY);
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  },
);

export default api;
