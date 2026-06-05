
const Order = require("../models/Order");
const Coupon = require(
  "../models/couponModel"
);
const User = require("../models/User");
const {
  calculateDynamicPrice,
} = require("../services/dynamicPricingService");

const {
  processVendorEarnings,
} = require("../utils/vendorEarnings");
const Product = require("../models/Product");
const RecommendationAnalytics = require(
  "../models/recommendationAnalyticsModel"
);
const Affiliate = require(
  "../models/affiliateModel"
);
//
// CREATE ORDER
//
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      totalPrice,
      isPaid,
      paidPrice,
      couponCode,
      discount,
      affiliateCode,

    
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        message: "No order items",
      });
    }
    //
// INVENTORY VALIDATION
//
for (const item of orderItems) {
  const product =
    await Product.findById(
      item.product
    );

  if (!product) {
    return res.status(404).json({
      message: `Product not found`,
    });
  }

  if (product.stock < item.qty) {
    return res.status(400).json({
      message: `${product.name} is out of stock`,
    });
  }
}

    const order = new Order({
      user: req.user._id,

      orderItems,

      totalPrice,

      isPaid: isPaid || false,

      paidPrice: paidPrice || 0,

      paidAt: isPaid
        ? Date.now()
        : null,

      //
      // ORDER TRACKING
      //
      orderStatus: "Order Placed",

      statusHistory: [
        {
          status: "Order Placed",
          updatedAt: new Date(),
        },
      ],
    });
 //
// REDUCE INVENTORY
//
for (const item of orderItems) {
  const product =
    await Product.findById(
      item.product
    );

  product.stock -= item.qty;

  product.soldCount += item.qty;

  await product.save();

  // RECALCULATE DYNAMIC PRICE
  await calculateDynamicPrice(
    product._id
  );
}
    const createdOrder =
      await order.save();

   
const affiliate =
  await Affiliate.findOne({
    referredUser: req.user._id,
  });

if (
  affiliate &&
  !affiliate.rewardGiven
) {
  const couponCode =
    "REF200" +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  await Coupon.create({
    code: couponCode,
    user: affiliate.affiliateUser,
    discountType: "fixed",
    discountValue: 200,
    minOrderAmount: 1000,
    expiryDate: new Date(
      Date.now() +
        30 * 24 * 60 * 60 * 1000
    ),
    reason: "Referral Reward",
  });

  affiliate.rewardGiven = true;
  affiliate.firstOrderCompleted = true;
  affiliate.order = createdOrder._id;

  await affiliate.save();

  console.log(
    "Referral Coupon Created:",
    couponCode
  );
}
      //
// AFFILIATE COMMISSION
//
if (affiliateCode) {
  try {
    const affiliate =
      await Affiliate.findOne({
        affiliateCode,
      });

    if (
      affiliate &&
      !affiliate.isConverted
    ) {
      affiliate.order =
        createdOrder._id;

      affiliate.orderAmount =
        totalPrice;

      affiliate.commissionEarned =
        (totalPrice *
          affiliate.commissionRate) /
        100;

      affiliate.isConverted =
        true;

      affiliate.convertedAt =
        new Date();

      affiliate.referredUser =
        req.user._id;

      await affiliate.save();

      console.log(
        "Affiliate Commission Added"
      );
    }
  } catch (error) {
    console.log(
      "Affiliate Error:",
      error.message
    );
  }
}
  //
