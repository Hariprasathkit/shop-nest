import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import sampleProducts from '../../src/data/products.json' with { type: 'json' };

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    const products = sampleProducts.map((product) => ({
      name: product.name,
      price: product.price,
      image: product.image,
      description:
        product.description ||
        `Experience premium quality and exceptional design with the ${product.name}. Expertly crafted to elevate your daily routine and built to last.`,
      category: product.category,
      stock: product.stock ?? 20,
      rating: product.rating ?? 0,
      reviews: product.reviews ?? 0,
      badge: product.badge || '',
    }));

    await Product.insertMany(products);
    console.log(`Seeded ${sampleProducts.length} products successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed products:', error.message);
    process.exit(1);
  }
};

seedProducts();
