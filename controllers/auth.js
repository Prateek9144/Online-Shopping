const User = require("../models/user");

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
require("dotenv").config();

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API,
    },
  })
);

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
    oldInput: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: error.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: error.array(),
    });
  }
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

          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage:
              "Your password is incorrect. Please try again, or set or reset your password",
            oldInput: { email: email, password: password },
            validationErrors: [{ param: "password" }],
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      const error = err;
      error.httpsStatusCode = 500;
      return next(500);
    });
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
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign Up",
      errorMessage: error.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: error.array(),
    });
  }
  return bcrypt
    .hash(password, 12)
    .then((bcryptPassword) => {
      const newUser = new User({
        email: email,
        password: bcryptPassword,
        cart: { items: [] },
      });
      return newUser.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "contactshopticon@gmail.com",
        subject: "Signup Successful!",
        html: `<h1  style="color:blue;"> Welcome to Shopticon! </h1><h3>You Successfully signed up to Shopticon!</h3>`,
      });
    })
    .catch((err) => {
      const error = err;
      error.httpsStatusCode = 500;
      return next(500);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  console.log("Reset Password");
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  console.log(email);
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account found with this email.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        const url = `http://localhost:${
          process.env.PORT || 8080
        }/reset/${token}`;
        transporter.sendMail({
          to: email,
          from: "contactshopticon@gmail.com",
          subject: "Reset my password",
          html: `<h1>Did you fogot your password?</h1>
					<p>Here we received a request to reset your Shopticon account password. Click the link below to choose a new one:</p>
					<p><a href="${url}">Reset my password</a></p>`,
        });
      })
      .catch((err) => {
        const error = err;
        error.httpsStatusCode = 500;
        return next(500);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("errorMessage");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Update Password",
        errorMessage: message,
        userId: user._id,
        userEmail: user.email,
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = err;
      error.httpsStatusCode = 500;
      return next(500);
    });
};

exports.postNewPassword = (req, res, next) => {
  newPassword = req.body.password;
  userId = req.body.userId;
  token = req.body.passwordToken;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashpaword) => {
      resetUser.password = hashpaword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpire = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = err;
      error.httpsStatusCode = 500;
      return next(500);
    });
};
