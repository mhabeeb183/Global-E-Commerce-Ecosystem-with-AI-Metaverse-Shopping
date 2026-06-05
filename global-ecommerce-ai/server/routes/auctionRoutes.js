const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createAuction,
  getActiveAuctions,
  getAuctionById,
  placeBid,
  getMyAuctions,
  cancelAuction,
} = require("../controllers/auctionController");

router.post("/", protect, createAuction);
router.get("/active", getActiveAuctions);
router.get("/my-auctions", protect, getMyAuctions);
router.get("/:id", getAuctionById);
router.post("/:id/bid", protect, placeBid);
router.put("/:id/cancel", protect, cancelAuction);

module.exports = router;
