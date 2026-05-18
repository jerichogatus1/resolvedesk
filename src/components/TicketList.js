import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, query, where, onSnapshot } from '../firebase';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import './Ticket.css';

function TicketList() {
  const { currentUser, userRole } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const normalizeDate = (value) => {
    if (!value) return null;
    if (typeof value?.toDate === 'function') return value.toDate();
    return new Date(value);
  };

  const formatDate = (value) => {
    const date = normalizeDate(value);
    if (!date || Number.isNaN(date.getTime())) return 'N/A';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatLabel = (value) =>
    (value || '')
      .toString()
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  useEffect(() => {
    if (!currentUser) return undefined;

    const q =
      userRole === 'it'
        ? query(collection(db, 'tickets'))
        : query(collection(db, 'tickets'), where('creatorId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ticketData = [];
        snapshot.forEach((doc) => {
          ticketData.push({ id: doc.id, ...doc.data() });
        });
        ticketData.sort((a, b) => {
          const aDate = normalizeDate(a.createdAt)?.getTime() ?? 0;
          const bDate = normalizeDate(b.createdAt)?.getTime() ?? 0;
          return bDate - aDate;
        });
        setTickets(ticketData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, userRole]);

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading tickets...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="ticket-list-container">
        <div className="ticket-list-header">
          <h1>Support Tickets</h1>
          <Link to="/create-ticket" className="create-ticket-btn">
            + New Ticket
          </Link>
        </div>

        <div className="filter-bar">
          <label htmlFor="ticket-filter">Filter by Status:</label>
          <select id="ticket-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="no-tickets">
            <p>No tickets found</p>
            <Link to="/create-ticket" className="create-first-ticket">
              Create your first ticket
            </Link>
          </div>
        ) : (
          <div className="ticket-grid">
            {filteredTickets.map((ticket) => (
              <Link to={`/ticket/${ticket.id}`} key={ticket.id} className="ticket-card">
                <div className="ticket-card-header">
                  <h3>{ticket.title}</h3>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                    {formatLabel(ticket.status)}
                  </span>
                </div>

                <p className="ticket-description">
                  {(ticket.description || '').substring(0, 100)}
                  {(ticket.description || '').length > 100 ? '...' : ''}
                </p>

                <div className="ticket-meta">
                  <span>#{ticket.id.slice(-6)}</span>
                  <span>{ticket.category}</span>
                </div>

                <div className="ticket-footer">
                  <span
                    className={`priority-badge priority-${ticket.priority?.toLowerCase() || 'medium'}`}
                    style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                  >
                    {formatLabel(ticket.priority)}
                  </span>
                  <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                </div>

                {ticket.assignedToName && <div className="assigned-info">Assigned to: {ticket.assignedToName}</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function getStatusColor(status) {
  const colors = {
    open: '#0ea5e9',
    'in progress': '#f59e0b',
    resolved: '#10b981',
    closed: '#64748b',
  };

  return colors[status?.toLowerCase()] || '#64748b';
}

function getPriorityColor(priority) {
  const colors = {
    low: '#d1fae5',
    medium: '#fef3c7',
    high: '#fee2e2',
    critical: '#fecaca',
  };

  return colors[priority?.toLowerCase()] || '#64748b';
}

export default TicketList;
