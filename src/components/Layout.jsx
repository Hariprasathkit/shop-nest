import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-links">
            <span>Products</span>
            <span>Support</span>
            <span>Secure Checkout</span>
          </div>
          <p className="footer-copy">&copy; {new Date().getFullYear()} ShopNest. Built By Hariprasath</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
