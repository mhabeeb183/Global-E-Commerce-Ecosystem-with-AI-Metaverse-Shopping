
const User = require("../models/User");

// Get Wallet Balance
const getWallet = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    res.json({
      walletBalance: user.walletBalance,
      isSubscribed: user.isSubscribed,
      subscriptionExpiry: user.subscriptionExpiry,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Money
const addMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(
      req.user._id
    );

    user.walletBalance += Number(amount);

    await user.save();

    res.json({
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Use Wallet Balance
const useWalletBalance = async (
  req,
  res
) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(
      req.user._id
    );

    if (
      user.walletBalance < Number(amount)
    ) {
      return res.status(400).json({
        message:
          "Insufficient wallet balance",
      });
    }

    user.walletBalance -= Number(amount);

    await user.save();

    res.json({
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getWallet,
  addMoney,
  useWalletBalance,
};

