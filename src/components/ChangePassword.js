import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { FiAlertCircle, FiCheckCircle, FiLock } from 'react-icons/fi';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import './Auth.css';

function ChangePassword() {
  const { currentUser, userRole } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!currentUser) return <Navigate to="/login" replace />;

  if (userRole === 'it') {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully.');
    } catch (err) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.');
      } else if (err?.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err?.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <div className="logo-mark" aria-hidden="true">RD</div>
              <div className="logo-text">
                <h1>RESOLVEDESK</h1>
                <p>IT SOLUTION FOR BPO</p>
              </div>
            </div>
          </div>

          <h2>Change Password</h2>
          <p className="auth-subtitle">Update your account credential</p>

          {error && (
            <div className="error-message">
              <FiAlertCircle /> {error}
            </div>
          )}
          {success && (
            <div className="success-message">
              <FiCheckCircle /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <div className="input-with-icon">
                <span className="field-icon" aria-hidden="true">
                  <FiLock />
                </span>
                <input
                  className="auth-input"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <span className="field-icon" aria-hidden="true">
                  <FiLock />
                </span>
                <input
                  className="auth-input"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <span className="field-icon" aria-hidden="true">
                  <FiLock />
                </span>
                <input
                  className="auth-input"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ChangePassword;
