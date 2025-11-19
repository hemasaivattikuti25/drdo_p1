import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProduct } from '../slices/productSlice';
import MetaData from './layouts/MetaData';

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, product, error } = useSelector(state => state.productState);

  useEffect(() => {
    dispatch(getProduct(id));
  }, [dispatch, id]);

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="product-details">
      <MetaData title={product.name || 'Product Details'} />
      <Link to="/" className="back-link">← Back to Products</Link>
      
      {product.name ? (
        <div className="product-details-content">
          <div className="product-image-section">
            <img 
              src={product.image || '/images/default-product.jpg'} 
              alt={product.name}
              className="product-detail-image"
            />
          </div>
          
          <div className="product-info-section">
            <h1>{product.name}</h1>
            <p className="price">${product.price}</p>
            <p className="description">{product.description}</p>
            <div className="product-meta">
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Stock:</strong> {product.stock}</p>
              <p><strong>Product ID:</strong> {product._id}</p>
            </div>
            
            <div className="action-buttons">
              <button 
                className="add-to-cart-btn"
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-product">Product not found</div>
      )}
    </div>
  );
}

export default ProductDetails;
