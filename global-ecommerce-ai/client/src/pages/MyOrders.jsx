import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const userInfo = JSON.parse(
          localStorage.getItem("userInfo")
        );

        const token = userInfo?.token;

        const { data } = await axios.get(
          "http://localhost:5000/api/orders/myorders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(data);
      } catch (error) {
        console.error(
          "Fetch Orders Error:",
          error.response?.data || error
        );
      }
    };

    fetchMyOrders();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-xl shadow"
            >
              <p>
                <strong>Order ID:</strong>{" "}
                {order._id}
              </p>

              <p>
                <strong>Total:</strong> ₹{" "}
                {order.totalPrice}
              </p>

              <p>
                <strong>Payment:</strong>{" "}
                {order.isPaid
                  ? "Paid"
                  : "Unpaid"}
              </p>

              <p>
                <strong>
                  Order Status:
                </strong>{" "}
                <span
                  className={
                    order.orderStatus ===
                    "Delivered"
                      ? "text-green-600 font-bold"
                      : order.orderStatus ===
                        "Shipped"
                      ? "text-yellow-600 font-bold"
                      : "text-blue-600 font-bold"
                  }
                >
                  {order.orderStatus ||
                    "Pending"}
                </span>
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  order.createdAt
                ).toLocaleDateString()}
              </p>

              <div className="mt-4">
                <Link
                  to={`/track-order/${order._id}`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;