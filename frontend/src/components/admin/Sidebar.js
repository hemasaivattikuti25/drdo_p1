import { Link, useNavigate } from 'react-router-dom';
import { NavDropdown } from 'react-bootstrap';

export default function Sidebar() {
    const navigate = useNavigate();

    return (
        <div className="sidebar-wrapper">
            <nav id="sidebar">
                {/* Brand */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">🛡️ DRDO DAMS</div>
                    <div className="sidebar-sub">Director's Control Panel</div>
                </div>

                <ul className="list-unstyled components">
                    <li>
                        <Link to="/admin/dashboard">
                            <i className="fas fa-tachometer-alt"></i> Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/database">
                            <i className="fas fa-database"></i> DB Status
                        </Link>
                    </li>

                    <li>
                        <NavDropdown
                            title={<span><i className="fa fa-shield-alt"></i> Equipment</span>}
                        >
                            <NavDropdown.Item onClick={() => navigate('/admin/products')}>
                                <i className="fa fa-list"></i> All Equipment
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => navigate('/admin/products/create')}>
                                <i className="fa fa-plus"></i> Register New
                            </NavDropdown.Item>
                        </NavDropdown>
                    </li>

                    <li>
                        <Link to="/admin/orders">
                            <i className="fa fa-clipboard-list"></i> Requisitions
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/users">
                            <i className="fa fa-users"></i> Personnel
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/reviews">
                            <i className="fa fa-clipboard-check"></i> Inspection Reports
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}