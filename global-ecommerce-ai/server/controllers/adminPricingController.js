const Product = require("../models/Product");

const updateCustomPricing =
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      product.customPricingAdjustment =
        req.body.adjustment;
        const {
            calculateDynamicPrice,
            } = require(
            "../services/dynamicPricingService"
            );

            await product.save();

            await calculateDynamicPrice(
            product._id
            );

      await product.save();

      res.status(200).json({
        message:
          "Pricing rule updated",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

module.exports = {
  updateCustomPricing,
};