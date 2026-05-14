import Product from '../models/Product.js';

const normalizeProduct = (product) => ({
  _id: product._id.toString(),
  name: product.name,
  price: product.price,
  image: product.image,
  description: product.description,
  category: product.category,
  stock: product.stock,
  rating: product.rating ?? 0,
  reviews: product.reviews ?? 0,
  badge: product.badge || '',
});

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const buildProductQuery = ({ keyword = '', category = '', minPrice, maxPrice }) => {
  const query = {};

  if (keyword.trim()) {
    query.name = { $regex: keyword.trim(), $options: 'i' };
  }

  if (category.trim() && category.trim().toLowerCase() !== 'all') {
    query.category = category.trim();
  }

  const min = parseOptionalNumber(minPrice);
  const max = parseOptionalNumber(maxPrice);

  if (min !== null || max !== null) {
    query.price = {};

    if (min !== null) {
      query.price.$gte = min;
    }

    if (max !== null) {
      query.price.$lte = max;
    }
  }

  return query;
};

const validateProductPayload = ({ name, price, image, description, category, stock }) => {
  if (!name?.trim() || !image?.trim() || !description?.trim() || !category?.trim()) {
    return 'Name, image, description, and category are required.';
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);

  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return 'Price must be a valid non-negative number.';
  }

  if (Number.isNaN(parsedStock) || parsedStock < 0) {
    return 'Stock must be a valid non-negative number.';
  }

  return null;
};

export const getProducts = async (req, res, next) => {
  try {
    const query = buildProductQuery(req.query);
    const products = await Product.find(query).sort({ createdAt: 1, _id: 1 });

    res.status(200).json({
      products: products.map(normalizeProduct),
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({
      product: normalizeProduct(product),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found.' });
    }

    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const validationError = validateProductPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.create({
      name: req.body.name.trim(),
      price: Number(req.body.price),
      image: req.body.image.trim(),
      description: req.body.description.trim(),
      category: req.body.category.trim(),
      stock: Number(req.body.stock),
      rating: parseOptionalNumber(req.body.rating) ?? 0,
      reviews: parseOptionalNumber(req.body.reviews) ?? 0,
      badge: req.body.badge?.trim() || '',
    });

    return res.status(201).json({
      message: 'Product created successfully.',
      product: normalizeProduct(product),
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const validationError = validateProductPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    product.name = req.body.name.trim();
    product.price = Number(req.body.price);
    product.image = req.body.image.trim();
    product.description = req.body.description.trim();
    product.category = req.body.category.trim();
    product.stock = Number(req.body.stock);
    product.rating = parseOptionalNumber(req.body.rating) ?? 0;
    product.reviews = parseOptionalNumber(req.body.reviews) ?? 0;
    product.badge = req.body.badge?.trim() || '';

    await product.save();

    return res.status(200).json({
      message: 'Product updated successfully.',
      product: normalizeProduct(product),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found.' });
    }

    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await product.deleteOne();

    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found.' });
    }

    next(error);
  }
};
