// Cart business logic for authenticated users only.
import CartItem from '../models/CartItem.js';

export const addCartItem = async (req, res) => {
  try {
    const { productId, name, category = '', price, image = '', quantity = 1 } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({ message: 'Product ID, name, and price are required.' });
    }

    if (Number(quantity) < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const existingItem = await CartItem.findOne({
      user: req.user.id,
      productId: String(productId),
    });

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      existingItem.category = typeof category === 'string' ? category.trim() : existingItem.category;
      existingItem.image = typeof image === 'string' ? image.trim() : existingItem.image;
      await existingItem.save();

      return res.status(200).json({
        message: 'Cart item quantity updated successfully.',
        item: existingItem,
      });
    }

    const cartItem = await CartItem.create({
      user: req.user.id,
      productId: String(productId),
      name: name.trim(),
      category: typeof category === 'string' ? category.trim() : '',
      price: Number(price),
      image: typeof image === 'string' ? image.trim() : '',
      quantity: Number(quantity),
    });

    return res.status(200).json({
      message: 'Item added to cart successfully.',
      item: cartItem,
    });
  } catch (error) {
    console.error('Add cart item error:', error);
    return res.status(500).json({ message: 'Server error while adding item to cart.' });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({ items: cartItems });
  } catch (error) {
    console.error('Get cart items error:', error);
    return res.status(500).json({ message: 'Server error while fetching cart items.' });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (Number(quantity) < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    cartItem.quantity = Number(quantity);
    await cartItem.save();

    return res.status(200).json({
      message: 'Cart item updated successfully.',
      item: cartItem,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({ message: 'Server error while updating cart item.' });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    return res.status(200).json({ message: 'Cart item removed successfully.' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return res.status(500).json({ message: 'Server error while deleting cart item.' });
  }
};

export const clearCartItems = async (req, res) => {
  try {
    await CartItem.deleteMany({ user: req.user.id });
    return res.status(200).json({ message: 'Cart cleared successfully.' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ message: 'Server error while clearing cart.' });
  }
};
