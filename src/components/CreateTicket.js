import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
} from '../firebase';
import Layout from './Layout';
import './Ticket.css';

function CreateTicket() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && userRole === 'it') {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, userRole, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hardware',
    priority: 'medium',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Hardware', 'Software', 'Network', 'Account Access', 'Other'];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'tickets'), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'open',
        creatorId: currentUser.uid,
        creatorName: currentUser.name,
        creatorEmail: currentUser.email,
        department: currentUser.department,
        attachmentURL: null,
        assignedTo: null,
        assignedToName: null,
        comments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      navigate('/tickets');
    } catch (err) {
      setError('Failed to create ticket: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <Layout>
      <div className="ticket-container">
        <div className="ticket-header">
          <h1>Create New Support Ticket</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Brief summary of the issue"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Detailed description of the problem..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority *</label>
              <select name="priority" value={formData.priority} onChange={handleChange} required>
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/tickets')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating Ticket...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default CreateTicket;
