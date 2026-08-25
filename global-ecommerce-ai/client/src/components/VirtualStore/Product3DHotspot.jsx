import React, { useRef, useState, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

// Safe model loader component that catches load errors and falls back to a 3D box
const ModelMesh = ({ path, scale = [1, 1, 1] }) => {
  const [error, setError] = useState(false);
  
  try {
    const { scene } = useGLTF(path);
    const cloned = scene.clone();
    return <primitive object={cloned} scale={scale} />;
  } catch (err) {
    console.error("Failed to load model path:", path, err);
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.8} />
      </mesh>
    );
  }
};

// Fallback geometric shape while loading
const LoaderFallback = () => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[0.3]} />
      <meshStandardMaterial color="#10b981" wireframe />
    </mesh>
  );
};

// Procedural 3D Products for immediate loading and ultra-realistic boutique vibe
const ProceduralProduct = ({ shapeType, colorTheme = "#10b981" }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Spinning parts like drone propellers
      if (shapeType === "drone") {
        const propGroup = groupRef.current.getObjectByName("propellors");
        if (propGroup) {
          propGroup.children.forEach(prop => {
            prop.rotation.y += delta * 15;
          });
        }
      }
    }
  });

  if (shapeType === "drone") {
    return (
      <group ref={groupRef}>
        {/* Central core */}
        <mesh castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Support rods */}
        <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.7, 0.02, 0.02]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[0.7, 0.02, 0.02]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        {/* Propellors */}
        <group name="propellors">
          <mesh position={[-0.25, 0.04, 0.25]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.005, 8]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.25, 0.04, 0.25]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.005, 8]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.6} />
          </mesh>
          <mesh position={[-0.25, 0.04, -0.25]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.005, 8]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.25, 0.04, -0.25]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.005, 8]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.6} />
          </mesh>
        </group>
      </group>
    );
  }

  if (shapeType === "headphones") {
    return (
      <group ref={groupRef}>
        {/* Headband */}
        <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.25, 0.025, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Earcups */}
        <mesh position={[-0.25, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0.25, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    );
  }

  if (shapeType === "watch") {
    return (
      <group ref={groupRef}>
        {/* Display mount */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.25, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Watch band */}
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.11, 0.03, 8, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Screen */}
        <mesh position={[0.12, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.11, 0.11, 0.03]} />
          <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.9} emissive="#059669" emissiveIntensity={0.6} />
        </mesh>
      </group>
    );
  }

  if (shapeType === "keyboard") {
    return (
      <group ref={groupRef}>
        {/* Base frame */}
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.65, 0.035, 0.26]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Backlight board */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.62, 0.015, 0.22]} />
          <meshStandardMaterial color="#111827" roughness={0.3} emissive="#8b5cf6" emissiveIntensity={0.6} />
        </mesh>
      </group>
    );
  }

  if (shapeType === "console") {
    return (
      <group ref={groupRef}>
        {/* PS5-style outer white shells */}
        <mesh position={[-0.07, 0.3, 0]} rotation={[0, 0.03, 0]} castShadow>
          <boxGeometry args={[0.02, 0.7, 0.26]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} />
        </mesh>
        <mesh position={[0.07, 0.3, 0]} rotation={[0, -0.03, 0]} castShadow>
          <boxGeometry args={[0.02, 0.7, 0.26]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} />
        </mesh>
        {/* Black glossy core */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.11, 0.67, 0.24]} />
          <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.95} />
        </mesh>
        {/* Blue status glow strip */}
        <mesh position={[0, 0.3, 0.125]}>
          <boxGeometry args={[0.008, 0.6, 0.008]} />
          <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={2.5} />
        </mesh>
      </group>
    );
  }

  if (shapeType === "glasses") {
    return (
      <group ref={groupRef}>
        {/* Frames */}
        <mesh position={[-0.15, 0.06, 0]} castShadow>
          <torusGeometry args={[0.09, 0.015, 8, 16]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.15, 0.06, 0]} castShadow>
          <torusGeometry args={[0.09, 0.015, 8, 16]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Bridge */}
        <mesh position={[0, 0.11, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.12, 8]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.9} />
        </mesh>
      </group>
    );
  }

  if (shapeType === "castle") {
    return (
      <group ref={groupRef}>
        {/* Yellow base block */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.5, 0.16, 0.35]} />
          <meshStandardMaterial color="#eab308" roughness={0.9} />
        </mesh>
        {/* Red pillars */}
        <mesh position={[-0.18, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 0.25, 12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.9} />
        </mesh>
        <mesh position={[0.18, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 0.25, 12]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.9} />
        </mesh>
        {/* Green cone roof */}
        <mesh position={[0, 0.52, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.22, 0.3, 4]} />
          <meshStandardMaterial color="#22c55e" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh ref={groupRef} castShadow>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color={colorTheme} roughness={0.3} metalness={0.8} />
    </mesh>
  );
};

