import React, { useEffect, useRef, useState } from "react";
import { store3DLayout } from "./virtualStoreConfig";
import WebGLStoreViewer from "./WebGLStoreViewer";
import "./virtualStore.css";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const VirtualStoreViewer = () => {
  const productsList = useRef([]);

  const [activeSection, setActiveSection] = useState("entrance");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Trigger to reset the camera via CameraWalkController
  const [resetTrigger, setResetTrigger] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch all products from MERN backend to resolve matching details dynamically
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/products");
        productsList.current = data;
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load products list:", err);
        setIsLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Jump to department helper
  const jumpToDepartment = (nodeId) => {
    setSelectedProduct(null);
    setActiveSection(nodeId);
    setResetTrigger(prev => prev + 1); // trigger camera walk alignment
  };

  // Dynamic Search inside virtual store
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();

    // 1. Search matching product in our 3D layout configuration
    const foundProductInConfig = store3DLayout.products.find(
      (p) => p.productSearchName.toLowerCase().includes(query) || (p.label && p.label.toLowerCase().includes(query))
    );

    if (foundProductInConfig) {
      const dbProduct = productsList.current.find(
        (p) => p.name.toLowerCase() === foundProductInConfig.productSearchName.toLowerCase()
      );
      
      jumpToDepartment(foundProductInConfig.section);
      
      setTimeout(() => {
        setSelectedProduct(dbProduct || {
          name: foundProductInConfig.label || foundProductInConfig.productSearchName,
          price: 1999,
          images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"],
          description: "High-quality virtual product item. Add to cart to purchase.",
          _id: "placeholder-tour-product",
          isPlaceholder: true,
        });
        toast.success(`Teleported to ${foundProductInConfig.productSearchName}!`);
      }, 500);

    } else {
      // Direct database lookup
      const matchedDbProduct = productsList.current.find(
        (p) => p.name.toLowerCase().includes(query) || (p.brand && p.brand.toLowerCase().includes(query))
      );

      if (matchedDbProduct) {
        let targetSec = "main-aisle";
        const cat = matchedDbProduct.category ? matchedDbProduct.category.toLowerCase() : "";
        if (cat.includes("kids") || matchedDbProduct.name.toLowerCase().includes("kids") || matchedDbProduct.name.toLowerCase().includes("lego") || matchedDbProduct.name.toLowerCase().includes("robot")) {
          targetSec = "kids-accessories";
        } else if (matchedDbProduct.name.toLowerCase().includes("sneakers") || matchedDbProduct.name.toLowerCase().includes("glasses") || matchedDbProduct.name.toLowerCase().includes("hoodie")) {
          targetSec = "women-section";
        }
        
        jumpToDepartment(targetSec);
        
        setTimeout(() => {
          setSelectedProduct(matchedDbProduct);
          toast.success(`Teleported to ${matchedDbProduct.name}!`);
        }, 500);
      } else {
        toast.error(`Product "${searchQuery}" not found in virtual store layout.`);
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    dispatch(addToCart(selectedProduct));
    toast.success(`${selectedProduct.name} added to cart!`);
  };

  const handleViewProduct = () => {
    if (!selectedProduct) return;
    if (selectedProduct.isPlaceholder) {
      toast.error("This is a placeholder item. Real products redirect to details.");
      return;
    }
    navigate(`/product/${selectedProduct._id}`);
  };

  // Get display details for the active section
  const sectionMeta = store3DLayout.sections[activeSection] || store3DLayout.sections.entrance;
  
  // Theme color maps for premium border glow
  const getThemeGlowClass = (sectionId) => {
    if (sectionId === "entrance") return "border-emerald-500/40 shadow-emerald-500/5";
    if (sectionId === "men-section") return "border-sky-500/40 shadow-sky-500/5";
    if (sectionId === "women-section") return "border-pink-400/40 shadow-pink-400/5";
    if (sectionId.startsWith("kids")) return "border-amber-400/40 shadow-amber-400/5";
    return "border-blue-500/40 shadow-blue-500/5";
  };

  const getThemeTextClass = (sectionId) => {
    if (sectionId === "entrance") return "text-emerald-400";
    if (sectionId === "men-section") return "text-sky-400";
    if (sectionId === "women-section") return "text-pink-400";
    if (sectionId.startsWith("kids")) return "text-amber-400";
    return "text-blue-400";
  };

  return (
    <div className={`relative w-full flex flex-col bg-slate-950/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border transition-all duration-500 ${getThemeGlowClass(activeSection)}`}>
      
      {/* 1. Glassmorphic Header */}
      <div className="flex flex-col xl:flex-row items-center justify-between bg-slate-950/70 backdrop-blur-md px-6 py-4.5 gap-4 border-b border-slate-900/50">
        
        {/* Left Branding */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-pulse">👕</span>
          <div>
            <h2 className="text-sm font-black text-slate-400 tracking-widest uppercase leading-none">
              Metaverse Boutique
            </h2>
            <h1 className="text-lg font-black text-white tracking-wide uppercase mt-0.5">
              3D Virtual Store
            </h1>
          </div>
        </div>

        {/* Central Search Bar */}
        <form onSubmit={handleSearch} className="flex bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-inner w-full max-w-md focus-within:border-slate-700/60 transition-all duration-300">
          <input
            type="text"
            placeholder="Search & Teleport to products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent px-4 py-2.5 text-xs text-white outline-none w-full font-semibold placeholder:text-slate-500"
          />
          <button 
            type="submit"
            className="bg-slate-850 hover:bg-slate-800 text-slate-200 border-l border-slate-800 px-5 font-black text-xs tracking-wider transition cursor-pointer"
          >
            Find
          </button>
        </form>

        {/* Right Quick Jump Nodes (Luxury Glass Pills) */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { id: "entrance", label: "Entrance" },
            { id: "main-aisle", label: "Main Aisle" },
            { id: "men-section", label: "Men" },
            { id: "women-section", label: "Women" },
            { id: "kids-entrance", label: "Kids" },
            { id: "kids-accessories", label: "Toys" },
          ].map((btn) => {
            const isSelected = btn.id === activeSection || (btn.id === "kids-entrance" && activeSection.startsWith("kids") && activeSection !== "kids-accessories");
            return (
              <button
                key={btn.id}
                onClick={() => jumpToDepartment(btn.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105"
                    : "bg-slate-900/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main 3D Canvas Container */}
      <div className="relative w-full h-[72vh] md:h-[82vh]">
        <WebGLStoreViewer
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onSelectProduct={setSelectedProduct}
          allProducts={productsList.current}
          resetTrigger={resetTrigger}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 backdrop-blur-md">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white text-lg font-medium tracking-wide">Loading Virtual Store...</p>
          </div>
        )}

        {/* Floating Top-Left Location HUD */}
        <div className="absolute top-6 left-6 z-10 bg-slate-950/80 border border-slate-800/60 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl select-none pointer-events-none">
          <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase leading-none">
            Active Department
          </p>
          <p className={`text-base font-black uppercase mt-1 leading-none ${getThemeTextClass(activeSection)}`}>
            {sectionMeta.name}
          </p>
        </div>

        {/* Floating Bottom-Left Controls Panel (🧭 Compass Reset & Zoom details) */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
          <button
            onClick={() => jumpToDepartment(activeSection)}
            className="w-10 h-10 rounded-xl bg-slate-950/85 border border-slate-800/80 text-slate-200 hover:text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg pointer-events-auto cursor-pointer"
            title="Reset Camera View"
          >
            <span className="text-xl">🧭</span>
          </button>
        </div>

        {/* 3. Product Details Popup Card overlay */}
        {selectedProduct && (
          <div className={`absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 bg-slate-950/90 border backdrop-blur-md rounded-2xl shadow-2xl p-5 z-30 transition-all duration-300 animate-slide-in ${getThemeGlowClass(activeSection)}`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`text-[10px] font-black uppercase tracking-wider bg-slate-900 px-2 py-1 rounded border border-slate-800 ${getThemeTextClass(activeSection)}`}>
                Found Product
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-500 hover:text-white text-xl leading-none cursor-pointer transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="flex gap-4">
              <img
                src={selectedProduct.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200"}
                alt={selectedProduct.name}
                className="w-24 h-24 object-cover rounded-xl border border-slate-900 shadow-md"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-base line-clamp-2 leading-tight">
                    {selectedProduct.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`font-black text-lg ${getThemeTextClass(activeSection)}`}>
                      ₹{selectedProduct.dynamicPrice || selectedProduct.price}
                    </span>
                    {selectedProduct.averageRating && (
                      <span className="text-amber-400 text-xs flex items-center gap-0.5 font-bold">
                        ⭐ {selectedProduct.averageRating}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleViewProduct}
                    className="bg-slate-905 border border-slate-800 hover:bg-slate-800 text-slate-200 font-black text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Instructions footer overlay */}
      <div className="bg-slate-950/70 backdrop-blur-md px-6 py-4.5 border-t border-slate-900/50 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-slate-400">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-bold uppercase select-none">
            🖱️ Left Drag
          </span>
          <span className="text-slate-600 font-medium">Look 360°</span>
          
          <span className="ml-2 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-bold uppercase select-none">
            📜 Scroll
          </span>
          <span className="text-slate-600 font-medium">Zoom</span>
          
          <span className="ml-2 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-bold uppercase select-none">
            🟢 Floor Ring
          </span>
          <span className="text-slate-600 font-medium">Walk Here</span>

          <span className="ml-2 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-bold uppercase select-none">
            ⌨️ WASD / Arrows
          </span>
          <span className="text-slate-600 font-medium">Step Around</span>
        </div>
        
        <div className="flex items-center gap-1.5 select-none font-bold text-[10px] uppercase tracking-widest text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          WebGL Retail Environment
        </div>
      </div>
    </div>
  );
};

export default VirtualStoreViewer;
