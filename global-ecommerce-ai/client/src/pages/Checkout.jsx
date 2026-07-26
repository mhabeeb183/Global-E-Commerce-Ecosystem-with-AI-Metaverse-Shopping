import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");


const Checkout = () => {
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] =
    useState(0);

  const [useWallet, setUseWallet] =
    useState(false);

  const [couponCode, setCouponCode] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState("");

  const cartItems = useSelector(
    (state) => state.cart.cartItems
  );

  const totalPrice = cartItems.reduce(
    (acc, item) =>
      acc +
      (item.dynamicPrice ||
        item.price) *
        item.quantity,
    0
  );
  const finalPrice =
    totalPrice - discount;

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const userInfo = JSON.parse(
          localStorage.getItem("userInfo")
        );

        const token = userInfo?.token;

        const { data } = await axios.get(
          "http://localhost:5000/api/wallet",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setWalletBalance(data.walletBalance);
      } catch (error) {
        console.log(error);
      }
    };

    fetchWallet();
  }, []);

  const createOrder = async (
    token,
    paidAmount
  ) => {
    const orderItems = cartItems.map(
      (item) => ({
        name: item.name,
        qty: item.quantity,
        image: item.images[0],
        price:
          item.dynamicPrice ||
          item.price,
        product: item._id,
      })
    );

    await axios.post(
      "http://localhost:5000/api/orders",
      {
        orderItems,
        totalPrice,
        isPaid: true,
        paidPrice: paidAmount,
        couponCode,
        discount,
        affiliateCode:
          localStorage.getItem(
            "affiliateCode"
          ),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const applyCouponHandler =
    async () => {
      try {
        const userInfo = JSON.parse(
          localStorage.getItem("userInfo")
        );

        const { data } = await axios.post(
          "http://localhost:5000/api/coupons/validate",
          {
            code: couponCode,
            orderAmount: totalPrice,
          },
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        setDiscount(data.discount);

        alert(
          `Coupon Applied. Discount ₹${data.discount}`
        );
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Invalid Coupon"
        );
      }
    };

  const placeOrderHandler = async () => {
    try {
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo")
      );

      const token = userInfo?.token;

      let walletUsed = 0;
      let remainingAmount = finalPrice;

      // Use Wallet First
      if (
        useWallet &&
        walletBalance > 0
      ) {
        walletUsed = Math.min(
          walletBalance,
          finalPrice
        );

        await axios.post(
          "http://localhost:5000/api/wallet/use-wallet",
          {
            amount: walletUsed,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        remainingAmount =
          finalPrice - walletUsed;
      }

      // Wallet Covers Entire Amount
      if (remainingAmount <= 0) {
        await createOrder(
          token,
          finalPrice
        );

        alert(
          "Order placed successfully using Wallet"
        );

        navigate("/myorders");

        return;
      }

      // Stripe payment path
      if (paymentMethod === "stripe") {
        const { data } = await axios.post(
          "http://localhost:5000/api/payment/stripe-intent",
          {
            amount: remainingAmount,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStripeClientSecret(data.clientSecret);
        setShowStripeModal(true);
        return;
      }

      // Razorpay For Remaining Amount
      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        {
          amount: remainingAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const options = {
        key:
          import.meta.env
            .VITE_RAZORPAY_KEY_ID,

        amount: data.amount,

        currency: data.currency,

        name: "Global E-Commerce",

        description: "Order Payment",

        order_id: data.id,

        handler: async function () {
          try {
            await createOrder(
              token,
              finalPrice
            );

            alert(
              "Payment Successful"
            );

            navigate("/myorders");
          } catch (error) {
            console.log(error);

            alert(
              "Order Save Failed"
            );
          }
        },

        prefill: {
          name: userInfo?.name || "",

          email:
            userInfo?.email || "",
        },

        theme: {
          color: "#16a34a",
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data
          ?.message ||
          "Payment Failed"
      );
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-gray-800">
        Checkout
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        {cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between border-b py-3"
              >
                <span>
                  {item.name} x{" "}
                  {item.quantity}
                </span>

                <span>
                  ₹
                  {(item.dynamicPrice ||
                    item.price) *
                    item.quantity}
                </span>
              </div>
            ))}

            <h2 className="text-2xl font-bold mt-6">
              Total: ₹ {totalPrice}
            </h2>
            <div className="mt-4 border p-4 rounded">
              <h3 className="font-bold mb-2">
                Apply Coupon
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) =>
                    setCouponCode(
                      e.target.value
                    )
                  }
                  placeholder="Enter Coupon Code"
                  className="border p-2 rounded flex-1"
                />

                <button
                  onClick={
                    applyCouponHandler
                  }
                  className="bg-blue-600 text-white px-4 rounded"
                >
                  Apply
                </button>
              </div>

              {discount > 0 && (
                <div className="mt-3">
                  <p className="text-green-600 font-bold">
                    Discount: ₹{discount}
                  </p>

                  <p className="text-xl font-bold">
                    Final Price: ₹{finalPrice}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 border rounded p-4">
              <h3 className="font-bold">
                Wallet Balance: ₹
                {walletBalance}
              </h3>

              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={useWallet}
                  onChange={() =>
                    setUseWallet(
                      !useWallet
                    )
                  }
                />

                Use Wallet
              </label>
            </div>

            {/* PAYMENT METHOD SELECTOR */}
            <div className="mt-4 border rounded p-4">
              <h3 className="font-bold mb-2">Select Payment Method</h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                  />
                  <span>Razorpay (Cards, UPI, Netbanking)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={() => setPaymentMethod("stripe")}
                  />
                  <span>Stripe (International Cards)</span>
                </label>
              </div>
            </div>

            <button
              onClick={
                placeOrderHandler
              }
              className="mt-6 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 w-full font-bold cursor-pointer transition-all duration-200"
            >
              Pay with {paymentMethod === "stripe" ? "Stripe" : "Razorpay"}
            </button>
          </>
        )}
      </div>

      {/* STRIPE CARD FORM MODAL */}
      {showStripeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowStripeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              💳 Secure Stripe Checkout
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Amount to charge: <span className="font-bold text-green-600">₹{finalPrice - (useWallet ? Math.min(walletBalance, finalPrice) : 0)}</span>
            </p>
            <Elements stripe={stripePromise}>
              <StripeCheckoutForm
                clientSecret={stripeClientSecret}
                finalAmount={finalPrice - (useWallet ? Math.min(walletBalance, finalPrice) : 0)}
                onSuccess={async (paymentMethodId) => {
                  try {
                    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                    await createOrder(userInfo?.token, finalPrice);
                    alert("Stripe Payment Completed Successfully!");
                    setShowStripeModal(false);
                    navigate("/myorders");
                  } catch (err) {
                    alert("Order Save Failed");
                  }
                }}
                onCancel={() => setShowStripeModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

const StripeCheckoutForm = ({ clientSecret, finalAmount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        alert("Payment failed: " + error.message);
        setIsProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        await onSuccess(paymentIntent.id);
      } else {
        alert("Payment status: " + paymentIntent.status);
        setIsProcessing(false);
      }
    } catch (err) {
      alert("Payment error: " + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border p-4 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`flex-1 py-3 rounded-xl text-white font-bold transition-all duration-200 ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer"
          }`}
        >
          {isProcessing ? "Processing..." : `Pay ₹${finalAmount}`}
        </button>
      </div>
    </form>
  );
};

export default Checkout;