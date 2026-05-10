import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  db,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from '../firebase';
import Layout from './Layout';
import './Ticket.css';

function TicketDetails() {
  const { id } = useParams();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState([]);

  const normalizeDate = (value) => {
    if (!value) return null;
    if (typeof value?.toDate === 'function') return value.toDate();
    return new Date(value);
  };

  const formatDate = (value) => {
    const date = normalizeDate(value);
    if (!date || Number.isNaN(date.getTime())) return 'N/A';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'tickets', id), (ticketDoc) => {
      if (ticketDoc.exists()) {
        setTicket({ id: ticketDoc.id, ...ticketDoc.data() });
        setStatus(ticketDoc.data().status);
      } else {
        navigate('/tickets');
      }
      setLoading(false);
    });

    if (userRole === 'it') {
      loadITStaff();
    }

    return () => unsubscribe();
  }, [id, navigate, userRole]);

  async function loadITStaff() {
    try {
      const usersQuery = query(collection(db, 'users'), where('role', '==', 'it'));
      const snapshot = await getDocs(usersQuery);
      const staffList = [];

      snapshot.forEach((userDoc) => {
        staffList.push({ id: userDoc.id, ...userDoc.data() });
      });

      setUsers(staffList);
    } catch (error) {
      console.error('Error loading IT staff:', error);
    }
  }

  async function addComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, {
        comments: arrayUnion({
          text: comment,
          author: currentUser.name,
          authorId: currentUser.uid,
          authorRole: userRole,
          timestamp: serverTimestamp(),
        }),
        updatedAt: serverTimestamp(),
      });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  async function assignTicket() {
    if (!assignTo) return;

    try {
      const selectedUser = users.find((u) => u.id === assignTo);
      const ticketRef = doc(db, 'tickets', id);

      await updateDoc(ticketRef, {
        assignedTo: assignTo,
        assignedToName: selectedUser?.name || 'Unknown',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  }

  async function updateStatus(newStatus) {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  const getStatusColor = (value) => {
    const colors = {
      open: '#0ea5e9',
      'in progress': '#f59e0b',
      resolved: '#10b981',
      closed: '#64748b',
    };
    return colors[value?.toLowerCase()] || '#64748b';
  };

  const getPriorityColor = (value) => {
    const colors = {
      low: '#d1fae5',
      medium: '#fef3c7',
      high: '#fee2e2',
      critical: '#fecaca',
    };
    return colors[value?.toLowerCase()] || '#64748b';
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading ticket...</div>
      </Layout>
    );
  }

  if (!ticket) return null;

  return (
    <Layout>
      <div className="ticket-details-container">
        <button onClick={() => navigate('/tickets')} className="back-btn">
          ← Back to Tickets
        </button>

        <div className="ticket-details">
          <div className="ticket-details-header">
            <h1>{ticket.title}</h1>
            <div className="ticket-badges">
              <span className="status-badge" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                {ticket.status}
              </span>
              <span
                className={`priority-badge priority-${ticket.priority?.toLowerCase() || 'medium'}`}
                style={{ backgroundColor: getPriorityColor(ticket.priority) }}
              >
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="ticket-info-grid">
            <div className="info-item">
              <label>Ticket ID</label>
              <span>#{ticket.id.slice(-8)}</span>
            </div>
            <div className="info-item">
              <label>Created By</label>
              <span>{ticket.creatorName}</span>
            </div>
            <div className="info-item">
              <label>Department</label>
              <span>{ticket.department}</span>
            </div>
            <div className="info-item">
              <label>Category</label>
              <span>{ticket.category}</span>
            </div>
            <div className="info-item">
              <label>Created</label>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Last Updated</label>
              <span>{formatDate(ticket.updatedAt)}</span>
            </div>
            {ticket.assignedToName && (
              <div className="info-item">
                <label>Assigned To</label>
                <span>{ticket.assignedToName}</span>
              </div>
            )}
          </div>

          <div className="ticket-description-section">
            <h3>Description</h3>
            <p>{ticket.description}</p>
          </div>

          {ticket.attachmentURL && (
            <div className="attachment-section">
              <h3>Attachment</h3>
              <a href={ticket.attachmentURL} target="_blank" rel="noopener noreferrer">
                View Attachment
              </a>
            </div>
          )}

          {userRole === 'it' && (
            <div className="it-controls">
              <h3>IT Management</h3>

              <div className="control-group">
                <label>Assign to IT Staff:</label>
                <div className="assign-control">
                  <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                    <option value="">Select IT Staff</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.department}
                      </option>
                    ))}
                  </select>
                  <button onClick={assignTicket} className="assign-btn">
                    Assign
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label>Update Status:</label>
                <div className="status-control">
                  <select value={status} onChange={(e) => updateStatus(e.target.value)}>
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="comments-section">
            <h3>Comments & Updates</h3>

            <div className="comments-list">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((ticketComment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">{ticketComment.author}</span>
                      <span className="comment-role">{ticketComment.authorRole}</span>
                      <span className="comment-date">{formatDate(ticketComment.timestamp)}</span>
                    </div>
                    <p className="comment-text">{ticketComment.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet</p>
              )}
            </div>

            <form onSubmit={addComment} className="comment-form">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment or update..."
                rows="3"
                required
              />
              <button type="submit" className="submit-comment">
                Add Comment
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default TicketDetails;
