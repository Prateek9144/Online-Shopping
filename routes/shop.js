const path = require("path");
const express = require("express");
const admin = require("./admin");
const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/product/:productId", shopController.getProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/cart-delete-item", shopController.postDeleteCartProduct);

router.post("/create-order", shopController.postOrder);

router.get("/orders", shopController.getOrders);

// router.get("/checkout",shopController.getcheckout);

module.exports = router;
