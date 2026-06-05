const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
const Auction = require("../models/Auction");
const LiveStream = require("../models/LiveStream");
const SubscriptionPlan = require("../models/SubscriptionPlan");

const seedDatabase = async () => {
  try {
    // Seed Subscription Plans if none exist
    const planCount = await SubscriptionPlan.countDocuments({});
    if (planCount === 0) {
      await SubscriptionPlan.create([
        {
          name: "Monthly Premium",
          duration: 30,
          price: 299,
          freeDelivery: true,
          isActive: true,
        },
        {
          name: "Quarterly Pro",
          duration: 90,
          price: 799,
          freeDelivery: true,
          isActive: true,
        },
        {
          name: "Yearly Elite",
          duration: 365,
          price: 2499,
          freeDelivery: true,
          isActive: true,
        },
      ]);
      console.log("Seeded Subscription Plans successfully.");
    }

    // Check if database is already seeded with all 14 products
    const productCount = await Product.countDocuments({});
    if (productCount >= 14) {
      console.log("Database already seeded with enough products. Skipping seeder.");
      return;
    }

    console.log("Cleaning and seeding/re-seeding products, warehouses, auctions, and live streams...");

    // Clear existing product, warehouse, auction, and stream data to avoid conflicts
    await Product.deleteMany({});
    await Warehouse.deleteMany({});
    await Auction.deleteMany({});
    await LiveStream.deleteMany({});

    // 1. Get or Create Users
    let admin = await User.findOne({ role: "admin" });
    let vendor = await User.findOne({ role: "vendor" });
    let customer = await User.findOne({ role: "user" });

    if (!admin || !vendor || !customer) {
      // Clear users to prevent partial duplicate states
      await User.deleteMany({});
      
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash("admin123", salt);
      const vendorPassword = await bcrypt.hash("vendor123", salt);
      const userPassword = await bcrypt.hash("user123", salt);

      admin = await User.create({
        name: "Super Admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "admin",
        isAdmin: true,
        walletBalance: 10000,
      });

      vendor = await User.create({
        name: "Tech vendor Pro",
        email: "vendor@example.com",
        password: vendorPassword,
        role: "vendor",
        walletBalance: 5000,
      });

      customer = await User.create({
        name: "John Doe",
        email: "user@example.com",
        password: userPassword,
        role: "user",
        walletBalance: 1500,
      });
      console.log("Seeded Users: admin@example.com, vendor@example.com, user@example.com");
    } else {
      console.log("Using existing database users.");
    }

    // 2. Create Products (14 total)
    const products = await Product.insertMany([
      {
        name: "Meta Quest 3 VR Headset",
        description: "Next-gen mixed reality headset with dual screen, 128GB storage, and advanced controller-free tracking. Perfect for immersive gaming and spatial computing.",
        category: "Metaverse",
        brand: "Meta",
        price: 49999,
        basePrice: 49999,
        dynamicPrice: 49999,
        stock: 50,
        soldCount: 12,
        images: ["https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.8,
      },
      {
        name: "AI Autonomous Drone 4K",
        description: "Smart follow-me drone with obstacle avoidance, 4K HDR stabilized camera, and gesture controls. Powered by onboard edge-computing neural networks.",
        category: "Electronics",
        brand: "Skydio",
        price: 79999,
        basePrice: 79999,
        dynamicPrice: 79999,
        stock: 20,
        soldCount: 5,
        images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.5,
      },
      {
        name: "Pro Gaming Mechanical Keyboard",
        description: "Tactile mechanical keyboard with customized hot-swappable yellow switches, dynamic per-key RGB backlighting, and solid aluminum chassis.",
        category: "Accessories",
        brand: "Keychron",
        price: 8999,
        basePrice: 8999,
        dynamicPrice: 8999,
        stock: 120,
        soldCount: 45,
        images: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.2,
      },
      {
        name: "Noise-Cancelling Wireless Headphones",
        description: "Studio-quality over-ear wireless headphones with active hybrid noise cancellation, 40-hour battery life, and spatial audio support.",
        category: "Audio",
        brand: "Sony",
        price: 24999,
        basePrice: 24999,
        dynamicPrice: 24999,
        stock: 80,
        soldCount: 30,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.7,
      },
      {
        name: "Apple Vision Pro Spatial Computer",
        description: "Revolutionary spatial computer that seamlessly blends digital content with your physical space, featuring dual-micro-OLED displays and advanced eye tracking.",
        category: "Metaverse",
        brand: "Apple",
        price: 299999,
        basePrice: 299999,
        dynamicPrice: 299999,
        stock: 15,
        soldCount: 3,
        images: ["https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.9,
      },
      {
        name: "PlayStation 5 Console Slim",
        description: "Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.",
        category: "Gaming",
        brand: "Sony",
        price: 44999,
        basePrice: 44999,
        dynamicPrice: 44999,
        stock: 40,
        soldCount: 18,
        images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.8,
      },
      {
        name: "Nintendo Switch OLED Model",
        description: "Features a vibrant 7-inch OLED screen, a wide adjustable stand, a dock with a wired LAN port, 64 GB of internal storage, and enhanced audio.",
        category: "Gaming",
        brand: "Nintendo",
        price: 32999,
        basePrice: 32999,
        dynamicPrice: 32999,
        stock: 60,
        soldCount: 22,
        images: ["https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.6,
      },
      {
        name: "Smart Fitness Watch Series 9",
        description: "Advanced health monitoring wristwear tracking real-time heart rate, blood oxygen levels, sleep quality, and active workout calories with premium design.",
        category: "Wearables",
        brand: "Fitbit",
        price: 14999,
        basePrice: 14999,
        dynamicPrice: 14999,
        stock: 100,
        soldCount: 35,
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.4,
      },
      {
        name: "Ergonomic Mesh Office Chair",
        description: "Premium mesh office chair designed for maximum lumbar support, containing highly adjustable armrests, seat depth, and smooth-rolling castors.",
        category: "Furniture",
        brand: "Steelcase",
        price: 24999,
        basePrice: 24999,
        dynamicPrice: 24999,
        stock: 25,
        soldCount: 8,
        images: ["https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.3,
      },
      {
        name: "Mechanical Gaming Mouse RGB",
        description: "High-precision gaming mouse with customizable weight system, 16000 DPI sensor, and 11 programmable buttons with dynamic RGB lighting profiles.",
        category: "Accessories",
        brand: "Logitech",
        price: 4999,
        basePrice: 4999,
        dynamicPrice: 4999,
        stock: 150,
        soldCount: 88,
        images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.5,
      },
      {
        name: "Portable Bluetooth Speaker Waterproof",
        description: "Rugged waterproof outdoor speaker with deep bass, dual passive radiators, 20-hour battery life, and wireless multi-speaker connection support.",
        category: "Audio",
        brand: "JBL",
        price: 9999,
        basePrice: 9999,
        dynamicPrice: 9999,
        stock: 75,
        soldCount: 29,
        images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.6,
      },
      {
        name: "Smart Home Assistant Speaker",
        description: "Compact smart speaker delivering rich sound with assistant integration to control lights, thermostats, and smart home appliances by voice.",
        category: "Electronics",
        brand: "Google",
        price: 4499,
        basePrice: 4499,
        dynamicPrice: 4499,
        stock: 200,
        soldCount: 110,
        images: ["https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.1,
      },
      {
        name: "4K Ultra HD Action Camera",
        description: "Pocket-sized action camera capturing stunning 4K video with HyperSmooth stabilization, waterproof design up to 10m, and dual preview screens.",
        category: "Electronics",
        brand: "GoPro",
        price: 34999,
        basePrice: 34999,
        dynamicPrice: 34999,
        stock: 45,
        soldCount: 14,
        images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.7,
      },
      {
        name: "Ultra-Slim 14\" ZenBook Laptop",
        description: "Thin and lightweight performance laptop with Intel Core i7 processor, 16GB LPDDR5 RAM, 512GB NVMe SSD, and bright OLED NanoEdge screen.",
        category: "Electronics",
        brand: "ASUS",
        price: 69999,
        basePrice: 69999,
        dynamicPrice: 69999,
        stock: 30,
        soldCount: 7,
        images: ["https://images.unsplash.com/photo-1496181130204-755241524eab?w=600&auto=format&fit=crop&q=60"],
        user: vendor._id,
        averageRating: 4.5,
      }
    ]);

    console.log("Seeded Products successfully.");

    // 3. Create Warehouses
    const warehouse1 = await Warehouse.create({
      name: "Silicon Valley Fulfillment Center",
      location: {
        address: "123 Silicon Valley Road",
        city: "San Jose",
        state: "CA",
        country: "USA",
      },
      manager: admin._id,
      capacity: 10000,
      currentStock: 170,
      products: [
        { product: products[0]._id, quantity: 30, bin: "A-12" },
        { product: products[1]._id, quantity: 10, bin: "B-04" },
        { product: products[2]._id, quantity: 70, bin: "C-11" },
        { product: products[3]._id, quantity: 60, bin: "D-08" },
      ],
      status: "active",
    });

    const warehouse2 = await Warehouse.create({
      name: "Austin Logistics Hub",
      location: {
        address: "456 Lone Star Blvd",
        city: "Austin",
        state: "TX",
        country: "USA",
      },
      manager: admin._id,
      capacity: 5000,
      currentStock: 100,
      products: [
        { product: products[0]._id, quantity: 20, bin: "Z-01" },
        { product: products[1]._id, quantity: 10, bin: "Y-02" },
        { product: products[2]._id, quantity: 50, bin: "X-03" },
        { product: products[3]._id, quantity: 20, bin: "W-04" },
      ],
      status: "active",
    });

    console.log("Seeded Warehouses successfully.");

    // 4. Create Auctions
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const activeAuctionEndDate = new Date();
    activeAuctionEndDate.setHours(activeAuctionEndDate.getHours() + 4);

    await Auction.create({
      product: products[2]._id, // keyboard
      seller: vendor._id,
      title: "Autographed Vintage Stratocaster Guitar (1974)",
      description: "Extremely rare, authentic autographed Fender Stratocaster in vintage sunburst. Includes certificate of authenticity.",
      startingPrice: 150000,
      currentPrice: 175000,
      bidIncrement: 5000,
      startTime: new Date(),
      endTime: activeAuctionEndDate,
      status: "active",
      bids: [
        { user: customer._id, amount: 160000, timestamp: new Date(Date.now() - 3600000) },
        { user: admin._id, amount: 170000, timestamp: new Date(Date.now() - 1800000) },
        { user: customer._id, amount: 175000, timestamp: new Date(Date.now() - 300000) }
      ],
      images: ["https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=60"]
    });

    await Auction.create({
      product: products[1]._id, // drone
      seller: vendor._id,
      title: "First Edition Holographic Charizard Card (PSA 10)",
      description: "The Holy Grail of Pokemon cards. Graded Gem Mint PSA 10 first edition shadowless holographic Charizard.",
      startingPrice: 500000,
      currentPrice: 500000,
      bidIncrement: 20000,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 86400000 * 2),
      status: "upcoming",
      bids: [],
      images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60"]
    });

    console.log("Seeded Auctions successfully.");

    // 5. Create LiveStreams
    await LiveStream.create({
      title: "Future of Mixed Reality: Meta Quest 3 Launch Showcase!",
      description: "Join us live as we showcase the gaming, workspace and entertainment features of Meta Quest 3 in high definition. Special discount codes for live viewers!",
      host: vendor._id,
      products: [products[0]._id, products[2]._id],
      status: "live",
      viewers: [],
      chat: [
        { user: customer._id, userName: "John Doe", message: "Wow, the visual clarity looks amazing!" },
        { user: admin._id, userName: "Super Admin", message: "Is the battery life improved over Quest 2?" },
        { user: customer._id, userName: "John Doe", message: "Can you show the passthrough mode live?" }
      ]
    });

    console.log("Seeded LiveStreams successfully.");
    console.log("Seeding Database Completed!");
  } catch (error) {
    console.error("Database Seeding Failed:", error.message);
  }
};

module.exports = seedDatabase;
