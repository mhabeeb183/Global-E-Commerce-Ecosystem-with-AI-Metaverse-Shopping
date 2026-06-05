import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import socket from "../socket/socket";

const trackingSteps = [
  "Order Placed",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
];

const OrderTrackingPage = () => {
  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchOrder();

    socket.emit("joinOrder", id);

    socket.on(
      "orderStatusUpdated",
      (data) => {
        if (data.orderId === id) {
          setOrder((prev) => ({
            ...prev,
            orderStatus: data.status,
            statusHistory:
              data.statusHistory,
          }));
        }
      }
    );

    return () => {
      socket.emit("leaveOrder", id);

      socket.off(
        "orderStatusUpdated"
      );
    };
  }, [id]);

  const fetchOrder = async () => {
    try {
      const userInfo =
        JSON.parse(
          localStorage.getItem(
            "userInfo"
          )
        );

      const { data } =
        await axios.get(
          `http://localhost:5000/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error( "Fetch Order Error:",
  error.response?.data || error);
      setLoading(false);
    }
  };

  if (loading)
    return <h2>Loading...</h2>;

  if (!order)
    return (
      <h2>Order Not Found</h2>
    );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        Order Tracking
      </h1>

      <div className="space-y-6">
        {trackingSteps.map(
          (step, index) => {
            const completed =
              order.statusHistory?.some(
                (item) =>
                  item.status ===
                  step
              );

            return (
              <div
                key={index}
                className="flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    completed
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                >
                  {completed
                    ? "✓"
                    : index + 1}
                </div>

                <div>
                  <h3 className="font-semibold">
                    {step}
                  </h3>

                  {completed && (
                    <p className="text-sm text-gray-500">
                      Completed
                    </p>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-bold text-lg">
          Current Status:
        </h2>

        <p className="text-blue-600 text-xl">
          {order.orderStatus}
        </p>
      </div>
    </div>
  );
};

export default OrderTrackingPage;