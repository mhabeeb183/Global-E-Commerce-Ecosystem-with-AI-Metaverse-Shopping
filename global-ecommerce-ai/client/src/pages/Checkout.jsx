import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { clearCart } from "../redux/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [walletBalance, setWalletBalance] =
    useState(0);

  const [useWallet, setUseWallet] =
    useState(false);

  const [couponCode, setCouponCode] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

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

    dispatch(clearCart());
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
            <button
              onClick={
                placeOrderHandler
              }
              className="mt-6 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 w-full font-bold cursor-pointer transition-all duration-200"
            >
              {useWallet
                ? walletBalance >= finalPrice
                  ? `Pay ₹${finalPrice} with Wallet`
                  : `Pay ₹${finalPrice - walletBalance} with Razorpay (₹${walletBalance} from Wallet)`
                : `Pay ₹${finalPrice} with Razorpay`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;