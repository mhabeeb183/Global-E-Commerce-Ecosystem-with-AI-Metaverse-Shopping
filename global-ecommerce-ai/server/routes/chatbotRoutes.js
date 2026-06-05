const express = require("express");

const {
  chatbotSearch,
} = require("../controllers/chatbotController");

const router = express.Router();

router.post("/", chatbotSearch);

module.exports = router;