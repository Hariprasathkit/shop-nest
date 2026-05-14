import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { addWishlistItem, getWishlistItems, removeWishlistItem } from '../services/wishlistApi.js';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistError('');
      return;
    }

    setWishlistLoading(true);
    setWishlistError('');

    try {
      const items = await getWishlistItems();
      setWishlistItems(items);
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Please login to view your wishlist.'
        : error.response?.data?.message || 'Unable to load wishlist.';
      setWishlistError(message);
      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistError('');
      setWishlistLoading(false);
      return;
    }

    loadWishlist();
  }, [authLoading, isAuthenticated, loadWishlist]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to your wishlist.');
    }

    setWishlistError('');

    try {
      const item = await addWishlistItem(productId);
      setWishlistItems((previousItems) => {
        const existingItem = previousItems.find((entry) => entry.product._id === item.product._id);

        if (existingItem) {
          return previousItems.map((entry) => (entry.id === item.id ? item : entry));
        }

        return [item, ...previousItems];
      });

      return item;
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Please login to add items to your wishlist.'
        : error.response?.data?.message || 'Unable to update wishlist.';
      setWishlistError(message);
      throw new Error(message);
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    setWishlistError('');

    try {
      await removeWishlistItem(wishlistItemId);
      setWishlistItems((previousItems) => previousItems.filter((item) => item.id !== wishlistItemId));
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Please login to view your wishlist.'
        : error.response?.data?.message || 'Unable to remove wishlist item.';
      setWishlistError(message);
      throw new Error(message);
    }
  };

  const isInWishlist = (productId) => wishlistItems.some((item) => item.product._id === productId);
  const getWishlistItemByProductId = (productId) => wishlistItems.find((item) => item.product._id === productId) || null;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistLoading,
        wishlistError,
        wishlistCount: wishlistItems.length,
        addToWishlist,
        removeFromWishlist,
        refreshWishlist: loadWishlist,
        isInWishlist,
        getWishlistItemByProductId,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
