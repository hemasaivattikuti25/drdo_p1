// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { orderCompleted } from "../../slices/cartSlice";
// import { validateShipping } from "../cart/Shipping";
// import { createOrder } from "../../actions/orderActions";
// import { clearError as clearOrderError } from "../../slices/orderSlice";

// export default function Payment() {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
//     const { user } = useSelector((state) => state.authState);
//     const { items: cartItems, shippingInfo } = useSelector((state) => state.cartState);
//     const { error: orderError } = useSelector((state) => state.orderState);

//     const order = {
//         orderItems: cartItems,
//         shippingInfo,
//     };

//     if (orderInfo) {
//         order.itemsPrice = orderInfo.itemsPrice;
//         order.shippingPrice = orderInfo.shippingPrice;
//         order.taxPrice = orderInfo.taxPrice;
//         order.totalPrice = orderInfo.totalPrice;
//     }

//     useEffect(() => {
//         validateShipping(shippingInfo, navigate);
//         if (orderError) {
//             toast(orderError, {
//                 position: toast.POSITION.BOTTOM_CENTER,
//                 type: "error",
//                 onOpen: () => {
//                     dispatch(clearOrderError());
//                 },
//             });
//             return;
//         }
//     }, []);

//     const submitHandler = (e) => {
//         e.preventDefault();

//         // Simulate successful payment
//         toast("Payment Success!", {
//             type: "success",
//             position: toast.POSITION.BOTTOM_CENTER,
//         });

//         order.paymentInfo = {
//             id: "mock_payment_id", // Mock payment ID
//             status: "succeeded",  // Mock status
//         };

//         dispatch(orderCompleted());
//         dispatch(createOrder(order));
//         navigate("/order/success");
//     };

//     return (
//         <div className="row wrapper">
//             <div className="col-10 col-lg-5">
//                 <form onSubmit={submitHandler} className="shadow-lg">
//                     <h1 className="mb-4">Card Info</h1>
//                     <div className="form-group">
//                         <label htmlFor="card_num_field">Card Number</label>
//                         <input
//                             type="text"
//                             id="card_num_field"
//                             className="form-control"
//                             required
//                             placeholder="Enter Card Number"
//                         />
//                     </div>

//                     <div className="form-group">
//                         <label htmlFor="card_exp_field">Card Expiry</label>
//                         <input
//                             type="text"
//                             id="card_exp_field"
//                             className="form-control"
//                             required
//                             placeholder="Enter Expiry Date"
//                         />
//                     </div>

//                     <div className="form-group">
//                         <label htmlFor="card_cvc_field">Card CVC</label>
//                         <input
//                             type="text"
//                             id="card_cvc_field"
//                             className="form-control"
//                             required
//                             placeholder="Enter CVC"
//                         />
//                     </div>

//                     <button id="pay_btn" type="submit" className="btn btn-block py-3">
//                         Pay - {` ₹${orderInfo && orderInfo.totalPrice}`}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }

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
  const { user } = useSelector((state) => state.authState);
  const { items: cartItems, shippingInfo } = useSelector(
    (state) => state.cartState
  );
  const { error: orderError } = useSelector((state) => state.orderState);

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [formValid, setFormValid] = useState(false);

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
        onOpen: () => {
          dispatch(clearOrderError());
        },
      });
    }
  }, [dispatch, orderError, shippingInfo, navigate]);

  // Validate form fields
  useEffect(() => {
    const cardNumberValid = /^[0-9]{16}$/.test(cardNumber); // 16 digits
    const expiryDateValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate); // MM/YY format
    const cvvValid = /^[0-9]{3}$/.test(cvv); // 3 digits
    setFormValid(cardNumberValid && expiryDateValid && cvvValid);
  }, [cardNumber, expiryDate, cvv]);

  const submitHandler = (e) => {
    e.preventDefault();

    // Simulate successful payment
    toast("Payment Success!", {
      type: "success",
      position: toast.POSITION.BOTTOM_CENTER,
    });

    order.paymentInfo = {
      id: "mock_payment_id", // Mock payment ID
      status: "succeeded", // Mock status
    };

    dispatch(orderCompleted());
    dispatch(createOrder(order));
    navigate("/order/success");
  };

  return (
    <div className="row wrapper">
      <div className="col-10 col-lg-5">
        <form onSubmit={submitHandler} className="shadow-lg">
          <h1 className="mb-4">Card Info</h1>

          <div className="form-group">
            <label htmlFor="card_num_field">Card Number</label>
            <input
              type="text"
              id="card_num_field"
              className="form-control"
              required
              placeholder="Enter 16-digit Card Number"
              value={cardNumber}
              maxLength="16"
              onChange={(e) =>
                setCardNumber(e.target.value.replace(/[^0-9]/g, ""))
              }
            />
            {!/^[0-9]{16}$/.test(cardNumber) && cardNumber && (
              <small className="text-danger">
                Enter a valid 16-digit card number
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="card_exp_field">Card Expiry</label>
            <input
              type="text"
              id="card_exp_field"
              className="form-control"
              required
              placeholder="MM/YY"
              value={expiryDate}
              maxLength="5"
              onChange={(e) =>
                setExpiryDate(
                  e.target.value
                    .replace(/[^0-9/]/g, "")
                    .replace(/^(\d{2})(\d)/, "$1/$2") // Auto-insert slash
                )
              }
            />
            {!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate) && expiryDate && (
              <small className="text-danger">
                Enter a valid expiry date (MM/YY)
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="card_cvc_field">Card CVV</label>
            <input
              type="text"
              id="card_cvc_field"
              className="form-control"
              required
              placeholder="Enter 3-digit CVC"
              value={cvv}
              maxLength="3"
              onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ""))}
            />
            {!/^[0-9]{3}$/.test(cvv) && cvv && (
              <small className="text-danger">Enter a valid 3-digit CVV</small>
            )}
          </div>

          <button
            id="pay_btn"
            type="submit"
            className="btn btn-block py-3"
            disabled={!formValid}
          >
            Pay - {` ₹${orderInfo && orderInfo.totalPrice}`}
          </button>
        </form>
      </div>
    </div>
  );
}
  