import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Wishlist from '../models/Wishlist.js';

const normalizeWishlistItem = (entry) => ({
  id: entry._id.toString(),
  product: {
    _id: entry.product._id.toString(),
    name: entry.product.name,
    price: entry.product.price,
    image: entry.product.image,
    description: entry.product.description,
    category: entry.product.category,
    stock: entry.product.stock,
    rating: entry.product.rating ?? 0,
    reviews: entry.product.reviews ?? 0,
    badge: entry.product.badge || '',
  },
  createdAt: entry.createdAt,
});

export const addWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'A valid product ID is required.' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const existingItem = await Wishlist.findOne({ user: req.user.id, product: productId }).populate('product');

    if (existingItem) {
      return res.status(200).json({
        message: 'Product is already in your wishlist.',
        item: normalizeWishlistItem(existingItem),
      });
    }

    const wishlistItem = await Wishlist.create({
      user: req.user.id,
      product: productId,
    });

    const populatedItem = await Wishlist.findById(wishlistItem._id).populate('product');

    return res.status(201).json({
      message: 'Product added to wishlist.',
      item: normalizeWishlistItem(populatedItem),
    });
  } catch (error) {
    console.error('Add wishlist item error:', error);
    return res.status(500).json({ message: 'Server error while updating wishlist.' });
  }
};

export const getWishlistItems = async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user.id })
      .populate('product')
      .sort({ createdAt: -1 });

    const validItems = items.filter((item) => item.product);

    return res.status(200).json({
      items: validItems.map(normalizeWishlistItem),
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({ message: 'Server error while fetching wishlist.' });
  }
};

export const deleteWishlistItem = async (req, res) => {
  try {
    const item = await Wishlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Wishlist item not found.' });
    }

    return res.status(200).json({ message: 'Wishlist item removed successfully.' });
  } catch (error) {
    console.error('Delete wishlist item error:', error);
    return res.status(500).json({ message: 'Server error while removing wishlist item.' });
  }
};
