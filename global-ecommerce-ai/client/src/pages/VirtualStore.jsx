import React from "react";
import VirtualStoreViewer from "../components/VirtualStore/VirtualStoreViewer";

const VirtualStore = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Title Section */}
        <div className="flex flex-col gap-2 border-l-4 border-emerald-500 pl-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Virtual 360° Walkthrough Store
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Step into our immersive virtual boutique. Walk through different aisles, explore clothing departments, and purchase items directly from 360° interactive display cases.
          </p>
        </div>

        {/* Main Viewer Component */}
        <VirtualStoreViewer />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-start gap-4">
            <span className="text-3xl bg-slate-800/80 p-3 rounded-xl">🚶‍♂️</span>
            <div>
              <h3 className="font-bold text-white mb-1">Floor Portal Navigation</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click the green arrows positioned on the floor to walk forward or backwards through various sections.
              </p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-start gap-4">
            <span className="text-3xl bg-slate-800/80 p-3 rounded-xl">🛍️</span>
            <div>
              <h3 className="font-bold text-white mb-1">Instant Cart Purchases</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Hover or click on product shopping bag markers to view price details and add items straight to your cart.
              </p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-start gap-4">
            <span className="text-3xl bg-slate-800/80 p-3 rounded-xl">📱</span>
            <div>
              <h3 className="font-bold text-white mb-1">Mobile & Touch Ready</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Full swipe gestures, gyro viewing, and tap navigation support optimized for mobile phones and tablet viewports.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VirtualStore;
