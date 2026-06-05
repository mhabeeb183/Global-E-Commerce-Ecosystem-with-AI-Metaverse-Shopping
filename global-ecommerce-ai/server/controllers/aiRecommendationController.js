const Product = require("../models/Product");
const Order = require("../models/Order");

const getPersonalizedRecommendations =
  async (req, res) => {
    try {
      const userId = req.user._id;

      const orders = await Order.find({
        user: userId,
      }).populate("orderItems.product");

      const categories = [];

      orders.forEach((order) => {
        order.orderItems.forEach((item) => {
          if (
            item.product &&
            item.product.category
          ) {
            categories.push(
              item.product.category
            );
          }
        });
      });

      const favoriteCategory =
        categories.length > 0
          ? categories.sort(
              (a, b) =>
                categories.filter(
                  (v) => v === a
                ).length -
                categories.filter(
                  (v) => v === b
                ).length
            )[0]
          : null;

      let products = [];

      if (favoriteCategory) {
        products = await Product.find({
          category: favoriteCategory,
        })
          .sort({ rating: -1 })
          .limit(10);
      } else {
        products = await Product.find()
          .sort({ rating: -1 })
          .limit(10);
      }

      res.json({
        success: true,
        favoriteCategory,
        products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  getPersonalizedRecommendations,
};