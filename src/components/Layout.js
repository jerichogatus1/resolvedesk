import React, { useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiBell,
  FiChevronRight,
  FiCommand,
  FiCompass,
  FiHome, 
  FiList,
  FiMenu,
  FiPlusCircle,
  FiUsers, 
  FiLogOut, 
  FiSettings,
  FiX,
} from 'react-icons/fi';
import './Layout.css';

function Layout({ children }) {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const isMasterAdmin = currentUser?.email === 'master@admin.com';

  const pageMeta = useMemo(() => {
    const path = location.pathname;
    if (path.includes('dashboard')) {
      return {
        title: 'Command Center',
        subtitle: 'Live ticket activity, SLA health, and support workload.',
        crumbs: [{ label: 'Home', to: userRole === 'it' ? '/dashboard' : '/home' }, { label: 'Dashboard' }],
      };
    }
    if (path.includes('create-ticket')) {
      return {
        title: 'Create Ticket',
        subtitle: 'Capture a request with the context IT needs to respond quickly.',
        crumbs: [{ label: 'Home', to: userRole === 'it' ? '/dashboard' : '/home' }, { label: 'New Ticket' }],
      };
    }
    if (path.includes('/ticket/')) {
      return {
        title: 'Ticket Detail',
        subtitle: 'Timeline, ownership, SLA health, and conversation history.',
        crumbs: [
          { label: 'Home', to: userRole === 'it' ? '/dashboard' : '/home' },
          { label: 'Tickets', to: '/tickets' },
          { label: 'Detail' },
        ],
      };
    }
    if (path.includes('tickets')) {
      return {
        title: 'Ticket Queue',
        subtitle: userRole === 'it' ? 'Triage and manage every active request.' : 'Track your submitted requests.',
        crumbs: [{ label: 'Home', to: userRole === 'it' ? '/dashboard' : '/home' }, { label: 'Tickets' }],
      };
    }
    if (path.includes('admin/create-user')) {
      return {
        title: 'User Management',
        subtitle: 'Provision IT and employee access for ResolveDesk.',
        crumbs: [{ label: 'Home', to: '/dashboard' }, { label: 'Admin' }, { label: 'Users' }],
      };
    }
    if (path.includes('admin/users')) {
      return {
        title: 'Account Management',
        subtitle: 'Review registered users and their submitted ticket history.',
        crumbs: [{ label: 'Home', to: '/dashboard' }, { label: 'Admin' }, { label: 'Accounts' }],
      };
    }
    if (path.includes('admin')) {
      return {
        title: 'IT Dashboard',
        subtitle: 'Administrative controls and queue oversight.',
        crumbs: [{ label: 'Home', to: '/dashboard' }, { label: 'Admin' }],
      };
    }
    if (path.includes('change-password')) {
      return {
        title: 'Change Password',
        subtitle: 'Update your account password',
        crumbs: [{ label: 'Home', to: userRole === 'it' ? '/dashboard' : '/home' }, { label: 'Change Password' }],
      };
    }
    return {
      title: 'ResolveDesk',
      subtitle: 'Enterprise IT support workspace.',
      crumbs: [{ label: 'Home' }],
    };
  }, [location.pathname, userRole]);

  const closeMobileSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={`layout ${isSidebarOpen ? 'sidebar-is-open' : ''}`}>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close navigation"
        onClick={closeMobileSidebar}
      />

      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Primary navigation">
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
          <button
            type="button"
            className="sidebar-close-btn"
            aria-label="Close navigation"
            onClick={closeMobileSidebar}
          >
            <FiX />
          </button>
        </div>

        <div className="sidebar-home-link-wrap">
          <NavLink
            to={userRole === 'it' ? '/dashboard' : '/home'}
            end
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-home-link ${isActive ? 'active' : ''}`
            }
          >
            <FiCompass /> <span>Home</span>
          </NavLink>
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
            {userRole === 'it' && (
              <li>
                <NavLink
                  to="/dashboard"
                  end
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  <FiHome /> <span>Dashboard</span>
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/create-ticket"
                onClick={closeMobileSidebar}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                <FiPlusCircle /> <span>Create Ticket</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tickets"
                onClick={closeMobileSidebar}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                <FiList /> <span>My Tickets</span>
              </NavLink>
            </li>
            {userRole !== 'it' && (
              <li>
                <NavLink
                  to="/change-password"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  <FiSettings /> <span>Change Password</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        {(userRole === 'it' || isMasterAdmin) && (
          <div className="nav-section">
            <p className="nav-section-title">ADMINISTRATION</p>
            <ul className="nav-links">
              <li>
                <NavLink
                  to="/admin/users"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  <FiUsers /> <span>User Accounts</span>
                </NavLink>
              </li>
              {isMasterAdmin && (
                <li>
                  <NavLink
                    to="/admin/create-user"
                    onClick={closeMobileSidebar}
                    className={({ isActive }) => (isActive ? 'active' : undefined)}
                  >
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
          <div className="top-bar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              aria-label="Open navigation"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen(true)}
            >
              <FiMenu />
            </button>
            <div className="page-title">
              <nav className="breadcrumbs" aria-label="Breadcrumb">
                {pageMeta.crumbs.map((crumb, index) => (
                  <React.Fragment key={`${crumb.label}-${index}`}>
                    {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                    {index < pageMeta.crumbs.length - 1 && <FiChevronRight aria-hidden="true" />}
                  </React.Fragment>
                ))}
              </nav>
              <h1>{pageMeta.title}</h1>
              <p>{pageMeta.subtitle}</p>
            </div>
          </div>
          <div className="top-actions">
            <Link to="/create-ticket" className="quick-action-btn">
              <FiPlusCircle /> <span>New Ticket</span>
            </Link>
            <button type="button" className="notification-btn" aria-label="Notifications">
              <FiBell />
              <span className="notification-dot" aria-hidden="true" />
            </button>
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
