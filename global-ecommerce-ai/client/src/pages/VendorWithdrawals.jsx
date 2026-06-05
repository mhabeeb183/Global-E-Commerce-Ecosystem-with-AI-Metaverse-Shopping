import { useEffect, useState } from "react";
import axios from "axios";

const VendorWithdrawals = () => {
  const [amount, setAmount] =
    useState("");

  const [withdrawals, setWithdrawals] =
    useState([]);

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  };

  const fetchWithdrawals = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/withdrawals/my",
        config
      );

      setWithdrawals(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/withdrawals/request",
        {
          amount,
        },
        config
      );

      alert(
        "Withdrawal request submitted"
      );

      setAmount("");

      fetchWithdrawals();
    } catch (error) {
      alert(
        error.response?.data?.message
      );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Vendor Withdrawals
      </h1>

      <form
        onSubmit={submitHandler}
        className="mb-8"
      >
        <input
          type="number"
          placeholder="Enter Amount"
          className="border p-2 mr-2"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Request Withdrawal
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">
              Amount
            </th>

            <th className="p-2">
              Status
            </th>

            <th className="p-2">
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {withdrawals.map((item) => (
            <tr key={item._id}>
              <td className="p-2">
                ₹{item.amount}
              </td>

              <td className="p-2">
                {item.status}
              </td>

              <td className="p-2">
                {new Date(
                  item.createdAt
                ).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorWithdrawals;