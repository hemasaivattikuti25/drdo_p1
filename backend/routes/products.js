const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// Get all products
router.get('/', asyncHandler(async (req, res) => {
  const products = await Product.find({});
  
  if (!products) {
    res.status(404);
    throw new Error('No products found');
  }

  res.json({
    success: true,
    count: products.length,
    products
  });
}));

// Get single product
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  res.json({
    success: true,
    product
  });
}));

module.exports = router;
