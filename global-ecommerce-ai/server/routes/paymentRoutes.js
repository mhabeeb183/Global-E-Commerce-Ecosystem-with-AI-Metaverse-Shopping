const express = require("express");
const {
  createRazorpayOrder,
  createStripePaymentIntent,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");
const fraudDetection = require("../middleware/fraudDetection");

const router = express.Router();

router.post(
  "/create-order",
  protect,
  fraudDetection,
  createRazorpayOrder
);

router.post(
  "/stripe-intent",
  protect,
  fraudDetection,
  createStripePaymentIntent
);

module.exports = router;