const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);
module.exports = class Cart {
  static addProduct(id, price) {
    fs.readFile(p, (err, fileContent) => {
      let cart = { product: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      const existingProductIndex = cart.product.findIndex(
        (prod) => prod.id === id
      );
      if (existingProductIndex >= 0) {
        cart.product[existingProductIndex].qty++;
      } else {
        cart.product.push({ id: id, qty: 1 });
      }
      cart.totalPrice = cart.totalPrice + +price;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }
  static deleteProduct(id, price) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }
      const updatedCart = { ...JSON.parse(fileContent) };
      const prod = updatedCart.product.find((prod) => prod.id === id);
      const prodQyt = prod.qty;
      updatedCart.totalPrice = updatedCart.totalPrice - prodQyt * price;
      updatedCart.product = updatedCart.product.filter(
        (prod) => prod.id !== id
      );
      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        cb([]);
      } else {
        cb(JSON.parse(fileContent));
      }
    });
  }
};
