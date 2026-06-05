const express = require("express");

const {
  createCoupon,
  getMyCoupons,
  validateCoupon,
} = require(
  "../controllers/couponController"
);

const {
  protect,
  admin,
} = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

//
// USER ROUTES
//
router.get(
  "/my",
  protect,
  getMyCoupons
);

router.post(
  "/validate",
  protect,
  validateCoupon
);

//
// ADMIN ROUTES
//
router.post(
  "/",
  protect,
  admin,
  createCoupon
);

module.exports = router;