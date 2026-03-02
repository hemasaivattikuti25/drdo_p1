import { Link } from "react-router-dom";

const DEFAULT_IMG = "/images/default_product.png";

export default function Product({ product, col }) {
  return (
    <div className={`col-sm-12 col-md-6 col-lg-${col} my-3`}>
      <div className="card p-3 rounded">
        <img
          className="card-img-top mx-auto"
          src={
            product.images && product.images.length > 0
              ? product.images[0].image
              : DEFAULT_IMG
          }
          alt={product.name}
          onError={(e) => { e.target.src = DEFAULT_IMG; e.target.onerror = null; }}
        />
        <div className="card-body d-flex flex-column">
          {product.category && (
            <span className="equip-category-tag">📦 {product.category}</span>
          )}
          <h5 className="card-title">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h5>
          <div className="ratings mt-auto">
            <div className="rating-outer">
              <div
                className="rating-inner"
                style={{ width: `${(product.ratings / 5) * 100}%` }}
              ></div>
            </div>
            <span id="no_of_reviews">({product.numOfReviews} Inspections)</span>
          </div>
          <p className="card-text">₹{product.price?.toLocaleString('en-IN')}</p>
          <Link to={`/product/${product._id}`} id="view_btn" className="btn btn-block">
            🔍 View Specs
          </Link>
        </div>
      </div>
    </div>
  );
}
