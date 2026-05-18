import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import app from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Layout from './Layout';
import './Admin.css';

const functions = getFunctions(app);

function AdminCreateUser() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'bpo',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const departments = [
    'BPO Operations',
    'Customer Service',
    'Technical Support',
    'Sales',
    'Marketing',
    'HR',
    'Finance',
    'IT Department',
  ];

  const isMasterAdmin = currentUser?.email === 'master@admin.com';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const createUserAccount = httpsCallable(functions, 'createUserAccount');
      await createUserAccount({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        name: formData.name,
        createdBy: currentUser.email,
      });

      setSuccess(`User ${formData.name} created successfully!`);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'bpo',
        department: '',
      });
    } catch (err) {
      setError('Failed to create user: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  if (!isMasterAdmin) {
    return (
      <Layout>
        <div className="admin-container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>Only the Master Admin can access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Panel - Create Users</h1>
          <p>Master Admin: create accounts for IT staff and employees</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="admin-form-card">
          <h2>Create New User Account</h2>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Temporary Password *</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter temporary password"
                minLength="6"
              />
              <small>Password must be at least 6 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} required>
                <option value="bpo">Employee (Can only create tickets)</option>
                <option value="it">IT Staff (Can view and edit all tickets)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select id="department" name="department" value={formData.department} onChange={handleChange} required>
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating User...' : 'Create User Account'}
            </button>
          </form>
        </div>

        <div className="info-box">
          <h3>Account Types:</h3>
          <ul>
            <li>
              <strong>IT Staff:</strong> Can view all tickets, update status, assign tickets, add comments
            </li>
            <li>
              <strong>Employee:</strong> Can only create tickets and view their own tickets
            </li>
          </ul>
          <p className="note">New users will use the email and temporary password you set to login.</p>
        </div>
      </div>
    </Layout>
  );
}

export default AdminCreateUser;
