const path = require("path");
const express = require("express");
const rootDir = require("../util/path");

const router = express.Router();
const product = [];

router.get("/add-product", (req, res, next) => {
  //   res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("add-product", {
    docTitle: "Add Products",
    path: "/admin/add-product",
  });
});

router.post("/add-product", (req, res, next) => {
  product.push({ title: req.body.title });
  res.redirect("/");
});

exports.router = router;
exports.product = product;
