import api from './api.js';
import fallbackProducts from '../data/products.json';

const PRODUCT_CACHE_TTL = 60 * 1000;
const PRODUCT_REQUEST_TIMEOUT_MS = 8000;
const productCache = new Map();

const defaultDescription = (name) =>
  `Experience premium quality and exceptional design with the ${name}. Expertly crafted to elevate your daily routine and built to last.`;

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeFallbackProduct = (product) => ({
  _id: String(product._id || product.id),
  name: product.name,
  price: Number(product.price),
  image: product.image || '',
  description: product.description || defaultDescription(product.name),
  category: product.category || '',
  stock: Number(product.stock ?? 20),
  rating: Number(product.rating ?? 0),
  reviews: Number(product.reviews ?? 0),
  badge: product.badge || '',
});

const normalizeProduct = (product) => ({
  _id: String(product._id),
  name: product.name,
  price: Number(product.price),
  image: product.image || '',
  description: product.description || '',
  category: product.category || '',
  stock: Number(product.stock ?? 0),
  rating: Number(product.rating ?? 0),
  reviews: Number(product.reviews ?? 0),
  badge: product.badge || '',
});

const applyFallbackFilters = (products, params = {}) => {
  const keyword = String(params.keyword || '').trim().toLowerCase();
  const category = String(params.category || '').trim();
  const minPrice = parseOptionalNumber(params.minPrice);
  const maxPrice = parseOptionalNumber(params.maxPrice);

  return products.filter((product) => {
    const matchesKeyword = !keyword || product.name.toLowerCase().includes(keyword);
    const matchesCategory = !category || category === 'All' || product.category === category;
    const matchesMinPrice = minPrice === null || product.price >= minPrice;
    const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

    return matchesKeyword && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });
};

const getCacheKey = (params = {}) => JSON.stringify({
  keyword: String(params.keyword || '').trim(),
  category: String(params.category || '').trim(),
  minPrice: String(params.minPrice || '').trim(),
  maxPrice: String(params.maxPrice || '').trim(),
});

export const getProducts = async (params = {}) => {
  const cacheKey = getCacheKey(params);
  const cached = productCache.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < PRODUCT_CACHE_TTL) {
    return cached.products;
  }

  try {
    const response = await api.get('/products', {
      params,
      timeout: PRODUCT_REQUEST_TIMEOUT_MS,
    });
    const products = (response.data.products || []).map(normalizeProduct);
    productCache.set(cacheKey, { createdAt: Date.now(), products });
    return products;
  } catch {
    return applyFallbackFilters(fallbackProducts.map(normalizeFallbackProduct), params);
  }
};

export const getAdminProducts = async () => {
  const response = await api.get('/products');
  return (response.data.products || []).map(normalizeProduct);
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return normalizeProduct(response.data.product || null);
  } catch {
    const fallbackProduct = fallbackProducts
      .map(normalizeFallbackProduct)
      .find((product) => product._id === String(id));

    if (!fallbackProduct) {
      throw new Error('Product not found.');
    }

    return fallbackProduct;
  }
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return normalizeProduct(response.data.product);
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return normalizeProduct(response.data.product);
};

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};