const Product3DHotspot = ({ config, onSelect, allProducts, isActiveSection }) => {
  const productGroupRef = useRef();
  const [hovered, setHovered] = useState(false);

  const matchingProduct = allProducts.find(
    (p) => p.name.toLowerCase() === config.productSearchName.toLowerCase()
  );

  useFrame((state) => {
    if (productGroupRef.current) {
      productGroupRef.current.rotation.y += 0.008;
      
      const time = state.clock.getElapsedTime();
      productGroupRef.current.position.y = config.position[1] + Math.sin(time * 2.0) * 0.04;
    }
  });

  return (
    <group position={[config.position[0], 0, config.position[2]]}>
      {/* 1. Pedestal Showcase Stand */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.8, 0.9, 32]} />
        <meshStandardMaterial 
          color="#1e293b" 
          roughness={0.2} 
          metalness={0.9} 
        />
      </mesh>

      {/* 2. Glass Showcase top plate */}
      <mesh position={[0, 0.91, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.03, 32]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} metalness={1} roughness={0} />
      </mesh>

      {/* Spot lighting for the active product stand */}
      {isActiveSection && (
        <spotLight 
          position={[0, 4, 0]} 
          target-position={[0, 1, 0]}
          intensity={4} 
          angle={Math.PI / 4} 
          penumbra={0.5} 
          castShadow 
        />
      )}

      {/* 3. Render Product (Procedural or GLB Model) */}
      <group 
        ref={productGroupRef} 
        position={[0, config.position[1], 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(matchingProduct || {
            name: config.label || config.productSearchName,
            price: 1999,
            images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"],
            description: "High-quality virtual product item. Add to cart to purchase.",
            _id: "placeholder-tour-product",
            isPlaceholder: true,
          });
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
        <Suspense fallback={<LoaderFallback />}>
          {config.shapeType ? (
            <ProceduralProduct shapeType={config.shapeType} />
          ) : config.glbPath ? (
            <ModelMesh path={config.glbPath} scale={config.scale} />
          ) : (
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial color="#f43f5e" roughness={0.1} metalness={0.6} />
            </mesh>
          )}
        </Suspense>
      </group>

      {/* 4. Interactive Floating Label Overlay */}
      {isActiveSection && (
        <Html 
          position={[0, config.position[1] + 1.2, 0]} 
          center 
          distanceFactor={6}
          style={{ transition: "all 0.2s" }}
        >
          <div 
            onClick={() => {
              onSelect(matchingProduct || {
                name: config.label || config.productSearchName,
                price: 1999,
                images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"],
                description: "High-quality virtual product item. Add to cart to purchase.",
                _id: "placeholder-tour-product",
                isPlaceholder: true,
              });
            }}
            className={`flex flex-col items-center select-none font-sans px-3.5 py-2 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-2xl transition duration-300 text-xs font-bold leading-tight cursor-pointer whitespace-nowrap ${
              hovered 
                ? "bg-emerald-400 text-slate-950 scale-110 border-emerald-300 shadow-emerald-400/20" 
                : "bg-slate-900/90 text-white hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🛍️</span>
              <div>
                <p className="max-w-[125px] overflow-hidden text-ellipsis leading-none text-white font-extrabold group-hover:text-slate-950">
                  {matchingProduct ? matchingProduct.name : config.label || config.productSearchName}
                </p>
                <p className="text-[10px] text-emerald-400 font-black mt-0.5 leading-none">
                  {matchingProduct ? `₹${matchingProduct.price}` : "₹1,999"}
                </p>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Product3DHotspot;
