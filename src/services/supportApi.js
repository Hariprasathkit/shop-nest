import api from './api.js';

const normalizeSupportTicket = (ticket) => ({
  id: ticket.id,
  message: ticket.message,
  status: ticket.status,
  createdAt: ticket.createdAt,
  user: ticket.user
    ? {
        id: ticket.user.id,
        name: ticket.user.name,
        email: ticket.user.email,
      }
    : null,
  replies: (ticket.replies || []).map((reply) => ({
    id: reply.id,
    sender: reply.sender,
    message: reply.message,
    createdAt: reply.createdAt,
  })),
});

export const createSupportTicket = async (message) => {
  const response = await api.post('/support', { message });
  return normalizeSupportTicket(response.data.ticket);
};

export const getSupportTickets = async () => {
  const response = await api.get('/support');
  return (response.data.tickets || []).map(normalizeSupportTicket);
};

export const getMySupportTickets = async () => {
  const response = await api.get('/support/my');
  return (response.data.tickets || []).map(normalizeSupportTicket);
};

export const getSupportTicketById = async (id) => {
  const response = await api.get(`/support/${id}`);
  return normalizeSupportTicket(response.data.ticket);
};

export const replyToSupportTicket = async (id, message) => {
  const response = await api.post(`/support/${id}/reply`, { message });
  return normalizeSupportTicket(response.data.ticket);
};

export const userReplyToSupportTicket = async (id, message) => {
  const response = await api.post(`/support/${id}/user-reply`, { message });
  return normalizeSupportTicket(response.data.ticket);
};
