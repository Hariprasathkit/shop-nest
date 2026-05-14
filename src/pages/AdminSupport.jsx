import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy } from 'lucide-react';
import { getSupportTickets, replyToSupportTicket } from '../services/supportApi.js';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 110, damping: 14 },
  },
};

const getSupportStatusClass = (status) => {
  if (status === 'resolved') {
    return 'status-delivered';
  }

  if (status === 'in-progress') {
    return 'status-paid';
  }

  return 'status-pending';
};

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || tickets[0] || null;

  const loadTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getSupportTickets();
      setTickets(data);
      setSelectedTicketId((previous) => (previous && data.some((ticket) => ticket.id === previous) ? previous : data[0]?.id || ''));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load support tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (!selectedTicket) {
      return;
    }

    setReplySubmitting(true);
    setError('');

    try {
      const updatedTicket = await replyToSupportTicket(selectedTicket.id, replyMessage);
      setTickets((previous) => previous.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)));
      setReplyMessage('');
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || 'Unable to send reply.');
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <motion.div className="page admin-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="content-container admin-shell">
        <motion.div className="admin-card" variants={itemVariants}>
          <div className="admin-section-header">
            <div>
              <span className="auth-kicker">Support Inbox</span>
              <h1>Customer support requests</h1>
            </div>
            <button type="button" className="btn secondary-btn" onClick={loadTickets}>Refresh</button>
          </div>

          {error ? <p className="form-message error">{error}</p> : null}

          {loading ? (
            <p className="form-message">Loading support tickets...</p>
          ) : tickets.length ? (
            <div className="support-layout support-layout-admin">
              <div className="support-ticket-list">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    className={`support-ticket-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <div className="support-ticket-item-top">
                      <strong>{ticket.user?.name || 'Unknown user'}</strong>
                      <span className={`stock-pill ${getSupportStatusClass(ticket.status)}`}>{ticket.status}</span>
                    </div>
                    <p>{ticket.user?.email || 'No email available'}</p>
                    <small>{ticket.message}</small>
                  </button>
                ))}
              </div>

              {selectedTicket ? (
                <div className="support-thread-card">
                  <div className="support-thread-header">
                    <div className="d-flex align-items-center gap-2">
                      <div className="admin-stat-icon">
                        <LifeBuoy size={18} />
                      </div>
                      <div>
                        <strong>{selectedTicket.user?.name || 'Unknown user'}</strong>
                        <p>{selectedTicket.user?.email || 'No email available'}</p>
                      </div>
                    </div>
                    <span className={`stock-pill ${getSupportStatusClass(selectedTicket.status)}`}>{selectedTicket.status}</span>
                  </div>

                  <div className="support-chat-list">
                    <div className="support-chat-message user">
                      <div className="support-chat-bubble">
                        <span className="support-chat-label">Customer</span>
                        <p>{selectedTicket.message}</p>
                        <time>{new Date(selectedTicket.createdAt).toLocaleString()}</time>
                      </div>
                    </div>
                    {selectedTicket.replies.map((reply) => (
                      <div key={reply.id} className={`support-chat-message ${reply.sender}`}>
                        <div className="support-chat-bubble">
                          <span className="support-chat-label">{reply.sender === 'admin' ? 'Admin' : 'Customer'}</span>
                          <p>{reply.message}</p>
                          <time>{new Date(reply.createdAt).toLocaleString()}</time>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTicket.status !== 'resolved' ? (
                    <form className="auth-form" onSubmit={handleReplySubmit}>
                      <label className="form-field">
                        <span>Reply as admin</span>
                        <textarea
                          rows="4"
                          value={replyMessage}
                          onChange={(event) => setReplyMessage(event.target.value)}
                          placeholder="Write your reply to the customer..."
                          required
                        />
                      </label>
                      <motion.button type="submit" className="btn primary-btn" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={replySubmitting}>
                        {replySubmitting ? 'Sending...' : 'Send Reply'}
                      </motion.button>
                    </form>
                  ) : (
                    <p className="form-message">This ticket is resolved.</p>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="form-message">No support requests yet.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminSupport;
