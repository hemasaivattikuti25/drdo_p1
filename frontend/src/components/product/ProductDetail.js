import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createReview, getProduct } from "../../actions/productActions";
import Loader from "../layouts/Loader";
import MetaData from "../layouts/MetaData";
import { addCartItem } from "../../actions/cartActions";
import {
  clearReviewSubmitted,
  clearError,
  clearProduct,
} from "../../slices/productSlice";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import ProductReview from "./ProductReview";

/* ── Category icon map ──────────────────────────────── */
const CATEGORY_ICONS = {
  "Missile Systems": "🚀",
  "Radar & Surveillance": "📡",
  "Electronic Warfare": "⚡",
  "Naval Systems": "🚢",
  "Communication Equipment": "📻",
  "Combat Vehicles": "🛡️",
  "Aeronautic Systems": "✈️",
  "Cyber Security": "🔐",
  "Unmanned Systems": "🤖",
  "Night Vision & Optics": "🔭",
};

export default function ProductDetail() {
  const {
    loading,
    product = {},
    isReviewSubmitted,
    error,
  } = useSelector((state) => state.productState);
  const { user } = useSelector((state) => state.authState);
  const dispatch = useDispatch();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  const increaseQty = () => {
    const count = document.querySelector(".count");
    if (product.stock === 0 || count.valueAsNumber >= product.stock) return;
    const qty = count.valueAsNumber + 1;
    setQuantity(qty);
  };
  const decreaseQty = () => {
    const count = document.querySelector(".count");
    if (count.valueAsNumber === 1) return;
    const qty = count.valueAsNumber - 1;
    setQuantity(qty);
  };

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");

  const reviewHandler = () => {
    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment);
    formData.append("productId", id);
    dispatch(createReview(formData));
  };

  useEffect(() => {
    if (isReviewSubmitted) {
      handleClose();
      toast("Review Submitted successfully", {
        type: "success",
        position: toast.POSITION.BOTTOM_CENTER,
        onOpen: () => dispatch(clearReviewSubmitted()),
      });
    }
    if (error) {
      toast(error, {
        position: toast.POSITION.BOTTOM_CENTER,
        type: "error",
        onOpen: () => {
          dispatch(clearError());
        },
      });
      return;
    }
    if (!product._id || isReviewSubmitted) {
      dispatch(getProduct(id));
    }
  }, [dispatch, id, isReviewSubmitted, error, product._id]);

  useEffect(() => {
    return () => {
      dispatch(clearProduct());
    };
  }, [dispatch]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={product.name} />
          <div className="row f-flex justify-content-around">
            <div className="col-12 col-lg-5 d-flex align-items-center justify-content-center" id="product_image">
              <div
                style={{
                  fontSize: "8rem",
                  background: "linear-gradient(135deg, #1a2a44, #0d1b2a)",
                  borderRadius: "1rem",
                  width: "100%",
                  height: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #1e3a5f",
                }}
              >
                {CATEGORY_ICONS[product.category] || "🔧"}
              </div>
            </div>

            <div className="col-12 col-lg-5 mt-5">
              <h3>{product.name}</h3>
              <p id="product_id" style={{ fontSize: '0.82rem', color: '#8ea0b4' }}>Asset ID: {product._id}</p>

              <hr />

              <div className="rating-outer">
                <div
                  className="rating-inner"
                  style={{ width: `${(product.ratings / 5) * 100}%` }}
                ></div>
              </div>
              <span id="no_of_reviews">({product.numOfReviews} Inspections)</span>

              <hr />

              <p id="product_price">₹{product.price}</p>
              <div className="stockCounter d-inline">
                <span className="btn btn-danger minus" onClick={decreaseQty}>
                  -
                </span>

                <input
                  type="number"
                  className="form-control count d-inline"
                  value={quantity}
                  readOnly
                />

                <span className="btn btn-primary plus" onClick={increaseQty}>
                  +
                </span>
              </div>
              <button
                type="button"
                id="cart_btn"
                disabled={product.stock === 0 ? true : false}
                onClick={() => {
                  dispatch(addCartItem(product._id, quantity));
                  toast("Asset added to requisition list!", {
                    type: "success",
                    position: toast.POSITION.BOTTOM_CENTER,
                  });
                }}
                className="btn btn-primary d-inline ml-4"
              >
                📋 Request Asset
              </button>

              <hr />

              <p>
                Availability:{" "}
                <span
                  className={product.stock > 0 ? "greenColor" : "redColor"}
                  id="stock_status"
                >
                  {product.stock > 0 ? `✅ Available (${product.stock} units)` : "❌ Not Available"}
                </span>
              </p>

              <hr />

              <h4 className="mt-2">Technical Specifications:</h4>
              <p style={{ lineHeight: '1.7', color: '#c5d0db' }}>{product.description}</p>
              <hr />
              <p id="product_seller mb-3">
                🏭 Vendor / Supplier: <strong>{product.seller}</strong>
              </p>
              {user ? (
                <button
                  onClick={handleShow}
                  id="review_btn"
                  type="button"
                  className="btn btn-primary mt-4"
                  data-toggle="modal"
                  data-target="#ratingModal"
                >
                  🔍 Submit Inspection Report
                </button>
              ) : (
                <div className="alert alert-danger mt-5">
                  🔒 Login to submit an inspection report
                </div>
              )}

              <div className="row mt-2 mb-5">
                <div className="rating w-50">
                  <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                      <Modal.Title>🔍 Submit Inspection Report</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <ul className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <li
                            value={star}
                            onClick={() => setRating(star)}
                            className={`star ${star <= rating ? "orange" : ""}`}
                            onMouseOver={(e) =>
                              e.target.classList.add("yellow")
                            }
                            onMouseOut={(e) =>
                              e.target.classList.remove("yellow")
                            }
                          >
                            <i className="fa fa-star"></i>
                          </li>
                        ))}
                      </ul>

                      <textarea
                        onChange={(e) => setComment(e.target.value)}
                        name="review"
                        id="review"
                        className="form-control mt-3"
                      ></textarea>
                      <button
                        disabled={loading}
                        onClick={reviewHandler}
                        aria-label="Close"
                        className="btn my-3 float-right review-btn px-4 text-white"
                      >
                        Submit
                      </button>
                    </Modal.Body>
                  </Modal>
                </div>
              </div>
            </div>
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <ProductReview reviews={product.reviews} />
          ) : null}
        </Fragment>
      )}
    </Fragment>
  );
}
