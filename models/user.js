const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("order")
      .find({ "user.id": new mongodb.ObjectID(this._id) })
      .toArray();
  }
  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return product._id.toString() === cp.productId.toString();
    });
    let newQuatity = 1;
    console.log(cartProductIndex);
    const UpdatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
      newQuatity = this.cart.items[cartProductIndex].quantity + 1;
      UpdatedCartItems[cartProductIndex].quantity = newQuatity;
    } else {
      UpdatedCartItems.push({
        productId: new mongodb.ObjectID(product._id),
        quantity: newQuatity,
      });
    }
    const updatedCart = {
      items: UpdatedCartItems,
    };
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectID(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  getCart() {
    const db = getDb();
    const prodId = this.cart.items.map((p) => {
      return p.productId;
    });
    console.log(prodId);
    return db
      .collection("product")
      .find({ _id: { $in: prodId } })
      .toArray()
      .then((product) => {
        console.log(product);
        return product.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      })
      .catch((err) => console.log(err));
  }

  deleteItemFromCart(prodId) {
    const updatedCartItems = this.cart.items.filter((i) => {
      return i.productId.toString() !== prodId.toString();
    });
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectID(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((product) => {
        const order = {
          user: {
            id: this._id,
            name: this.name,
          },
          items: product,
        };
        return db.collection("order").insertOne(order);
      })
      .then((result) => {
        this.cart = { item: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectID(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  save() {
    const db = getDb();
    db.collection("users")
      .insertOne(this)
      .then((result) => console.log("Inserted"))
      .catch((err) => console.log(err));
  }
  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectID(userId) })
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = User;
