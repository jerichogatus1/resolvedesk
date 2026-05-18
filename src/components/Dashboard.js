import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, query, where, onSnapshot } from '../firebase';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiInbox,
  FiArrowRight,
  FiTrendingUp,
  FiPlusCircle,
} from 'react-icons/fi';
import './Dashboard.css';

function Dashboard() {
  const { currentUser, userRole } = useAuth();
  const [metrics, setMetrics] = useState({
    totalOpen: 0,
    inProgress: 0,
    resolvedToday: 0,
    totalTickets: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeDate = (value) => {
    if (!value) return null;
    if (typeof value?.toDate === 'function') return value.toDate();
    return new Date(value);
  };

  const formatDate = (value) => {
    const date = normalizeDate(value);
    if (!date || Number.isNaN(date.getTime())) return 'N/A';

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
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

    const ticketsQuery =
      userRole === 'it'
        ? query(collection(db, 'tickets'), where('status', 'in', ['open', 'in progress', 'resolved']))
        : query(collection(db, 'tickets'), where('creatorId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        const tickets = [];
        let openCount = 0;
        let inProgressCount = 0;
        let resolvedTodayCount = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        snapshot.forEach((doc) => {
          const ticket = { id: doc.id, ...doc.data() };
          tickets.push(ticket);

          if (ticket.status === 'open') openCount += 1;
          if (ticket.status === 'in progress') inProgressCount += 1;

          if (ticket.status === 'resolved' && ticket.updatedAt) {
            const updatedDate = normalizeDate(ticket.updatedAt);
            if (updatedDate) {
              updatedDate.setHours(0, 0, 0, 0);
              if (updatedDate.getTime() === today.getTime()) {
                resolvedTodayCount += 1;
              }
            }
          }
        });

        tickets.sort((a, b) => {
          const aDate = normalizeDate(a.createdAt)?.getTime() ?? 0;
          const bDate = normalizeDate(b.createdAt)?.getTime() ?? 0;
          return bDate - aDate;
        });

        setMetrics({
          totalOpen: openCount,
          inProgress: inProgressCount,
          resolvedToday: resolvedTodayCount,
          totalTickets: tickets.length,
        });
        setRecentTickets(tickets.slice(0, 5));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [currentUser, userRole]);

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <div className="loading-spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome back, {currentUser?.name}!</h1>
          <p className="welcome-text">Here is the latest activity across your support queue.</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <FiInbox />
            </div>
            <h3>Open Tickets</h3>
            <p className="metric-value">{metrics.totalOpen}</p>
            <div className="metric-trend">
              <FiTrendingUp /> Live ticket volume
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FiClock />
            </div>
            <h3>In Progress</h3>
            <p className="metric-value">{metrics.inProgress}</p>
            <div className="metric-trend">
              {metrics.totalTickets > 0
                ? `${Math.round((metrics.inProgress / metrics.totalTickets) * 100)}% of total`
                : 'No active tickets'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FiCheckCircle />
            </div>
            <h3>Resolved Today</h3>
            <p className="metric-value">{metrics.resolvedToday}</p>
            <div className="metric-trend">
              {metrics.resolvedToday > 0 ? 'Great progress today' : 'No resolutions yet'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FiAlertCircle />
            </div>
            <h3>Total Tickets</h3>
            <p className="metric-value">{metrics.totalTickets}</p>
            <div className="metric-trend">All-time ticket count</div>
          </div>
        </div>

        <div className="recent-tickets">
          <div className="section-header">
            <h2>Recent Ticket Activity</h2>
            <Link to="/tickets" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="no-tickets">
              <div className="no-tickets-icon">Tickets</div>
              <h3>No tickets yet</h3>
              <p>Create your first support ticket to get started</p>
              <Link to="/create-ticket" className="create-first-ticket">
                <FiPlusCircle /> Create Your First Ticket
              </Link>
            </div>
          ) : (
            <div className="tickets-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>#{ticket.id.slice(-6).toUpperCase()}</td>
                      <td>{ticket.title}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            ticket.status === 'in progress' ? 'in-progress' : ticket.status
                          }`}
                        >
                          {formatLabel(ticket.status)}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-indicator priority-${ticket.priority}`}>
                          <span className="priority-dot" />
                          {formatLabel(ticket.priority)}
                        </span>
                      </td>
                      <td>{formatDate(ticket.createdAt)}</td>
                      <td>
                        <Link to={`/ticket/${ticket.id}`} className="view-btn">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
