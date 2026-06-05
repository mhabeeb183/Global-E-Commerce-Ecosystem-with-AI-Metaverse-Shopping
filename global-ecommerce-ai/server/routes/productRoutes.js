const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getAllReviews,
  getLowStockProducts,
  getVendorReviews,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

//
// PUBLIC ROUTES
//
router.get("/", getProducts);

//
// LOW STOCK PRODUCTS (ADMIN)
// IMPORTANT: Must be above "/:id"
//
router.get(
  "/low-stock",
  protect,
  admin,
  getLowStockProducts
);

//
// VENDOR REVIEWS
// IMPORTANT: Must be above "/:id"
//
router.get(
  "/vendor/reviews",
  protect,
  getVendorReviews
);

//
// ADMIN - GET ALL REVIEWS
// IMPORTANT: Must be above "/:id"
//
router.get(
  "/reviews/all",
  protect,
  admin,
  getAllReviews
);

//
// GET PRODUCT BY ID
//
router.get("/:id", getProductById);

//
// REVIEW ROUTE (LOGGED-IN USERS)
//
router.post(
  "/:id/reviews",
  protect,
  createProductReview
);

//
// ADMIN PROTECTED ROUTES
//
router.post(
  "/",
  protect,
  admin,
  createProduct
);

router.put(
  "/:id",
  protect,
  admin,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  admin,
  deleteProduct
);

module.exports = router;