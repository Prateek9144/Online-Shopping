const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const { name } = require("ejs");

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("5fe070c66592ff2bd42d79db")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// app.use(errorController.error404);
mongoose
  .connect(
    "mongodb+srv://Prateek:Prateek9144@cluster0.bo9ad.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const newUser = new User({
          name: "Prateek",
          email: "prateek@gmail.com",
          cart: { items: [] },
        });
        newUser.save();
        console.log("New User Created");
      }
		});
		
    app.listen(8000);
    console.log("local created");
  });
