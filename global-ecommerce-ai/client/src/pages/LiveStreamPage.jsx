import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";

const API = "http://localhost:5000/api/livestreams";
const envUrl = import.meta.env.VITE_SOCKET_URL;
const SOCKET_URL = envUrl && !envUrl.includes("localhost")
  ? envUrl
  : `${window.location.protocol}//${window.location.hostname}:5000`;
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

const LiveStreamPage = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const token = userInfo?.token;
  const userId = userInfo?.user?._id || userInfo?._id;
  const role = userInfo?.user?.role || userInfo?.role;

  const [streams, setStreams] = useState([]);
  const [currentStream, setCurrentStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", scheduledAt: "" });

  const videoRef = useRef(null);
  const localStreamRef = useRef(null);
  const chatEndRef = useRef(null);
  // Host keeps one RTCPeerConnection per viewer socket ID
  const peerConnectionsRef = useRef({});
  // Viewer keeps one RTCPeerConnection to the host
  const peerConnectionRef = useRef(null);
  // Ref to avoid stale closures in socket listeners
  const localStreamLiveRef = useRef(false);
  const currentStreamRef = useRef(null);

  // Keep currentStreamRef in sync
  useEffect(() => {
    currentStreamRef.current = currentStream;
  }, [currentStream]);

  // ─── SOCKET SETUP ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    // Live chat messages
    s.on("streamChat", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Viewer count updates
    s.on("viewerUpdate", (data) => {
      setViewerCount((prev) =>
        data.action === "joined" ? prev + 1 : Math.max(0, prev - 1)
      );
    });

    // Stream ended by host
    s.on("streamEnded", () => {
      alert("The stream has ended!");
      setCurrentStream(null);
      setIsStreaming(false);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    });

    // ── HOST ONLY: a viewer just joined and is ready ──────────────────────────
    s.on("viewer-ready", async ({ viewerId }) => {
      if (!localStreamLiveRef.current || !localStreamRef.current) return;

      try {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionsRef.current[viewerId] = pc;

        // Add all local tracks to this peer connection
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });

        // Send ICE candidates to this viewer
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            s.emit("peer-signal", {
              to: viewerId,
              signal: { type: "ice-candidate", candidate },
            });
          }
        };

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        s.emit("peer-signal", {
          to: viewerId,
          signal: { type: "offer", sdp: offer },
        });
      } catch (err) {
        console.error("Error creating offer for viewer:", err);
      }
    });

    // ── BOTH: handle incoming peer signals ────────────────────────────────────
    s.on("peer-signal", async ({ from, signal }) => {
      try {
        if (signal.type === "offer") {
          // VIEWER receives offer from host
          const pc = new RTCPeerConnection(ICE_SERVERS);
          peerConnectionRef.current = pc;

          // When host's video/audio tracks arrive, show in video element
          pc.ontrack = ({ streams }) => {
            if (videoRef.current && streams[0]) {
              videoRef.current.srcObject = streams[0];
              setIsStreaming(true);
            }
          };

          // Send ICE candidates back to host
          pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
              s.emit("peer-signal", {
                to: from,
                signal: { type: "ice-candidate", candidate },
              });
            }
          };

          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          s.emit("peer-signal", {
            to: from,
            signal: { type: "answer", sdp: answer },
          });
        } else if (signal.type === "answer") {
          // HOST receives answer from a viewer
          const pc = peerConnectionsRef.current[from];
          if (pc && pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          }
        } else if (signal.type === "ice-candidate") {
          // Both: add ICE candidate
          const hostPc = peerConnectionRef.current;
          const viewerPc = peerConnectionsRef.current[from];
          const pc = hostPc || viewerPc;
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.error("Peer signal handling error:", err);
      }
    });

    return () => {
      s.disconnect();
      // Cleanup all peer connections on unmount
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      peerConnectionsRef.current = {};
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [token]);

  // ─── JOIN SOCKET ROOM (separate effect — fixed race condition) ────────────────
  useEffect(() => {
    if (!socket || !currentStream?.roomId) return;

    const { roomId } = currentStream;
    const hostId = currentStream.host?._id || currentStream.host;
    const isHost = hostId === userId;

    socket.emit("joinStream", roomId);

    // Viewers notify the host they are ready to receive video
    if (!isHost && currentStream.status === "live") {
      // Small delay to ensure host's socket listener is registered
      const timer = setTimeout(() => {
        socket.emit("viewer-ready", { roomId });
      }, 800);
      return () => {
        clearTimeout(timer);
        socket.emit("leaveStream", roomId);
      };
    }

    return () => {
      socket.emit("leaveStream", roomId);
    };
  }, [socket, currentStream?.roomId, currentStream?.status]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ─── DATA FETCHING ───────────────────────────────────────────────────────────
  const fetchStreams = async () => {
    try {
      const { data } = await axios.get(`${API}/active`);
      setStreams(data.streams || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStream = async (streamId) => {
    try {
      const { data } = await axios.get(`${API}/${streamId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCurrentStream(data.stream);
      setChatMessages(data.stream.chat || []);
      setViewerCount(data.stream.currentViewerCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!id) {
      fetchStreams();
    } else {
      fetchStream(id);
    }
  }, [id]);

  // ─── STREAM CONTROLS ─────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowCreate(false);
      fetchStreams();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating stream");
    }
  };

  const handleStartStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = mediaStream;
      localStreamLiveRef.current = true;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsStreaming(true);
      }

      await axios.put(`${API}/${currentStream._id}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchStream(currentStream._id);
    } catch (err) {
      console.error("Start stream error:", err);
      alert("Could not start stream. Please allow camera and microphone access.");
    }
  };

  const handleEndStream = async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      localStreamLiveRef.current = false;
      setIsStreaming(false);

      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      peerConnectionsRef.current = {};

      await axios.put(`${API}/${currentStream._id}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentStream(null);
      fetchStreams();
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinStream = async (streamId) => {
    try {
      await axios.post(
        `${API}/${streamId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStream(streamId);
    } catch (err) {
      alert(err.response?.data?.message || "Cannot join stream");
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !currentStream) return;
    try {
      await axios.post(
        `${API}/${currentStream._id}/chat`,
        { message: chatInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const isHost =
    currentStream &&
    (currentStream.host?._id === userId || currentStream.host === userId);

  // ─── STREAM LISTING VIEW ──────────────────────────────────────────────────────
  if (!id && !currentStream) {
    return (
      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>📺 Live Commerce</h1>
          {(role === "vendor" || role === "admin") && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              style={{ background: "#ef4444", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
              {showCreate ? "Cancel" : "🔴 Go Live"}
            </button>
          )}
        </div>

        {showCreate && (role === "vendor" || role === "admin") && (
          <form onSubmit={handleCreate} style={{ background: "#fff", padding: "24px", borderRadius: "12px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <input placeholder="Stream Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #d1d5db", minHeight: "60px" }} />
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "12px" }} />
            <button type="submit" style={{ background: "#ef4444", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer" }}>Create Stream</button>
          </form>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {streams.map((stream) => (
            <div key={stream._id} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ height: "180px", background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <span style={{ fontSize: "48px" }}>📺</span>
                {stream.status === "live" && (
                  <span style={{ position: "absolute", top: "12px", left: "12px", background: "#ef4444", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                    🔴 LIVE
                  </span>
                )}
                <span style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "12px" }}>
                  👁 {stream.currentViewerCount || 0}
                </span>
              </div>
              <div style={{ padding: "16px" }}>
                <h3 style={{ fontWeight: "bold", marginBottom: "4px" }}>{stream.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "12px" }}>by {stream.host?.name || "Host"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>{stream.products?.length || 0} products</span>
                  {stream.status === "live" ? (
                    <button
                      onClick={() => handleJoinStream(stream._id)}
                      style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                    >
                      Watch Live
                    </button>
                  ) : (
                    <Link
                      to={`/livestream/${stream._id}`}
                      style={{ background: "#3b82f6", color: "#fff", padding: "8px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}
                    >
                      Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {streams.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
            <p style={{ fontSize: "48px" }}>📺</p>
            <p>No live streams right now</p>
          </div>
        )}
      </div>
    );
  }

  // ─── STREAM VIEWER / HOST VIEW ────────────────────────────────────────────────
  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>

        {/* Video Area */}
        <div>
          <div style={{ background: "#111", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={!!isHost}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {!isStreaming && (
              <div style={{ position: "absolute", color: "#fff", textAlign: "center" }}>
                <p style={{ fontSize: "48px" }}>📺</p>
                <p style={{ fontSize: "16px" }}>
                  {currentStream?.status === "live"
                    ? "Connecting to stream..."
                    : "Waiting for host to start stream..."}
                </p>
              </div>
            )}
            <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "8px" }}>
              {currentStream?.status === "live" && (
                <span style={{ background: "#ef4444", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                  🔴 LIVE
                </span>
              )}
              <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "12px" }}>
                👁 {viewerCount}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>{currentStream?.title}</h2>
            <p style={{ color: "#6b7280" }}>by {currentStream?.host?.name}</p>

            {isHost && (
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                {currentStream?.status !== "live" && (
                  <button
                    onClick={handleStartStream}
                    style={{ background: "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  >
                    🔴 Start Stream
                  </button>
                )}
                {currentStream?.status === "live" && (
                  <button
                    onClick={handleEndStream}
                    style={{ background: "#6b7280", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  >
                    ⬛ End Stream
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Featured Products */}
          {currentStream?.products?.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ fontWeight: "bold", marginBottom: "12px" }}>🛍️ Featured Products</h3>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {currentStream.products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    style={{ minWidth: "160px", background: "#fff", borderRadius: "12px", padding: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", textDecoration: "none", color: "inherit" }}
                  >
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px" }} />
                    )}
                    <p style={{ fontWeight: "600", fontSize: "13px", marginTop: "8px" }}>{product.name}</p>
                    <p style={{ color: "#10b981", fontWeight: "bold" }}>₹{product.price}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Chat Panel */}
        <div style={{ background: "#fff", borderRadius: "16px", display: "flex", flexDirection: "column", height: "600px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #f3f4f6" }}>
            <h3 style={{ fontWeight: "bold" }}>💬 Live Chat</h3>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {chatMessages.length === 0 && (
              <p style={{ color: "#9ca3af", textAlign: "center", marginTop: "24px", fontSize: "14px" }}>
                No messages yet. Say hi! 👋
              </p>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <span style={{ fontWeight: "600", fontSize: "13px", color: "#8b5cf6" }}>
                  {msg.userName || "User"}
                </span>
                <p style={{ fontSize: "14px", color: "#374151", margin: "2px 0 0" }}>
                  {msg.message}
                </p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {token ? (
            <div style={{ padding: "12px", borderTop: "1px solid #f3f4f6", display: "flex", gap: "8px" }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none" }}
              />
              <button
                onClick={sendChat}
                style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer" }}
              >
                Send
              </button>
            </div>
          ) : (
            <div style={{ padding: "12px", borderTop: "1px solid #f3f4f6", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
              <Link to="/login" style={{ color: "#8b5cf6", fontWeight: "600" }}>Login</Link> to join the chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPage;
