const Product = require("../models/Product");

const RecommendationAnalytics = require(
  "../models/recommendationAnalyticsModel"
);

const getRecommendations = async (
  req,
  res
) => {
  try {
    const currentProduct =
      await Product.findById(
        req.params.id
      );

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const recommendations =
      await Product.find({
        category:
          currentProduct.category,
        _id: {
          $ne: currentProduct._id,
        },
      }).limit(4);

    // =========================
    // TRACK RECOMMENDATIONS
    // =========================

    try {
      const userId =
        req.user?._id || null;

      if (
        userId &&
        recommendations.length > 0
      ) {
        const analyticsData =
          recommendations.map(
            (product) => ({
              user: userId,
              product: product._id,
              category:
                product.category,
              brand: product.brand,
              action:
                "recommended",
            })
          );

        await RecommendationAnalytics.insertMany(
          analyticsData
        );
      }
    } catch (trackingError) {
      console.error(
        "Recommendation Tracking Error:",
        trackingError.message
      );
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
};