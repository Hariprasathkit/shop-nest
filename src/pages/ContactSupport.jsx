import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headset } from 'lucide-react';
import {
  createSupportTicket,
  getMySupportTickets,
  userReplyToSupportTicket,
} from '../services/supportApi.js';

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

const ContactSupport = () => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || tickets[0] || null;

  const loadTickets = async () => {
    setTicketsLoading(true);

    try {
      const data = await getMySupportTickets();
      setTickets(data);
      setSelectedTicketId((previous) => (previous && data.some((ticket) => ticket.id === previous) ? previous : data[0]?.id || ''));
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message || 'Unable to load support tickets.');
      setTickets([]);
      setSelectedTicketId('');
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const ticket = await createSupportTicket(message);
      setMessage('');
      setTickets((previous) => [ticket, ...previous]);
      setSelectedTicketId(ticket.id);
      setSuccess('Your support request has been sent. Our team will get back to you soon.');
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || 'Unable to send support request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (!selectedTicket) {
      return;
    }

    setReplySubmitting(true);
    setError('');
    setSuccess('');

    try {
      const updatedTicket = await userReplyToSupportTicket(selectedTicket.id, replyMessage);
      setTickets((previous) => previous.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)));
      setReplyMessage('');
      setSuccess('Your reply has been sent.');
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || 'Unable to send reply.');
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <motion.div className="page auth-page" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="content-container support-shell">
        <motion.div className="auth-copy" variants={itemVariants}>
          <span className="auth-kicker">Customer Support</span>
          <h1>
            Need help with <span className="highlight">ShopNest</span>?
          </h1>
          <p className="lead auth-lead">
            Start a ticket, review replies from the support team, and continue the conversation in one place.
          </p>
        </motion.div>

        <motion.div className="auth-card" variants={itemVariants}>
          <div className="auth-card-header">
            <div className="auth-card-icon">
              <Headset size={20} />
            </div>
            <div>
              <h2>Open a new ticket</h2>
              <p>Tell us what happened and we will respond inside the thread.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Message</span>
              <textarea
                name="message"
                rows="6"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe your issue, question, or request..."
                required
              />
            </label>

            {success ? <p className="form-message success">{success}</p> : null}
            {error ? <p className="form-message error">{error}</p> : null}

            <motion.button type="submit" className="btn primary-btn auth-submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={submitting}>
              {submitting ? 'Sending...' : 'Submit Request'}
            </motion.button>
          </form>

          <p className="auth-switch">
            Want to check your account too? <Link to="/profile">Go to profile</Link>
          </p>
        </motion.div>

        <motion.div className="profile-orders-card support-threads-card" variants={itemVariants}>
          <div className="admin-section-header">
            <div>
              <span className="auth-kicker">Your Tickets</span>
              <h2>Conversation history</h2>
            </div>
            <button type="button" className="btn secondary-btn" onClick={loadTickets}>Refresh</button>
          </div>

          {ticketsLoading ? (
            <p className="form-message">Loading your tickets...</p>
          ) : tickets.length ? (
            <div className="support-layout">
              <div className="support-ticket-list">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    className={`support-ticket-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <div className="support-ticket-item-top">
                      <strong>Ticket #{ticket.id.slice(-6).toUpperCase()}</strong>
                      <span className={`stock-pill ${getSupportStatusClass(ticket.status)}`}>{ticket.status}</span>
                    </div>
                    <p>{ticket.message}</p>
                  </button>
                ))}
              </div>

              {selectedTicket ? (
                <div className="support-thread-card">
                  <div className="support-thread-header">
                    <div>
                      <strong>Ticket #{selectedTicket.id.slice(-6).toUpperCase()}</strong>
                      <p>{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`stock-pill ${getSupportStatusClass(selectedTicket.status)}`}>{selectedTicket.status}</span>
                  </div>

                  <div className="support-chat-list">
                    <div className="support-chat-message user">
                      <div className="support-chat-bubble">
                        <span className="support-chat-label">You</span>
                        <p>{selectedTicket.message}</p>
                        <time>{new Date(selectedTicket.createdAt).toLocaleString()}</time>
                      </div>
                    </div>
                    {selectedTicket.replies.map((reply) => (
                      <div key={reply.id} className={`support-chat-message ${reply.sender}`}>
                        <div className="support-chat-bubble">
                          <span className="support-chat-label">{reply.sender === 'admin' ? 'Support Team' : 'You'}</span>
                          <p>{reply.message}</p>
                          <time>{new Date(reply.createdAt).toLocaleString()}</time>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTicket.status !== 'resolved' ? (
                    <form className="auth-form" onSubmit={handleReplySubmit}>
                      <label className="form-field">
                        <span>Reply</span>
                        <textarea
                          rows="4"
                          value={replyMessage}
                          onChange={(event) => setReplyMessage(event.target.value)}
                          placeholder="Add more details or respond to support..."
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
            <p className="form-message">No support requests yet. Start a new conversation above.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactSupport;
