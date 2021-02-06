const User = require("../models/user");

const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              return res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password");
          return res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("errorMessage");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  console.log(message);
  console.log(req.session.inLoggedIn);
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash(
          "errorMessage",
          "E-mail already exist, pick a diffrenet one."
        );
        return res.redirect("/signup");
      } else if (confirmPassword != password) {
        req.flash(
          "errorMessage",
          "Entered password and confirm password won't match, please try again!"
        );
        return res.redirect("/signup");
      }
      return bcrypt.hash(password, 12).then((bcryptPassword) => {
        const newUser = new User({
          email: email,
          password: bcryptPassword,
          cart: { items: [] },
        });
        return newUser.save();
      });
    })
    .then((result) => {
      res.redirect("/login");
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
