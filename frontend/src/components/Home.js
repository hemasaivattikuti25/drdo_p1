import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../slices/productsSlice';
import Product from './product/Product';
import MetaData from './layouts/MetaData';

function Home() {
  const dispatch = useDispatch();
  const { loading, products, error } = useSelector(state => state.productsState);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <MetaData title="FAVcart - Best Products Online" />
      <h1>FAVcart - Products</h1>
      {products.length > 0 ? (
        <div className="products-grid">
          {products.map(product => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="no-products">No products found</div>
      )}
    </div>
  );
}

export default Home;