const Product = require("../models/Product");
const User = require("../models/User");
const VendorEarning = require("../models/vendorEarningModel");

const processVendorEarnings = async (order) => {
  const COMMISSION_PERCENT = 10;

  for (const item of order.orderItems) {
    const product = await Product.findById(
      item.product
    );

    if (!product) continue;

    const vendorId = product.user;

    const orderAmount =
      item.price * item.qty;

    const commissionAmount =
      (orderAmount *
        COMMISSION_PERCENT) /
      100;

    const vendorAmount =
      orderAmount -
      commissionAmount;

    // CREATE VENDOR EARNING RECORD
    await VendorEarning.create({
      vendor: vendorId,
      order: order._id,

      orderAmount,

      commissionPercent:
        COMMISSION_PERCENT,

      commissionAmount,

      vendorAmount,

      // ORDER IS DELIVERED
      // SO EARNINGS ARE CREDITED
      status: "credited",
    });

    // CREDIT VENDOR WALLET
    const vendor =
      await User.findById(vendorId);

    if (vendor) {
      vendor.walletBalance =
        (vendor.walletBalance ||
          0) + vendorAmount;

      await vendor.save();
    }
  }
};

module.exports = {
  processVendorEarnings,
};