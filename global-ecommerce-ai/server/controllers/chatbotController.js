const Product = require("../models/Product");
const Order = require("../models/Order");
const ChatLog = require("../models/ChatLog");

const chatbotSearch = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const text = message.toLowerCase().trim();

    // =========================
// BASIC AI CONVERSATION
// =========================

if (
  text === "hi" ||
  text === "hii" ||
  text === "hello" ||
  text === "hey"
) {
  return res.json({
    success: true,
    products: [],
    reply:
      "Hello 👋 I'm your AI Shopping Assistant. What product are you looking for today?",
  });
}

if (
  text.includes("how are you") ||
  text.includes("how r u") ||
  text.includes("how are u")
) {
  return res.json({
    success: true,
    products: [],
    reply:
      "I'm doing great 😊. I can help you find products, compare items, and recommend the best deals.",
  });
}

if (
  text.includes("your name") ||
  text.includes("who are you")
) {
  return res.json({
    success: true,
    products: [],
    reply:
      "I'm your AI Shopping Assistant 🤖 for the Global E-Commerce Ecosystem.",
  });
}

if (
  text.includes("thank") ||
  text.includes("thanks")
) {
  return res.json({
    success: true,
    products: [],
    reply:
      "You're welcome 😊 Happy shopping!",
  });
}
// =========================
// PERSONALIZED RECOMMENDATIONS
// =========================

if (
  text.includes("recommend something for me") ||
  text.includes("personalized recommendation") ||
  text.includes("recommend for me")
) {
  const userId =
  req.body.userId || null;

  if (!userId) {
    return res.json({
      success: true,
      products: [],
      reply:
        "Please login to get personalized recommendations.",
    });
  }

  const orders = await Order.find({
    user: userId,
  }).populate("orderItems.product");

  const categoryCount = {};

  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      if (item.product?.category) {
        const category =
          item.product.category;

        categoryCount[category] =
          (categoryCount[category] || 0) + 1;
      }
    });
  });

  const favoriteCategory =
    Object.keys(categoryCount).sort(
      (a, b) =>
        categoryCount[b] -
        categoryCount[a]
    )[0];

  const products = await Product.find({
    category: favoriteCategory,
  })
    .sort({ rating: -1 })
    .limit(10);

  return res.json({
    success: true,
    type: "personalized",
    favoriteCategory,
    products,
  });
}
    // =========================
// PRODUCT COMPARISON
// =========================

// =========================
// PRODUCT COMPARISON
// =========================

