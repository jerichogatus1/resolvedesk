import React, { useEffect, useMemo, useState } from 'react';
import { db, collection, onSnapshot, query, where } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import './Admin.css';

function UserAccounts() {
  const { currentUser, userRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTickets, setUserTickets] = useState([]);
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [error, setError] = useState('');

  const canManageAccounts = userRole === 'it' || currentUser?.email === 'master@admin.com';

  useEffect(() => {
    if (!canManageAccounts) return undefined;

    const usersQuery = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setUsers(data);
        setLoadingUsers(false);
      },
      () => {
        setError('Failed to load user accounts.');
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, [canManageAccounts]);

  useEffect(() => {
    if (!selectedUser) {
      setUserTickets([]);
      return undefined;
    }

    setLoadingTickets(true);
    const ticketQuery = query(collection(db, 'tickets'), where('creatorId', '==', selectedUser.id));

    const unsubscribe = onSnapshot(
      ticketQuery,
      (snapshot) => {
        const tickets = [];
        snapshot.forEach((doc) => {
          tickets.push({ id: doc.id, ...doc.data() });
        });
        tickets.sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });
        setUserTickets(tickets);
        setLoadingTickets(false);
      },
      () => {
        setError('Failed to load user tickets.');
        setLoadingTickets(false);
      }
    );

    return () => unsubscribe();
  }, [selectedUser]);

  const selectedUserTicketCount = useMemo(() => userTickets.length, [userTickets]);
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => (user.name || '').toLowerCase().includes(term));
  }, [users, searchTerm]);

  const filteredUserTickets = useMemo(() => {
    if (ticketStatusFilter === 'all') return userTickets;
    return userTickets.filter((ticket) => (ticket.status || '').toLowerCase() === ticketStatusFilter);
  }, [userTickets, ticketStatusFilter]);

  const formatLabel = (value) =>
    (value || '')
      .toString()
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  if (!canManageAccounts) {
    return (
      <Layout>
        <div className="admin-container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>Only IT staff and Master Admin can access account management.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-container admin-accounts-grid">
        <div>
          <div className="admin-header">
            <h1>User Accounts</h1>
            <p>Select an account to view submitted tickets.</p>
          </div>
          {error && <div className="error-message">{error}</div>}

          <div className="admin-form-card">
            <h2>Registered Accounts</h2>
            <div className="form-group">
              <label htmlFor="user-search">Search by Name</label>
              <input
                id="user-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type a name..."
              />
            </div>
            {loadingUsers ? (
              <p>Loading accounts...</p>
            ) : filteredUsers.length === 0 ? (
              <p>No matching accounts found.</p>
            ) : (
              <div className="account-list">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`account-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <span className="account-name">{user.name || 'Unnamed User'}</span>
                    <span className="account-meta">{user.email}</span>
                    <span className="account-role">{(user.role || 'bpo').toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-form-card">
          <h2>Account Details</h2>
          {!selectedUser ? (
            <p>Select an account from the list.</p>
          ) : (
            <>
              <p className="account-detail-line">
                <strong>Name:</strong> {selectedUser.name || 'N/A'}
              </p>
              <p className="account-detail-line">
                <strong>Email:</strong> {selectedUser.email || 'N/A'}
              </p>
              <p className="account-detail-line">
                <strong>Department:</strong> {selectedUser.department || 'N/A'}
              </p>
              <p className="account-detail-line">
                <strong>Role:</strong> {(selectedUser.role || 'bpo').toUpperCase()}
              </p>

              <div className="account-tickets-box">
                <h3>Submitted Tickets ({selectedUserTicketCount})</h3>
                <div className="form-group">
                  <label htmlFor="ticket-status-filter">Filter by Status</label>
                  <select
                    id="ticket-status-filter"
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                {loadingTickets ? (
                  <p>Loading tickets...</p>
                ) : filteredUserTickets.length === 0 ? (
                  <p>No submitted tickets for this account.</p>
                ) : (
                  <ul className="ticket-mini-list">
                    {filteredUserTickets.map((ticket) => (
                      <li key={ticket.id}>
                        <span>#{ticket.id.slice(-6).toUpperCase()}</span>
                        <span>{ticket.title || 'Untitled Ticket'}</span>
                        <span className="ticket-mini-status">{formatLabel(ticket.status || 'open')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UserAccounts;
