const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const adminOrVendor = require("../middleware/adminMiddleware");

const {
  createAuction,
  getActiveAuctions,
  getAuctionById,
  placeBid,
  getMyAuctions,
  cancelAuction,
} = require("../controllers/auctionController");

// Only vendors and admins can create auctions
router.post("/", protect, adminOrVendor, createAuction);
router.get("/active", getActiveAuctions);
// Only vendors and admins can view their own auctions
router.get("/my-auctions", protect, adminOrVendor, getMyAuctions);
router.get("/:id", getAuctionById);
// Any logged-in user can place a bid
router.post("/:id/bid", protect, placeBid);
// Only vendors and admins can cancel auctions
router.put("/:id/cancel", protect, adminOrVendor, cancelAuction);

module.exports = router;
