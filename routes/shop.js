const path = require('path');
const express = require("express");
const rootDir = require('../util/path')
const admin  = require('./admin')

const router = express.Router();
const product = admin.product;

router.get("/", (req, res, next) => {
	console.log('shop.js',product.title);
	res.render('shop',{prods : product,docTitle : "Shop",path : "/"});
  });

module.exports = router;
