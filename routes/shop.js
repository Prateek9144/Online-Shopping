const path = require("path");
const express = require("express");
const admin = require("./admin");
const productController = require('../controllers/products')

const router = express.Router();

router.get("/", productController.getProduct );

module.exports = router;
