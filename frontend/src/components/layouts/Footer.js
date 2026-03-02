import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <span className="footer-brand">🛡️ DRDO DAMS</span>
            <span style={{ marginLeft: '0.8rem', fontSize: '0.78rem' }}>
              Defence Asset Management System v2.0
            </span>
          </div>
          <div className="col-md-6 text-md-end mt-2 mt-md-0" style={{ fontSize: '0.75rem' }}>
            © 2025 Defence Research &amp; Development Laboratory, Hyderabad.
            &nbsp;Ministry of Defence, Govt. of India.
          </div>
        </div>
        <div className="row mt-1">
          <div className="col text-center" style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}>
            DRDL · DRDO · Kanchanbagh, Hyderabad – 500 058 &nbsp;|&nbsp;
            Powered by FastAPI + MongoDB Replica Set
          </div>
        </div>
      </div>
    </footer>
  );
}
