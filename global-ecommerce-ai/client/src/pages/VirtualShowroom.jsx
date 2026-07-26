import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, TeleportTarget } from '@react-three/xr';
import { Environment, OrbitControls, useGLTF, Text, Float, Billboard, useTexture } from '@react-three/drei';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DoubleSide } from 'three';

const store = createXRStore();

const isMobile = typeof window !== "undefined" ? /Mobi|Android/i.test(navigator.userAgent) : false;

// Error Boundary Component to prevent canvas crashes on failed assets
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("Caught resource load error in VR Showroom:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// Component to render product image on a flat plane
const ProductImagePlane = ({ url }) => {
  const texture = useTexture(url);
  return (
    <mesh castShadow receiveShadow>
      <planeGeometry args={[0.8, 0.8]} />
      <meshBasicMaterial map={texture} transparent side={DoubleSide} />
    </mesh>
  );
};

// Component to render GLB model
const ModelViewer = ({ url, product }) => {
  const { scene } = useGLTF(url, true, true, (error) => {
    console.warn("Could not load model for", product.name, error);
  });

  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone();
    clone.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return clonedScene ? <primitive object={clonedScene} /> : (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#4f46e5" />
    </mesh>
  );
};

// A component to display a single product in 3D space
const ProductPedestal = ({ product, position, onClick }) => {
  const modelUrl = product.arModelUrl;
  const imageUrl = product.images?.[0];

  return (
    <group position={position}>
      {/* Pedestal */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 1, 32]} />
        <meshStandardMaterial color="#2d3748" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Product Model or Image Plane */}
      <Float speed={isMobile ? 0 : 2} rotationIntensity={isMobile ? 0 : 0.5} floatIntensity={isMobile ? 0 : 0.5}>
        <group position={[0, 1.1, 0]} scale={0.6} onClick={() => onClick(product)}>
          {modelUrl ? (
            <ErrorBoundary fallback={
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#4f46e5" />
              </mesh>
            }>
              <Suspense fallback={
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.5, 0.5, 0.5]} />
                  <meshStandardMaterial color="#4f46e5" />
                </mesh>
              }>
                <ModelViewer url={modelUrl} product={product} />
              </Suspense>
            </ErrorBoundary>
          ) : imageUrl ? (
            <ErrorBoundary fallback={
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#4f46e5" />
              </mesh>
            }>
              <Suspense fallback={
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.5, 0.5, 0.5]} />
                  <meshStandardMaterial color="#4f46e5" />
                </mesh>
              }>
                <Billboard>
                  <ProductImagePlane url={imageUrl} />
                </Billboard>
              </Suspense>
            </ErrorBoundary>
          ) : (
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          )}
        </group>
      </Float>

      {/* Label always facing camera */}
      <Billboard position={[0, 2.2, 0]}>
        <Text
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
          position={[0, -0.25, 0]}
          fontSize={0.15}
          color="#4ade80"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
        >
          ₹ {product.dynamicPrice || product.basePrice || product.price}
        </Text>
      </Billboard>
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
        // Sort by newly created first so new products display instantly
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // Take latest 12 products
        setProducts(sorted.slice(0, 12));
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
      <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6 text-white bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">🥽 VR Virtual Showroom</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/')} 
              className="flex-1 sm:flex-none bg-white hover:bg-gray-155 bg-gray-100 text-black px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer text-sm"
            >
              Exit
            </button>
            <button 
              onClick={() => store.enterVR()}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer text-sm"
            >
              Enter VR
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs md:text-sm text-gray-300 max-w-xl">
          Drag to look around. Scroll to zoom. Click "Enter VR" on compatible mobile devices/headsets for an immersive 3D experience.
        </p>
      </div>

      {/* 3D Canvas */}
      <Canvas 
        shadows={!isMobile} 
        dpr={isMobile ? 1 : [1, 1.5]} 
        performance={{ min: 0.5 }}
        camera={{ position: [0, 4, 9], fov: 60 }}
      >
        <XR store={store}>
          <color attach="background" args={['#1a1a2e']} />
          <ambientLight intensity={isMobile ? 0.8 : 0.5} />
          <directionalLight position={[10, 10, 5]} intensity={isMobile ? 1.0 : 1.5} castShadow={!isMobile} />
          
          {!isMobile && <Environment preset="city" />}

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
                <ErrorBoundary key={product._id} fallback={null}>
                  <ProductPedestal 
                    product={product} 
                    position={[x, 0, z]} 
                    onClick={handleProductClick}
                  />
                </ErrorBoundary>
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
