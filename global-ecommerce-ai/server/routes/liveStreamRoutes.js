const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createLiveStream,
  getActiveStreams,
  getStreamById,
  startStream,
  endStream,
  joinStream,
  sendStreamChat,
  getMyStreams,
} = require("../controllers/liveStreamController");

router.post("/", protect, createLiveStream);
router.get("/active", getActiveStreams);
router.get("/my-streams", protect, getMyStreams);
router.get("/:id", getStreamById);
router.put("/:id/start", protect, startStream);
router.put("/:id/end", protect, endStream);
router.post("/:id/join", protect, joinStream);
router.post("/:id/chat", protect, sendStreamChat);

module.exports = router;
