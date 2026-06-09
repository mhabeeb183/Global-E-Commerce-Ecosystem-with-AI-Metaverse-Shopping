const express = require("express");

const {
  createOrder,
  getMyOrders,
  getVendorOrders,
  getAllOrders,
  updateOrderStatus,
  markOrderPaid,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const {
  protect,
} = require("../middleware/authMiddleware");
const fraudDetection = require("../middleware/fraudDetection");

const adminOnly = require(
  "../middleware/adminOnlyMiddleware"
);

const router = express.Router();

//
// CREATE ORDER
//
router.post(
  "/",
  protect,
  fraudDetection,
  createOrder
);

//
// GET MY ORDERS
//
router.get(
  "/myorders",
  protect,
  getMyOrders
);

//
// GET VENDOR ORDERS
//
router.get(
  "/vendor-orders",
  protect,
  getVendorOrders
);

//
// GET ALL ORDERS (ADMIN)
//
router.get(
  "/admin",
  protect,
  adminOnly,
  getAllOrders
);

//
// GET SINGLE ORDER
//
router.get(
  "/:id",
  protect,
  getOrderById
);

//
// UPDATE ORDER STATUS
//
// TEMPORARY:
// protect only so Vendor can update.
//
// Later we'll create
// vendorOrAdmin middleware.
//
router.put(
  "/:id/status",
  protect,
  updateOrderStatus
);

//
// MARK ORDER AS PAID
//
router.put(
  "/:id/pay",
  protect,
  markOrderPaid
);

//
// CANCEL ORDER
//
router.put(
  "/:id/cancel",
  protect,
  cancelOrder
);

module.exports = router;