
import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } =
        await axios.get(
          "http://localhost:5000/api/subscriptions/plans"
        );

      setPlans(data.plans || []);
    } catch (error) {
      console.error(
        "Fetch Plans Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (
    plan
  ) => {
    try {
      const { data } =
        await axios.post(
          "http://localhost:5000/api/subscriptions/purchase",
          {
            planId: plan._id,
            useWallet: true,
          },
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

      console.log(
        "Subscription Purchase:",
        data
      );

      alert(
        `Payment Type: ${data.paymentType}
Amount To Pay: ₹${data.amountToPay}`
      );

      // Razorpay Integration Next Step
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Subscription Purchase Failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-xl">
        Loading Subscription Plans...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">
        Subscription Plans
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-2xl transition"
          >
            <h2 className="text-3xl font-bold mb-4">
              {plan.name}
            </h2>

            <p className="text-4xl font-bold text-blue-600 mb-4">
              ₹{plan.price}
            </p>

            <p className="text-gray-600 mb-2">
              {plan.duration} Days
            </p>

            <p className="text-green-600 font-semibold mb-6">
              ✓ Unlimited Free Delivery
            </p>

            <button
              onClick={() =>
                handleSubscribe(plan)
              }
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;

