import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import ProductDetails from './components/ProductDetails';
import Dashboard from './components/admin/Dashboard';
import DatabaseManager from './components/admin/DatabaseManager';

function App() {
  return (
    <div className="App">
      <Router>
        <div className="container">
          <header className="app-header">
            <h1>FAVcart</h1>
            <nav>
              <a href="/">Home</a>
            </nav>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/database" element={<DatabaseManager />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;
