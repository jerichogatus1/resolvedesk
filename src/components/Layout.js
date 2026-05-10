import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiHome, 
  FiPlusCircle, 
  FiList, 
  FiUsers, 
  FiLogOut, 
  FiSettings 
} from 'react-icons/fi';
import './Layout.css';

function Layout({ children }) {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const isMasterAdmin = currentUser?.email === 'master@admin.com';

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('create-ticket')) return 'Create New Ticket';
    if (path.includes('tickets')) return 'Ticket Management';
    if (path.includes('admin/create-user')) return 'User Management';
    if (path.includes('admin')) return 'IT Dashboard';
    return 'ResolveDesk';
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">
              <div className="logo-mark" aria-hidden="true">RD</div>
              <div className="logo-text">
                <h2>RESOLVEDESK</h2>
                <p>IT SOLUTION FOR BPO</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="user-profile">
          <div className="user-avatar">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <p className="user-name">{currentUser?.name || 'User'}</p>
            <p className="user-badge">
              {isMasterAdmin ? 'Master Admin' : userRole === 'it' ? 'IT Specialist' : 'BPO Staff'}
            </p>
          </div>
        </div>

        <div className="nav-section">
          <p className="nav-section-title">MAIN MENU</p>
          <ul className="nav-links">
            <li>
              <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
                <FiHome /> <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/create-ticket" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                <FiPlusCircle /> <span>Create Ticket</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/tickets" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                <FiList /> <span>My Tickets</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {(userRole === 'it' || isMasterAdmin) && (
          <div className="nav-section">
            <p className="nav-section-title">ADMINISTRATION</p>
            <ul className="nav-links">
              <li>
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <FiUsers /> <span>IT Dashboard</span>
                </NavLink>
              </li>
              {isMasterAdmin && (
                <li>
                  <NavLink to="/admin/create-user" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                    <FiSettings /> <span>User Management</span>
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="main-content app-shell-enter">
        <div className="top-bar">
          <div className="page-title">
            <h1>{getPageTitle()}</h1>
          </div>
        </div>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