// MARK COUPON USED
//
if (couponCode) {
  const coupon =
    await Coupon.findOne({
      code: couponCode,
    });

  if (
    coupon &&
    !coupon.isUsed
  ) {
    coupon.isUsed = true;

    coupon.usedAt =
      new Date();

    await coupon.save();
  }
}
      try {
  for (const item of orderItems) {
    const product =
      await Product.findById(
        item.product
      );

    if (product) {
      await RecommendationAnalytics.create({
        user: req.user._id,
        product: product._id,
        category: product.category,
        brand: product.brand,
        action: "purchased",
      });
    }
  }
} catch (trackingError) {
  console.error(
    "Purchase Tracking Error:",
    trackingError.message
  );
}

    res.status(201).json(
      createdOrder
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//
// GET MY ORDERS
//
const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//
// GET VENDOR ORDERS
//
const getVendorOrders =
  async (req, res) => {
    try {
      const Product = require(
        "../models/Product"
      );

      const vendorProducts =
        await Product.find({
          user: req.user._id,
        });

      const productIds =
        vendorProducts.map((product) =>
          product._id.toString()
        );

      const orders =
        await Order.find();

      const vendorOrders =
        orders.filter((order) =>
          order.orderItems.some(
            (item) =>
              item.product &&
              productIds.includes(
                item.product.toString()
              )
          )
        );

      res
        .status(200)
        .json(vendorOrders);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

//
// GET ALL ORDERS (ADMIN)
//
const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find().populate(
        "user",
        "name email"
      );

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//
// UPDATE ORDER STATUS
//
const updateOrderStatus =
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res
          .status(404)
          .json({
            message:
              "Order not found",
          });
      }

      const newStatus =
        req.body.status;

        //
// ROLE-BASED STATUS CONTROL
//
if (
  req.user.role === "vendor"
) {
  const vendorStatuses = [
    "Packed",
    "Shipped",
    "Out For Delivery",
  ];

  if (
    !vendorStatuses.includes(
      newStatus
    )
  ) {
    return res.status(403).json({
      message:
        "Vendors cannot set this status",
    });
  }
}

if (
  req.user.role === "admin"
) {
  if (
    newStatus !== "Delivered"
  ) {
    return res.status(403).json({
      message:
        "Admins can only mark Delivered",
    });
  }
}

      const validStatuses = [
        "Order Placed",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
      ];

      if (
        !validStatuses.includes(
          newStatus
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid order status",
          });
      }

 if (order.orderStatus === newStatus) {
  return res.status(400).json({
    message: "Order already has this status",
  });
}

order.orderStatus = newStatus;

order.statusHistory.push({
  status: newStatus,
  updatedAt: new Date(),
});

      //
      // CUSTOMER CASHBACK
      //
      if (
        newStatus ===
          "Delivered" &&
        order.isPaid &&
        !order.cashbackGiven
      ) {
        const user =
          await User.findById(
            order.user
          );

        if (user) {
          const cashback =
            order.totalPrice * 0.05;

          user.walletBalance =
            (user.walletBalance ||
              0) + cashback;

          await user.save();

          order.cashbackGiven = true;
        }
      }

      //
      // VENDOR EARNINGS
      //
      if (
        newStatus ===
          "Delivered" &&
        order.isPaid &&
        !order.vendorEarningsProcessed
      ) {
        await processVendorEarnings(
          order
        );

        order.vendorEarningsProcessed =
          true;
      }

      const updatedOrder =
        await order.save();

      //
      // SOCKET.IO REAL-TIME EVENT
      //
      const io =
        req.app.get("io");

      if (io) {
        io.to(
          `order_${order._id}`
        ).emit(
          "orderStatusUpdated",
          {
            orderId:
              order._id,
            status:
              updatedOrder.orderStatus,
            statusHistory:
              updatedOrder.statusHistory,
            updatedAt:
              new Date(),
          }
        );
      }

      res.status(200).json({
        message:
          "Order status updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.error(
      "Update Order Status Error:",
      error
      );

      res.status(500).json({
        message: error.message,
      });
    }
  };

//
// MARK ORDER AS PAID
//
const markOrderPaid =
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res
          .status(404)
          .json({
            message:
              "Order not found",
          });
      }

      order.isPaid = true;
      order.paidAt = Date.now();

      const updatedOrder =
        await order.save();

      res.status(200).json(
        updatedOrder
      );
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

  
  const getOrderById = async (
  req,
  res
) => {
  try {
    const order =
  await Order.findById(
    req.params.id
  ).populate(
    "user",
    "name email"
  );

    if (!order) {
      return res.status(404).json({
        message:
          "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getVendorOrders,
  getAllOrders,
  updateOrderStatus,
  markOrderPaid,
  getOrderById,
};