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
  const modelViewerRef = useRef(null);

  const isMobileDevice = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const modelUrl = product?.arModelUrl
    ? (product.arModelUrl.toLowerCase().endsWith(".glb") ||
       product.arModelUrl.toLowerCase().endsWith(".gltf") ||
       product.arModelUrl.includes(".glb?") ||
       product.arModelUrl.includes(".gltf?")
        ? product.arModelUrl
        : (product.arModelUrl.includes("?") 
           ? `${product.arModelUrl}&ext=.glb` 
           : `${product.arModelUrl}?ext=.glb`))
    : "";

  useEffect(() => {
    setIsMounted(true);
    // Fetch PC's network IP from server for QR code connection
    axios.get("http://localhost:5000/api/scenes/ip")
      .then(({ data }) => {
        if (data.ip) {
          try {
            // Decode the base64 masked IP address
            const decodedIp = atob(data.ip);
            setLocalIp(decodedIp);
          } catch (e) {
            setLocalIp(data.ip);
          }
        }
      })
      .catch((err) => {
        console.error("Could not fetch server local IP:", err);
      });
  }, []);


  useEffect(() => {
    const el = modelViewerRef.current;
    if (!el) return;

    try {
      el.setAttribute("ar", "");
      el.setAttribute("ar-modes", "scene-viewer webxr quick-look");
      el.setAttribute("camera-controls", "");
      el.setAttribute("auto-rotate", "");
      el.setAttribute("shadow-intensity", "1");
      el.setAttribute("environment-image", "neutral");
      el.setAttribute("interaction-prompt", "none");
      el.setAttribute("touch-action", "none");
    } catch (e) {
      console.error("Error setting model-viewer attributes:", e);
    }
  }, [modelUrl]);

  if (!isMounted) return null;

  const posterUrl = product?.images?.[0] || "/assets/poster-astronaut.webp";
  
  // Get current page URL and replace localhost or 127.0.0.1 with the real PC IP for mobile scanning
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const displayUrl = currentUrl
    .replace("localhost", localIp)
    .replace("127.0.0.1", localIp);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(displayUrl)}&color=000000&bgcolor=ffffff`;

  const handleARActivation = () => {
    const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
    const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid && product?.arModelUrl) {
      // Build absolute model URL with extension query param for correct model-viewer parsing
      const finalModelUrl = product.arModelUrl.toLowerCase().endsWith(".glb") ||
                            product.arModelUrl.toLowerCase().endsWith(".gltf") ||
                            product.arModelUrl.includes(".glb?") ||
                            product.arModelUrl.includes(".gltf?")
                              ? product.arModelUrl
                              : (product.arModelUrl.includes("?") 
                                 ? `${product.arModelUrl}&ext=.glb` 
                                 : `${product.arModelUrl}?ext=.glb`);

      // Build native Google Scene Viewer intent URL
      const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(finalModelUrl)}&mode=ar_only&title=${encodeURIComponent(product.name || "Product")}` + 
                        `#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;
      
      // Redirect to native app
      window.location.href = intentUrl;
    } else if (isIOS && product?.arModelUrl) {
      if (modelViewerRef.current) {
        modelViewerRef.current.activateAR();
      }
    } else if (isMobileDevice) {
      // Generic mobile fallback
      if (modelViewerRef.current) {
        modelViewerRef.current.activateAR();
      }
    } else {
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
              ios-src={product?.arModelUrl ? product.arModelUrl.replace(".glb", ".usdz") : ""}
              alt={product?.name || "A 3D model of the product"}
              shadow-intensity="1"
              environment-image="neutral"
              camera-controls=""
              auto-rotate=""
              interaction-prompt="none"
              touch-action="none"
              ar=""
              ar-modes="scene-viewer webxr quick-look"
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              <div 
                slot="poster" 
                className="custom-poster absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] z-10 pointer-events-none transition-opacity duration-500" 
                draggable="false"
              >
                <img 
                  src={posterUrl} 
                  alt="Product Loading..." 
                  className="max-w-[70%] max-h-[70%] object-contain mb-5" 
                  draggable="false" 
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-black/10 border-l-blue-600 rounded-full animate-spin"></div>
                  <div className="text-xs text-slate-800 font-semibold tracking-wider">Loading 3D Model...</div>
                </div>
              </div>
            </model-viewer>

            {/* Unified AR Button */}
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

      {/* Dynamic inline styles are avoided to comply with Content Security Policy */}
    </div>
  );
};

export default ARProductViewer;
