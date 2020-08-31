const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectID(id) : null;
    this.userId = userId;
  }
  save() {
    const db = getDb();
    let Opdb;
    if (this._id) {
      Opdb = db
        .collection("product")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      Opdb = db.collection("product").insertOne(this);
    }
    return Opdb.then((result) => {
      console.log(result);
    }).catch((err) => console.log(err));
  }
  static fetchAll() {
    const db = getDb();
    return db
      .collection("product")
      .find()
      .toArray()
      .then((product) => {
        console.log(product);
        return product;
      })
      .catch((err) => console.log(err));
  }

  static findById(prodId) {
    const db = getDb();
    return db
      .collection("product")
      .find({ _id: new mongodb.ObjectID(prodId) })
      .next()
      .then((product) => {
        console.log(product);
        return product;
      })
      .catch((err) => console.log(err));
  }
  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("product")
      .deleteOne({ _id: new mongodb.ObjectID(prodId) })
      .then((result) => console.log("Deleted"))
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
