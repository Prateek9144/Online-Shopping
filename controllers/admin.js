const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Products",
    path: "/admin/add-product",
  });
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const price = req.body.price;
	const imageUrl = req.body.imageUrl;
	const description = req.body.description;
  const newproduct = new Product(title,imageUrl,price,description);
  newproduct.save();
  res.redirect("/");
};

exports.getProducts = (req, res, next) => {
	Product.fetchAll((products) => {
	  res.render("admin/products", {
		prods: products,
		pageTitle: "Admin Products",
		path: "/admin/products",
	  });
	});
  };
  
