import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const CameraWalkController = ({ activeSection, layout, orbitRef, resetTrigger }) => {
  const { camera } = useThree();
  
  // Track target position and focus targets
  const targetPos = useRef(new THREE.Vector3(0, 2.5, 12));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.8, 5));
  
  // State to track if camera is currently interpolating/walking
  const isTransitioning = useRef(true);
  
  // Keyboard state
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
  });

  // Handle active section change or reset trigger alignment
  useEffect(() => {
    if (layout?.sections?.[activeSection]) {
      const sec = layout.sections[activeSection];
      targetPos.current.set(...sec.cameraPos);
      targetLookAt.current.set(...sec.lookAt);
      isTransitioning.current = true; // Lock and animate camera
    }
  }, [activeSection, resetTrigger, layout]);

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key] = true;
        isTransitioning.current = true; // Reactivate walk interpolation for adjustments
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    // 1. Keyboard movements (micro-navigation)
    const moveSpeed = 4 * delta; // speed factor
    const tempDir = new THREE.Vector3();
    const tempSide = new THREE.Vector3();
    
    // Get horizontal direction vector from camera look-at
    camera.getWorldDirection(tempDir);
    tempDir.y = 0; // lock height
    tempDir.normalize();
    
    // Calculate right vector
    tempSide.crossVectors(tempDir, camera.up).normalize();

    let didMove = false;
    
    if (keys.current.w || keys.current.arrowup) {
      targetPos.current.addScaledVector(tempDir, moveSpeed);
      targetLookAt.current.addScaledVector(tempDir, moveSpeed);
      didMove = true;
    }
    if (keys.current.s || keys.current.arrowdown) {
      targetPos.current.addScaledVector(tempDir, -moveSpeed);
      targetLookAt.current.addScaledVector(tempDir, -moveSpeed);
      didMove = true;
    }
    if (keys.current.a || keys.current.arrowleft) {
      targetPos.current.addScaledVector(tempSide, -moveSpeed);
      targetLookAt.current.addScaledVector(tempSide, -moveSpeed);
      didMove = true;
    }
    if (keys.current.d || keys.current.arrowright) {
      targetPos.current.addScaledVector(tempSide, moveSpeed);
      targetLookAt.current.addScaledVector(tempSide, moveSpeed);
      didMove = true;
    }

    if (didMove) {
      isTransitioning.current = true;
    }

    // 2. Camera walking lerp (only runs during transitions)
    if (isTransitioning.current) {
      camera.position.lerp(targetPos.current, 0.08);

      if (orbitRef.current) {
        orbitRef.current.target.lerp(targetLookAt.current, 0.08);
        orbitRef.current.update();
      }

      // Check if we arrived close to target
      const dist = camera.position.distanceTo(targetPos.current);
      if (dist < 0.05 && !didMove) {
        isTransitioning.current = false; // Release camera control back to OrbitControls!
      }
    }
  });

  return null;
};

export default CameraWalkController;
