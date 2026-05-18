import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import CreateTicket from './components/CreateTicket';
import TicketList from './components/TicketList';
import TicketDetails from './components/TicketDetails';
import AdminCreateUser from './components/AdminCreateUser';
import UserAccounts from './components/UserAccounts';
import ChangePassword from './components/ChangePassword';
import './App.css';

// Protected Route Component
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// IT-only Route Component
function ITOnlyRoute({ children }) {
  const { currentUser, userRole } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (userRole !== 'it') return <Navigate to="/create-ticket" />;
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route 
            path="/dashboard" 
            element={
              <ITOnlyRoute>
                <Dashboard />
              </ITOnlyRoute>
            } 
          />
          <Route 
            path="/create-ticket" 
            element={
              <PrivateRoute>
                <CreateTicket />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tickets" 
            element={
              <PrivateRoute>
                <TicketList />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/ticket/:id" 
            element={
              <PrivateRoute>
                <TicketDetails />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/create-user" 
            element={
              <PrivateRoute>
                <AdminCreateUser />
              </PrivateRoute>
            } 
          />
          <Route
            path="/admin/users"
            element={
              <ITOnlyRoute>
                <UserAccounts />
              </ITOnlyRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ITOnlyRoute>
                <Navigate to="/admin/users" replace />
              </ITOnlyRoute>
            }
          />
          <Route 
            path="/change-password" 
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            } 
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navigate to="/home" replace />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
