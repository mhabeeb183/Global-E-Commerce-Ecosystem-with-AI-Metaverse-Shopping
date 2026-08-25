import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { store3DLayout } from "./virtualStoreConfig";
import CameraWalkController from "./CameraWalkController";
import StoreEnvironment from "./StoreEnvironment";
import Product3DHotspot from "./Product3DHotspot";

// Interactive floor navigation marker (a pulsing ring on the floor)
const FloorNavigationMarker = ({ targetId, targetSection, markerPos, label, onClick }) => {
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Subtle pulsing animation
  useFrame((state) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.08;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  // Position floor markers based on config or destination pos
  const pos = markerPos ? [...markerPos] : [...targetSection.cameraPos];
  pos[1] = 0.05; // rest on floor

  return (
    <group position={pos}>
      {/* Horizontal mesh ring on the floor */}
      <mesh 
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(targetId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <ringGeometry args={[0.3, 0.45, 32]} />
        <meshBasicMaterial 
          color={hovered ? "#34d399" : "#10b981"} 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Inside circle for click target */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(targetId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <circleGeometry args={[0.3, 32]} />
        <meshBasicMaterial 
          color={hovered ? "#059669" : "#10b981"} 
          transparent 
          opacity={0.3} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Floating Walk Tag above the floor ring */}
      <Html position={[0, 0.6, 0]} center distanceFactor={8}>
        <div 
          onClick={() => onClick(targetId)}
          className={`flex flex-col items-center select-none font-sans px-2.5 py-1.5 rounded-lg border shadow-xl transition-all duration-300 text-[10px] font-black tracking-widest cursor-pointer whitespace-nowrap uppercase ${
            hovered 
              ? "bg-emerald-400 border-emerald-300 text-slate-950 scale-110 shadow-emerald-400/20" 
              : "bg-slate-950/90 border-emerald-500/40 text-emerald-400"
          }`}
        >
          <span className="text-[12px] leading-none mb-0.5">↓</span>
          {label || "Walk Here"}
        </div>
      </Html>
    </group>
  );
};

const WebGLStoreViewer = ({ 
  activeSection, 
  setActiveSection, 
  onSelectProduct, 
  allProducts,
  resetTrigger
}) => {
  const orbitRef = useRef();

  // Find connections (adjacent areas) of the currently active section
  const currentSection = store3DLayout.sections[activeSection] || store3DLayout.sections.entrance;
  const connections = currentSection.connections || [];

  return (
    <div className="w-full h-full bg-slate-950 relative">
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 12], fov: 60 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        {/* Lights & Atmosphere */}
        <color attach="background" args={["#f3f4f6"]} />
        <fog attach="fog" args={["#f3f4f6", 20, 60]} />
        
        <ambientLight intensity={0.65} />
        <directionalLight
          castShadow
          position={[12, 22, 12]}
          intensity={1.3}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />

        {/* Procedural Store Shell: floor columns, walls, racks, dividers, signage */}
        <StoreEnvironment activeSection={activeSection} />

        {/* Orbit Controls for Drag-to-Rotate & Scroll-to-Zoom */}
        <OrbitControls 
          ref={orbitRef}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05} // prevent going under floor
          minDistance={1}
          maxDistance={25}
        />

        {/* Smooth Camera Walking Controller */}
        <CameraWalkController 
          activeSection={activeSection} 
          layout={store3DLayout} 
          orbitRef={orbitRef} 
          resetTrigger={resetTrigger}
        />

        {/* Render floor markers dynamically for connected sections */}
        {connections.map((conn) => {
          // Connections can be objects with specific floor positions or simple strings
          const connId = typeof conn === "string" ? conn : conn.target;
          const targetSection = store3DLayout.sections[connId];
          if (!targetSection) return null;
          
          return (
            <FloorNavigationMarker
              key={connId}
              targetId={connId}
              targetSection={targetSection}
              markerPos={typeof conn === "object" ? conn.pos : null}
              label={typeof conn === "object" ? conn.label : null}
              onClick={(id) => setActiveSection(id)}
            />
          );
        })}

        {/* Render Interactive 3D Product Stand Hotspots */}
        {store3DLayout.products.map((prodConfig, idx) => {
          return (
            <Product3DHotspot
              key={idx}
              config={prodConfig}
              allProducts={allProducts}
              onSelect={onSelectProduct}
              isActiveSection={prodConfig.section === activeSection}
            />
          );
        })}
      </Canvas>
    </div>
  );
};

export default WebGLStoreViewer;
