import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  updateProduct,
} from '../services/productApi.js';
import { formatCurrency } from '../utils/currency.js';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 110, damping: 14 },
  },
};

const emptyForm = {
  name: '',
  price: '',
  image: '',
  description: '',
  category: '',
  stock: '',
  rating: '0',
  reviews: '0',
  badge: '',
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadProducts = async () => {
    setLoading(true);

    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId('');
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: String(product.price),
      image: product.image,
      description: product.description,
      category: product.category,
      stock: String(product.stock),
      rating: String(product.rating ?? 0),
      reviews: String(product.reviews ?? 0),
      badge: product.badge || '',
    });
    setMessage('');
    setError('');
  };

  const handleDelete = async (productId) => {
    setMessage('');
    setError('');

    try {
      await deleteProduct(productId);
      setProducts((previous) => previous.filter((product) => product._id !== productId));
      if (editingId === productId) {
        resetForm();
      }
      setMessage('Product deleted successfully.');
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete product.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      if (editingId) {
        const updatedProduct = await updateProduct(editingId, formData);
        setProducts((previous) => previous.map((product) => (product._id === editingId ? updatedProduct : product)));
        setMessage('Product updated successfully.');
      } else {
        const createdProduct = await createProduct(formData);
        setProducts((previous) => [...previous, createdProduct]);
        setMessage('Product created successfully.');
      }

      resetForm();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="page admin-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="content-container admin-shell admin-two-column">
        <motion.div className="admin-card admin-form-card" variants={itemVariants}>
          <div className="admin-section-header">
            <div>
              <span className="auth-kicker">Admin Products</span>
              <h1>{editingId ? 'Edit product' : 'Add product'}</h1>
            </div>
            <button type="button" className="btn secondary-btn" onClick={resetForm}>Clear</button>
          </div>

          <form className="auth-form admin-form-grid" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Name</span>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Price</span>
              <input type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
            </label>
            <label className="form-field admin-grid-span-2">
              <span>Image URL</span>
              <input type="url" name="image" value={formData.image} onChange={handleChange} required />
            </label>
            <label className="form-field admin-grid-span-2">
              <span>Description</span>
              <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Category</span>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Stock</span>
              <input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Rating</span>
              <input type="number" min="0" max="5" step="0.1" name="rating" value={formData.rating} onChange={handleChange} />
            </label>
            <label className="form-field">
              <span>Reviews</span>
              <input type="number" min="0" name="reviews" value={formData.reviews} onChange={handleChange} />
            </label>
            <label className="form-field admin-grid-span-2">
              <span>Badge</span>
              <input type="text" name="badge" value={formData.badge} onChange={handleChange} placeholder="Optional label" />
            </label>

            {message ? <p className="form-message success admin-grid-span-2">{message}</p> : null}
            {error ? <p className="form-message error admin-grid-span-2">{error}</p> : null}

            <motion.button type="submit" className="btn primary-btn auth-submit admin-grid-span-2" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={saving}>
              <Plus size={18} />
              <span>{saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}</span>
            </motion.button>
          </form>
        </motion.div>

        <motion.div className="admin-card" variants={itemVariants}>
          <div className="admin-section-header">
            <div>
              <span className="auth-kicker">Catalog</span>
              <h2>All products</h2>
            </div>
            <button type="button" className="btn secondary-btn" onClick={loadProducts}>Refresh</button>
          </div>

          {loading ? (
            <p className="form-message">Loading products...</p>
          ) : products.length ? (
            <div className="admin-list">
              {products.map((product) => (
                <div key={product._id} className="admin-list-row">
                  <div className="admin-list-copy">
                    <strong>{product.name}</strong>
                    <p>{product.category} - {formatCurrency(product.price)} - Stock {product.stock}</p>
                  </div>
                  <div className="admin-list-actions">
                    <button type="button" className="btn secondary-btn" onClick={() => handleEdit(product)}>
                      <Pencil size={16} />
                      <span>Edit</span>
                    </button>
                    <button type="button" className="btn secondary-btn danger-btn" onClick={() => handleDelete(product._id)}>
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="form-message">No products found.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminProducts;
