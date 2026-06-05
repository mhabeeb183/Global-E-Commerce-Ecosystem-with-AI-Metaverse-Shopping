
import { useEffect, useState } from "react";
import axios from "axios";

const Wallet = () => {
  const [walletBalance, setWalletBalance] =
    useState(0);

  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const userInfo = JSON.parse(
          localStorage.getItem("userInfo")
        );

        const { data } = await axios.get(
          "http://localhost:5000/api/wallet",
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
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
const addMoneyHandler = async () => {
  try {
    if (!amount || amount <= 0) {
      return alert("Enter valid amount");
    }

    const userInfo = JSON.parse(
      localStorage.getItem("userInfo")
    );

    const token = userInfo?.token;

    // Create Razorpay Order
    const { data } = await axios.post(
      "http://localhost:5000/api/payment/create-order",
      {
        amount: Number(amount),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,

      amount: data.amount,

      currency: data.currency,

      name: "Global E-Commerce",

      description: "Wallet Top Up",

      order_id: data.id,

      handler: async function () {
        try {
          // Add money only after payment success
          const walletResponse =
            await axios.post(
              "http://localhost:5000/api/wallet/add-money",
              {
                amount: Number(amount),
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          setWalletBalance(
            walletResponse.data.walletBalance
          );

          setAmount("");

          alert(
            "Money added to wallet successfully"
          );
        } catch (error) {
          console.log(error);

          alert(
            "Wallet update failed"
          );
        }
      },

      prefill: {
        name: userInfo?.name || "",
        email: userInfo?.email || "",
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

    alert("Payment Failed");
  }
};

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        My Wallet 💰
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg">
        <h2 className="text-xl text-gray-500">
          Wallet Balance
        </h2>

        <p className="text-5xl font-bold text-green-600 mt-4">
          ₹ {walletBalance}
        </p>

        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className="w-full border rounded-lg p-3 mt-6"
        />

        <button
          onClick={addMoneyHandler}
          className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          Add Money
        </button>
      </div>
    </div>
  );
};

export default Wallet;

