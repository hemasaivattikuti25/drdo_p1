import React from 'react';
import { Link } from 'react-router-dom';

function Product({ product }) {
  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`}>
        <img 
          src={product.image || '/images/default-product.jpg'} 
          alt={product.name}
          className="product-image"
        />
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="price">${product.price}</p>
          <p className="description">{product.description}</p>
          <p className="stock">Stock: {product.stock}</p>
          <p className="category">Category: {product.category}</p>
        </div>
      </Link>
    </div>
  );
}

export default Product;
