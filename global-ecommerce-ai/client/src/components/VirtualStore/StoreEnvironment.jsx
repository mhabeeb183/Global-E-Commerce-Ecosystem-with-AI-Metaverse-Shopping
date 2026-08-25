import React from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// Reusable Planter Pot with Greenery
const PlantPot = ({ position }) => {
  return (
    <group position={position}>
      {/* Ceramic Pot */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.7, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      
      {/* Dark Soil */}
      <mesh position={[0, 0.69, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 16]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>

      {/* Bush Leaves (using multiple green spheres/dodecahedrons for an organic look) */}
      <group position={[0, 0.85, 0]}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <dodecahedronGeometry args={[0.35]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.18, 0, 0.15]}>
          <dodecahedronGeometry args={[0.28]} />
          <meshStandardMaterial color="#166534" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.18, -0.05, -0.15]}>
          <dodecahedronGeometry args={[0.26]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.15, 0, 0.18]}>
          <dodecahedronGeometry args={[0.25]} />
          <meshStandardMaterial color="#166534" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.15, -0.05, -0.18]}>
          <dodecahedronGeometry args={[0.25]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

// Reusable Structural Column / Pillar
const Pillar = ({ position }) => {
  return (
    <group position={position}>
      {/* Main Concrete Pillar */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 6, 0.6]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.7} />
      </mesh>

      {/* Modern wooden slats accent wrap on the bottom half */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.64, 2.4, 0.64]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Reusable Clothing Rack 3D Mesh
const ClothingRack = ({ position, rotation = [0, 0, 0], colorTheme = "#1e3a8a" }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Metallic support frames */}
      <mesh position={[-1.2, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1.2, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Horizontal hanging bar */}
      <mesh position={[0, 1.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2.5, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Decorative base bar */}
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Hanging Clothes placeholders (colorful cylinders/boxes) */}
      {[-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8].map((xOffset, idx) => {
        const clothesColors = [colorTheme, "#f43f5e", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6", "#8b5cf6", "#f97316"];
        const color = clothesColors[idx % clothesColors.length];
        
        return (
          <group key={idx} position={[xOffset, 1.25, 0]}>
            {/* Hanger wire */}
            <mesh position={[0, 0.38, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            {/* Clothing item mesh */}
            <mesh castShadow>
              <boxGeometry args={[0.16, 0.65, 0.38]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Reusable Display Shelving Unit
const DisplayShelf = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Side wooden planks */}
      <mesh position={[-1.2, 1.2, 0]} castShadow>
        <boxGeometry args={[0.08, 2.4, 0.6]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      <mesh position={[1.2, 1.2, 0]} castShadow>
        <boxGeometry args={[0.08, 2.4, 0.6]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>

      {/* Horizontal Shelves */}
      {[0.1, 0.7, 1.3, 1.9].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.32, 0.06, 0.58]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
      ))}

      {/* Placed decorative product items (folded sweaters, hats, shoeboxes) */}
      <mesh position={[-0.7, 0.82, 0]} castShadow>
        <boxGeometry args={[0.4, 0.18, 0.3]} />
        <meshStandardMaterial color="#ea580c" roughness={0.8} />
      </mesh>
      <mesh position={[0.7, 0.82, 0]} castShadow>
        <boxGeometry args={[0.4, 0.18, 0.3]} />
        <meshStandardMaterial color="#0284c7" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.42, 0.05]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
        <meshStandardMaterial color="#16a34a" roughness={0.5} />
      </mesh>
      <mesh position={[-0.8, 2.02, 0]} castShadow>
        <boxGeometry args={[0.3, 0.18, 0.3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0.6, 2.02, 0]} castShadow>
        <boxGeometry args={[0.4, 0.18, 0.38]} />
        <meshStandardMaterial color="#db2777" roughness={0.9} />
      </mesh>
    </group>
  );
};

const StoreEnvironment = ({ activeSection }) => {
  // Helpers to isolate department sign rendering based on the user's active section.
  // This cleans up overlapping 3D tags, ensuring a realistic, clutter-free store interface.
  const showEntranceSign = activeSection === "entrance" || activeSection === "main-aisle";
  const showMainAisleSign = activeSection === "entrance" || activeSection === "main-aisle" || activeSection === "men-section" || activeSection === "women-section" || activeSection === "kids-entrance";
  const showMenSign = activeSection === "men-section" || activeSection === "main-aisle";
  const showWomenSign = activeSection === "women-section" || activeSection === "main-aisle";
  const showKidsSign = activeSection === "kids-entrance" || activeSection === "main-aisle";
  const showKidsClothingSign = activeSection === "kids-aisle" || activeSection === "kids-entrance" || activeSection === "kids-accessories";
  const showKidsToysSign = activeSection === "kids-accessories" || activeSection === "kids-aisle";

  return (
    <group>
      {/* 1. Ground Floor (Polished Epoxy concrete finish with high reflections) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 100]} />
        <meshStandardMaterial 
          color="#f3f4f6" // Light grey marble tile background
          roughness={0.18} 
          metalness={0.2} // Adds beautiful subtle reflections of spotlight fixtures
        />
      </mesh>

      {/* 2. Ceilings & Structural Beams */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 100]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.9} />
      </mesh>

      {/* Decorative ceiling structural girders */}
      {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((z, idx) => (
        <mesh key={idx} position={[0, 5.9, z]} castShadow>
          <boxGeometry args={[49.8, 0.15, 0.35]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      ))}

      {/* ====================================================
          STRUCTURAL PILLARS (Colonnade along main corridor)
         ==================================================== */}
      <Pillar position={[-4.5, 0, 4]} />
      <Pillar position={[4.5, 0, 4]} />
      <Pillar position={[-4.5, 0, -8]} />
      <Pillar position={[4.5, 0, -8]} />
      <Pillar position={[-4.5, 0, -20]} />
      <Pillar position={[4.5, 0, -20]} />

      {/* ====================================================
          LUXURY GREENERY / PLANTS IN PLANTERS
         ==================================================== */}
      <PlantPot position={[-4.5, 0, 8]} />
      <PlantPot position={[4.5, 0, 8]} />
      <PlantPot position={[-4.5, 0, -2]} />
      <PlantPot position={[4.5, 0, -2]} />
      <PlantPot position={[-4.5, 0, -14]} />
      <PlantPot position={[4.5, 0, -14]} />
      <PlantPot position={[-15, 0, -10]} />
      <PlantPot position={[15, 0, -10]} />

      {/* ====================================================
          WALL COMPONENT ARCHITECTURE
         ==================================================== */}
      {/* Back Boundary Wall */}
      <mesh position={[0, 3, -40]} castShadow receiveShadow>
        <boxGeometry args={[50, 6, 0.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      
      {/* Front Entrance Boundary Wall */}
      <mesh position={[0, 3, 16]} castShadow receiveShadow>
        <boxGeometry args={[50, 6, 0.2]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      
      {/* Left Boundary Wall */}
      <mesh position={[-16, 3, -12]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 6, 56]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Right Boundary Wall */}
      <mesh position={[16, 3, -12]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 6, 56]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Section Divider Partitions (Adding wood panels to look like luxury store layout) */}
      <mesh position={[-10.2, 3, -8]} castShadow receiveShadow>
        <boxGeometry args={[11.6, 6, 0.4]} />
        <meshStandardMaterial color="#451a03" roughness={0.5} /> {/* Dark Mahogany Wood Divider */}
      </mesh>
      <mesh position={[10.2, 3, -8]} castShadow receiveShadow>
        <boxGeometry args={[11.6, 6, 0.4]} />
        <meshStandardMaterial color="#451a03" roughness={0.5} />
      </mesh>

      <mesh position={[-10.2, 3, 4]} castShadow receiveShadow>
        <boxGeometry args={[11.6, 6, 0.4]} />
        <meshStandardMaterial color="#451a03" roughness={0.5} />
      </mesh>
      <mesh position={[10.2, 3, 4]} castShadow receiveShadow>
        <boxGeometry args={[11.6, 6, 0.4]} />
        <meshStandardMaterial color="#451a03" roughness={0.5} />
      </mesh>

      {/* ====================================================
          STORE FURNITURE & DISPLAYS (Dressing stands, shelves)
         ==================================================== */}
      {/* Men's Section Displays */}
      <ClothingRack position={[-12, 0, -2]} colorTheme="#1d4ed8" />
      <ClothingRack position={[-12, 0, 1]} colorTheme="#1e3a8a" />
      <DisplayShelf position={[-15.2, 0, -5]} rotation={[0, Math.PI / 2, 0]} />

      {/* Women's Section Displays */}
      <ClothingRack position={[12, 0, -2]} colorTheme="#ec4899" />
      <ClothingRack position={[12, 0, 1]} colorTheme="#be185d" />
      <DisplayShelf position={[15.2, 0, -5]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Kids Section Displays */}
      <ClothingRack position={[-3.5, 0, -17]} colorTheme="#fbbf24" />
      <ClothingRack position={[3.5, 0, -17]} colorTheme="#10b981" />
      <DisplayShelf position={[-5.2, 0, -22]} rotation={[0, Math.PI / 2, 0]} />
      <DisplayShelf position={[5.2, 0, -22]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Kids Toys Accessories Room Displays */}
      <DisplayShelf position={[0, 0, -32]} rotation={[0, 0, 0]} />
      
      {/* Wooden Display tables in Kids section */}
      <mesh position={[-2.5, 0.45, -27]} castShadow>
        <boxGeometry args={[1.5, 0.9, 1.5]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
      <mesh position={[2.5, 0.45, -27]} castShadow>
        <boxGeometry args={[1.5, 0.9, 1.5]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>

      {/* Luxury center lounge sofa in Main Aisle */}
      <group position={[0, 0, -3]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[3, 0.5, 1.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.7, -0.6]} castShadow>
          <boxGeometry args={[3, 0.6, 0.3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* ====================================================
          NEON MOUNTED SIGNAGE COMPONENT
         ==================================================== */}
      {/* Front Entrance Banner */}
      {showEntranceSign && (
        <Html position={[0, 4.2, 15.8]} center distanceFactor={10}>
          <div className="px-5 py-1.5 bg-slate-950/95 text-white border border-emerald-500/80 rounded-xl shadow-lg shadow-emerald-500/10 font-sans font-black text-sm tracking-widest text-center select-none whitespace-nowrap uppercase">
            🚪 Virtual Entrance
          </div>
        </Html>
      )}

      {/* Main Aisle Banner */}
      {showMainAisleSign && (
        <Html position={[0, 4.2, 3.8]} center distanceFactor={10}>
          <div className="px-5 py-1.5 bg-slate-950/95 text-white border border-blue-500/80 rounded-xl shadow-lg shadow-blue-500/10 font-sans font-black text-sm tracking-widest text-center select-none whitespace-nowrap uppercase">
            🛍️ Central Boulevard
          </div>
        </Html>
      )}

      {/* Men Section Pillar Sign */}
      {showMenSign && (
        <Html position={[-4.5, 3.8, 4.3]} center distanceFactor={10}>
          <div className="px-4 py-1.5 bg-slate-950/95 text-sky-400 border border-sky-500/60 rounded-lg shadow-md font-sans font-bold text-xs tracking-wider select-none whitespace-nowrap uppercase">
            👞 Men's Section
          </div>
        </Html>
      )}

      {/* Women Section Pillar Sign */}
      {showWomenSign && (
        <Html position={[4.5, 3.8, 4.3]} center distanceFactor={10}>
          <div className="px-4 py-1.5 bg-slate-950/95 text-pink-400 border border-pink-500/60 rounded-lg shadow-md font-sans font-bold text-xs tracking-wider select-none whitespace-nowrap uppercase">
            👗 Women's Boutique
          </div>
        </Html>
      )}

      {/* Kids Kingdom Entrance Sign */}
      {showKidsSign && (
        <Html position={[0, 4.2, -7.8]} center distanceFactor={10}>
          <div className="px-5 py-1.5 bg-slate-950/95 text-amber-400 border border-amber-500/80 rounded-xl shadow-lg font-sans font-black text-sm tracking-widest select-none whitespace-nowrap uppercase">
            🧸 Kids Kingdom
          </div>
        </Html>
      )}
      
      {/* Kids Clothing Sign */}
      {showKidsClothingSign && (
        <Html position={[0, 4.2, -16.8]} center distanceFactor={10}>
          <div className="px-4 py-1.5 bg-slate-950/95 text-rose-400 border border-rose-500/60 rounded-lg shadow-md font-sans font-bold text-xs tracking-wider select-none whitespace-nowrap uppercase">
            👕 Kids Apparel
          </div>
        </Html>
      )}

      {/* Kids Toys accessories Sign */}
      {showKidsToysSign && (
        <Html position={[0, 4.2, -25.8]} center distanceFactor={10}>
          <div className="px-4 py-1.5 bg-slate-950/95 text-purple-400 border border-purple-500/60 rounded-lg shadow-md font-sans font-bold text-xs tracking-wider select-none whitespace-nowrap uppercase">
            🎮 Toys & Games
          </div>
        </Html>
      )}
    </group>
  );
};

export default StoreEnvironment;
