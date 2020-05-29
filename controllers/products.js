const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("add-product", {
    docTitle: "Add Products",
    path: "/admin/add-product",
  });
};

exports.postAddProduct = (req, res, next) => {
  const newproduct = new Product(req.body.title);
  newproduct.save();
  res.redirect("/");
};

exports.getProduct = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop", {
      prods: products,
      docTitle: "Shop",
      path: "/",
    });
  });
};
