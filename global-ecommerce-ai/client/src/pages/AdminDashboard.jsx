import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    recentOrders: [],
    monthlyRevenue: [],
  });

  const [vendorRequests, setVendorRequests] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userInfo = JSON.parse(
          localStorage.getItem("userInfo")
        );

        const { data } = await axios.get(
          "http://localhost:5000/api/admin/analytics",
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        setAnalytics(data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchVendorRequests = async () => {
      try {
        const userInfo = JSON.parse(
          localStorage.getItem("userInfo")
        );

        const { data } = await axios.get(
          "http://localhost:5000/api/vendor-requests",
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        setVendorRequests(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAnalytics();
    fetchVendorRequests();
  }, []);

  const pieData = [
    {
      name: "Pending",
      value: analytics.pendingOrders,
    },
    {
      name: "Shipped",
      value: analytics.shippedOrders,
    },
    {
      name: "Delivered",
      value: analytics.deliveredOrders,
    },
  ];

  const handleReviewRequest = async (id, status) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const notes = prompt("Enter review notes (optional):") || "";
      await axios.put(
        `http://localhost:5000/api/vendor-requests/${id}`,
        { status, reviewNotes: notes },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      alert(`Request ${status} successfully!`);
      setVendorRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to review request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-800">
        Admin Dashboard
      </h1>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-gray-500">
            Total Users
          </h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {analytics.totalUsers}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-gray-500">
            Total Products
          </h2>
          <p className="text-4xl font-bold text-purple-600 mt-2">
            {analytics.totalProducts}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-gray-500">
            Total Orders
          </h2>
          <p className="text-4xl font-bold text-orange-500 mt-2">
            {analytics.totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-gray-500">
            Total Revenue
          </h2>
          <p className="text-4xl font-bold text-green-600 mt-2">
            ₹{analytics.totalRevenue?.toLocaleString()}
          </p>
        </div>
        <Link
  to="/admin/recommendation-analytics"
  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition block"
>
  <h2 className="text-gray-500">
    Recommendation Analytics
  </h2>

  <p className="text-4xl font-bold text-indigo-600 mt-2">
    📊
  </p>

  <p className="text-sm text-gray-500 mt-2">
    View recommendation performance
  </p>
</Link>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow-lg p-8 mt-10">
        <h2 className="text-2xl font-bold mb-6">
          Order Status Analytics
        </h2>

        <div className="w-full h-96">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={130}
                label
              >
                <Cell fill="#3B82F6" />
                <Cell fill="#F59E0B" />
                <Cell fill="#22C55E" />
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-blue-100 rounded-xl p-6">
          <h3 className="font-semibold text-blue-700">
            Pending Orders
          </h3>
          <p className="text-3xl font-bold mt-2">
            {analytics.pendingOrders}
          </p>
        </div>

        <div className="bg-yellow-100 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-700">
            Shipped Orders
          </h3>
          <p className="text-3xl font-bold mt-2">
            {analytics.shippedOrders}
          </p>
        </div>

        <div className="bg-green-100 rounded-xl p-6">
          <h3 className="font-semibold text-green-700">
            Delivered Orders
          </h3>
          <p className="text-3xl font-bold mt-2">
            {analytics.deliveredOrders}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-8 mt-10">
        <h2 className="text-2xl font-bold mb-6">
          Recent Orders
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">
                  Customer
                </th>
                <th className="p-3 text-left">
                  Amount
                </th>
                <th className="p-3 text-left">
                  Status
                </th>
                <th className="p-3 text-left">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {analytics.recentOrders?.map(
                (order) => (
                  <tr
                    key={order._id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {order.user?.name}
                    </td>

                    <td className="p-3">
                      ₹{order.totalPrice}
                    </td>

                    <td className="p-3">
                      {order.orderStatus}
                    </td>

                    <td className="p-3">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="bg-white rounded-xl shadow-lg p-8 mt-10">
        <h2 className="text-2xl font-bold mb-6">
          Monthly Revenue
        </h2>

        <div className="w-full h-96">
          <ResponsiveContainer>
            <LineChart
              data={
                analytics.monthlyRevenue || []
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Applications */}
      <div className="bg-white rounded-xl shadow-lg p-8 mt-10">
        <h2 className="text-2xl font-bold mb-6">🏪 Vendor Onboarding Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Applicant</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Business Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorRequests.map((req) => (
                <tr key={req._id} className="border-b">
                  <td className="p-3 font-semibold">{req.user?.name}</td>
                  <td className="p-3 text-gray-500">{req.user?.email}</td>
                  <td className="p-3">{req.businessName}</td>
                  <td className="p-3 text-sm max-w-xs truncate">{req.description}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReviewRequest(req._id, "approved")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewRequest(req._id, "rejected")}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {req.status !== "pending" && (
                      <span className="text-gray-400 text-sm italic">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
              {vendorRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-400">
                    No vendor applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



