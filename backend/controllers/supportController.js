import Support from '../models/Support.js';

const normalizeSupportTicket = (ticket) => ({
  id: ticket._id.toString(),
  message: ticket.message,
  status: ticket.status,
  createdAt: ticket.createdAt,
  user: ticket.user
    ? {
        id: ticket.user._id?.toString?.() || ticket.user.id,
        name: ticket.user.name,
        email: ticket.user.email,
      }
    : null,
  replies: (ticket.replies || []).map((reply, index) => ({
    id: `${ticket._id.toString()}-${index}-${new Date(reply.createdAt).getTime()}`,
    sender: reply.sender,
    message: reply.message,
    createdAt: reply.createdAt,
  })),
});

const validateReplyMessage = (message) => {
  if (!message?.trim()) {
    return 'Reply message is required.';
  }

  return null;
};

const buildReply = (sender, message) => ({
  sender,
  message: message.trim(),
  createdAt: new Date(),
});

const findTicketForUser = async (ticketId, user) => {
  if (user.isAdmin) {
    return Support.findById(ticketId).populate('user', 'name email');
  }

  return Support.findOne({ _id: ticketId, user: user.id }).populate('user', 'name email');
};

export const createSupportTicket = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Support message is required.' });
    }

    const ticket = await Support.create({
      user: req.user.id,
      message: message.trim(),
      status: 'open',
      replies: [],
    });

    const populatedTicket = await ticket.populate('user', 'name email');

    return res.status(201).json({
      message: 'Support request submitted successfully.',
      ticket: normalizeSupportTicket(populatedTicket),
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    return res.status(500).json({ message: 'Unable to submit support request.' });
  }
};

export const getSupportTickets = async (_req, res) => {
  try {
    const tickets = await Support.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      tickets: tickets.map(normalizeSupportTicket),
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    return res.status(500).json({ message: 'Unable to load support tickets.' });
  }
};

export const getMySupportTickets = async (req, res) => {
  try {
    const tickets = await Support.find({ user: req.user.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      tickets: tickets.map(normalizeSupportTicket),
    });
  } catch (error) {
    console.error('Get my support tickets error:', error);
    return res.status(500).json({ message: 'Unable to load your support tickets.' });
  }
};

export const getSupportTicketById = async (req, res) => {
  try {
    const ticket = await findTicketForUser(req.params.id, req.user);

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    return res.status(200).json({
      ticket: normalizeSupportTicket(ticket),
    });
  } catch (error) {
    console.error('Get support ticket error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    return res.status(500).json({ message: 'Unable to load support ticket.' });
  }
};

export const replyToSupportTicket = async (req, res) => {
  try {
    const validationError = validateReplyMessage(req.body.message);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const ticket = await Support.findById(req.params.id).populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    ticket.replies.push(buildReply('admin', req.body.message));

    if (ticket.status !== 'resolved') {
      ticket.status = 'in-progress';
    }

    await ticket.save();

    return res.status(200).json({
      message: 'Reply sent successfully.',
      ticket: normalizeSupportTicket(ticket),
    });
  } catch (error) {
    console.error('Admin reply error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    return res.status(500).json({ message: 'Unable to send reply.' });
  }
};

export const userReplyToSupportTicket = async (req, res) => {
  try {
    const validationError = validateReplyMessage(req.body.message);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const ticket = await Support.findOne({ _id: req.params.id, user: req.user.id }).populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    ticket.replies.push(buildReply('user', req.body.message));

    if (ticket.status !== 'resolved') {
      ticket.status = 'in-progress';
    }

    await ticket.save();

    return res.status(200).json({
      message: 'Reply sent successfully.',
      ticket: normalizeSupportTicket(ticket),
    });
  } catch (error) {
    console.error('User reply error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    return res.status(500).json({ message: 'Unable to send reply.' });
  }
};
