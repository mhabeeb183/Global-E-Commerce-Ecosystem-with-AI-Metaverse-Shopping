// Configuration structure for the Virtual Walkthrough Store.
// Ready to be moved to MongoDB schemas in the future.

// Config for Immersive 3D WebGL Store Layout
// Camera coordinates [x, y, z] and lookAt target points [x, y, z]
export const store3DLayout = {
  sections: {
    entrance: {
      id: "entrance",
      name: "Store Entrance",
      department: "Entrance",
      cameraPos: [0, 2.5, 12],
      lookAt: [0, 1.8, 5],
      signText: "Virtual Fashion Hub",
      signColor: "#10b981",
      connections: [
        { target: "main-aisle", pos: [0, 0.05, 6], label: "Walk Forward" }
      ]
    },
    "main-aisle": {
      id: "main-aisle",
      name: "Main Aisle",
      department: "Main Store",
      cameraPos: [0, 2.5, 2],
      lookAt: [0, 1.8, -6],
      signText: "Central Blvd",
      signColor: "#3b82f6",
      connections: [
        { target: "entrance", pos: [0, 0.05, 8], label: "Walk to Entrance" },
        { target: "men-section", pos: [-5.5, 0.05, -2], label: "Men's Section" },
        { target: "women-section", pos: [5.5, 0.05, -2], label: "Women's Section" },
        { target: "kids-entrance", pos: [0, 0.05, -6], label: "Kids Department" }
      ]
    },
    "men-section": {
      id: "men-section",
      name: "Men's Section",
      department: "Men",
      cameraPos: [-8, 2.5, -2],
      lookAt: [-15, 1.8, -2],
      signText: "Men's Style",
      signColor: "#60a5fa",
      connections: [
        { target: "main-aisle", pos: [-5.5, 0.05, -2], label: "Main Aisle" }
      ]
    },
    "women-section": {
      id: "women-section",
      name: "Women's Section",
      department: "Women",
      cameraPos: [8, 2.5, -2],
      lookAt: [15, 1.8, -2],
      signText: "Women's Collection",
      signColor: "#f472b6",
      connections: [
        { target: "main-aisle", pos: [5.5, 0.05, -2], label: "Main Aisle" }
      ]
    },
    "kids-entrance": {
      id: "kids-entrance",
      name: "Kids Section Entrance",
      department: "Kids",
      cameraPos: [0, 2.5, -8],
      lookAt: [0, 1.8, -16],
      signText: "Kids Corner",
      signColor: "#fbbf24",
      connections: [
        { target: "main-aisle", pos: [0, 0.05, -6], label: "Main Aisle" },
        { target: "kids-aisle", pos: [0, 0.05, -14], label: "Walk Forward" }
      ]
    },
    "kids-aisle": {
      id: "kids-aisle",
      name: "Kids Aisle",
      department: "Kids",
      cameraPos: [0, 2.5, -17],
      lookAt: [0, 1.8, -25],
      signText: "Boys & Girls Clothes",
      signColor: "#fb7185",
      connections: [
        { target: "kids-entrance", pos: [0, 0.05, -11], label: "Go Back" },
        { target: "kids-accessories", pos: [0, 0.05, -23], label: "Walk Forward" }
      ]
    },
    "kids-accessories": {
      id: "kids-accessories",
      name: "Kids Accessories Room",
      department: "Kids",
      cameraPos: [0, 2.5, -26],
      lookAt: [0, 1.8, -32],
      signText: "Toys & Fun Games",
      signColor: "#a78bfa",
      connections: [
        { target: "kids-aisle", pos: [0, 0.05, -21], label: "Go Back" }
      ]
    }
  },
  products: [
    // 1. Entrance Area
    {
      productSearchName: "Anti-Radiation Gaming Glasses",
      section: "entrance",
      position: [-2.8, 1.1, 11],
      scale: [1, 1, 1],
      rotation: [0, Math.PI / 4, 0],
      shapeType: "glasses",
      label: "Gaming Glasses"
    },
    // 2. Main Aisle Showcase
    {
      productSearchName: "Ergonomic Mesh Office Chair",
      section: "main-aisle",
      position: [-3.8, 0.45, -3],
      scale: [1.2, 1.2, 1.2],
      rotation: [0, Math.PI / 6, 0],
      glbPath: "/assets/SheenChair.glb",
      label: "Ergonomic Mesh Chair"
    },
    {
      productSearchName: "PlayStation 5 Console Slim",
      section: "main-aisle",
      position: [3.8, 1.1, -3],
      scale: [1, 1, 1],
      rotation: [0, -Math.PI / 6, 0],
      shapeType: "console",
      label: "PS5 Console Slim"
    },
    // 3. Men's Section
    {
      productSearchName: "Meta Quest 3 VR Headset",
      section: "men-section",
      position: [-12, 1.15, -4],
      scale: [1.3, 1.3, 1.3],
      rotation: [0, -Math.PI / 3, 0],
      glbPath: "/assets/DamagedHelmet.glb",
      label: "Meta Quest 3 VR"
    },
    {
      productSearchName: "AI Autonomous Drone 4K",
      section: "men-section",
      position: [-12, 1.15, 0.5],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      shapeType: "drone",
      label: "AI Drone 4K"
    },
    {
      productSearchName: "Noise-Cancelling Wireless Headphones",
      section: "men-section",
      position: [-14, 1.1, -2],
      scale: [1.1, 1.1, 1.1],
      rotation: [0, Math.PI / 2, 0],
      shapeType: "headphones",
      label: "Sony Headphones"
    },
    // 4. Women's Section
    {
      productSearchName: "Cyberpunk LED Sneakers",
      section: "women-section",
      position: [12, 1.1, -2],
      scale: [1.2, 1.2, 1.2],
      rotation: [0, Math.PI / 4, 0],
      glbPath: "/assets/MaterialsVariantsShoe.glb",
      label: "Cyberpunk LED Shoes"
    },
    {
      productSearchName: "Smart Fitness Watch Series 9",
      section: "women-section",
      position: [12, 1.1, 1.5],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      shapeType: "watch",
      label: "Fitbit Smartwatch"
    },
    {
      productSearchName: "Pro Gaming Mechanical Keyboard",
      section: "women-section",
      position: [14, 1.1, -4],
      scale: [1, 1, 1],
      rotation: [0, -Math.PI / 6, 0],
      shapeType: "keyboard",
      label: "Gaming Keyboard"
    },
    // 5. Kids Sections
    {
      productSearchName: "Wooden Activity Blocks Castle",
      section: "kids-entrance",
      position: [0, 1.05, -12],
      scale: [1, 1, 1],
      rotation: [0, Math.PI / 4, 0],
      shapeType: "castle",
      label: "Wooden Building Blocks"
    },
    {
      productSearchName: "Lego Star Wars Millennium Falcon",
      section: "kids-accessories",
      position: [-2.5, 1.0, -29],
      scale: [0.4, 0.4, 0.4],
      rotation: [0, 0.5, 0],
      glbPath: "/assets/ToyCar.glb",
      label: "Lego Space Toy"
    },
    {
      productSearchName: "RC Intelligent Dancing Robot",
      section: "kids-accessories",
      position: [2.5, 0.95, -29],
      scale: [0.9, 0.9, 0.9],
      rotation: [0, Math.PI, 0],
      glbPath: "/assets/RobotExpressive.glb",
      label: "Intelligent Robot"
    }
  ]
};
