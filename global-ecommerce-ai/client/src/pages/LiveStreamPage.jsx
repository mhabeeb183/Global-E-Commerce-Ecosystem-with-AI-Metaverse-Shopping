import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";

const API = "http://localhost:5000/api/livestreams";

const LiveStreamPage = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const token = userInfo?.token;
  const role = userInfo?.user?.role || userInfo?.role;

  const [streams, setStreams] = useState([]);
  const [currentStream, setCurrentStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", scheduledAt: "" });

  const videoRef = useRef(null);
  const localStreamRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!id) {
      fetchStreams();
    } else {
      fetchStream(id);
    }

    if (token) {
      const s = io("http://localhost:5000", { auth: { token } });
      setSocket(s);

      s.on("streamChat", (msg) => {
        setChatMessages((prev) => [...prev, msg]);
      });

      s.on("viewerUpdate", (data) => {
        setViewerCount((prev) => data.action === "joined" ? prev + 1 : Math.max(0, prev - 1));
      });

      s.on("streamEnded", () => {
        alert("Stream has ended!");
        setCurrentStream(null);
      });

      return () => s.disconnect();
    }
  }, [id, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

      if (socket && data.stream.roomId) {
        socket.emit("joinStream", data.stream.roomId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowCreate(false);
      fetchStreams();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleStartStream = async () => {
    try {
      // Request camera/mic access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      await axios.put(`${API}/${currentStream._id}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchStream(currentStream._id);
    } catch (err) {
      console.error("Start stream error:", err);
      alert("Could not start stream. Camera/mic access required.");
    }
  };

  const handleEndStream = async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

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
      await axios.post(`${API}/${streamId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStream(streamId);
    } catch (err) {
      alert(err.response?.data?.message || "Cannot join");
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

  // Stream Listing View
  if (!id && !currentStream) {
    return (
      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>📺 Live Commerce</h1>
          {(role === "vendor" || role === "admin") && (
            <button onClick={() => setShowCreate(!showCreate)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
              {showCreate ? "Cancel" : "🔴 Go Live"}
            </button>
          )}
        </div>

        {showCreate && (
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
                  <span style={{ position: "absolute", top: "12px", left: "12px", background: "#ef4444", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", animation: "pulse 2s infinite" }}>
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
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                    {stream.products?.length || 0} products
                  </span>
                  {stream.status === "live" ? (
                    <button onClick={() => handleJoinStream(stream._id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                      Watch Live
                    </button>
                  ) : (
                    <Link to={`/livestream/${stream._id}`} style={{ background: "#3b82f6", color: "#fff", padding: "8px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
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

  // Stream Viewer View
  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Video Area */}
        <div>
          <div style={{ background: "#000", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {(!videoRef.current?.srcObject) && (
              <div style={{ position: "absolute", color: "#fff", textAlign: "center" }}>
                <p style={{ fontSize: "48px" }}>📺</p>
                <p>{currentStream?.status === "live" ? "Stream is live" : "Waiting for stream..."}</p>
              </div>
            )}
            <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "8px" }}>
              {currentStream?.status === "live" && (
                <span style={{ background: "#ef4444", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>🔴 LIVE</span>
              )}
              <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "12px" }}>
                👁 {viewerCount}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>{currentStream?.title}</h2>
            <p style={{ color: "#6b7280" }}>by {currentStream?.host?.name}</p>

            {currentStream?.host?._id === (userInfo?.user?._id || userInfo?._id) && (
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                {currentStream?.status !== "live" && (
                  <button onClick={handleStartStream} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                    🔴 Start Stream
                  </button>
                )}
                {currentStream?.status === "live" && (
                  <button onClick={handleEndStream} style={{ background: "#6b7280", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                    ⬛ End Stream
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Products showcase */}
          {currentStream?.products?.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ fontWeight: "bold", marginBottom: "12px" }}>🛍️ Featured Products</h3>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto" }}>
                {currentStream.products.map((product) => (
                  <Link key={product._id} to={`/product/${product._id}`} style={{ minWidth: "160px", background: "#fff", borderRadius: "12px", padding: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", textDecoration: "none", color: "inherit" }}>
                    {product.images?.[0] && <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px" }} />}
                    <p style={{ fontWeight: "600", fontSize: "13px", marginTop: "8px" }}>{product.name}</p>
                    <p style={{ color: "#10b981", fontWeight: "bold" }}>₹{product.price}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div style={{ background: "#fff", borderRadius: "16px", display: "flex", flexDirection: "column", height: "600px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #f3f4f6" }}>
            <h3 style={{ fontWeight: "bold" }}>💬 Live Chat</h3>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <span style={{ fontWeight: "600", fontSize: "13px", color: "#8b5cf6" }}>{msg.userName || "User"}</span>
                <p style={{ fontSize: "14px", color: "#374151" }}>{msg.message}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {token && (
            <div style={{ padding: "12px", borderTop: "1px solid #f3f4f6", display: "flex", gap: "8px" }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
              />
              <button onClick={sendChat} style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer" }}>
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPage;
