import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProducts as getProductsRequest } from '../services/productApi.js';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const queryState = useMemo(() => ({
    keyword: searchParams.get('keyword') || searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  }), [searchParams]);

  useEffect(() => {
    setSearchTerm(queryState.keyword);
    setActiveCategory(queryState.category);
    setMinPrice(queryState.minPrice);
    setMaxPrice(queryState.maxPrice);
  }, [queryState]);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError('');

      try {
        const data = await getProductsRequest({
          keyword: queryState.keyword,
          category: queryState.category === 'All' ? '' : queryState.category,
          minPrice: queryState.minPrice,
          maxPrice: queryState.maxPrice,
        });
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setProductsError(error.response?.data?.message || error.message || 'Unable to load products.');
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [queryState]);

  const categories = ['All', ...new Set(products.map((item) => item.category))];

  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'All') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (params.get('search') && !params.get('keyword')) {
      params.set('keyword', params.get('search'));
      params.delete('search');
    }

    setSearchParams(params);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    updateQuery({ keyword: value.trim(), category: activeCategory, minPrice, maxPrice });
  };

  const handleCategoryChange = (value) => {
    setActiveCategory(value);
    updateQuery({ keyword: searchTerm.trim(), category: value, minPrice, maxPrice });
  };

  const applyPriceFilters = () => {
    updateQuery({ keyword: searchTerm.trim(), category: activeCategory, minPrice, maxPrice });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div className="page products-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit" style={{ animation: 'none' }}>
      <div className="content-container">
        <div className="products-header" style={{ animation: 'none' }}>
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <h1 className="page-title">Discover <span className="highlight">Products</span></h1>
            <p className="page-subtitle">Find the perfect items for your lifestyle.</p>
          </motion.div>

          <motion.div className="products-controls" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input type="text" placeholder="Search products..." value={searchTerm} onChange={handleSearchChange} />
            </div>
            <motion.button className={`filter-btn ${showFilters ? 'active' : ''}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowFilters((value) => !value)}>
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </motion.button>
          </motion.div>
        </div>

        {showFilters ? (
          <motion.div className="filters-panel" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <label className="filter-field">
              <span>Category</span>
              <select value={activeCategory} onChange={(event) => handleCategoryChange(event.target.value)}>
                {['All', ...new Set(categories)].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Min Price</span>
              <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0" />
            </label>
            <label className="filter-field">
              <span>Max Price</span>
              <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="500" />
            </label>
            <div className="filter-actions">
              <button className="btn secondary-btn" onClick={resetFilters}>Reset</button>
              <button className="btn primary-btn" onClick={applyPriceFilters}>Apply</button>
            </div>
          </motion.div>
        ) : null}

        <motion.div className="categories-pills" variants={staggerContainer} initial="hidden" animate="visible">
          {categories.map((category) => (
            <motion.button
              key={category}
              className={`category-pill ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
              style={{ animation: 'none' }}
              variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {productsLoading ? (
          <motion.div className="no-results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p>Loading products...</p>
          </motion.div>
        ) : productsError ? (
          <motion.div className="no-results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p>{productsError}</p>
            <button className="btn secondary-btn mt-4" onClick={resetFilters}>Clear Filters</button>
          </motion.div>
        ) : products.length > 0 ? (
          <motion.div className="products-grid" variants={staggerContainer} initial="hidden" animate="visible">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        ) : (
          <motion.div className="no-results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p>No products found matching your criteria.</p>
            <button className="btn secondary-btn mt-4" onClick={resetFilters}>Clear Filters</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Products;