if (
  text.includes("compare") ||
  text.includes(" vs ")
) {
  const cleanedText = text
    .replace("compare", "")
    .replace("plz", "")
    .trim();

  const products = await Product.find();

  const matchedProducts = products.filter(
    (product) =>
      cleanedText.includes(
        product.name.toLowerCase()
      )
  );

let recommendation = "";

if (matchedProducts.length >= 2) {
  const first = matchedProducts[0];
  const second = matchedProducts[1];

  const firstScore =
    (first.rating || 0) * 100 -
    (first.price || 0) / 1000;

  const secondScore =
    (second.rating || 0) * 100 -
    (second.price || 0) / 1000;

  recommendation =
    firstScore > secondScore
      ? first.name
      : second.name;
}

return res.status(200).json({
  success: true,
  type: "comparison",
  recommendation,
  total: matchedProducts.length,
  products: matchedProducts,
});
}

    // =========================
    // BASIC CHAT RESPONSES
    // =========================

    if (
      text.includes("your name") ||
      text.includes("who are you")
    ) {
      return res.json({
        success: true,
        products: [],
        total: 0,
        reply:
          "I am your AI Shopping Assistant 🤖. I can help you find products and recommendations.",
      });
    }

    if (
      text === "hi" ||
      text === "hello" ||
      text === "hey"
    ) {
      return res.json({
        success: true,
        products: [],
        total: 0,
        reply:
          "Hello 👋 What product are you looking for today?",
      });
    }

    if (
      text.includes("thanks") ||
      text.includes("thank you")
    ) {
      return res.json({
        success: true,
        products: [],
        total: 0,
        reply:
          "You're welcome 😊 Happy shopping!",
      });
    }

    // =========================
    // PRICE FILTER
    // =========================

    let finalQuery = {};

    const priceMatch =
      text.match(/under\s*₹?\s*(\d+)/i) ||
      text.match(/below\s*₹?\s*(\d+)/i) ||
      text.match(/less than\s*₹?\s*(\d+)/i);

    if (priceMatch) {
      finalQuery.price = {
        $lte: Number(priceMatch[1]),
      };
    }

    // =========================
    // SEARCH CONDITIONS
    // =========================

    const searchConditions = [];

    // Brands

    const brands = [
      "samsung",
      "apple",
      "iphone",
      "realme",
      "xiaomi",
      "oppo",
      "vivo",
      "oneplus",
      "hp",
      "dell",
      "lenovo",
      "asus",
      "puma",
      "nike",
      "adidas",
    ];

    brands.forEach((brand) => {
      if (text.includes(brand)) {
        searchConditions.push({
          brand: {
            $regex: brand,
            $options: "i",
          },
        });

        searchConditions.push({
          name: {
            $regex: brand,
            $options: "i",
          },
        });
      }
    });

    // Categories

    const categories = [
      "mobile",
      "phone",
      "smartphone",
      "laptop",
      "shoe",
      "shoes",
      "watch",
      "camera",
      "tv",
      "headphone",
      "headphones",
    ];

    categories.forEach((category) => {
      if (text.includes(category)) {
        searchConditions.push({
          category: {
            $regex: category,
            $options: "i",
          },
        });

        searchConditions.push({
          name: {
            $regex: category,
            $options: "i",
          },
        });
      }
    });

    // Product Name Search

    const words = text.split(" ");

    words.forEach((word) => {
      if (
        word.length > 2 &&
        ![
          "show",
          "find",
          "want",
          "buy",
          "under",
          "below",
          "good",
          "best",
          "top",
          "recommend",
          "suggest",
        ].includes(word)
      ) {
        searchConditions.push({
          name: {
            $regex: word,
            $options: "i",
          },
        });
      }
    });

    if (searchConditions.length > 0) {
      finalQuery.$or = searchConditions;
    }

    console.log("Chatbot Query:", finalQuery);

    // =========================
    // COMMANDS
    // =========================

    let products = [];

    // Top Rated

    if (
      text.includes("top rated") ||
      text.includes("best") ||
      text.includes("recommend") ||
      text.includes("suggest")
    ) {
      products = await Product.find(finalQuery)
        .sort({ rating: -1 })
        .limit(10);
    }

    // Best Sellers

    else if (
      text.includes("best seller") ||
      text.includes("best sellers")
    ) {
      products = await Product.find(finalQuery)
        .sort({ sold: -1 })
        .limit(10);
    }

    // Low Stock

    else if (
      text.includes("low stock")
    ) {
      products = await Product.find({
        ...finalQuery,
        stock: { $lt: 10 },
      })
        .sort({ stock: 1 })
        .limit(10);
    }

    // Normal Search

    else {
      products = await Product.find(finalQuery)
        .limit(10);
    }

    let reply = "";
    if (process.env.GROQ_API_KEY) {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              {
                role: "system",
                content: "You are an AI Shopping Assistant for the Global E-Commerce Ecosystem. Help users find products, recommend items, and answer e-commerce questions in a friendly, conversational way. Keep responses to 2-3 sentences max. Do not use markdown formats that are complex to render (plain text or simple formatting with emojis is preferred)."
              },
              {
                role: "user",
                content: `User message: "${message}". Products found in database: ${JSON.stringify(products.map(p => ({ name: p.name, price: p.price, brand: p.brand, rating: p.rating })))}`
              }
            ]
          })
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          reply = groqData.choices?.[0]?.message?.content || "";
        } else {
          console.error("Groq API error response status:", groqResponse.status);
        }
      } catch (err) {
        console.error("Groq API Call Error:", err);
      }
    }

    if (!reply) {
      reply = products.length > 0
        ? `I found ${products.length} products matching your query.`
        : "I couldn't find any products matching your search. Try searching for something else like 'laptop', 'iphone', or 'shoes'!";
    }

    // Save Chat to Database
    const finalUserId = req.body.userId || req.user?._id;
    if (finalUserId) {
      try {
        let chatLog = await ChatLog.findOne({ user: finalUserId });
        if (!chatLog) {
          chatLog = new ChatLog({ user: finalUserId, messages: [] });
        }
        chatLog.messages.push({ sender: "user", text: message });
        chatLog.messages.push({ sender: "bot", text: reply });
        await chatLog.save();
      } catch (logErr) {
        console.error("Failed to save chat log:", logErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      userMessage: message,
      total: products.length,
      products,
      reply
    });
  } catch (error) {
    console.error("Chatbot Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const chatLog = await ChatLog.findOne({ user: userId });
    res.json({
      success: true,
      messages: chatLog ? chatLog.messages : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  chatbotSearch,
  getChatHistory,
};