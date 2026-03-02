import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAdminProducts } from "../../actions/productActions";
import { getUsers } from "../../actions/userActions";
import { adminOrders as adminOrdersAction } from "../../actions/orderActions";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { products = [] } = useSelector((state) => state.productsState);
  const { adminOrders = [] } = useSelector((state) => state.orderState);
  const { users = [] } = useSelector((state) => state.userState);
  const dispatch = useDispatch();

  let outOfStock = products.filter(p => p.stock === 0).length;
  let totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  let totalAmount = adminOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  let pendingReqs = adminOrders.filter(o => o.orderStatus !== "Delivered").length;

  useEffect(() => {
    dispatch(getAdminProducts);
    dispatch(getUsers);
    dispatch(adminOrdersAction);
  }, [dispatch]);

  const statCards = [
    { label: "Total Equipment", value: products.length, icon: "🛠️", link: "/admin/products", linkLabel: "View Registry" },
    { label: "Inventory Value", value: `₹${totalValue.toLocaleString('en-IN')}`, icon: "💰", link: null },
    { label: "Requisitions", value: adminOrders.length, icon: "📋", link: "/admin/orders", linkLabel: "View All" },
    { label: "Pending", value: pendingReqs, icon: "⏳", link: "/admin/orders", linkLabel: "View Pending" },
    { label: "Personnel", value: users.length, icon: "👥", link: "/admin/users", linkLabel: "View All" },
    { label: "Out of Stock", value: outOfStock, icon: "⚠️", link: null },
  ];

  return (
    <div className="row">
      <div className="col-12 col-md-2">
        <Sidebar />
      </div>
      <div className="col-12 col-md-10" style={{ padding: '1.5rem' }}>
        {/* Page header */}
        <div style={{ borderLeft: '4px solid #c9a84c', paddingLeft: '0.8rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', color: '#c9a84c', margin: 0, letterSpacing: '0.05em' }}>
            🖥️ Director's Control Panel
          </h1>
          <small style={{ color: '#8ea0b4', letterSpacing: '0.08em' }}>
            DRDO DAMS — Defence Asset Management System
          </small>
        </div>

        {/* Total Orders Value banner */}
        <div className="stat-card mb-4" style={{ background: 'linear-gradient(135deg, #1a2e44, #243b55)', borderColor: 'rgba(201,168,76,0.4)' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="stat-label">Total Requisition Value</div>
              <div className="stat-value" style={{ fontSize: '2.5rem' }}>₹{totalAmount.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ fontSize: '3.5rem', opacity: 0.4 }}>📊</div>
          </div>
        </div>

        {/* Stat grid */}
        <div className="row">
          {statCards.map((card, i) => (
            <div className="col-xl-4 col-sm-6 mb-3" key={i}>
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-value">{card.value}</div>
                  </div>
                  <div style={{ fontSize: '1.8rem' }}>{card.icon}</div>
                </div>
                {card.link && (
                  <Link to={card.link} style={{ fontSize: '0.78rem', color: '#c9a84c', textDecoration: 'none' }}>
                    {card.linkLabel} →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* DB info note */}
        <div style={{
          marginTop: '1rem',
          background: 'rgba(13,27,42,0.8)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '6px',
          padding: '1rem 1.2rem',
          fontSize: '0.82rem',
          color: '#8ea0b4'
        }}>
          <strong style={{ color: '#c9a84c' }}>🗄️ Database Architecture:</strong>&nbsp;
          MongoDB Replica Set (rs0) — 3-node hot redundancy with automatic failover.
          Built with FastAPI (Python) backend. &nbsp;
          <Link to="/admin/database" style={{ color: '#c9a84c' }}>View DB Status →</Link>
        </div>
      </div>
    </div>
  );
}
