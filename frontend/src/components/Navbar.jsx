import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiLogOut, FiPlusCircle, FiActivity } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to={user ? "/dashboard" : "/"} className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Outfit' }}>
          <FiActivity className="text-gradient" />
          <span>DevLab</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-secondary text-sm">Dashboard</Link>
              <Link to="/create" className="btn btn-secondary text-sm">
                <FiPlusCircle /> New Experiment
              </Link>
              <button onClick={handleLogout} className="btn btn-danger text-sm" style={{ padding: '0.5rem 1rem' }}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
