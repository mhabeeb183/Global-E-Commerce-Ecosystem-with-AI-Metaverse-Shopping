const LiveStream = require("../models/LiveStream");

// Create/Schedule a live stream
const createLiveStream = async (req, res) => {
  try {
    const streamData = {
      ...req.body,
      host: req.user._id,
      roomId: `stream_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };

    const stream = await LiveStream.create(streamData);
    res.status(201).json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all live/upcoming streams
const getActiveStreams = async (req, res) => {
  try {
    const streams = await LiveStream.find({
      status: { $in: ["live", "scheduled"] },
    })
      .populate("host", "name")
      .populate("products", "name price images")
      .sort({ scheduledAt: 1 });

    res.json({ success: true, streams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stream by ID
const getStreamById = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id)
      .populate("host", "name")
      .populate("products", "name price images description")
      .populate("viewers.user", "name");

    if (!stream) {
      return res.status(404).json({ success: false, message: "Stream not found" });
    }

    res.json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start live stream
const startStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({ success: false, message: "Stream not found" });
    }

    if (stream.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    stream.status = "live";
    stream.startedAt = new Date();
    await stream.save();

    // Notify via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("streamStarted", {
        streamId: stream._id,
        title: stream.title,
        host: req.user.name,
        roomId: stream.roomId,
      });
    }

    res.json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// End live stream
const endStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({ success: false, message: "Stream not found" });
    }

    stream.status = "ended";
    stream.endedAt = new Date();
    await stream.save();

    const io = req.app.get("io");
    if (io) {
      io.to(stream.roomId).emit("streamEnded", { streamId: stream._id });
    }

    res.json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join a stream as viewer
const joinStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);

    if (!stream || stream.status !== "live") {
      return res.status(400).json({ success: false, message: "Stream is not live" });
    }

    const alreadyViewing = stream.viewers.find(
      (v) => v.user && v.user.toString() === req.user._id.toString()
    );

    if (!alreadyViewing) {
      stream.viewers.push({ user: req.user._id });
      stream.currentViewerCount += 1;
      if (stream.currentViewerCount > stream.peakViewerCount) {
        stream.peakViewerCount = stream.currentViewerCount;
      }
      await stream.save();
    }

    const io = req.app.get("io");
    if (io) {
      io.to(stream.roomId).emit("viewerJoined", {
        viewerCount: stream.currentViewerCount,
      });
    }

    res.json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send chat message in stream
const sendStreamChat = async (req, res) => {
  try {
    const { message } = req.body;
    const stream = await LiveStream.findById(req.params.id);

    if (!stream || stream.status !== "live") {
      return res.status(400).json({ success: false, message: "Stream is not live" });
    }

    const chatMessage = {
      user: req.user._id,
      userName: req.user.name,
      message,
      timestamp: new Date(),
    };

    stream.chat.push(chatMessage);
    await stream.save();

    const io = req.app.get("io");
    if (io) {
      io.to(stream.roomId).emit("streamChat", chatMessage);
    }

    res.json({ success: true, chatMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get vendor's streams
const getMyStreams = async (req, res) => {
  try {
    const streams = await LiveStream.find({ host: req.user._id })
      .populate("products", "name price images")
      .sort({ createdAt: -1 });

    res.json({ success: true, streams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createLiveStream,
  getActiveStreams,
  getStreamById,
  startStream,
  endStream,
  joinStream,
  sendStreamChat,
  getMyStreams,
};
