import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../redux/cartSlice';

import PanoramaViewer from '../components/vr/PanoramaViewer';
import ProductPopup from '../components/vr/ProductPopup';
import MiniMap from '../components/vr/MiniMap';
import SceneLoader from '../components/vr/SceneLoader';
import AdminVRPanel from '../components/vr/AdminVRPanel';

const speakText = (text) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    window.speechSynthesis.speak(utterance);
  }
};

const playSound = (type) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'teleport') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'cart') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch (e) {}
};

const VirtualShowroom = () => {
  // VR Scenes & Hotspots data
  const [scenes, setScenes] = useState([]);
  const [activeScene, setActiveScene] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  
  // UI Overlays
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing Showroom...");
  const [toastMessage, setToastMessage] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isAdminEditorOpen, setIsAdminEditorOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Search Inside VR
  const [searchQuery, setSearchQuery] = useState("");
  const [lookAtCoords, setLookAtCoords] = useState(null);
  const [highlightedHotspotId, setHighlightedHotspotId] = useState(null);

  // Visual Editor coordinates (clicked on sphere)
  const [pendingClickCoords, setPendingClickCoords] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Check if logged-in user is admin to show panel toggles
  useEffect(() => {
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      const role = userInfo.user?.role || userInfo.role;
      if (role === "admin") {
        setIsAdminUser(true);
      }
    }
  }, []);

  // 2. Fetch all Scenes/Rooms from MERN API
  const fetchScenes = async () => {
    try {
      setLoadingMessage("Fetching department rooms...");
      const { data } = await axios.get("http://localhost:5000/api/scenes");
      setScenes(data);
      
      if (data.length > 0) {
        // Default to Lobby scene, or the first scene in the list
        const lobby = data.find(s => s.name.toLowerCase() === "lobby") || data[0];
        setActiveScene(lobby);
      } else {
        setLoadingMessage("Showroom database is empty. Please check seed files.");
      }
    } catch (err) {
      console.error("Failed to load scenes:", err);
      setLoadingMessage("Failed to load VR Store database.");
    }
  };

  useEffect(() => {
    fetchScenes();
  }, []);

  // 3. Fetch Hotspots when activeScene changes
  const fetchHotspotsForScene = async () => {
    if (!activeScene?._id) return;
    try {
      setIsTransitioning(true);
      setLoadingMessage(`Warping to ${activeScene.name}...`);
      
      const { data } = await axios.get(`http://localhost:5000/api/hotspots/scene/${activeScene._id}`);
      setHotspots(data);
      
      // Delay transitions slightly to allow texture rendering
      setTimeout(() => {
        setIsTransitioning(false);
      }, 450);
    } catch (err) {
      console.error("Failed to load hotspots:", err);
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    fetchHotspotsForScene();
  }, [activeScene]);

  // 4. Handle teleports to connected rooms
  const handleTeleport = (roomName) => {
    const nextScene = scenes.find(s => s.name.toLowerCase() === roomName.toLowerCase());
    if (nextScene) {
      playSound('teleport');
      setActiveScene(nextScene);
      setSelectedProduct(null);
      setPendingClickCoords(null);
      
      // Play room greeting announcement
      const announcement = `Entering the ${nextScene.name} Department.`;
      speakText(announcement);
    } else {
      console.warn(`Scene named "${roomName}" not found.`);
    }
  };

  // 5. Add to Cart integration
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    playSound('cart');
    setToastMessage(`Added ${product.name} to cart!`);
    speakText(`${product.name} added to cart.`);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // 6. Search Inside VR functionality
  const handleSearchInsideVR = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    
    // Find matching product hotspot in CURRENT scene
    const match = hotspots.find(h => 
      h.type === "product" && 
      h.productId && 
      (h.productId.name.toLowerCase().includes(query) || 
       h.productId.brand?.toLowerCase().includes(query) ||
       h.productId.category?.toLowerCase().includes(query))
    );

    if (match) {
      // 1. Target camera azimuthal/polar angles to look directly at it
      setLookAtCoords({ pitch: match.pitch, yaw: match.yaw });
      setHighlightedHotspotId(match._id);
      speakText(`Found product ${match.productId.name}. panning camera.`);
      playSound('click');

      // Clear coords lock after 1.5s so OrbitControls releases camera control
      setTimeout(() => {
        setLookAtCoords(null);
      }, 1500);

      // Reset pulse highlight after 4s
      setTimeout(() => {
        setHighlightedHotspotId(null);
      }, 4000);
    } else {
      // Search in OTHER scenes
      const sceneWithMatch = scenes.find(s => {
        // We can't query other scenes' hotspots easily without fetching,
        // but we can check if there are products matching the query in that category!
        const categoryMatch = s.name.toLowerCase().includes(query);
        return categoryMatch;
      });

      if (sceneWithMatch) {
        if (window.confirm(`Found matching department "${sceneWithMatch.name}". Would you like to teleport there?`)) {
          handleTeleport(sceneWithMatch.name);
        }
      } else {
        alert(`Product containing "${searchQuery}" not found in this department. Try searching another term.`);
      }
    }
  };

  // Theme styling (e.g. hotspot colors) based on room name
  const currentThemeColor = useMemo(() => {
    if (!activeScene) return "#3b82f6";
    const name = activeScene.name.toLowerCase();
    if (name.includes("lobby")) return "#3b82f6"; // blue
    if (name.includes("kids")) return "#ec4899"; // pink
    if (name.includes("fashion")) return "#a855f7"; // purple
    if (name.includes("tech") || name.includes("electronics")) return "#06b6d4"; // cyan
    return "#10b981"; // green
  }, [activeScene]);

  return (
    <div className="w-screen h-screen relative bg-black overflow-hidden font-sans select-none">
      
      {/* Screen Loader when transitioning */}
      {isTransitioning && <SceneLoader message={loadingMessage} />}

      {/* Floating Cart Toast Notification */}
      {toastMessage && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40 bg-zinc-950/95 border border-emerald-500/50 backdrop-blur-2xl px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-xl">🛒</span>
          <p className="text-white text-sm font-bold tracking-wide">{toastMessage}</p>
        </div>
      )}

      {/* Dynamic Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 text-white bg-gradient-to-b from-black/90 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-wider flex items-center gap-3">
            <span className="text-purple-400">🥽</span> VR VIRTUAL STORE
          </h1>
          {activeScene && (
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Department: {activeScene.name}
              </p>
            </div>
          )}
        </div>

        {/* Search bar inside VR */}
        <form onSubmit={handleSearchInsideVR} className="flex bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden w-full md:w-80 shadow-lg">
          <input
            type="text"
            placeholder="Search products in room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent px-4 py-2 text-xs text-white outline-none flex-1 font-medium"
          />
          <button 
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 font-black text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            Find
          </button>
        </form>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {isAdminUser && (
            <button 
              onClick={() => {
                playSound('click');
                setIsAdminEditorOpen(!isAdminEditorOpen);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest transition-all cursor-pointer ${
                isAdminEditorOpen 
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 border border-emerald-400' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
              }`}
            >
              {isAdminEditorOpen ? '🛠️ CLOSE PANEL' : '🛠️ VR ADMIN PANEL'}
            </button>
          )}

          <button 
            onClick={() => {
              playSound('click');
              setIsMapOpen(!isMapOpen);
            }}
            className="bg-zinc-900/90 hover:bg-zinc-850 text-white border border-zinc-800 px-4 py-2 rounded-xl text-xs font-black tracking-widest transition-all cursor-pointer"
          >
            {isMapOpen ? '🗺️ HIDE MAP' : '🗺️ VIEW MAP'}
          </button>
          
          <button 
            onClick={() => navigate('/')} 
            className="bg-zinc-900/90 hover:bg-zinc-850 text-white border border-zinc-800 px-4 py-2 rounded-xl text-xs font-black tracking-widest transition-all cursor-pointer"
          >
            EXIT TOUR
          </button>
        </div>
      </div>

      {/* Dynamic Categories Tab Menu at the bottom */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-[90%] max-w-4xl bg-zinc-950/85 border border-zinc-800/60 backdrop-blur-2xl rounded-2xl p-2.5 shadow-2xl flex gap-2 overflow-x-auto scrollbar-none items-center justify-start md:justify-center">
        {scenes.map((scene) => {
          const isActive = activeScene?._id === scene._id;
          return (
            <button
              key={scene._id || scene.name}
              onClick={() => handleTeleport(scene.name)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-lg shadow-emerald-500/25' 
                  : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {scene.name === "Lobby" ? "Main Lobby" : scene.name}
            </button>
          );
        })}
      </div>

      {/* Interactive 3D Canvas Panorama Viewer */}
      {activeScene && (
        <PanoramaViewer
          activeScene={activeScene}
          hotspots={hotspots}
          onHotspotClick={(prod) => {
            playSound('click');
            setSelectedProduct(prod);
          }}
          onTeleportClick={handleTeleport}
          isEditingHotspots={isAdminEditorOpen}
          onVisualPlacement={(pitch, yaw) => {
            playSound('click');
            setPendingClickCoords({ pitch, yaw });
          }}
          lookAtCoords={lookAtCoords}
          highlightedHotspotId={highlightedHotspotId}
          activeColor={currentThemeColor}
        />
      )}

      {/* Floating Store Mini Map */}
      <MiniMap 
        scenes={scenes}
        activeScene={activeScene}
        onJump={handleTeleport}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        activeColor={currentThemeColor}
      />

      {/* Product Detailed Card Popup */}
      {selectedProduct && (
        <ProductPopup 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          activeColor={currentThemeColor}
        />
      )}

      {/* Admin Visual VR Editor Panel */}
      {isAdminEditorOpen && (
        <AdminVRPanel 
          scenes={scenes}
          activeScene={activeScene}
          onRefreshScenes={fetchScenes}
          hotspots={hotspots}
          onRefreshHotspots={fetchHotspotsForScene}
          pendingClickCoords={pendingClickCoords}
          onClearPendingCoords={() => setPendingClickCoords(null)}
          onJumpRoom={handleTeleport}
        />
      )}

      {/* Embedded CSS for transitions */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default VirtualShowroom;
