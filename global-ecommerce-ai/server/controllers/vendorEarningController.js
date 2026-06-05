const VendorEarning = require("../models/vendorEarningModel");
const User = require("../models/User");

const getVendorEarnings = async (req, res) => {
  try {
    const earnings =
      await VendorEarning.find({
        vendor: req.user._id,
      }).sort({ createdAt: -1 });

    const vendor =
      await User.findById(req.user._id);

    const totalSales = earnings.reduce(
      (acc, item) =>
        acc + item.orderAmount,
      0
    );

    const totalEarnings = earnings
      .filter(
        (item) =>
          item.status === "credited"
      )
      .reduce(
        (acc, item) =>
          acc + item.vendorAmount,
        0
      );

    const pendingEarnings = earnings
      .filter(
        (item) =>
          item.status === "pending"
      )
      .reduce(
        (acc, item) =>
          acc + item.vendorAmount,
        0
      );

    const totalOrders =
      earnings.length;

    res.status(200).json({
      totalSales,
      totalOrders,
      totalEarnings,
      pendingEarnings,

      // NEW
      availableBalance:
        vendor.walletBalance,

      earnings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getVendorEarnings,
};