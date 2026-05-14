import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  addCartItem as addCartItemRequest,
  clearCart as clearCartRequest,
  getCartItems as getCartItemsRequest,
  hasCartToken,
  removeCartItem as removeCartItemRequest,
  updateCartItem as updateCartItemRequest,
} from '../services/cartApi.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  const loadCart = useCallback(async () => {
    if (!hasCartToken()) {
      setCartItems([]);
      setCartError('');
      return;
    }

    setCartLoading(true);
    setCartError('');

    try {
      const items = await getCartItemsRequest();
      setCartItems(items);
    } catch (error) {
      if (error.response?.status === 401) {
        setCartError('Please login to view your cart.');
      } else {
        setCartError(error.response?.data?.message || 'Unable to load cart.');
      }
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setCartItems([]);
      setCartError('');
      setCartLoading(false);
      return;
    }

    loadCart();
  }, [authLoading, isAuthenticated, loadCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!hasCartToken()) {
      throw new Error('Please login to add items to your cart.');
    }

    setCartError('');

    try {
      const updatedItem = await addCartItemRequest(product, quantity);
      setCartItems((previousItems) => {
        const existingItem = previousItems.find((item) => item.id === updatedItem.id);

        if (existingItem) {
          return previousItems.map((item) => (item.id === updatedItem.id ? updatedItem : item));
        }

        return [updatedItem, ...previousItems];
      });

      return updatedItem;
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Please login to add items to your cart.'
        : error.response?.data?.message || 'Unable to add item to cart.';
      setCartError(message);
      throw new Error(message);
    }
  };

  const removeFromCart = async (cartItemId) => {
    setCartError('');

    try {
      await removeCartItemRequest(cartItemId);
      setCartItems((previousItems) => previousItems.filter((item) => item.id !== cartItemId));
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Please login to view your cart.'
        : error.response?.data?.message || 'Unable to remove item from cart.';
      setCartError(message);
      throw new Error(message);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    setCartError('');

    try {
      const updatedItem = await updateCartItemRequest(cartItemId, newQuantity);
      setCartItems((previousItems) =>
        previousItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Please login to view your cart.'
        : error.response?.data?.message || 'Unable to update item quantity.';
      setCartError(message);
      throw new Error(message);
    }
  };

  const clearCart = async () => {
    setCartError('');

    try {
      await clearCartRequest();
      setCartItems([]);
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Please login to view your cart.'
        : error.response?.data?.message || 'Unable to clear cart.';
      setCartError(message);
      throw new Error(message);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: loadCart,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
