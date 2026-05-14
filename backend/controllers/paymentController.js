import crypto from 'crypto';
import Razorpay from 'razorpay';
import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';

const normalizeOrder = (order) => ({
  id: order._id.toString(),
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

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are missing from environment variables.');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const mapCartItemsToOrderItems = (cartItems) => cartItems.map((item) => ({
  productId: item.productId,
  name: item.name,
  image: item.image,
  category: item.category,
  price: Number(item.price),
  quantity: Number(item.quantity),
}));

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

const areItemsEqual = (leftItems, rightItems) => {
  if (leftItems.length !== rightItems.length) {
    return false;
  }

  return leftItems.every((leftItem, index) => {
    const rightItem = rightItems[index];

    return (
      leftItem.productId === rightItem.productId
      && leftItem.name === rightItem.name
      && leftItem.image === rightItem.image
      && leftItem.category === rightItem.category
      && Number(leftItem.price) === Number(rightItem.price)
      && Number(leftItem.quantity) === Number(rightItem.quantity)
    );
  });
};

const buildPaymentOrderResponse = (order, amount) => ({
  key: process.env.RAZORPAY_KEY_ID,
  amount,
  currency: 'INR',
  orderId: order.razorpayOrderId,
  shopOrderId: order._id.toString(),
});

export const createPaymentOrder = async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const items = mapCartItemsToOrderItems(cartItems);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amount = Math.round(totalPrice * 100);
    const { error: addressError, value: shippingAddress } = validateShippingAddress(req.body.shippingAddress);

    if (addressError) {
      return res.status(400).json({ message: addressError });
    }

    const existingOrder = await Order.findOne({
      user: req.user.id,
      paymentMethod: 'razorpay',
      isPaid: false,
      status: 'pending',
    }).sort({ createdAt: -1 });

    if (
      existingOrder
      && existingOrder.razorpayOrderId
      && Number(existingOrder.totalPrice) === totalPrice
      && areItemsEqual(existingOrder.items, items)
    ) {
      existingOrder.shippingAddress = shippingAddress;
      await existingOrder.save();

      return res.status(200).json({
        ...buildPaymentOrderResponse(existingOrder, amount),
        reused: true,
      });
    }

    const order = existingOrder
      && Number(existingOrder.totalPrice) === totalPrice
      && areItemsEqual(existingOrder.items, items)
        ? existingOrder
        : await Order.create({
            user: req.user.id,
            items,
            totalPrice,
            shippingAddress,
            status: 'pending',
            isPaid: false,
            paymentMethod: 'razorpay',
          });

    order.items = items;
    order.totalPrice = totalPrice;
    order.shippingAddress = shippingAddress;
    order.status = 'pending';
    order.isPaid = false;
    order.paymentMethod = 'razorpay';
    order.paidAt = null;
    order.razorpayPaymentId = '';
    order.razorpaySignature = '';
    order.receipt = `shopnest_${order._id.toString().slice(-10)}`;

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: order.receipt,
      notes: {
        shopOrderId: order._id.toString(),
        userId: req.user.id,
        shippingCity: shippingAddress.city,
        shippingPostalCode: shippingAddress.postalCode,
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      ...buildPaymentOrderResponse(order, razorpayOrder.amount),
      reused: false,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({ message: 'Unable to initialize payment.' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      shopOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!shopOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification details are required.' });
    }

    const order = await Order.findOne({ _id: shopOrderId, user: req.user.id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.isPaid) {
      return res.status(200).json({
        message: 'Payment already verified.',
        order: normalizeOrder(order),
      });
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ message: 'Payment order mismatch.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    order.status = 'paid';
    order.isPaid = true;
    order.paidAt = new Date();
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    await CartItem.deleteMany({ user: req.user.id });

    return res.status(200).json({
      message: 'Payment verified successfully.',
      order: normalizeOrder(order),
    });
  } catch (error) {
    console.error('Verify payment error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(500).json({ message: 'Unable to verify payment.' });
  }
};
