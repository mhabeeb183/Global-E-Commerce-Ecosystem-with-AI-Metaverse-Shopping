import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const API = "http://localhost:5000/api/warehouses";

const WarehouseManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const token = userInfo?.token;

  const [warehouses, setWarehouses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: { address: "", city: "", state: "", country: "", zipCode: "" },
    capacity: 1000,
    status: "active",
  });

  const [stockForm, setStockForm] = useState({
    warehouseId: "",
    productId: "",
    quantity: 0,
    bin: "A1",
  });

  const [transferForm, setTransferForm] = useState({
    fromWarehouseId: "",
    toWarehouseId: "",
    productId: "",
    quantity: 0,
  });

  const [activeTab, setActiveTab] = useState("warehouses");

  useEffect(() => {
    fetchWarehouses();
    fetchAnalytics();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const { data } = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarehouses(data.warehouses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get(`${API}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(data.analytics);
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
      setShowForm(false);
      setForm({
        name: "",
        location: { address: "", city: "", state: "", country: "", zipCode: "" },
        capacity: 1000,
        status: "active",
      });
      fetchWarehouses();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating warehouse");
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/${stockForm.warehouseId}/add-stock`,
        {
          productId: stockForm.productId,
          quantity: Number(stockForm.quantity),
          bin: stockForm.bin,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Stock added!");
      fetchWarehouses();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding stock");
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/transfer`, transferForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Transfer successful!");
      fetchWarehouses();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Transfer failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this warehouse?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWarehouses();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>
        🏭 Warehouse Management
      </h1>

      {/* Analytics Cards */}
      {analytics && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total Warehouses", value: analytics.totalWarehouses, color: "#3b82f6" },
            { label: "Active", value: analytics.activeWarehouses, color: "#10b981" },
            { label: "Total Capacity", value: analytics.totalCapacity, color: "#8b5cf6" },
            { label: "Current Stock", value: analytics.totalCurrentStock, color: "#f59e0b" },
            { label: "Utilization", value: analytics.utilizationRate, color: "#ef4444" },
          ].map((card, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderLeft: `4px solid ${card.color}` }}>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>{card.label}</p>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["warehouses", "addStock", "transfer"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: activeTab === tab ? "#3b82f6" : "#e5e7eb",
              color: activeTab === tab ? "#fff" : "#374151",
              fontWeight: "600",
            }}
          >
            {tab === "warehouses" ? "📦 Warehouses" : tab === "addStock" ? "➕ Add Stock" : "🔄 Transfer"}
          </button>
        ))}
      </div>

      {/* Warehouses Tab */}
      {activeTab === "warehouses" && (
        <>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: "#10b981", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", marginBottom: "16px" }}
          >
            {showForm ? "Cancel" : "+ Create Warehouse"}
          </button>

          {showForm && (
            <form onSubmit={handleCreate} style={{ background: "#fff", padding: "24px", borderRadius: "12px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <input placeholder="Warehouse Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
                <input placeholder="Address" value={form.location.address} onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
                <input placeholder="City" value={form.location.city} onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
                <input placeholder="Country" value={form.location.country} onChange={(e) => setForm({ ...form, location: { ...form.location, country: e.target.value } })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
                <input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
              </div>
              <button type="submit" style={{ marginTop: "16px", background: "#3b82f6", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer" }}>Create</button>
            </form>
          )}

          <div style={{ display: "grid", gap: "16px" }}>
            {warehouses.map((wh) => (
              <div key={wh._id} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{wh.name}</h3>
                    <p style={{ color: "#6b7280" }}>{wh.location?.city}, {wh.location?.country}</p>
                    <p>Capacity: {wh.currentStock}/{wh.capacity} | Status: <span style={{ color: wh.status === "active" ? "#10b981" : "#ef4444", fontWeight: "600" }}>{wh.status}</span></p>
                    <p style={{ fontSize: "13px", color: "#9ca3af" }}>Products: {wh.products?.length || 0} types</p>
                  </div>
                  <button onClick={() => handleDelete(wh._id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            ))}
            {warehouses.length === 0 && <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px" }}>No warehouses found</p>}
          </div>
        </>
      )}

      {/* Add Stock Tab */}
      {activeTab === "addStock" && (
        <form onSubmit={handleAddStock} style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Add Stock to Warehouse</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <select value={stockForm.warehouseId} onChange={(e) => setStockForm({ ...stockForm, warehouseId: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}>
              <option value="">Select Warehouse</option>
              {warehouses.map((wh) => (<option key={wh._id} value={wh._id}>{wh.name}</option>))}
            </select>
            <input placeholder="Product ID" value={stockForm.productId} onChange={(e) => setStockForm({ ...stockForm, productId: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
            <input type="number" placeholder="Quantity" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
            <input placeholder="Bin Location" value={stockForm.bin} onChange={(e) => setStockForm({ ...stockForm, bin: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
          </div>
          <button type="submit" style={{ marginTop: "16px", background: "#10b981", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer" }}>Add Stock</button>
        </form>
      )}

      {/* Transfer Tab */}
      {activeTab === "transfer" && (
        <form onSubmit={handleTransfer} style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Transfer Stock Between Warehouses</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <select value={transferForm.fromWarehouseId} onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}>
              <option value="">From Warehouse</option>
              {warehouses.map((wh) => (<option key={wh._id} value={wh._id}>{wh.name}</option>))}
            </select>
            <select value={transferForm.toWarehouseId} onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}>
              <option value="">To Warehouse</option>
              {warehouses.map((wh) => (<option key={wh._id} value={wh._id}>{wh.name}</option>))}
            </select>
            <input placeholder="Product ID" value={transferForm.productId} onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
            <input type="number" placeholder="Quantity" value={transferForm.quantity} onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
          </div>
          <button type="submit" style={{ marginTop: "16px", background: "#8b5cf6", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer" }}>Transfer</button>
        </form>
      )}
    </div>
  );
};

export default WarehouseManagement;
