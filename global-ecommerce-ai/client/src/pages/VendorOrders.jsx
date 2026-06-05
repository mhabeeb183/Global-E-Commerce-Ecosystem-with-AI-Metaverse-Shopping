import { useEffect, useState } from "react";
import axios from "axios";

const orderStatuses = [
  "Packed",
  "Shipped",
  "Out For Delivery",
];

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchVendorOrders = async () => {
      try {
        const userInfo = JSON.parse(
          localStorage.getItem("userInfo")
        );

        const token = userInfo?.token;

        const { data } = await axios.get(
          "http://localhost:5000/api/orders/vendor-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(data);
      } catch (error) {
        console.error(
          "Fetch Vendor Orders Error:",
          error.response?.data || error
        );
      }
    };

    fetchVendorOrders();
  }, []);

  const updateStatus = async (
    orderId,
    status
  ) => {
    try {
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo")
      );

      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: status,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "Update Status Error:",
        error.response?.data || error
      );
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">
        Vendor Orders
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
                  {order.orderStatus}
                </span>
              </p>

              <div className="mt-3">
                <select
                  value={
                    order.orderStatus
                  }
                  disabled={
                    order.orderStatus ===
                    "Delivered"
                  }
                  onChange={(e) =>
                    updateStatus(
                      order._id,
                      e.target.value
                    )
                  }
                  className="border p-2 rounded w-full"
                >
                  <option
                    value={
                      order.orderStatus
                    }
                  >
                    {order.orderStatus}
                  </option>

                  {orderStatuses.map(
                    (status) =>
                      status !==
                        order.orderStatus && (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                  )}
                </select>
              </div>

              <p className="mt-3">
                <strong>Date:</strong>{" "}
                {new Date(
                  order.createdAt
                ).toLocaleDateString()}
              </p>

              <div className="mt-4">
                <strong>
                  Products:
                </strong>

                {order.orderItems.map(
                  (item) => (
                    <div
                      key={item.product}
                      className="border-t mt-2 pt-2"
                    >
                      {item.name} ×{" "}
                      {item.qty}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;