import { Link } from "react-router-dom";

// DRDO DAMS — Equipment Card (text-only, no product image)
export default function Product({ product, col }) {
  const categoryIcon = {
    "Test & Measurement": "📡",
    "RF & Microwave": "🔭",
    "Environmental Testing": "🌡️",
    "Computing": "🖥️",
    "Imaging & Optics": "🔬",
    "Sensors & Navigation": "🛰️",
    "Embedded Systems": "🔌",
    "Manufacturing Equipment": "🏭",
    "Electronic Warfare": "📻",
    "Communication": "📟",
    "Protective Gear": "🛡️",
    "Field Equipment": "🧰",
    "Medical": "🏥",
    "Optics": "🔭",
  };
  const icon = categoryIcon[product.category] || "⚙️";

  return (
    <div className={`col-sm-12 col-md-6 col-lg-${col} my-3`}>
      <div className="card p-3 rounded" style={{ minHeight: "260px", display: "flex", flexDirection: "column" }}>
        {/* No image — professional asset registry style */}
        <div className="card-body d-flex flex-column">
          <span className="equip-category-tag">{icon} {product.category}</span>

          <h5 className="card-title mt-2" style={{ fontSize: "1rem", lineHeight: "1.4" }}>
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h5>

          <p className="card-text" style={{ fontSize: "0.82rem", opacity: 0.75, flex: 1, overflow: "hidden" }}>
            {product.description
              ? product.description.slice(0, 120) + (product.description.length > 120 ? "…" : "")
              : ""}
          </p>

          <div className="ratings">
            <div className="rating-outer">
              <div
                className="rating-inner"
                style={{ width: `${(product.ratings / 5) * 100}%` }}
              />
            </div>
            <span id="no_of_reviews">({product.numOfReviews} Inspections)</span>
          </div>

          <p className="card-text mt-2">
            ₹{product.price?.toLocaleString("en-IN")}
            <small style={{ opacity: 0.55, fontSize: "0.7rem", marginLeft: "6px" }}>
              {product.stock > 0 ? `${product.stock} units` : "Out of stock"}
            </small>
          </p>

          <Link to={`/product/${product._id}`} id="view_btn" className="btn btn-block">
            🔍 View Asset Details
          </Link>
        </div>
      </div>
    </div>
  );
}
