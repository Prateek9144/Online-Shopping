const User = require("../models/user");
exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get("Cookie").split(";")[3].split("=")[1];
  console.log(req.session.inLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};
exports.postLogin = (req, res, next) => {
  User.findById("5fe070c66592ff2bd42d79db")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
