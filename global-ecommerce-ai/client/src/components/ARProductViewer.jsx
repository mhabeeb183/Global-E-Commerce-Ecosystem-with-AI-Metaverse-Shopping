import { useState, useRef, useEffect } from "react";

/**
 * AR/VR Product Viewer Component
 * Provides an immersive 3D product viewing experience
 * with rotation, zoom, and AR mode simulation
 */
const ARProductViewer = ({ product }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState("3d"); // "3d", "ar", "vr"
  const containerRef = useRef(null);

  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setRotateY((prev) => prev + 0.5);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setRotateY((prev) => prev + dx * 0.5);
    setRotateX((prev) => prev - dy * 0.5);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    setScale((prev) => Math.max(0.5, Math.min(3, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - lastPos.x;
    const dy = e.touches[0].clientY - lastPos.y;
    setRotateY((prev) => prev + dx * 0.5);
    setRotateX((prev) => prev - dy * 0.5);
    setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const productImage = product?.images?.[0] || "";

  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      {/* Mode Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
        {[
          { key: "3d", label: "🎮 3D View", color: "#3b82f6" },
          { key: "ar", label: "📱 AR Mode", color: "#10b981" },
          { key: "vr", label: "🥽 VR Mode", color: "#8b5cf6" },
        ].map((mode) => (
          <button
            key={mode.key}
            onClick={() => setViewMode(mode.key)}
            style={{
              flex: 1, padding: "12px", border: "none", cursor: "pointer",
              background: viewMode === mode.key ? mode.color : "#f9fafb",
              color: viewMode === mode.key ? "#fff" : "#374151",
              fontWeight: "600", fontSize: "14px",
              transition: "all 0.3s ease",
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* 3D Viewer */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{
          width: "100%",
          height: "400px",
          cursor: isDragging ? "grabbing" : "grab",
          perspective: "1000px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: viewMode === "vr"
            ? "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
            : viewMode === "ar"
            ? "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          position: "relative",
          overflow: "hidden",
          userSelect: "none",
          transition: "background 0.5s ease",
        }}
      >
        {/* AR Grid overlay */}
        {viewMode === "ar" && (
          <div style={{
            position: "absolute", inset: 0, opacity: 0.15,
            backgroundImage: "linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
        )}

        {/* VR Starfield */}
        {viewMode === "vr" && (
          <>
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                width: "2px", height: "2px",
                background: "#fff",
                borderRadius: "50%",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
              }} />
            ))}
          </>
        )}

        {/* Product 3D Container */}
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.1s ease",
          }}
        >
          {/* Front Face */}
          <div style={{
            width: "250px", height: "250px",
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: viewMode === "vr"
              ? "0 0 40px rgba(139,92,246,0.5)"
              : "0 10px 40px rgba(0,0,0,0.2)",
          }}>
            {productImage ? (
              <img
                src={productImage}
                alt={product?.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                draggable={false}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "64px",
              }}>
                🛍️
              </div>
            )}
          </div>
        </div>

        {/* Mode Label */}
        <div style={{
          position: "absolute", bottom: "16px", left: "16px",
          background: "rgba(0,0,0,0.6)", color: "#fff",
          padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
          backdropFilter: "blur(8px)",
        }}>
          {viewMode === "3d" && "🎮 Interactive 3D — Drag to rotate, scroll to zoom"}
          {viewMode === "ar" && "📱 AR Mode — Point camera at flat surface"}
          {viewMode === "vr" && "🥽 VR Mode — Immersive experience active"}
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db",
              background: autoRotate ? "#3b82f6" : "#f3f4f6",
              color: autoRotate ? "#fff" : "#374151",
              cursor: "pointer", fontSize: "13px",
            }}
          >
            {autoRotate ? "⏸ Pause" : "▶ Auto Rotate"}
          </button>
          <button
            onClick={() => { setRotateX(0); setRotateY(0); setScale(1); }}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f3f4f6", cursor: "pointer", fontSize: "13px" }}
          >
            🔄 Reset
          </button>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f3f4f6", cursor: "pointer", fontSize: "16px" }}>−</button>
          <span style={{ fontSize: "13px", color: "#6b7280", minWidth: "40px", textAlign: "center" }}>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.2))} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f3f4f6", cursor: "pointer", fontSize: "16px" }}>+</button>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ARProductViewer;
