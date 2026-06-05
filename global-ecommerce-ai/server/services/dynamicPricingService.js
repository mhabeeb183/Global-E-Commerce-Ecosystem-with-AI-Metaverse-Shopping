const Product = require("../models/Product");

const calculateDynamicPrice = async (
  productId
) => {
  const product =
    await Product.findById(productId);

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  if (
    !product.dynamicPricingEnabled
  ) {
    product.dynamicPrice =
      product.basePrice;

    product.pricingRulesApplied =
      [];

    await product.save();

    return product;
  }

  let finalPrice =
    product.basePrice;

  let appliedRules = [];

  // LOW STOCK
  if (
    product.stock <=
    product.lowStockThreshold
  ) {
    finalPrice +=
      product.basePrice * 0.05;

    appliedRules.push(
      "Low Stock (+5%)"
    );
  }

  // VERY HIGH DEMAND
  if (
    product.soldCount > 100
  ) {
    finalPrice +=
      product.basePrice * 0.15;

    appliedRules.push(
      "Very High Demand (+15%)"
    );
  }

  // HIGH DEMAND
  else if (
    product.soldCount > 50
  ) {
    finalPrice +=
      product.basePrice * 0.10;

    appliedRules.push(
      "High Demand (+10%)"
    );
  }

  //
  // MIN PRICE LIMIT
  //
  if (
    product.minPrice > 0 &&
    finalPrice < product.minPrice
  ) {
    finalPrice =
      product.minPrice;

    appliedRules.push(
      "Min Price Limit"
    );
  }

  //
  // MAX PRICE LIMIT
  //
  if (
    product.maxPrice > 0 &&
    finalPrice > product.maxPrice
  ) {
    finalPrice =
      product.maxPrice;

    appliedRules.push(
      "Max Price Limit"
    );
  }
  // ADMIN CUSTOM RULE
if (product.customPricingAdjustment) {
  finalPrice +=
    product.basePrice *
    (product.customPricingAdjustment /
      100);

  appliedRules.push(
    `Admin Adjustment (${product.customPricingAdjustment}%)`
  );
}

  finalPrice =
    Math.round(finalPrice);

  product.dynamicPrice =
    finalPrice;

  product.pricingRulesApplied =
    appliedRules;

  await product.save();

  return product;
};

module.exports = {
  calculateDynamicPrice,
};