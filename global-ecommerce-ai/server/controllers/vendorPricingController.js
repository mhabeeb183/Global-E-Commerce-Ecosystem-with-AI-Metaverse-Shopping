const Product = require("../models/Product");

const updatePricingSettings = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // SECURITY
    if (
      product.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Not authorized to update this product",
      });
    }

    product.dynamicPricingEnabled =
      req.body.dynamicPricingEnabled;

    product.minPrice =
      req.body.minPrice;

    product.maxPrice =
      req.body.maxPrice;

    await product.save();

    res.status(200).json({
      message:
        "Pricing settings updated",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  updatePricingSettings,
};