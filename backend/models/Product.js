import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required.'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, 'Product price cannot be negative.'],
    },
    image: {
      type: String,
      required: [true, 'Product image is required.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Product category is required.'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required.'],
      min: [0, 'Product stock cannot be negative.'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    badge: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ createdAt: 1, _id: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
