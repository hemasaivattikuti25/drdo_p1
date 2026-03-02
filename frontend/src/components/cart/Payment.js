import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { orderCompleted } from "../../slices/cartSlice";
import { validateShipping } from "../cart/Shipping";
import { createOrder } from "../../actions/orderActions";
import { clearError as clearOrderError } from "../../slices/orderSlice";

export default function Payment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
  const { items: cartItems, shippingInfo } = useSelector(
    (state) => state.cartState
  );
  const { error: orderError } = useSelector((state) => state.orderState);

  const [approvalCode, setApprovalCode] = useState("");
  const [remarks, setRemarks] = useState("");

  const order = {
    orderItems: cartItems,
    shippingInfo,
  };

  if (orderInfo) {
    order.itemsPrice = orderInfo.itemsPrice;
    order.shippingPrice = orderInfo.shippingPrice;
    order.taxPrice = orderInfo.taxPrice;
    order.totalPrice = orderInfo.totalPrice;
  }

  useEffect(() => {
    validateShipping(shippingInfo, navigate);
    if (orderError) {
      toast(orderError, {
        position: toast.POSITION.BOTTOM_CENTER,
        type: "error",
        onOpen: () => dispatch(clearOrderError()),
      });
    }
  }, [dispatch, orderError, shippingInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    toast("Requisition approved successfully!", {
      type: "success",
      position: toast.POSITION.BOTTOM_CENTER,
    });

    order.paymentInfo = {
      id: approvalCode || `DRDO-${Date.now()}`,
      status: "approved",
    };

    dispatch(orderCompleted());
    dispatch(createOrder(order));
    navigate("/order/success");
  };

  return (
    <div className="row wrapper">
      <div className="col-10 col-lg-5">
        <form onSubmit={submitHandler} className="shadow-lg">
          <h1 className="mb-4">Internal Approval</h1>

          <div className="form-group">
            <label htmlFor="approval_code_field">Approval / Sanction Code</label>
            <input
              type="text"
              id="approval_code_field"
              className="form-control"
              placeholder="e.g. DRDO-2025-00123"
              value={approvalCode}
              onChange={(e) => setApprovalCode(e.target.value)}
            />
            <small className="text-muted">
              Leave blank for auto-generated code
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="remarks_field">Remarks (optional)</label>
            <textarea
              id="remarks_field"
              className="form-control"
              rows="3"
              placeholder="Any special instructions"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <button
            id="pay_btn"
            type="submit"
            className="btn btn-block py-3"
          >
            Confirm Requisition
            {orderInfo && ` — ₹${orderInfo.totalPrice}`}
          </button>
        </form>
      </div>
    </div>
  );
}
  