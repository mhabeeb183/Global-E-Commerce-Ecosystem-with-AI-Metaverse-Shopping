import React, { useState, useEffect } from "react";
import "@google/model-viewer";

/**
 * AR/VR Product Viewer Component
 * Uses @google/model-viewer for true 3D and AR experiences.
 * If arModelUrl is not provided, it falls back to displaying the product image.
 */
const ARProductViewer = ({ product }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const modelUrl = product?.arModelUrl;
  const posterUrl = product?.images?.[0] || "https://modelviewer.dev/shared-assets/models/Astronaut.png";

  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      {/* Mode Indicator */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
        <div style={{ flex: 1, padding: "12px", textAlign: "center", color: "#374151", fontWeight: "600", fontSize: "14px" }}>
          {modelUrl ? "📱 True 3D & AR Mode Enabled" : "🖼️ 2D Image View (No 3D Model Available)"}
        </div>
      </div>

      {/* 3D/AR Viewer or Fallback */}
      <div
        style={{
          width: "100%",
          height: "500px",
          background: modelUrl ? "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" : "#f9fafb",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {modelUrl ? (
          <model-viewer
            src={modelUrl}
            ios-src={modelUrl.replace(".glb", ".usdz")}
            poster={posterUrl}
            alt={product?.name || "A 3D model of the product"}
            shadow-intensity="1"
            camera-controls
            auto-rotate
            ar
            ar-modes="webxr scene-viewer quick-look"
            style={{ width: "100%", height: "100%" }}
          >
            {/* Custom AR Button */}
            <button
              slot="ar-button"
              style={{
                backgroundColor: "white",
                borderRadius: "4px",
                border: "none",
                position: "absolute",
                bottom: "16px",
                right: "16px",
                padding: "10px 16px",
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              👋 View in your space
            </button>

            <div id="ar-prompt">
              <img src="https://modelviewer.dev/shared-assets/icons/hand.png" alt="AR prompt" />
            </div>
          </model-viewer>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <img 
              src={posterUrl} 
              alt={product?.name} 
              style={{ maxHeight: "350px", objectFit: "contain", margin: "0 auto", borderRadius: "8px" }} 
            />
            <p style={{ marginTop: "20px", color: "#6b7280", fontSize: "14px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
              A 3D model (.glb) is not currently available for this product. Vendors can upload an AR model in the dashboard to enable immersive AR/VR viewing.
            </p>
          </div>
        )}

        {/* Mode Label */}
        {modelUrl && (
          <div style={{
            position: "absolute", top: "16px", left: "16px",
            background: "rgba(0,0,0,0.6)", color: "#fff",
            padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
            backdropFilter: "blur(8px)",
            pointerEvents: "none"
          }}>
            🎮 Drag to rotate, scroll to zoom. Use AR button on mobile.
          </div>
        )}
      </div>

      <style>{`
        model-viewer {
          --poster-color: transparent;
        }
        #ar-prompt {
          position: absolute;
          left: 50%;
          bottom: 175px;
          animation: notify 1s ease-in-out infinite alternate;
          display: none;
        }
        model-viewer[ar-status="session-started"] > #ar-prompt {
          display: block;
        }
        model-viewer > #ar-prompt > img {
          animation: circle 4s linear infinite;
        }
        @keyframes notify {
          0% { transform: translateY(0); }
          100% { transform: translateY(-20px); }
        }
        @keyframes circle {
          from { transform: translateX(-50%) rotate(0deg) translateX(50px) rotate(0deg); }
          to   { transform: translateX(-50%) rotate(360deg) translateX(50px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

export default ARProductViewer;
