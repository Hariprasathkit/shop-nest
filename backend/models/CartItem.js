// Cart item model for storing products that belong to a specific authenticated user.
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: [true, 'Product ID is required.'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required.'],
      trim: true,
    },
    category: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, 'Price cannot be negative.'],
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required.'],
      min: [1, 'Quantity must be at least 1.'],
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

const CartItem = mongoose.model('CartItem', cartItemSchema);

export default CartItem;
