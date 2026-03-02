import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Search from './Search';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Image } from 'react-bootstrap';
import { logout } from '../../actions/userActions';

export default function Header() {
  const { isAuthenticated, user } = useSelector(state => state.authState);
  const { items: cartItems } = useSelector(state => state.cartState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => { dispatch(logout); };

  return (
    <nav className="navbar row" style={{ padding: '0.65rem 1.5rem' }}>
      {/* Brand */}
      <div className="col-12 col-md-3">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="dams-brand">
            <span className="dams-brand-emblem">🛡️</span>
            <div className="dams-brand-text">
              <span className="dams-brand-title">DRDO DAMS</span>
              <span className="dams-brand-subtitle">Defence Asset Mgmt. System</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="col-12 col-md-6 mt-2 mt-md-0">
        <Search />
      </div>

      {/* Auth / Actions */}
      <div className="col-12 col-md-3 mt-3 mt-md-0 text-center d-flex align-items-center justify-content-end gap-3">
        {isAuthenticated ? (
          <Dropdown className="d-inline">
            <Dropdown.Toggle variant="default text-white pr-5" id="dropdown-basic">
              <figure className="avatar avatar-nav" style={{ display: 'inline-block', marginBottom: 0 }}>
                <Image width="36px" src={user.avatar ?? '/images/default_avatar.png'} style={{ borderRadius: '50%' }} />
              </figure>
              <span style={{ marginLeft: '0.4rem', fontSize: '0.9rem' }}>{user.name}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {user.role === 'admin' && (
                <Dropdown.Item onClick={() => navigate('admin/dashboard')}>
                  🖥️ Director's Panel
                </Dropdown.Item>
              )}
              <Dropdown.Item onClick={() => navigate('/myprofile')}>👤 My Profile</Dropdown.Item>
              <Dropdown.Item onClick={() => navigate('/orders')}>📋 My Requisitions</Dropdown.Item>
              <Dropdown.Item onClick={logoutHandler} className="text-danger">🔒 Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Link to="/login" className="btn" id="login_btn">🔑 Login</Link>
        )}

        <Link to="/cart" style={{ textDecoration: 'none' }}>
          <span id="cart">📋 Requests</span>
          <span id="cart_count">{cartItems.length}</span>
        </Link>
      </div>
    </nav>
  );
}