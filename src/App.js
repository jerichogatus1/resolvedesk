import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateTicket from './components/CreateTicket';
import TicketList from './components/TicketList';
import TicketDetails from './components/TicketDetails';
import AdminCreateUser from './components/AdminCreateUser';
import './App.css';

// Protected Route Component
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
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
            path="/admin"
            element={
              <PrivateRoute>
                <Navigate to="/tickets" replace />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
