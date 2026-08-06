import React, { useState, useEffect, useRef } from "react";
import "@google/model-viewer";
import axios from "axios";

/**
 * AR/VR Product Viewer Component
 * Uses @google/model-viewer for true 3D and AR experiences.
 * If arModelUrl is not provided, it falls back to displaying the product image.
 * Supports desktop QR Code scanning to view on mobile.
 */
const ARProductViewer = ({ product }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [localIp, setLocalIp] = useState("localhost");
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    setModelLoaded(false);
  }, [product?.arModelUrl]);

  useEffect(() => {
    setIsMounted(true);
    // Fetch PC's network IP from server for QR code connection
    axios.get("http://localhost:5000/api/scenes/ip")
      .then(({ data }) => {
        if (data.ip) {
          setLocalIp(data.ip);
        }
      })
      .catch((err) => {
        console.error("Could not fetch server local IP:", err);
      });
  }, []);

  useEffect(() => {
    const el = modelViewerRef.current;
    if (!el) return;

    // Check if the model is already loaded (e.g. from browser cache)
    if (el.loaded) {
      setModelLoaded(true);
    }

    const handleLoad = () => {
      setModelLoaded(true);
    };

    const handleDismissed = () => {
      setModelLoaded(true);
    };

    // Polling backup to catch cases where custom element upgrades late
    const checkInterval = setInterval(() => {
      if (el.loaded) {
        setModelLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    el.addEventListener("load", handleLoad);
    el.addEventListener("poster-dismissed", handleDismissed);

    return () => {
      clearInterval(checkInterval);
      el.removeEventListener("load", handleLoad);
      el.removeEventListener("poster-dismissed", handleDismissed);
    };
  }, [product?.arModelUrl]);

  if (!isMounted) return null;

  const modelUrl = product?.arModelUrl;
  const posterUrl = product?.images?.[0] || "https://modelviewer.dev/shared-assets/models/Astronaut.png";
  
  // Get current page URL and replace localhost with the real PC IP for mobile scanning
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const displayUrl = currentUrl.replace("localhost", localIp);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(displayUrl)}&color=000000&bgcolor=ffffff`;

  const handleARActivation = () => {
    const isMobileDevice = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    
    if (isMobileDevice && modelViewerRef.current) {
      // Trigger native mobile AR core/AR kit session
      modelViewerRef.current.activateAR();
    } else {
      // Show QR code scanner overlay for desktop users
      setShowQrModal(true);
    }
  };

  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", position: "relative" }}>
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
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <model-viewer
              ref={modelViewerRef}
              src={modelUrl}
              ios-src={modelUrl.replace(".glb", ".usdz")}
              alt={product?.name || "A 3D model of the product"}
              shadow-intensity="1"
              environment-image="neutral"
              camera-controls="true"
              interaction-prompt="none"
              touch-action="pan-y"
              ar="true"
              ar-modes="webxr scene-viewer quick-look"
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              {!modelLoaded && (
                <div slot="poster" className="custom-poster">
                  <img src={posterUrl} alt="Product Loading..." className="custom-poster-img" />
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading 3D Model...</div>
                  </div>
                </div>
              )}
              <div id="ar-prompt">
                <img src="https://modelviewer.dev/shared-assets/icons/hand.png" alt="AR prompt" />
              </div>
            </model-viewer>

            {/* Unified AR Button (Visible on both desktop & mobile) */}
            <button
              onClick={handleARActivation}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "24px",
                border: "none",
                position: "absolute",
                bottom: "20px",
                right: "20px",
                padding: "12px 22px",
                fontWeight: "bold",
                fontSize: "13px",
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#1d4ed8";
                e.target.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#2563eb";
                e.target.style.transform = "scale(1)";
              }}
            >
              <span>🕶️</span> View in your space
            </button>
          </div>
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
            pointerEvents: "none",
            zIndex: 5
          }}>
            🎮 Drag to rotate, scroll to zoom. Use AR button to place.
          </div>
        )}
      </div>

      {/* Desktop QR Code AR Modal */}
      {showQrModal && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          padding: "20px",
          borderRadius: "16px",
          animation: "fadeIn 0.25s ease-out forwards"
        }}>
          <div style={{
            background: "#121214",
            border: "1px solid #27272a",
            borderRadius: "24px",
            padding: "32px 24px",
            maxWidth: "340px",
            width: "100%",
            textAlign: "center",
            color: "white",
            position: "relative",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowQrModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "#1f1f23",
                border: "1px solid #2d2d30",
                color: "#a1a1aa",
                cursor: "pointer",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px"
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "8px", letterSpacing: "0.5px" }}>
              📱 Scan to View in AR
            </h3>
            <p style={{ fontSize: "11px", color: "#a1a1aa", lineHeight: "1.5", marginBottom: "20px" }}>
              Scan the QR code with your mobile camera to instantly place this product in your room!
            </p>

            {/* QR Code Container */}
            <div style={{
              background: "white",
              padding: "12px",
              borderRadius: "16px",
              display: "inline-block",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              marginBottom: "16px"
            }}>
              <img src={qrCodeUrl} alt="AR QR Code" style={{ display: "block" }} />
            </div>

            <p style={{ fontSize: "10px", color: "#2563eb", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
              ⚡ Powered by WebXR
            </p>
          </div>
        </div>
      )}

      <style>{`
        model-viewer {
          --poster-color: transparent;
        }
        .custom-poster {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          z-index: 2;
          transition: opacity 0.5s ease-out;
        }
        .custom-poster-img {
          max-width: 70%;
          max-height: 70%;
          object-fit: contain;
          margin-bottom: 20px;
        }
        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .loading-text {
          font-size: 13px;
          color: #1e293b;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .custom-poster.hide {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .hide {
          display: none !important;
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ARProductViewer;
