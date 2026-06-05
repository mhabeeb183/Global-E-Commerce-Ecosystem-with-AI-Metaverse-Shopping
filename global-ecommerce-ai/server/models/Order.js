const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        name: String,
        qty: Number,
        image: String,
        price: Number,

        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    paidPrice: {
      type: Number,
      default: 0,
    },

    //
    // REAL-TIME ORDER TRACKING
    //
    orderStatus: {
      type: String,
      enum: [
        "Order Placed",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
      ],
      default: "Order Placed",
    },

    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },

        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    cashbackGiven: {
      type: Boolean,
      default: false,
    },

    vendorEarningsProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  mongoose.models.Order ||
  mongoose.model(
    "Order",
    orderSchema
  );

module.exports = Order;