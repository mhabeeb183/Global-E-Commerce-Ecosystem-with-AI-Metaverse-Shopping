import React, { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, TeleportTarget } from '@react-three/xr';
import { Environment, OrbitControls, useGLTF, Text, Float } from '@react-three/drei';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const store = createXRStore();

// A component to display a single product in 3D space
const ProductPedestal = ({ product, position, onClick }) => {
  const modelUrl = product.arModelUrl || "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
  
  // Try to load the GLTF, fallback to a simple box if it fails or is loading
  const { scene } = useGLTF(modelUrl, true, true, (error) => {
    console.warn("Could not load model for", product.name, error);
  });

  return (
    <group position={position}>
      {/* Pedestal */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 1, 32]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>

      {/* Product Model */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[0, 0.5, 0]} scale={0.5} onClick={() => onClick(product)}>
          {scene ? <primitive object={scene.clone()} /> : (
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          )}
        </group>
      </Float>

      {/* Label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {product.name}
      </Text>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.15}
        color="#4ade80"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="black"
      >
        ₹ {product.dynamicPrice || product.basePrice || product.price}
      </Text>
    </group>
  );
};

const VirtualShowroom = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/products");
        // Just take the first 8 products for the showroom circle
        setProducts(data.slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch products for showroom", error);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      
      {/* UI Overlay */}
      <div style={{ position: 'absolute', zIndex: 10, padding: '20px', color: 'white', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>🥽 VR Virtual Showroom</h1>
          <div>
            <button 
              onClick={() => navigate('/')} 
              style={{ background: 'white', color: 'black', padding: '10px 20px', borderRadius: '8px', marginRight: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Exit
            </button>
            <button 
              onClick={() => store.enterVR()}
              style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Enter VR
            </button>
          </div>
        </div>
        <p style={{ marginTop: '10px', opacity: 0.8 }}>Drag to look around. Scroll to zoom. Click Enter VR for an immersive headset experience.</p>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 1.6, 5], fov: 60 }}>
        <XR store={store}>
          <color attach="background" args={['#1a1a2e']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          
          <Environment preset="city" />

          {/* Floor / Teleport Target for VR */}
          <TeleportTarget>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <meshStandardMaterial color="#0f0f1a" />
            </mesh>
          </TeleportTarget>

          <Suspense fallback={null}>
            {products.map((product, i) => {
              const angle = (i / products.length) * Math.PI * 2;
              const radius = 4;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;

              return (
                <ProductPedestal 
                  key={product._id} 
                  product={product} 
                  position={[x, 0, z]} 
                  onClick={handleProductClick}
                />
              );
            })}
          </Suspense>

          <OrbitControls makeDefault />
        </XR>
      </Canvas>
    </div>
  );
};

export default VirtualShowroom;
