import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api/auctions";

const AuctionPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const token = userInfo?.token;
  const role = userInfo?.user?.role || userInfo?.role;
  const isVendorOrAdmin = role === "vendor" || role === "admin";
  const [auctions, setAuctions] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    product: "",
    startingPrice: "",
    bidIncrement: 10,
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const { data } = await axios.get(`${API}/active`);
      setAuctions(data.auctions || []);
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
      fetchAuctions();
      alert("Auction created!");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating auction");
    }
  };

  const getTimeRemaining = (endTime) => {
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#10b981";
      case "upcoming": return "#3b82f6";
      case "ended": return "#6b7280";
      case "sold": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>🔨 Live Auctions</h1>
        {isVendorOrAdmin && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
          >
            {showCreate ? "Cancel" : "+ Create Auction"}
          </button>
        )}
      </div>

      {isVendorOrAdmin && showCreate && (
        <form onSubmit={handleCreate} style={{ background: "#fff", padding: "24px", borderRadius: "12px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "16px" }}>Create New Auction</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <input placeholder="Auction Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
            <input placeholder="Product ID" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
            <input type="number" placeholder="Starting Price (₹)" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
            <input type="number" placeholder="Bid Increment (₹)" value={form.bidIncrement} onChange={(e) => setForm({ ...form, bidIncrement: Number(e.target.value) })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280" }}>Start Time</label>
              <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", width: "100%" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b7280" }}>End Time</label>
              <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", width: "100%" }} />
            </div>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginTop: "16px", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", width: "100%", minHeight: "80px" }} />
          <button type="submit" style={{ marginTop: "16px", background: "#8b5cf6", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Create Auction</button>
        </form>
      )}

      {/* Auction Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
        {auctions.map((auction) => (
          <div key={auction._id} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.2s" }}>
            {/* Image */}
            <div style={{ height: "180px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {auction.product?.images?.[0] ? (
                <img src={auction.product.images[0]} alt={auction.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "48px" }}>🔨</span>
              )}
              <span style={{
                position: "absolute", top: "12px", right: "12px",
                background: getStatusColor(auction.status), color: "#fff",
                padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase"
              }}>
                {auction.status}
              </span>
            </div>

            <div style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>{auction.title}</h3>
              <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "12px" }}>
                by {auction.seller?.name || "Unknown"}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#9ca3af" }}>Current Bid</p>
                  <p style={{ fontSize: "22px", fontWeight: "bold", color: "#10b981" }}>₹{auction.currentPrice}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "12px", color: "#9ca3af" }}>Time Left</p>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#ef4444" }}>{getTimeRemaining(auction.endTime)}</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  {auction.totalBids || 0} bids
                </span>
                <Link
                  to={`/auction/${auction._id}`}
                  style={{ background: "#3b82f6", color: "#fff", padding: "8px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}
                >
                  Place Bid →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {auctions.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
          <p style={{ fontSize: "48px" }}>🔨</p>
          <p style={{ fontSize: "18px" }}>No active auctions right now</p>
        </div>
      )}
    </div>
  );
};

export default AuctionPage;
