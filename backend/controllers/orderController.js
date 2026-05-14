import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';

const normalizeOrder = (order) => ({
  id: order._id.toString(),
  user: order.user && typeof order.user === 'object'
    ? {
        id: order.user._id?.toString?.() || order.user.id,
        name: order.user.name,
        email: order.user.email,
      }
    : null,
  items: order.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    image: item.image,
    category: item.category,
    price: item.price,
    quantity: item.quantity,
  })),
  totalPrice: order.totalPrice,
  shippingAddress: order.shippingAddress
    ? {
        fullName: order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        addressLine1: order.shippingAddress.addressLine1,
        addressLine2: order.shippingAddress.addressLine2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      }
    : null,
  status: order.status,
  isPaid: Boolean(order.isPaid),
  paidAt: order.paidAt,
  paymentMethod: order.paymentMethod,
  razorpayOrderId: order.razorpayOrderId,
  razorpayPaymentId: order.razorpayPaymentId,
  createdAt: order.createdAt,
});

const normalizeShippingAddress = (shippingAddress = {}) => ({
  fullName: shippingAddress.fullName?.trim() || '',
  phone: shippingAddress.phone?.trim() || '',
  addressLine1: shippingAddress.addressLine1?.trim() || '',
  addressLine2: shippingAddress.addressLine2?.trim() || '',
  city: shippingAddress.city?.trim() || '',
  state: shippingAddress.state?.trim() || '',
  postalCode: shippingAddress.postalCode?.trim() || '',
  country: shippingAddress.country?.trim() || '',
});

const validateShippingAddress = (shippingAddress) => {
  const normalized = normalizeShippingAddress(shippingAddress);

  if (
    !normalized.fullName
    || !normalized.phone
    || !normalized.addressLine1
    || !normalized.city
    || !normalized.state
    || !normalized.postalCode
    || !normalized.country
  ) {
    return { error: 'Shipping address is required.', value: null };
  }

  return { error: null, value: normalized };
};

export const createOrder = async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const items = cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      category: item.category,
      price: Number(item.price),
      quantity: Number(item.quantity),
    }));

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { error: addressError, value: shippingAddress } = validateShippingAddress(req.body.shippingAddress);

    if (addressError) {
      return res.status(400).json({ message: addressError });
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      totalPrice,
      shippingAddress,
      status: 'pending',
      isPaid: false,
      paymentMethod: 'manual',
    });

    await CartItem.deleteMany({ user: req.user.id });

    return res.status(201).json({
      message: 'Order placed successfully.',
      order: normalizeOrder(order),
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Server error while creating order.' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      orders: orders.map(normalizeOrder),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Server error while fetching orders.' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      orders: orders.map(normalizeOrder),
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ message: 'Server error while fetching all orders.' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'paid', 'delivered'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    order.isPaid = status === 'paid' || status === 'delivered' ? true : order.isPaid;
    order.paidAt = order.isPaid && !order.paidAt ? new Date() : order.paidAt;
    await order.save();

    return res.status(200).json({
      message: 'Order status updated successfully.',
      order: normalizeOrder(order),
    });
  } catch (error) {
    console.error('Update order status error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(500).json({ message: 'Server error while updating order status.' });
  }
};
