import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, ShoppingCart, Sun, Moon, Heart, Shield, Headphones, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const urlSearchQuery = useMemo(() => new URLSearchParams(location.search).get('keyword') || '', [location.search]);
  const [searchDraft, setSearchDraft] = useState('');

  const displayedSearchQuery = location.pathname === '/products' ? urlSearchQuery : searchDraft;

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', isMobileMenuOpen);

    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const searchValue = displayedSearchQuery.trim();

    if (searchValue) {
      params.set('keyword', searchValue);
    }

    navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`);
    setSearchDraft(searchValue);
    setIsMobileMenuOpen(false);
  };

  const handleSearchInput = (event) => {
    const nextValue = event.target.value;

    if (location.pathname === '/products') {
      const params = new URLSearchParams(location.search);
      if (nextValue.trim()) {
        params.set('keyword', nextValue.trim());
      } else {
        params.delete('keyword');
      }
      navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
      return;
    }

    setSearchDraft(nextValue);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container d-flex align-items-center justify-content-between w-100">
        <div className="navbar-left">
          <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2">
            <ShoppingBag className="brand-icon" />
            <span>ShopNest</span>
          </NavLink>
        </div>

        <div className="navbar-center d-flex flex-grow-1 justify-content-center mx-4 desktop-only">
          <form className="nav-search-bar w-100" onSubmit={handleSearch}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={displayedSearchQuery}
              onChange={handleSearchInput}
              className="form-control"
            />
          </form>
        </div>

        <div className="navbar-right d-flex align-items-center gap-4">
          <div className="navbar-links desktop-only d-flex align-items-center gap-4">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Home</NavLink>
            <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Products</NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>About</NavLink>
            {isAuthenticated ? <NavLink to="/support" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Support</NavLink> : null}
            {isAdmin ? <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Admin</NavLink> : null}
          </div>

          <div className="navbar-actions d-flex align-items-center gap-2">
            <button className="action-button theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <NavLink to="/support" className="action-button cart-action-btn desktop-action" aria-label="Support">
                <Headphones size={20} />
              </NavLink>
            ) : null}

            {isAdmin ? (
              <NavLink to="/admin/dashboard" className="action-button cart-action-btn desktop-action" aria-label="Admin dashboard">
                <Shield size={20} />
              </NavLink>
            ) : null}

            {isAdmin ? (
              <NavLink to="/admin/settings" className="action-button cart-action-btn desktop-action" aria-label="Admin settings">
                <Settings size={20} />
              </NavLink>
            ) : null}

            <NavLink to="/wishlist" className="action-button cart-action-btn desktop-action" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </NavLink>

            <NavLink to="/cart" className="action-button cart-action-btn" aria-label="Cart">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </NavLink>

            {isAuthenticated ? (
              <NavLink
                to="/profile"
                className="action-button primary navbar-auth-pill desktop-only d-flex align-items-center justify-content-center"
                aria-label="Profile"
                style={{ padding: '0.6rem 1rem' }}
              >
                <User size={18} />
                <span>Profile</span>
              </NavLink>
            ) : (
              <div className="desktop-only d-flex align-items-center gap-2">
                <NavLink to="/login" className="action-button navbar-auth-link" aria-label="Login">Login</NavLink>
                <NavLink
                  to="/signup"
                  className="action-button primary navbar-auth-pill d-flex align-items-center justify-content-center"
                  aria-label="Sign up"
                  style={{ padding: '0.6rem 1rem' }}
                >
                  <User size={18} />
                  <span>Sign Up</span>
                </NavLink>
              </div>
            )}

            <button
              className="mobile-menu-btn mobile-only action-button"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-navigation" className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <form className="nav-search-bar w-100 mb-2" onSubmit={handleSearch}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={displayedSearchQuery}
            onChange={handleSearchInput}
            className="form-control"
          />
        </form>
        <NavLink to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
        <NavLink to="/products" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Products</NavLink>
        <NavLink to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</NavLink>
        {isAuthenticated ? <NavLink to="/support" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Support</NavLink> : null}
        {isAdmin ? <NavLink to="/admin/dashboard" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</NavLink> : null}
        {isAdmin ? <NavLink to="/admin/settings" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Admin Settings</NavLink> : null}
        <NavLink to="/wishlist" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
          Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
        </NavLink>
        <NavLink to="/cart" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
          Cart{cartItemCount > 0 ? ` (${cartItemCount})` : ''}
        </NavLink>
        <div className="mobile-actions mt-3">
          {isAuthenticated ? (
            <NavLink
              to="/profile"
              className="mobile-action-btn primary w-100 d-flex justify-content-center align-items-center"
              aria-label="Profile"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={18} />
              <span className="ms-2">Profile</span>
            </NavLink>
          ) : (
            <>
              <NavLink to="/login" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink>
              <NavLink
                to="/signup"
                className="mobile-action-btn primary w-100 d-flex justify-content-center align-items-center"
                aria-label="Sign up"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={18} />
                <span className="ms-2">Sign Up</span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
